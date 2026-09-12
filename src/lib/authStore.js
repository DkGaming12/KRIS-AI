/**
 * authStore.js — Custom hook useAuth + manajemen token user
 * 
 * Token ekonomi:
 *   - User baru dapat 10.000 token gratis
 *   - Token dikurangi diam-diam setelah AI response
 *   - 1 kata output AI = 1 token
 *   - User TIDAK melihat berapa token per aksi — hanya saldo total
 */

import { useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  getAuth,
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import app, { auth, db } from './firebase';

// ─── Konstanta ───────────────────────────────────────────────────────────────
export const INITIAL_TOKEN_GRANT = 10_000;
const GUEST_SESSION_KEY = 'kris_ai_guest_session';

function readGuestSession() {
  if (typeof window === 'undefined') return null;

  try {
    const rawSession = window.sessionStorage.getItem(GUEST_SESSION_KEY);
    if (!rawSession) return null;

    const parsed = JSON.parse(rawSession);
    if (!parsed?.user) return null;

    return parsed;
  } catch {
    return null;
  }
}

function writeGuestSession(payload) {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(payload));
  } catch {
    // Abaikan kegagalan storage agar mode tamu tetap bisa dipakai.
  }
}

function clearGuestSession() {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.removeItem(GUEST_SESSION_KEY);
  } catch {
    // Abaikan kegagalan storage.
  }
}

// ─── Firestore helpers ───────────────────────────────────────────────────────

/** Ambil atau buat dokumen user di Firestore */
async function ensureUserDoc(uid, email) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // User baru — kasih token gratis
    await setDoc(ref, {
      email,
      tokenBalance: INITIAL_TOKEN_GRANT,
      totalTokensUsed: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { tokenBalance: INITIAL_TOKEN_GRANT, totalTokensUsed: 0 };
  }

  return snap.data();
}

/** Ambil saldo token terkini */
export async function fetchTokenBalance(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data().tokenBalance ?? 0) : 0;
}

/**
 * Kurangi token berdasarkan jumlah kata output AI.
 * Dipanggil SETELAH AI selesai menjawab — user tidak melihat nominal per-aksi.
 * @param {string} uid
 * @param {string} aiOutput - teks yang dihasilkan AI
 * @returns {Promise<number>} saldo token terbaru
 */
export async function spendTokensForOutput(uid, aiOutput) {
  if (!uid || !aiOutput) return 0;

  const wordCount = aiOutput
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const tokensToSpend = Math.max(1, wordCount); // minimal 1

  const ref = doc(db, 'users', uid);
  await updateDoc(ref, {
    tokenBalance:    increment(-tokensToSpend),
    totalTokensUsed: increment(tokensToSpend),
    updatedAt:       serverTimestamp(),
  });

  return fetchTokenBalance(uid);
}

/**
 * Tambah token (dipanggil admin setelah pembelian).
 * Bisa dipakai dari Firebase Console, atau dari kode admin di masa depan.
 */
export async function addTokens(uid, amount) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, {
    tokenBalance: increment(amount),
    updatedAt:    serverTimestamp(),
  });
  return fetchTokenBalance(uid);
}

export async function addTokensByEmail(email, amount) {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) throw new Error("Email pengguna tidak ditemukan.");
  const userDoc = snapshot.docs[0];
  return await addTokens(userDoc.id, amount);
}

/**
 * Buat user baru dari Admin Panel tanpa logout admin.
 * Menggunakan instance Firebase sekunder.
 */
