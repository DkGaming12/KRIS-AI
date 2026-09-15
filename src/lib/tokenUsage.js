/**
 * tokenUsage.js — Metering pemakaian token per fitur
 *
 * Model ekonomi:
 *   - Tagihan = usage.total_tokens API asli − token padding anti-WAF
 *   - Bila usage tak tersedia → estimasi fallback: ceil(chars/4)
 *   - Log per fitur: Firestore users/{uid}/usage (member), sessionStorage (tamu)
 */

import {
  doc,
  updateDoc,
  increment,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Registry fitur ──────────────────────────────────────────────────────────
export const FEATURES = {
  chat:        { id: 'chat',        label: 'Chat AI',            icon: 'MessageSquare' },
  ghostwriter: { id: 'ghostwriter', label: 'Ghostwriter',        icon: 'Ghost' },
  makalah:     { id: 'makalah',     label: 'Buat Makalah',       icon: 'FileText' },
  gen_ide:     { id: 'gen_ide',     label: 'Generator: Ide',     icon: 'Sparkles' },
  gen_karakter:{ id: 'gen_karakter',label: 'Generator: Karakter',icon: 'User' },
  gen_dunia:   { id: 'gen_dunia',   label: 'Generator: Dunia',   icon: 'Globe' },
  gen_outline: { id: 'gen_outline', label: 'Generator: Outline', icon: 'List' },
  gen_episode: { id: 'gen_episode', label: 'Generator: Episode', icon: 'BookOpen' },
  gen_koreksi: { id: 'gen_koreksi', label: 'Generator: Koreksi', icon: 'Wrench' },
  gen_cover:   { id: 'gen_cover',   label: 'Generator: Cover',   icon: 'Image' },
  tool:        { id: 'tool',        label: 'Writer Tool',        icon: 'Settings' },
  fallback:    { id: 'fallback',    label: 'AI',                 icon: 'Sparkles' },
};

export const GUEST_USAGE_KEY = 'kris_ai_guest_usage';
const GUEST_LOG_MAX = 50;

// ─── Estimasi & tagihan ──────────────────────────────────────────────────────

/** Estimasi kasar token dari teks: ~4 karakter = 1 token */
export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(String(text).length / 4);
}

/**
 * Hitung tagihan final sebuah request AI.
 * @param {object|null} usage - field `usage` respons API ({prompt_tokens, completion_tokens, total_tokens})
 * @param {number} padChars - jumlah karakter padding anti-WAF (header X-Kris-Pad-Chars)
 * @param {string} fallbackInput - teks input utk estimasi bila usage null
 * @param {string} fallbackOutput - teks output utk estimasi bila usage null
 * @returns {{charged:number, tokensIn:number, tokensOut:number, estimated:boolean}}
 */
export function computeCharge(usage, padChars = 0, fallbackInput = '', fallbackOutput = '') {
  // Jalur 1: usage asli dari API — kurangi token padding (biaya artifisial WAF)
  if (usage && typeof usage.total_tokens === 'number' && usage.total_tokens > 0) {
    const padTokens = Math.ceil((padChars || 0) / 4);
    const tokensIn = Math.max(0, (usage.prompt_tokens ?? 0) - padTokens);
    const tokensOut = usage.completion_tokens ?? (usage.total_tokens - (usage.prompt_tokens ?? 0));
    const charged = Math.max(1, tokensIn + Math.max(0, tokensOut));
    return { charged, tokensIn, tokensOut: Math.max(0, tokensOut), estimated: false };
  }

  // Jalur 2: fallback estimasi dari panjang teks
  const tokensIn = estimateTokens(fallbackInput);
  const tokensOut = estimateTokens(fallbackOutput);
  return { charged: Math.max(1, tokensIn + tokensOut), tokensIn, tokensOut, estimated: true };
}

// ─── Log pemakaian ───────────────────────────────────────────────────────────

function readGuestLog() {
  try {
    return JSON.parse(sessionStorage.getItem(GUEST_USAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeGuestLog(entries) {
  try {
    sessionStorage.setItem(GUEST_USAGE_KEY, JSON.stringify(entries.slice(0, GUEST_LOG_MAX)));
  } catch {
    // Abaikan kegagalan storage.
  }
}

/**
 * Catat satu entri pemakaian (dipanggil setelah tagihan dihitung).
 * Member → Firestore users/{uid}/usage + increment totalTokensUsed.
 * Tamu  → sessionStorage (maks 50 entri).
 */
export async function logUsage(uid, isGuest, entry) {
  const record = {
    feature: entry.feature || 'fallback',
    tokensIn: entry.tokensIn ?? 0,
    tokensOut: entry.tokensOut ?? 0,
    charged: entry.charged ?? 0,
    estimated: Boolean(entry.estimated),
    createdAt: new Date().toISOString(),
  };

  if (isGuest || !uid || !db) {
    writeGuestLog([record, ...readGuestLog()]);
    return record;
  }

  try {
    await addDoc(collection(db, 'users', uid, 'usage'), {
      ...record,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'users', uid), {
      totalTokensUsed: increment(record.charged),
    });
  } catch (e) {
    console.warn('[tokenUsage] Gagal mencatat pemakaian:', e);
    writeGuestLog([record, ...readGuestLog()]);
  }
  return record;
}

/**
 * Ambil N entri pemakaian terbaru.
 * @returns {Promise<Array>} terbaru dulu
 */
export async function fetchUsageLog(uid, isGuest, max = 50) {
  if (isGuest || !uid || !db) return readGuestLog();
  try {
    const q = query(collection(db, 'users', uid, 'usage'), orderBy('createdAt', 'desc'), limit(max));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn('[tokenUsage] Gagal membaca riwayat:', e);
    return [];
  }
}
