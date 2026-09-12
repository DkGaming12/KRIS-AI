import { Readable } from 'node:stream';

const DEFAULT_BASE_URL =
  process.env.AGENTROUTER_BASE_URL ||
  process.env.VITE_AGENTROUTER_BASE_URL ||
  process.env.VITE_OPENAI_BASE_URL ||
  'https://agentrouter.org/v1';

const DEFAULT_API_KEY =
  process.env.AGENTROUTER_API_KEY ||
  process.env.VITE_AGENTROUTER_API_KEY ||
  process.env.VITE_OPENAI_API_KEY ||
  '';

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

  if (!DEFAULT_API_KEY) {
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

  const upstream = await fetch(`${DEFAULT_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DEFAULT_API_KEY}`,
      'Content-Type': 'application/json',
      Accept: body.stream ? 'text/event-stream' : 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!upstream.ok) {
    const errorText = await upstream.text();
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