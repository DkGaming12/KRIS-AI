/**
 * firebase.js — Inisialisasi Firebase App, Auth & Firestore
 * Config dibaca dari .env (VITE_FIREBASE_*)
 * Firebase hanya diinisialisasi jika API Key tersedia.
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// Guard: hanya init Firebase jika API Key tersedia
// Tanpa ini, app akan crash (blank screen) jika .env belum diisi
let app  = null;
let auth = null;
let db   = null;

if (apiKey) {
  const firebaseConfig = {
    apiKey,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  };
  app  = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db   = getFirestore(app);
} else {
  console.warn('[firebase.js] VITE_FIREBASE_API_KEY tidak ditemukan. Firebase dinonaktifkan — mode lokal aktif.');
}

export { auth, db };
export default app;
