/**
 * TokenToast.jsx — Notifikasi global "fitur · −N token" setelah aksi AI.
 * Render satu kali di layout; muncul 4 detik lalu fade.
 */
import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { FEATURES } from '../lib/tokenUsage';

export default function TokenToast({ spend }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!spend) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, [spend]);

  if (!spend) return null;

  const label = FEATURES[spend.feature]?.label || 'AI';
  return (
    <div className={`token-toast ${visible ? 'show' : ''}`} role="status">
      <Zap size={14} />
      <span className="token-toast-label">{label}</span>
      <span className="token-toast-amount">−{spend.charged.toLocaleString('id-ID')} token</span>
    </div>
  );
}
