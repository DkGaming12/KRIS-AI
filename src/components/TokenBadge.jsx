/**
 * TokenBadge.jsx — Komponen saldo token di sidebar
 * Tampil elegan, tidak menampilkan biaya per-aksi
 */
import React, { useMemo } from 'react';
import { Zap, ShoppingCart } from 'lucide-react';

export default function TokenBadge({ tokenBalance, onBuyClick }) {
  const formatted = useMemo(() =>
    (tokenBalance ?? 0).toLocaleString('id-ID'),
    [tokenBalance]
  );

  const isLow     = tokenBalance < 1_000;
  const isCritical = tokenBalance < 200;

  const statusColor = isCritical
    ? '#ef4444'
    : isLow
      ? '#f59e0b'
      : '#a5b4fc';

  const statusGlow = isCritical
    ? 'rgba(239,68,68,0.3)'
    : isLow
      ? 'rgba(245,158,11,0.3)'
      : 'rgba(165,180,252,0.15)';

  return (
    <div style={{
      background: `linear-gradient(135deg, ${statusGlow}, rgba(14,165,233,0.05))`,
      border: `1px solid ${isLow ? statusColor + '40' : 'rgba(99,102,241,0.2)'}`,
      borderRadius: '1rem',
      padding: '0.75rem 1rem',
      marginBottom: '0.85rem',
      transition: 'all 0.4s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{
            fontSize: '0.6rem',
            fontWeight: '800',
            color: 'var(--text-secondary)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            Saldo Token
          </p>
          <p style={{
            fontSize: '1.1rem',
            fontWeight: '900',
            background: `linear-gradient(135deg, ${statusColor}, #0ea5e9)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginTop: '2px',
            lineHeight: '1',
            margin: 0,
          }}>
            {formatted}
          </p>
          {isLow && (
            <p style={{
              fontSize: '0.6rem',
              color: statusColor,
              marginTop: '3px',
              fontWeight: '700',
              margin: 0,
            }}>
              {isCritical ? '⚠️ Token hampir habis!' : '⚡ Saldo menipis'}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <Zap size={18} color={statusColor} style={{ opacity: 0.8 }} />
          {isLow && (
            <button
              onClick={onBuyClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.58rem',
                fontWeight: '900',
                color: '#25d366',
                background: 'rgba(37,211,102,0.1)',
                border: '1px solid rgba(37,211,102,0.25)',
                borderRadius: '6px',
                padding: '4px 8px',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              <ShoppingCart size={10} />
              Beli Token
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
