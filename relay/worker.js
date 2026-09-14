// ─────────────────────────────────────────────────────────────────
// Relay AgentRouter di Cloudflare Workers.
//
// Latar belakang: WAF Aliyun di depan agentrouter.org menantang semua
// IP egress Vercel (serverless maupun edge, semua region) dengan
// captcha slider interaktif — tidak bisa dilewati dari server. IP
// egress Cloudflare Workers terbukti lolos WAF, jadi request dari
// Vercel diarahkan lewat worker ini.
//
// Worker ini pipa passthrough SEMINIMAL mungkin (sengaja):
//   - API key TIDAK disimpan di sini — header Authorization hanya
//     diteruskan dari Vercel, jadi rahasia tetap di env Vercel.
//   - Semua logika (padding anti content-block, format, model)
//     tetap di api/chat.js Vercel.
//   - Worker hanya: ganti User-Agent jadi UA klien AI (AgentRouter
//     menolak UA lain) + proteksi token supaya tidak jadi proxy
//     terbuka.
// ─────────────────────────────────────────────────────────────────

const UPSTREAM = 'https://agentrouter.org';
const CLIENT_USER_AGENT =
  'codex_cli_rs/0.42.0 (Mac OS 15.6.0; arm64) terminal';

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/relay') {
      return new Response('Not Found', { status: 404 });
    }

    // Proteksi proxy terbuka: token bersama di-set sebagai secret
    // Cloudflare (wrangler secret put RELAY_TOKEN) dan env Vercel.
    const token = request.headers.get('x-relay-token');
    if (!env.RELAY_TOKEN || token !== env.RELAY_TOKEN) {
      return new Response('Forbidden', { status: 403 });
    }

    const upstream = new Request(UPSTREAM + '/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: request.headers.get('authorization') || '',
        'Content-Type': 'application/json',
        Accept: request.headers.get('accept') || 'application/json',
        'User-Agent': CLIENT_USER_AGENT,
      },
      body: request.body,
      // stream request body tanpa buffering
      // @ts-ignore — tipe RequestInit di CF mengenal duplex
      duplex: 'half',
    });

    return fetch(upstream);
  },
};
