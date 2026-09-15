/**
 * tokenPackages.js — Satu sumber kebenaran harga paket token.
 * Dipakai oleh BeliTokenView & halaman Daftar (LoginView).
 */

export const TOKEN_PACKAGES = [
  {
    id: 'starter',
    name: 'Paket Starter',
    tokens: '100.000',
    tokensValue: 100_000,
    originalPrice: 'Rp 35.000',
    price: 'Rp 25.000',
    desc: 'Cocok untuk penulis pemula yang ingin mencoba fitur Kris AI.',
    color: '#38bdf8',
    gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
  },
  {
    id: 'pro',
    name: 'Paket Pro',
    tokens: '500.000',
    tokensValue: 500_000,
    originalPrice: 'Rp 129.000',
    price: 'Rp 100.000',
    desc: 'Pilihan terpopuler! Selesaikan 1-2 novel dengan nyaman.',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
    popular: true,
  },
  {
    id: 'sultan',
    name: 'Paket Sultan',
    tokens: '1.000.000',
    tokensValue: 1_000_000,
    originalPrice: 'Rp 219.000',
    price: 'Rp 175.000',
    desc: 'Untuk penulis produktif. Harga lebih hemat, bebas khawatir habis token.',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  },
];

export const WELCOME_GRANT = {
  name: 'Welcome',
  tokens: '10.000',
  price: 'GRATIS',
  desc: 'Token gratis untuk user baru setelah aktivasi akun.',
  color: '#34d399',
};
