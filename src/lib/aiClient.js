/**
 * aiClient.js — Multi-provider AI client dengan auto-fallback
 * Urutan fallback: AgentRouter → Gemini → Groq → OpenAI → Error
 */

import OpenAI from 'openai';

// ─────────────────────────────────────────────
// Provider configurations
// ─────────────────────────────────────────────

const AGENTROUTER_BASE_URL =
  import.meta.env.VITE_AGENTROUTER_BASE_URL ||
  import.meta.env.VITE_OPENAI_BASE_URL ||
  'https://agentrouter.org/v1';

const AGENTROUTER_API_KEY =
  import.meta.env.VITE_AGENTROUTER_API_KEY ||
  import.meta.env.VITE_OPENAI_API_KEY ||
  'dummy';

function createSseAsyncIterable(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();

  return {
    async *[Symbol.asyncIterator]() {
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let separatorIndex = buffer.indexOf('\n\n');
        while (separatorIndex !== -1) {
          const rawEvent = buffer.slice(0, separatorIndex).trim();
          buffer = buffer.slice(separatorIndex + 2);

          const dataLines = rawEvent
            .split('\n')
            .filter((line) => line.startsWith('data:'))
            .map((line) => line.slice(5).trim())
            .filter(Boolean);

          for (const dataLine of dataLines) {
            if (dataLine === '[DONE]') {
              return;
            }

            try {
              yield JSON.parse(dataLine);
            } catch {
              // Abaikan payload non-JSON agar stream tetap jalan.
            }
          }

          separatorIndex = buffer.indexOf('\n\n');
        }
      }

      const trailing = buffer.trim();
      if (trailing.startsWith('data:')) {
        const payload = trailing.slice(5).trim();
        if (payload && payload !== '[DONE]') {
          try {
            yield JSON.parse(payload);
          } catch {
            // Abaikan payload akhir yang tidak valid.
          }
        }
      }
    },
  };
}

async function createAgentRouterChatCompletion(params) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `AgentRouter proxy gagal (${response.status})`);
  }

  // Jumlah karakter padding anti-WAF yang disisipkan server — dipakai
  // metering token supaya padding tidak ditagih ke user.
  const padChars = parseInt(response.headers.get('X-Kris-Pad-Chars') || '0', 10) || 0;

  if (params.stream) {
    if (!response.body) {
      throw new Error('Stream respons AgentRouter tidak tersedia.');
    }
    // Bungkus iterable: tangkap chunk ber-`usage` (dikirim upstream di akhir
    // stream bila stream_options.include_usage aktif) tanpa mengubah output.
    const inner = createSseAsyncIterable(response.body);
    let capturedUsage = null;
    async function* streamWithUsageCapture() {
      for await (const chunk of inner) {
        if (chunk?.usage) capturedUsage = chunk.usage;
        yield chunk;
      }
      return { usage: capturedUsage, padChars };
    }
    const wrapper = streamWithUsageCapture();
    wrapper.__krisMeta = () => ({ usage: capturedUsage, padChars });
    return wrapper;
  }

  const json = await response.json();
  json.__krisPadChars = padChars;
  return json;
}

