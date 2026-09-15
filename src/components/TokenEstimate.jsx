/**
 * TokenEstimate.jsx — Chip estimasi pemakaian token SEBELUM aksi dijalankan.
 * Dipakai semua fitur agar gaya konsisten.
 */
import React from 'react';
import { Coins } from 'lucide-react';

export default function TokenEstimate({ min, max, suffix = '' }) {
  const fmt = (n) => n.toLocaleString('id-ID');
  return (
    <span className="token-estimate-chip" title="Perkiraan token yang dipakai (input + output AI)">
      <Coins size={12} />
      <span>
        ≈ {fmt(min)}{max && max !== min ? `–${fmt(max)}` : ''} token{suffix}
      </span>
    </span>
  );
}
