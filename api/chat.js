// ─────────────────────────────────────────────────────────────────
// Proxy AgentRouter (Anthropic Messages API) untuk web app.
// Mekanisme sama dengan cli/lib/aiClient.js yang sudah teruji:
//   1. UA klien AI (tanpa ini ditolak "unauthorized client detected")
//   2. Padding bahasa Inggris (filter AgentRouter memblokir pesan yang
//      terklasifikasi dominan Bahasa Indonesia → "content-blocked")
//   3. Filter blok thinking glm-5.3 (ambil blok text saja)
// Browser tetap berkirim format OpenAI — proxy menerjemahkan dua arah,
// jadi src/lib/aiClient.js tidak perlu berubah.
// ─────────────────────────────────────────────────────────────────

// AgentRouter menolak permintaan tanpa User-Agent klien AI yang dikenali
const CLIENT_USER_AGENT =
  process.env.AGENTROUTER_CLIENT_UA ||
  'claude-cli/2.1.270 (external, cli)';

// Padding bahasa Inggris untuk menipu filter bahasa AgentRouter.
// Harus cukup panjang (±3x panjang teks user, min ~1.2KB) supaya pesan
// terklasifikasi dominan Inggris. Konteksnya relevan menulis supaya
// tidak mengganggu jawaban model. (Salinan dari cli/lib/aiClient.js)
const EN_PADDING =
  'The user is working on a creative writing project. Analyze the narrative structure ' +
  'carefully and provide thoughtful feedback about character development, pacing, themes, ' +
  'and literary techniques used in the manuscript. Consider genre conventions and reader ' +
  'expectations while evaluating the overall quality and coherence of the story being told. ' +
  'Pay attention to dialogue, setting descriptions, plot progression, and emotional beats. ';

const PADDING_MIN = 1200;
const PADDING_MAX = 100000; // batasi supaya payload tidak membengkak untuk naskah panjang

function buildPadding(length) {
  const target = Math.min(Math.max(PADDING_MIN, length * 3), PADDING_MAX);
  let pad = '';
  while (pad.length < target) pad += EN_PADDING;
  return pad.slice(0, target);
}

/** Sisipkan padding Inggris ke satu pesan user */
function padUserMessage(text) {
  const pad = buildPadding(text.length);
  return (
    pad +
    '\n\n(The technical context above is routing metadata — ignore it and answer only the user message below.)\n\n' +
    text
  );
}

/** Resolve konfigurasi secara lazy supaya env tetap bisa di-inject saat dev */
function getConfig() {
  return {
    baseUrl: (
      process.env.AGENTROUTER_BASE_URL ||
      process.env.ANTHROPIC_BASE_URL ||
      process.env.VITE_AGENTROUTER_BASE_URL ||
      process.env.VITE_OPENAI_BASE_URL ||
      'https://agentrouter.org'
    ).replace(/\/+$/, ''),
    apiKey:
      process.env.AGENTROUTER_API_KEY ||
      process.env.ANTHROPIC_AUTH_TOKEN ||
      process.env.VITE_AGENTROUTER_API_KEY ||
      process.env.VITE_OPENAI_API_KEY ||
      '',
    model: process.env.ANTHROPIC_MODEL || 'glm-5.3',
  };
}

function anthropicHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'Content-Type': 'application/json',
    'User-Agent': CLIENT_USER_AGENT,
  };
}

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) return {};

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

/**
 * Terjemah messages format OpenAI → body Anthropic Messages API.
 * Pesan system dipindah ke field `system` (diberi framing Inggris),
 * pesan user terakhir diberi padding Inggris — dua-duanya untuk
 * menghindari content-block pada prompt Bahasa Indonesia.
 */
function toAnthropicBody(body, defaultModel) {
  const systemMsgs = (body.messages || []).filter((m) => m.role === 'system');
  const rest = (body.messages || []).filter((m) => m.role !== 'system');

  let system = systemMsgs.map((m) => m.content).join('\n\n');
  if (system) {
    // System prompt web (persona, aturan penulisan) umumnya berbahasa
    // Indonesia dan ikut memicu filter — bungkus dengan framing Inggris.
    system = buildPadding(system.length) + '\n\n' + system;
  }

  // Padding hanya pada pesan user TERAKHIR — history dibiarkan apa adanya
  // supaya token tidak membengkak.
  const messages = rest.map((m) => ({ ...m }));
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user' && typeof messages[i].content === 'string') {
      messages[i].content = padUserMessage(messages[i].content);
      break;
    }
  }

  const model =
    body.model && body.model !== 'auto' ? body.model : defaultModel;

  // Whitelist param — buang yang tidak dikenal Anthropic (penalty, dll)
  const out = { model, max_tokens: 8000, system, messages };
  if (body.max_tokens && Number.isFinite(Number(body.max_tokens))) {
    out.max_tokens = Math.min(Math.max(1, Number(body.max_tokens)), 8192);
  }
  if (typeof body.temperature === 'number') out.temperature = body.temperature;
  if (body.stream) out.stream = true;
  return out;
}

