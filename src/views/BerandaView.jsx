import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, TrendingUp, History, Download, Ghost, Code, Terminal, FileText, Cpu, Zap, Star } from 'lucide-react';

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
    <div className="fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* ── HERO SECTION ── */}
      <div style={{
        position: 'relative',
        padding: '3rem 2rem',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 27, 75, 0.8))',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        overflow: 'hidden',
        marginBottom: '3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        {/* Decorative background glow */}
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '20px', marginBottom: '1.5rem' }}>
            <Sparkles size={14} color="#c084fc" />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '1px' }}>Engine V6 Aktif</span>
          </div>
          
          <h1 style={{ fontSize: '2.8rem', fontWeight: '900', margin: '0 0 1rem 0', lineHeight: '1.2' }}>
            Selamat Datang di <br />
            <span style={{ background: 'linear-gradient(135deg, #c084fc, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 2px 10px rgba(139,92,246,0.2))' }}>
              KRIS AI Ecosystem
            </span>
          </h1>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Lebih dari sekadar mesin penulis novel. KRIS AI kini berevolusi menjadi asisten cerdas <i>All-in-One</i> untuk <strong>karya sastra, penyusunan makalah akademik, hingga pendamping pemrograman (coding)</strong> Anda.
          </p>
        </div>
      </div>

      {/* ── STATISTIK ── */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <TrendingUp size={20} color="#38bdf8" /> Statistik Anda
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="premium-card-v2" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ padding: '14px', background: 'rgba(99,102,241,0.15)', borderRadius: '14px', boxShadow: '0 0 20px rgba(99,102,241,0.2)' }}>
            <BookOpen size={26} color="#818cf8" />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>Total Novel</p>
            <h3 style={{ fontSize: '1.6rem', margin: 0, fontWeight: '800', color: '#ffffff' }}>{stats.totalNovels}</h3>
          </div>
        </div>
        <div className="premium-card-v2" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ padding: '14px', background: 'rgba(14,165,233,0.15)', borderRadius: '14px', boxShadow: '0 0 20px rgba(14,165,233,0.2)' }}>
            <FileText size={26} color="#38bdf8" />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>Kata Ter-Generate</p>
            <h3 style={{ fontSize: '1.6rem', margin: 0, fontWeight: '800', color: '#ffffff' }}>{stats.totalWords.toLocaleString()}</h3>
          </div>
        </div>
        <div className="premium-card-v2" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ padding: '14px', background: 'rgba(244,63,94,0.15)', borderRadius: '14px', boxShadow: '0 0 20px rgba(244,63,94,0.2)' }}>
            <History size={26} color="#fb7185" />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>Aktivitas Terakhir</p>
            <h3 style={{ fontSize: '1.2rem', margin: 0, marginTop: '4px', fontWeight: '700', color: '#ffffff' }}>{stats.lastActive}</h3>
          </div>
        </div>
      </div>

      {/* ── LAYANAN UNGGULAN ── */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Star size={20} color="#fbbf24" /> Fitur Unggulan KRIS AI
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1.5rem' }}>
        
        {/* 1. Novel Generator */}
        <button 
          className="premium-card-v2" 
          onClick={() => setCurrentView('generator')}
          style={{ padding: '1.8rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.3s', border: '1px solid rgba(99,102,241,0.3)', background: 'linear-gradient(145deg, rgba(99,102,241,0.08), rgba(30,41,59,0.5))' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ padding: '10px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: '10px', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
              <BookOpen size={20} color="white" />
            </div>
            <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '800', color: '#ffffff' }}>Novel Generator</h3>
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Buat mahakarya fiksi dari nol. Susun premis, karakter, outline bab, hingga biarkan AI menyusun draf cerita epik untuk Anda.
          </p>
        </button>

        {/* 2. Chat & Coding Assistant */}
        <button 
          className="premium-card-v2" 
          onClick={() => setCurrentView('chat')}
          style={{ padding: '1.8rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.3s', border: '1px solid rgba(16,185,129,0.3)', background: 'linear-gradient(145deg, rgba(16,185,129,0.08), rgba(30,41,59,0.5))' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ padding: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '10px', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' }}>
              <Code size={20} color="white" />
            </div>
            <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '800', color: '#ffffff' }}>Chat & Coding Assistant</h3>
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Diskusikan apa saja dengan KRIS AI. Termasuk <strong>menulis kode, debugging, dan merancang arsitektur aplikasi (Software Engineering)</strong>.
          </p>
        </button>

        {/* 3. Makalah Akademik */}
        <button 
          className="premium-card-v2" 
          onClick={() => setCurrentView('makalah')}
          style={{ padding: '1.8rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.3s', border: '1px solid rgba(245,158,11,0.3)', background: 'linear-gradient(145deg, rgba(245,158,11,0.08), rgba(30,41,59,0.5))' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ padding: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '10px', boxShadow: '0 4px 15px rgba(245,158,11,0.4)' }}>
              <FileText size={20} color="white" />
            </div>
            <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '800', color: '#ffffff' }}>Buat Makalah Akademik</h3>
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Susun karya tulis ilmiah, esai, dan makalah otomatis lengkap dengan <strong>Sitasi APA</strong> dan siap diexport langsung ke format MS Word (.docx).
          </p>
        </button>

        {/* 4. Ghostwriter */}
        <button 
          className="premium-card-v2" 
          onClick={() => setCurrentView('ghostwriter')}
          style={{ padding: '1.8rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.3s', border: '1px solid rgba(139,92,246,0.3)', background: 'linear-gradient(145deg, rgba(139,92,246,0.08), rgba(30,41,59,0.5))' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ padding: '10px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', borderRadius: '10px', boxShadow: '0 4px 15px rgba(139,92,246,0.4)' }}>
              <Ghost size={20} color="white" />
            </div>
            <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '800', color: '#ffffff' }}>Ghostwriter</h3>
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Editor teks pintar (WYSIWYG) yang dapat melanjutkan tulisan Anda. Sangat cocok saat Anda mengalami <i>writer's block</i>.
          </p>
        </button>

      </div>
    </div>
  );
}
