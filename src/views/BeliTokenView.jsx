import React from 'react';
import { Zap, CheckCircle, MessageCircle, Star } from 'lucide-react';

const WA_ADMIN_NUMBER = '6285700660475';

const PACKAGES = [
  {
    id: 'starter',
    name: 'Paket Starter',
    tokens: '100.000',
    originalPrice: 'Rp 35.000',
    price: 'Rp 25.000',
    desc: 'Cocok untuk penulis pemula yang ingin mencoba fitur Kris AI.',
    color: '#38bdf8',
    gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)'
  },
  {
    id: 'pro',
    name: 'Paket Pro',
    tokens: '500.000',
    originalPrice: 'Rp 129.000',
    price: 'Rp 100.000',
    desc: 'Pilihan terpopuler! Selesaikan 1-2 novel dengan nyaman.',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
    popular: true
  },
  {
    id: 'sultan',
    name: 'Paket Sultan',
    tokens: '1.000.000',
    originalPrice: 'Rp 219.000',
    price: 'Rp 175.000',
    desc: 'Untuk penulis produktif. Harga lebih hemat, bebas khawatir habis token.',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)'
  }
];

export default function BeliTokenView() {
  const handleBuy = (pkg) => {
    const text = encodeURIComponent(`Halo admin Kris AI! Saya ingin membeli *${pkg.name}* (${pkg.tokens} Token) seharga ${pkg.price}. Mohon info pembayarannya 🙏`);
    window.open(`https://wa.me/${WA_ADMIN_NUMBER}?text=${text}`, '_blank');
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="view-header">
        <div className="view-header-left">
          <div className="view-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
            <Zap size={22} />
          </div>
          <div>
            <h1 className="view-title">Beli Token AI</h1>
            <p className="view-subtitle">Isi ulang token untuk semua fitur Kris AI</p>
          </div>
        </div>
      </div>

      <div style={{
        marginBottom: '2rem', textAlign: 'center', padding: '2rem 1rem',
        background: 'linear-gradient(160deg, rgba(167,139,250,0.05), rgba(99,102,241,0.02))',
        borderRadius: '20px', border: '1px solid rgba(167,139,250,0.1)'
      }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '0 0 10px 0', background: 'linear-gradient(135deg, #c4b5fd, #f9a8d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Tingkatkan Kreativitas Tanpa Batas
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
          Token digunakan untuk menghasilkan teks (1 kata = 1 token). Pilih paket yang sesuai dengan kebutuhan menulismu. Pembayaran aman dan token langsung ditambahkan ke akunmu.
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '1rem', padding: '8px 14px', borderRadius: '999px', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', color: '#25d366', fontSize: '0.82rem', fontWeight: '800' }}>
          <Star size={14} /> Harga promo aktif terus
        </div>
      </div>

      {/* Grid Paket */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {PACKAGES.map((pkg) => (
          <div key={pkg.id} style={{
            background: 'rgba(255,255,255,0.02)',
            border: pkg.popular ? `2px solid ${pkg.color}80` : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px', padding: '2rem 1.5rem',
            display: 'flex', flexDirection: 'column', position: 'relative',
            boxShadow: pkg.popular ? `0 0 40px ${pkg.color}20` : 'none',
            transition: 'transform 0.2s', cursor: 'default'
          }}
          className="hover-scale"
          >
            {pkg.popular && (
              <div style={{
                position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                background: pkg.gradient, color: 'white', padding: '4px 14px', borderRadius: '20px',
                fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px',
                boxShadow: `0 4px 12px ${pkg.color}40`
              }}>
                <Star size={12} fill="white" /> PALING LARIS
              </div>
            )}

            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: pkg.color, margin: '0 0 5px 0' }}>{pkg.name}</h3>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '15px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: '1' }}>
                {pkg.tokens}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Token</span>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textDecoration: 'line-through', marginBottom: '4px' }}>
                Harga normal {pkg.originalPrice}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981' }}>
                Harga promo {pkg.price}
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 20px 0', flex: 1 }}>
              {pkg.desc}
            </p>

            <button
              onClick={() => handleBuy(pkg)}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #25d366, #128c7e)', border: 'none',
                color: 'white', fontWeight: '700', fontSize: '0.95rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(37,211,102,0.3)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <MessageCircle size={18} />
              Beli via WhatsApp
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