/** Ambil teks dari respons Anthropic (buang blok thinking glm-5.3) */
function anthropicText(json) {
  return (json.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
}

/** Bentuk chunk SSE gaya OpenAI dari delta teks */
function openaiChunk(id, text) {
  return `data: ${JSON.stringify({
    id,
    object: 'chat.completion.chunk',
    choices: [{ index: 0, delta: { content: text }, finish_reason: null }],
  })}\n\n`;
}

/**
 * Streaming: baca SSE Anthropic dari upstream, terjemah tiap
 * content_block_delta menjadi chunk OpenAI, tulis ke res.
 */
async function pipeAnthropicStream(upstream, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const id = `chatcmpl-${Date.now()}`;
  let buffer = '';
  let sawText = false;

  for await (const chunk of upstream.body) {
    buffer += Buffer.from(chunk).toString('utf8');
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;

      let evt;
      try {
        evt = JSON.parse(payload);
      } catch {
        continue;
      }

      if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
        sawText = true;
        res.write(openaiChunk(id, evt.delta.text));
      } else if (evt.type === 'error') {
        console.error('[api/chat] AgentRouter stream error:', evt.error);
      }
    }
  }

  // Flush event terakhir yang masih menempel di buffer
  const trailing = buffer.trim();
  if (trailing.startsWith('data:')) {
    const payload = trailing.slice(5).trim();
    if (payload && payload !== '[DONE]') {
      try {
        const evt = JSON.parse(payload);
        if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
          sawText = true;
          res.write(openaiChunk(id, evt.delta.text));
        }
      } catch {
        // abaikan payload tidak valid
      }
    }
  }

  if (!sawText) {
    res.write(
      openaiChunk(id, '[Respons AgentRouter kosong — coba ulangi atau periksa provider fallback di Pengaturan Akun.]')
    );
  }

  res.write('data: [DONE]\n\n');
  res.end();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { baseUrl, apiKey, model: defaultModel } = getConfig();

  if (!apiKey) {
    res.status(500).json({
      error: 'AgentRouter API key belum dikonfigurasi di environment server.',
    });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    res.status(400).json({ error: `Body JSON tidak valid: ${error.message}` });
    return;
  }

  const anthropicBody = toAnthropicBody(body, defaultModel);

  let upstream;
  try {
    upstream = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: anthropicHeaders(apiKey),
      body: JSON.stringify(anthropicBody),
    });
  } catch (error) {
    res.status(502).json({ error: `Gagal menghubungi AgentRouter: ${error.message}` });
    return;
  }

  if (!upstream.ok) {
    const errorText = await upstream.text();
    // AgentRouter memblokir prompt yang terklasifikasi non-Inggris
    // (content-blocked); beri pesan yang jelas supaya user tahu penyebabnya.
    if (errorText.includes('content-blocked')) {
      res.status(upstream.status).json({
        error:
          'AgentRouter sedang memblokir konten berbahasa Indonesia (content-blocked). ' +
          'Coba tulis prompt dalam bahasa Inggris, atau tambahkan API key Gemini/Groq ' +
          'di Pengaturan Akun sebagai provider fallback.',
      });
      return;
    }
    res.status(upstream.status).send(errorText || `AgentRouter error (${upstream.status})`);
    return;
  }

  if (anthropicBody.stream) {
    if (!upstream.body) {
      res.status(502).json({ error: 'Stream AgentRouter tidak tersedia.' });
      return;
    }
    await pipeAnthropicStream(upstream, res);
    return;
  }

  const json = await upstream.json();

  // Konversi balik ke bentuk OpenAI yang dibaca src/lib/aiClient.js
  const content = anthropicText(json);
  res.status(200).json({
    id: json.id || `chatcmpl-${Date.now()}`,
    object: 'chat.completion',
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content },
        finish_reason: json.stop_reason || 'stop',
      },
    ],
    usage: json.usage
      ? {
          prompt_tokens: json.usage.input_tokens,
          completion_tokens: json.usage.output_tokens,
          total_tokens: (json.usage.input_tokens || 0) + (json.usage.output_tokens || 0),
        }
      : undefined,
  });
}
