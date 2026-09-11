/**
 * aiClient.js — Node.js version of the multi-provider AI client
 * Sama dengan src/lib/aiClient.js tapi pakai process.env & dotenv
 * Support streaming via openai SDK
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

// Load .env dari root project (satu level di atas cli/)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../../.env');

if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && !process.env[key]) {
        process.env[key] = vals.join('=');
      }
    }
  });
}

import OpenAI from 'openai';

// ─── Provider Configurations ───────────────────────────────────

const OMNI_BASE_URL = process.env.VITE_OPENAI_BASE_URL || 'http://localhost:20127/v1';
const OMNI_API_KEY  = process.env.VITE_OPENAI_API_KEY  || 'dummy';

const PROVIDERS = [
  {
    id: 'omni',
    name: 'OpenRouter',
    baseURL: OMNI_BASE_URL,
    envKey: 'VITE_OPENAI_API_KEY',
    models: {
      default: 'openrouter/auto',
      powerful: 'openrouter/auto',
      fast: 'openrouter/auto',
    },
    alwaysAvailable: true,
    errorCodes: [429, 402, 403, 401],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    envKey: 'VITE_GEMINI_API_KEY',
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
    models: {
      default: 'gpt-4o-mini',
      powerful: 'gpt-4o',
      fast: 'gpt-4o-mini',
    },
    alwaysAvailable: false,
    errorCodes: [429, 402, 403, 401],
  },
];

// ─── Helpers ──────────────────────────────────────────────────

function getApiKey(provider) {
  // OmniRoute: pakai key dari env (9router key)
  if (provider.id === 'omni') {
    return process.env[provider.envKey] || OMNI_API_KEY;
  }
  // Provider lain: hanya pakai key-nya sendiri, jangan fallback ke OMNI key
  return process.env[provider.envKey] || '';
}

function getAvailableProviders() {
  return PROVIDERS.filter(p => {
    if (p.alwaysAvailable) return true;
    // Hanya masukkan provider jika punya key sendiri
    return getApiKey(p).length > 0;
  });
}

function buildClient(provider) {
  return new OpenAI({
    apiKey: getApiKey(provider),
    baseURL: provider.baseURL,
  });
}

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
    msg.includes('afford')
  );
}

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

function resolveModel(provider, requestedModel) {
  if (provider.id === 'omni') return requestedModel || 'auto';
  if (!requestedModel || requestedModel === 'auto') return provider.models.default;
  const isKnown = Object.values(provider.models).includes(requestedModel);
  return isKnown ? requestedModel : provider.models.default;
}

// ─── Core: Chat with fallback (streaming) ─────────────────────

/**
 * Stream chat completion dengan auto-fallback
 * @param {Array} messages - [{role, content}]
 * @param {object} opts - { model, onChunk, onProviderSwitch }
 * @returns {Promise<string>} - full response text
 */
export async function streamChatWithFallback(messages, opts = {}) {
  const { model = 'auto', onChunk, onProviderSwitch } = opts;
  const available = getAvailableProviders();

  if (available.length === 0) {
    throw new Error(
      'Tidak ada provider AI tersedia. Pastikan 9router berjalan atau isi API Key di .env'
    );
  }

  let lastError = null;
  let usedProvider = null;

  for (const provider of available) {
    try {
      const client = buildClient(provider);
      const resolvedModel = resolveModel(provider, model);

      if (onProviderSwitch) onProviderSwitch(provider.name);
      usedProvider = provider.name;

      const stream = await client.chat.completions.create({
        model: resolvedModel,
        messages,
        stream: true,
        temperature: 0.85,
        max_tokens: 4096,
      });

      let fullText = '';
      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content || '';
        if (content) {
          fullText += content;
          if (onChunk) onChunk(content);
        }
      }

      return { text: fullText, provider: provider.name };
    } catch (error) {
      lastError = error;
      if (isNetworkError(error) || isQuotaError(error)) {
        continue;
      } else {
        continue;
      }
    }
  }

  const providerNames = available.map(p => p.name).join(' → ');
  throw new Error(
    `Semua provider gagal (${providerNames}).\nError: ${lastError?.message || 'Unknown'}`
  );
}

/**
 * Non-streaming chat (untuk tool yang butuh full response)
 */
export async function chatWithFallback(messages, opts = {}) {
  const { model = 'auto', onProviderSwitch } = opts;
  const available = getAvailableProviders();

  if (available.length === 0) {
    throw new Error('Tidak ada provider AI tersedia.');
  }

  let lastError = null;

  for (const provider of available) {
    try {
      const client = buildClient(provider);
      const resolvedModel = resolveModel(provider, model);

      if (onProviderSwitch) onProviderSwitch(provider.name);

      const result = await client.chat.completions.create({
        model: resolvedModel,
        messages,
        temperature: 0.85,
        max_tokens: 4096,
      });

      return {
        text: result.choices[0]?.message?.content || '',
        provider: provider.name,
      };
    } catch (error) {
      lastError = error;
      continue;
    }
  }

  const providerNames = available.map(p => p.name).join(' → ');
  throw new Error(`Semua provider gagal (${providerNames}). Error: ${lastError?.message}`);
}

export function getProviderStatus() {
  const available = getAvailableProviders();
  return available.map(p => ({
    name: p.name,
    id: p.id,
    baseURL: p.baseURL,
    model: p.models.default,
  }));
}

export { PROVIDERS };