export async function adminCreateUser(email, password, bonusTokens) {
  if (!app) throw new Error('Firebase belum diinisialisasi');
  
  // Buat secondary app untuk register
  const secondaryApp = initializeApp(app.options, "SecondaryApp_" + Date.now());
  const secondaryAuth = getAuth(secondaryApp);
  
  try {
    const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const newUid = userCred.user.uid;
    
    // Langsung buat dokumen Firestore untuk user baru
    const ref = doc(db, 'users', newUid);
    await setDoc(ref, {
      email: email,
      tokenBalance: parseInt(bonusTokens, 10) || 10000,
      totalTokensUsed: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Logout secondary app agar clean
    await firebaseSignOut(secondaryAuth);
    return newUid;
  } catch (e) {
    throw e;
  }
}

// ─── Hook utama ──────────────────────────────────────────────────────────────

/**
 * useAuth() — satu-satunya hook yang perlu dipakai di App.jsx
 * Expose: user, userProfile, tokenBalance, loading, authError,
 *         signIn(email, pass), signOut(), refreshToken()
 */
export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [guestUser, setGuestUser] = useState(() => readGuestSession()?.user ?? null);
  const [userProfile, setUserProfile] = useState(() => readGuestSession()?.profile ?? null);
  const [tokenBalance, setTokenBalance] = useState(() => readGuestSession()?.tokenBalance ?? 0);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Dengarkan perubahan auth state
  useEffect(() => {
    // Guard: jika Firebase tidak diinisialisasi (API Key tidak ada di .env),
    // langsung selesaikan loading agar app tidak stuck selamanya.
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        setGuestUser(null);
        clearGuestSession();
        if (fbUser.email === 'didikpurnomoipung21@gmail.com' || fbUser.email === 'didikpurnomoipu@gmail.com') {
          setTokenBalance(999999999);
        }

        try {
          const profile = await ensureUserDoc(fbUser.uid, fbUser.email);
          setUserProfile(profile);
          if (fbUser.email !== 'didikpurnomoipung21@gmail.com' && fbUser.email !== 'didikpurnomoipu@gmail.com') {
            setTokenBalance(profile.tokenBalance ?? 0);
          }
        } catch (e) {
          console.error('[useAuth] Gagal load profil:', e);
        }
      } else {
        setFirebaseUser(null);
        // Jika tidak ada user firebase, dan tidak ada tamu, baru reset state
        // (Guest state akan dikelola terpisah tanpa menabrak Firebase Auth)
        if (!guestUser) {
          setUserProfile(null);
          setTokenBalance(0);
        }
      }
      setLoading(false);
    });

    return unsub;
  }, [guestUser]);

  /** Login dengan email + password */
  const signIn = useCallback(async (email, password) => {
    setAuthError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged akan handle sisanya
    } catch (err) {
      const msg = mapFirebaseError(err.code);
      setAuthError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  }, []);

  /** Login sebagai Tamu (Ephemeral) */
  const signInAsGuest = useCallback(() => {
    const dummyGuest = {
      uid: 'guest-' + Date.now(),
      email: 'tamu@kris.ai',
      displayName: 'Tamu Mode',
      isGuest: true
    };
    setGuestUser(dummyGuest);
    setUserProfile({
      isGuest: true,
      displayName: 'Tamu Mode',
      email: dummyGuest.email,
    });
    setTokenBalance(100); // Saldo token demo untuk mode tamu
    writeGuestSession({
      user: dummyGuest,
      profile: {
        isGuest: true,
        displayName: 'Tamu Mode',
        email: dummyGuest.email,
      },
      tokenBalance: 100,
    });
    setAuthError('');
  }, []);

  /** Logout */
  const signOut = useCallback(async () => {
    if (guestUser) {
      setGuestUser(null);
      setTokenBalance(0);
      setUserProfile(null);
      clearGuestSession();
    } else {
      await firebaseSignOut(auth);
    }
  }, [guestUser]);

  const activeUser = firebaseUser || guestUser;

  /** Refresh saldo token dari Firestore */
  const refreshToken = useCallback(async () => {
    if (!activeUser || activeUser.isGuest) return;
    if (activeUser.email === 'didikpurnomoipung21@gmail.com' || activeUser.email === 'didikpurnomoipu@gmail.com') {
      setTokenBalance(999999999);
      return;
    }
    const bal = await fetchTokenBalance(activeUser.uid);
    setTokenBalance(bal);
  }, [activeUser]);

  const spendTokens = useCallback(async (aiOutput) => {
    if (!activeUser || !aiOutput) return;
    
    const wordCount = aiOutput.trim().split(/\\s+/).filter((w) => w.length > 0).length;
    const tokensToSpend = Math.max(1, wordCount);

    if (activeUser.isGuest) {
      setTokenBalance(prev => Math.max(0, prev - tokensToSpend));
      return;
    }

    if (activeUser.email === 'didikpurnomoipung21@gmail.com' || activeUser.email === 'didikpurnomoipu@gmail.com') return; // Unlimited for admin
    const newBalance = await spendTokensForOutput(activeUser.uid, aiOutput);
    setTokenBalance(newBalance);
  }, [activeUser]);

  return {
    user: activeUser,
    userProfile,
    tokenBalance,
    loading,
    authError,
    setAuthError,
    signIn,
    signInAsGuest,
    signOut,
    refreshToken,
    spendTokens,
    isAuthenticated: !!activeUser,
    hasTokens: tokenBalance > 0,
  };
}

// ─── Terjemahan kode error Firebase ──────────────────────────────────────────
function mapFirebaseError(code) {
  const map = {
    'auth/user-not-found':        'Email tidak terdaftar. Hubungi admin untuk mendaftar.',
    'auth/wrong-password':        'Password salah. Coba lagi.',
    'auth/invalid-email':         'Format email tidak valid.',
    'auth/user-disabled':         'Akun dinonaktifkan. Hubungi admin.',
    'auth/too-many-requests':     'Terlalu banyak percobaan login. Coba beberapa menit lagi.',
    'auth/invalid-credential':    'Email atau password salah.',
    'auth/network-request-failed':'Koneksi gagal. Periksa internet kamu.',
  };
  return map[code] || `Login gagal (${code}). Coba lagi.`;
}
