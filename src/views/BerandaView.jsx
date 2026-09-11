import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, TrendingUp, History, Download, Ghost } from 'lucide-react';

export default function BerandaView({ setCurrentView }) {
  const [stats, setStats] = useState({
    totalNovels: 0,
    totalWords: 0,
    lastActive: '-'
  });

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('kris_ai_history') || '[]');
      let words = 0;
      history.forEach(n => {
        n.chapters.forEach(c => {
          words += c.trim().split(/\s+/).filter(w => w.length > 0).length;
        });
      });
      setStats({
        totalNovels: history.length,
        totalWords: words,
        lastActive: history.length > 0 ? new Date(history[0].date).toLocaleDateString() : '-'
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', background: 'linear-gradient(135deg, #a5b4fc, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
          Selamat Datang kembali di Kris AI!
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Sastra Engine V6 siap membantumu menciptakan mahakarya hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="premium-card-v2" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '12px', background: 'rgba(99,102,241,0.1)', borderRadius: '12px' }}>
            <BookOpen size={24} color="#a5b4fc" />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Novel</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.totalNovels}</h3>
          </div>
        </div>
        <div className="premium-card-v2" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '12px', background: 'rgba(14,165,233,0.1)', borderRadius: '12px' }}>
            <TrendingUp size={24} color="#38bdf8" />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kata Ter-Generate</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.totalWords.toLocaleString()}</h3>
          </div>
        </div>
        <div className="premium-card-v2" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '12px', background: 'rgba(244,63,94,0.1)', borderRadius: '12px' }}>
            <History size={24} color="#fb7185" />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Aktivitas Terakhir</p>
            <h3 style={{ fontSize: '1.2rem', margin: 0, marginTop: '4px' }}>{stats.lastActive}</h3>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Pintasan Cepat</h2>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1.5rem' }}>
        <button 
          className="premium-card-v2" 
          onClick={() => setCurrentView('generator')}
          style={{ padding: '2rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.3s', border: '1px solid rgba(99,102,241,0.3)', background: 'linear-gradient(145deg, rgba(99,102,241,0.05), transparent)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Sparkles size={24} color="#a5b4fc" />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Novel Generator</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Buat novel dari nol hingga selesai dengan bantuan Sastra Engine V6. Tentukan premis, karakter, outline, dan biarkan AI menuliskan drafnya.
          </p>
        </button>

        <button 
          className="premium-card-v2" 
          onClick={() => setCurrentView('ghostwriter')}
          style={{ padding: '2rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.3s', border: '1px solid rgba(139,92,246,0.3)', background: 'linear-gradient(145deg, rgba(139,92,246,0.05), transparent)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Ghost size={24} color="#c4b5fd" />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Ghostwriter</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Editor teks pintar yang bisa melajutkan tulisanmu secara otomatis saat kamu mengalami writer's block.
          </p>
        </button>
      </div>
    </div>
  );
}
