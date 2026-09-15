/**
 * TokenUsageView.jsx — Riwayat Pemakaian Token per fitur.
 * Member: Firestore users/{uid}/usage. Tamu/admin: sessionStorage.
 */
import React, { useState, useEffect } from 'react';
import {
  Activity, MessageSquare, Ghost, FileText, Sparkles, User, Globe,
  List, BookOpen, Wrench, Image as ImageIcon, Settings, Clock,
} from 'lucide-react';
import { fetchUsageLog, FEATURES } from '../lib/tokenUsage';

const FEATURE_ICONS = {
  MessageSquare, Ghost, FileText, Sparkles, User, Globe,
  List, BookOpen, Wrench, Image: ImageIcon, Settings,
};

function relTime(iso) {
  const d = iso?.toDate ? iso.toDate() : new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'baru saja';
  if (s < 3600) return `${Math.floor(s / 60)} menit lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return `${Math.floor(s / 86400)} hari lalu`;
}

export default function TokenUsageView({ user }) {
  const [entries, setEntries] = useState(null);

  const isGuestOrAdmin = !user || user.isGuest || !user.email;

  useEffect(() => {
    let alive = true;
    fetchUsageLog(user?.uid, isGuestOrAdmin, 50)
      .then((log) => { if (alive) setEntries(log); })
      .catch(() => { if (alive) setEntries([]); });
    return () => { alive = false; };
  }, [user?.uid]);

  if (entries === null) {
    return (
      <div className="fade-in" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <span className="loader"></span>
      </div>
    );
  }

  const total = entries.reduce((a, e) => a + (e.charged || 0), 0);
  const weekAgo = Date.now() - 7 * 86400 * 1000;
  const week = entries.filter((e) => {
    const d = e.createdAt?.toDate ? e.createdAt.toDate() : new Date(e.createdAt);
    return d.getTime() >= weekAgo;
  });
  const weekTotal = week.reduce((a, e) => a + (e.charged || 0), 0);
  const avgPerDay = week.length ? Math.round(weekTotal / 7) : 0;

  // Breakdown per fitur
  const byFeature = {};
  entries.forEach((e) => {
    byFeature[e.feature] = (byFeature[e.feature] || 0) + (e.charged || 0);
  });
  const breakdown = Object.entries(byFeature)
    .map(([id, tokens]) => ({ id, tokens, label: FEATURES[id]?.label || 'Lainnya' }))
    .sort((a, b) => b.tokens - a.tokens);
  const maxTokens = Math.max(1, ...breakdown.map((b) => b.tokens));

  const fmt = (n) => n.toLocaleString('id-ID');

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="view-header">
        <div className="view-header-left">
          <div className="view-icon" style={{ background: 'linear-gradient(135deg, #34d399, #0ea5e9)' }}>
            <Activity size={22} />
          </div>
          <div>
            <h1 className="view-title">Pemakaian Token</h1>
            <p className="view-subtitle">Estimasi & riwayat pemakaian semua fitur Kris AI</p>
          </div>
        </div>
        <div className="chip brand">{entries.length} aktivitas terakhir</div>
      </div>

      <div className="section-block">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="premium-card-v2 stat-card">
            <div className="icon-box primary"><Sparkles size={26} color="#818cf8" /></div>
            <div>
              <p className="stat-label">Total Tercatat</p>
              <h3 className="stat-value">{fmt(total)}</h3>
            </div>
          </div>
          <div className="premium-card-v2 stat-card">
            <div className="icon-box sky"><Clock size={26} color="#38bdf8" /></div>
            <div>
              <p className="stat-label">7 Hari Terakhir</p>
              <h3 className="stat-value">{fmt(weekTotal)}</h3>
            </div>
          </div>
          <div className="premium-card-v2 stat-card">
            <div className="icon-box rose"><Activity size={26} color="#fb7185" /></div>
            <div>
              <p className="stat-label">Rata-rata / Hari</p>
              <h3 className="stat-value">{fmt(avgPerDay)}</h3>
            </div>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="premium-card-v2" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <Activity size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
          <p>Belum ada pemakaian tercatat. Coba Chat AI atau Generator Novel dulu!</p>
        </div>
      ) : (
        <>
          {breakdown.length > 0 && (
            <div className="section-block">
              <h2 className="section-title"><Sparkles size={20} color="#fbbf24" /> Per Fitur</h2>
              <div className="premium-card-v2" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {breakdown.map((b) => (
                  <div key={b.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                      <span>{b.label}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{fmt(b.tokens)} token</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', background: 'var(--glass-bg)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.max(3, (b.tokens / maxTokens) * 100)}%`,
                        height: '100%',
                        borderRadius: '3px',
                        background: 'linear-gradient(90deg, #6366f1, #0ea5e9)',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="section-block">
            <h2 className="section-title"><Clock size={20} color="#38bdf8" /> Aktivitas Terakhir</h2>
            <div className="premium-card-v2" style={{ padding: '0.5rem' }}>
              {entries.map((e, idx) => {
                const meta = FEATURES[e.feature] || FEATURES.fallback;
                const Icon = FEATURE_ICONS[meta.icon] || Sparkles;
                return (
                  <div key={e.id || idx} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '0.75rem 1rem',
                    borderBottom: idx < entries.length - 1 ? '1px solid var(--border-color)' : 'none',
                  }}>
                    <div className="icon-box primary" style={{ width: '34px', height: '34px' }}>
                      <Icon size={16} color="#818cf8" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700 }}>{meta.label}</p>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {relTime(e.createdAt)}
                        {e.estimated ? ' · estimasi' : ''}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                        −{fmt(e.charged || 0)}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                        {fmt(e.tokensIn || 0)} in / {fmt(e.tokensOut || 0)} out
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
