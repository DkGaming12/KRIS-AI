import React from 'react';
import { Zap, ShoppingCart, X } from 'lucide-react';

const WA_ADMIN_NUMBER = '6285700660475';
const WA_BUY_MSG = encodeURIComponent(
  'Halo admin Kris AI! Saya mau beli token tambahan. Bisa info paket yang tersedia? 🙏'
);
export const WA_BUY_LINK = `https://wa.me/${WA_ADMIN_NUMBER}?text=${WA_BUY_MSG}`;

/**
 * TokenEmptyModal — Popup fullscreen blocker saat token habis.
 * Tampilkan ini di App.jsx ketika tokenBalance <= 0.
 */
export default function TokenEmptyModal({ onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #0d0d1a, #12122a)',
          border: '1px solid rgba(167,139,250,0.3)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 0 60px rgba(99,102,241,0.3), 0 0 120px rgba(0,0,0,0.5)',
          position: 'relative',
        }}
      >
        {/* Close button (X kecil di pojok) */}
        <button
          onClick={onClose}
          title="Tutup (tidak bisa menggunakan fitur AI)"
          style={{
            position: 'absolute', top: '14px', right: '14px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px', color: 'rgba(255,255,255,0.3)',
            width: '28px', height: '28px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={14} />
        </button>

        {/* Icon */}
        <div style={{
          width: '70px', height: '70px', borderRadius: '20px', margin: '0 auto 1.25rem',
          background: 'linear-gradient(135deg, #7c3aed, #db2777)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px rgba(124,58,237,0.4)',
        }}>
          <Zap size={32} color="white" />
        </div>

        <h2 style={{
          fontSize: '1.4rem', fontWeight: '900', margin: '0 0 10px 0',
          background: 'linear-gradient(135deg, #c4b5fd, #f9a8d4)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Token Kamu Habis!
        </h2>

        <p style={{
          fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)',
          lineHeight: '1.6', margin: '0 0 1.75rem 0',
        }}>
          Kamu sudah menghabiskan semua token. Beli token tambahan untuk melanjutkan menulis novel, menggunakan Chat AI, dan semua fitur Sastra Engine.
        </p>

        {/* CTA Beli Token */}
        <a
          href={WA_BUY_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            background: 'linear-gradient(135deg, #25d366, #128c7e)',
            color: 'white', textDecoration: 'none', fontWeight: '800',
            fontSize: '1rem', padding: '14px 24px', borderRadius: '14px',
            boxShadow: '0 4px 20px rgba(37,211,102,0.3)',
            transition: 'all 0.2s',
          }}
        >
          <ShoppingCart size={20} />
          Beli Token via WhatsApp
        </a>

        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', marginTop: '14px' }}>
          Pembayaran aman · Proses cepat · Langsung aktif
        </p>
      </div>
    </div>
  );
}
