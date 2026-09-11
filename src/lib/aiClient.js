/**
 * aiClient.js — Multi-provider AI client dengan auto-fallback
 * Urutan fallback: OmniRoute (lokal) → Gemini → Groq → OpenAI → Error
 */

import OpenAI from 'openai';

// ─────────────────────────────────────────────
// Provider configurations
// ─────────────────────────────────────────────

const OMNI_BASE_URL = import.meta.env.VITE_OPENAI_BASE_URL || 'http://localhost:20127/v1';
const OMNI_API_KEY  = import.meta.env.VITE_OPENAI_API_KEY  || 'dummy';

const PROVIDERS = [
  {
    id: 'omni',
    name: 'OpenRouter',
    // baseURL & apiKey di-resolve secara dinamis — lihat buildClient()
    baseURL: OMNI_BASE_URL,
    envKey: 'VITE_OPENAI_API_KEY',       // env key yang dibaca
    localStorageKey: 'kris_ai_api_key',  // localStorage key (lama / compat)
    // OmniRoute punya multi-provider sendiri, jadi "auto" valid di sini
    models: {
      default: 'openrouter/auto',
      powerful: 'openrouter/auto',
      fast: 'openrouter/auto',
    },
    // OmniRoute dianggap "tersedia" kalau endpoint-nya reachable
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
      default: 'llama3-70b-8192',
      powerful: 'llama3-70b-8192',
      fast: 'llama3-8b-8192',
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
  // OmniRoute: pakai env key langsung (atau 'dummy' jika tidak ada)
  if (provider.id === 'omni') {
    return localStorage.getItem(provider.localStorageKey)
      || import.meta.env[provider.envKey]
      || OMNI_API_KEY;
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
    // OmniRoute support 'auto' natively
    return requestedModel || 'auto';
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
export async function chatWithFallback(params, onProviderSwitch) {
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

      if (onProviderSwitch) onProviderSwitch(provider.name);

      const result = await client.chat.completions.create({
        ...params,
        model,
      });

      localStorage.setItem('kris_ai_last_provider', provider.id);
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