const PROVIDERS = [
  {
    id: 'omni',
    name: 'AgentRouter',
    // baseURL & apiKey di-resolve secara dinamis — lihat buildClient()
    baseURL: AGENTROUTER_BASE_URL,
    envKey: 'VITE_AGENTROUTER_API_KEY',   // env key yang dibaca
    legacyEnvKey: 'VITE_OPENAI_API_KEY',  // kompatibilitas lama
    localStorageKey: 'kris_ai_api_key',   // localStorage key (lama / compat)
    // Model harus ada di daftar AgentRouter (/v1/models).
    // glm-5.3 & deepseek-v4-flash aktif; model premium (claude-opus-5,
    // gpt-6-astra, gpt-5.6-sol) sering budget-exhausted/blocked.
    models: {
      default: 'glm-5.3',
      powerful: 'glm-5.3',
      fast: 'deepseek-v4-flash',
    },
    // AgentRouter dianggap "tersedia" kalau endpoint-nya reachable
    // Kita cek ketersediaannya via flag alwaysAvailable — tapi tetap fallback jika 402/429
    alwaysAvailable: true,
    errorCodes: [429, 402, 403, 401],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    envKey: 'VITE_GEMINI_API_KEY',
    localStorageKey: 'kris_ai_gemini_key',
    models: {
      default: 'gemini-2.0-flash',
      powerful: 'gemini-2.5-flash',
      fast: 'gemini-2.0-flash',
    },
    alwaysAvailable: false,
    errorCodes: [429, 402, 403, 401],
  },
  {
    id: 'groq',
    name: 'Groq',
    baseURL: 'https://api.groq.com/openai/v1',
    envKey: 'VITE_GROQ_API_KEY',
    localStorageKey: 'kris_ai_groq_key',
    models: {
      default: 'llama-3.3-70b-versatile',
      powerful: 'llama-3.3-70b-versatile',
      fast: 'llama-3.1-8b-instant',
    },
    alwaysAvailable: false,
    errorCodes: [429, 402, 403, 401],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    envKey: 'VITE_OPENAI_DIRECT_KEY',
    localStorageKey: 'kris_ai_openai_key',
    models: {
      default: 'gpt-4o-mini',
      powerful: 'gpt-4o',
      fast: 'gpt-4o-mini',
    },
    alwaysAvailable: false,
    errorCodes: [429, 402, 403, 401],
  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Ambil API key dari localStorage atau env */
function getApiKey(provider) {
  // AgentRouter: pakai env key langsung (atau 'dummy' jika tidak ada)
  if (provider.id === 'omni') {
    return localStorage.getItem(provider.localStorageKey)
      || import.meta.env[provider.envKey]
      || import.meta.env[provider.legacyEnvKey]
      || AGENTROUTER_API_KEY;
  }
  return (
    localStorage.getItem(provider.localStorageKey) ||
    import.meta.env[provider.envKey] ||
    ''
  );
}

/** Ambil semua provider yang tersedia */
function getAvailableProviders() {
  return PROVIDERS.filter((p) => {
    if (p.alwaysAvailable) return true; // OmniRoute selalu masuk daftar
    return getApiKey(p).length > 0;
  });
}

/** Buat OpenAI-compatible client untuk provider tertentu */
function buildClient(provider) {
  if (provider.id === 'omni') {
    return {
      chat: {
        completions: {
          create: (params) => createAgentRouterChatCompletion(params),
        },
      },
    };
  }

  return new OpenAI({
    apiKey: getApiKey(provider),
    baseURL: provider.baseURL,
    dangerouslyAllowBrowser: true,
  });
}

/** Cek apakah error adalah rate-limit / quota habis */
function isQuotaError(error) {
  const msg = (error?.message || '').toLowerCase();
  const status = error?.status || error?.statusCode || 0;
  return (
    status === 429 ||
    status === 402 ||
    msg.includes('quota') ||
    msg.includes('credit') ||
    msg.includes('rate limit') ||
    msg.includes('insufficient') ||
    msg.includes('billing') ||
    msg.includes('exceed') ||
    msg.includes('max_tokens') ||
    msg.includes('afford')
  );
}

/** Cek apakah error adalah network error (OmniRoute tidak jalan) */
function isNetworkError(error) {
  const msg = (error?.message || '').toLowerCase();
  return (
    msg.includes('fetch') ||
    msg.includes('network') ||
    msg.includes('econnrefused') ||
    msg.includes('failed to fetch') ||
    msg.includes('connection refused') ||
    error?.code === 'ECONNREFUSED'
  );
}

/** Resolve model name */
function resolveModel(provider, requestedModel) {
  if (provider.id === 'omni') {
    // AgentRouter butuh model valid; fallback ke default jika auto/kosong.
    if (!requestedModel || requestedModel === 'auto' || requestedModel === 'openrouter/auto') {
      return provider.models.default;
    }
    const isKnown = Object.values(provider.models).includes(requestedModel);
    return isKnown ? requestedModel : provider.models.default;
  }
  if (!requestedModel || requestedModel === 'auto') {
    return provider.models.default;
  }
  const isKnown = Object.values(provider.models).includes(requestedModel);
  return isKnown ? requestedModel : provider.models.default;
}

// ─────────────────────────────────────────────
// Core: Auto-fallback chat completion
// ─────────────────────────────────────────────

/**
 * Kirim chat completion dengan auto-fallback antar provider.
 * @param {Object} params - parameter kompatibel dengan openai.chat.completions.create
 * @param {Function} onProviderSwitch - callback(providerName) saat ganti provider
 * @returns {Promise<import('openai').ChatCompletion>}
 */
/**
 * Kirim chat completion dengan fallback antar provider.
 * @param {object} params - parameter OpenAI-format
 * @param {object|function} [optsOrCb] - { onProviderSwitch, onUsage } (atau
 *   callback onProviderSwitch lama — kompatibilitas)
 *   onUsage({ usage, padChars, params }) dipanggil SEKALI setelah sukses,
 *   dengan usage asli API (bisa null) + padChars padding anti-WAF.
 */
export async function chatWithFallback(params, optsOrCb) {
  const opts = typeof optsOrCb === 'function' ? { onProviderSwitch: optsOrCb } : (optsOrCb || {});
  const available = getAvailableProviders();

  // Kalau hanya OmniRoute yang ada di daftar dan tidak ada provider lain
  // tetap coba — OmniRoute dianggap tersedia
  if (available.length === 0) {
    throw new Error(
      'Tidak ada provider AI yang tersedia. Pastikan OmniRoute berjalan atau masukkan API Key di Pengaturan Akun.'
    );
  }

  let lastError = null;

  for (const provider of available) {
    try {
      const client = buildClient(provider);
      const model = resolveModel(provider, params.model);

      if (opts.onProviderSwitch) opts.onProviderSwitch(provider.name);

      // Minta upstream menyertakan usage di akhir stream (OpenAI-format).
      const finalParams = { ...params, model };
      if (finalParams.stream) {
        finalParams.stream_options = { ...finalParams.stream_options, include_usage: true };
      }

      const result = await client.chat.completions.create(finalParams);

      localStorage.setItem('kris_ai_last_provider', provider.id);

      // ── Metering: laporkan usage (asli atau null) ke pemanggil ──
      if (finalParams.stream) {
        if (typeof result.__krisMeta === 'function') {
          // Provider omni (fetch manual): usage tertangkap setelah stream
          // habis — bungkus agar onUsage terpanggil tepat saat selesai.
          const inner = result;
          let reported = false;
          async function* reportOnDone() {
            for await (const chunk of inner) {
              yield chunk;
            }
            if (!reported) {
              reported = true;
              const meta = inner.__krisMeta();
              try { opts.onUsage?.({ usage: meta.usage, padChars: meta.padChars, params: finalParams }); } catch (e) { console.warn('[aiClient] onUsage error:', e); }
            }
          }
          return reportOnDone();
        }
        // Provider SDK lain: usage stream tak tertangkap — estimasi fallback.
        try { opts.onUsage?.({ usage: null, padChars: 0, params: finalParams }); } catch (e) { console.warn('[aiClient] onUsage error:', e); }
        return result;
      }

      // Non-stream: usage ada di result.usage (kalau upstream mengirim).
      const usage = result?.usage || null;
      const padChars = result?.__krisPadChars || 0;
      try { opts.onUsage?.({ usage, padChars, params: finalParams }); } catch (e) { console.warn('[aiClient] onUsage error:', e); }

      return result;
    } catch (error) {
      lastError = error;
      console.warn(`[aiClient] Provider "${provider.name}" gagal:`, error.message);

      if (isNetworkError(error) || isQuotaError(error)) {
        // Lanjut ke provider berikutnya
        continue;
      } else {
        // Error lain (auth salah, parsing, dll) — lanjut juga supaya tetap bisa fallback
        continue;
      }
    }
  }

  // Semua provider habis
  const providerNames = available.map((p) => p.name).join(' → ');
  throw new Error(
    `Semua provider AI gagal (${providerNames}).\n` +
    `Detail error terakhir: ${lastError?.message || 'Unknown error'}`
  );
}

// ─────────────────────────────────────────────
// Exports: info & management helpers
// ─────────────────────────────────────────────

export function getConfiguredProviders() {
  return PROVIDERS.map((p) => ({
    ...p,
    hasKey: p.alwaysAvailable || getApiKey(p).length > 0,
    currentKey: p.id === 'omni' ? '' : getApiKey(p), // jangan expose OmniRoute key di UI
  }));
}

export function saveProviderKey(providerId, key) {
  const provider = PROVIDERS.find((p) => p.id === providerId);
  if (!provider) return;
  if (key) {
    localStorage.setItem(provider.localStorageKey, key);
  } else {
    localStorage.removeItem(provider.localStorageKey);
  }
}

export function getLastUsedProvider() {
  return localStorage.getItem('kris_ai_last_provider') || null;
}

export { PROVIDERS };
