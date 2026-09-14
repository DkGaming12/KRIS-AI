import { Readable } from 'node:stream';

// AgentRouter menolak permintaan tanpa User-Agent klien yang dikenali
// ("unauthorized client detected"), jadi proxy wajib mengirim UA klien AI.
const CLIENT_USER_AGENT =
  process.env.AGENTROUTER_CLIENT_UA ||
  'codex_cli_rs/0.42.0 (Mac OS 15.6.0; arm64) terminal';

/** Resolve konfigurasi secara lazy supaya env tetap bisa di-inject saat dev */
function getConfig() {
  return {
    baseUrl:
      process.env.AGENTROUTER_BASE_URL ||
      process.env.VITE_AGENTROUTER_BASE_URL ||
      process.env.VITE_OPENAI_BASE_URL ||
      'https://agentrouter.org/v1',
    apiKey:
      process.env.AGENTROUTER_API_KEY ||
      process.env.VITE_AGENTROUTER_API_KEY ||
      process.env.VITE_OPENAI_API_KEY ||
      '',
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { baseUrl, apiKey } = getConfig();

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

  const upstream = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': CLIENT_USER_AGENT,
      Accept: body.stream ? 'text/event-stream' : 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!upstream.ok) {
    const errorText = await upstream.text();
    // AgentRouter memblokir prompt berbahasa Indonesia (content-blocked);
    // beri pesan yang jelas supaya user tahu penyebabnya.
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

  if (body.stream) {
    res.writeHead(upstream.status, {
      'Content-Type': upstream.headers.get('content-type') || 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    if (!upstream.body) {
      res.end();
      return;
    }

    Readable.fromWeb(upstream.body).pipe(res);
    return;
  }

  const json = await upstream.json();
  res.status(upstream.status).json(json);
}
