import React from 'react';
import { Info, Sparkles, BookOpen, PenTool, Cpu, Star } from 'lucide-react';

export default function TentangAppView() {
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div className="view-header">
        <div className="view-header-left">
          <div className="view-icon" style={{ background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)' }}>
            <Info size={22} />
          </div>
          <div>
            <h1 className="view-title">Tentang Aplikasi</h1>
            <p className="view-subtitle">Profil Kris AI V8 dan orang di baliknya</p>
          </div>
        </div>
      </div>

      <div className="premium-card-v2" style={{ padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: '80px', height: '80px', margin: '0 auto 1.5rem', borderRadius: '24px',
          background: 'linear-gradient(135deg, #a5b4fc, #0ea5e9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(14, 165, 233, 0.3)'
        }}>
          <Sparkles size={40} color="white" />
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: '0 0 8px 0', background: 'linear-gradient(135deg, #a5b4fc, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Kris AI V8
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
          Asisten kreatif mandiri untuk penulis, mahasiswa, dan developer yang ingin bergerak cepat tanpa kehilangan kualitas.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <span className="chip brand">Version 8.0.0</span>
          <span className="chip success">Stable Release</span>
        </div>
      </div>

      <div className="section-block">
        <div className="premium-card-v2" style={{ padding: '1.5rem' }}>
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>
            <PenTool size={20} color="#f59e0b" /> Biodata Pembuat
          </h2>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '700' }}>
            Didi Purnomo
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
            Mahasiswa Informatika UIN Gusdur Pekalongan. Kris AI dibangun sebagai asisten mandiri untuk mendukung karya sastra, coding, dan produktivitas kreatif sehari-hari.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1.5rem' }}>
        <div className="premium-card-v2 feature-card">
          <h3 className="feature-card-title" style={{ marginBottom: '0.75rem' }}>
            <span className="icon-box violet" style={{ width: '36px', height: '36px' }}>
              <Cpu size={18} color="#a5b4fc" />
            </span>
            Teknologi Kris AI
          </h3>
          <p className="feature-card-desc">
            Dirancang sebagai mesin AI mandiri yang fokus pada hasil kerja nyata: penulisan, coding, ideasi, dan eksekusi cepat.
            Kris AI dibentuk untuk tetap terasa sebagai produk utuh yang punya karakter sendiri.
          </p>
        </div>

        <div className="premium-card-v2 feature-card">
          <h3 className="feature-card-title" style={{ marginBottom: '0.75rem' }}>
            <span className="icon-box rose" style={{ width: '36px', height: '36px' }}>
              <BookOpen size={18} color="#f472b6" />
            </span>
            Fokus Kami
          </h3>
          <p className="feature-card-desc">
            Kris AI V8 didesain agar penulis dan developer tidak tergantikan oleh AI, melainkan <strong>terakselerasi</strong> oleh AI.
            AI berfokus pada draft kasar, outline, ideasi, dan bantuan coding, sementara sentuhan akhir tetap di tangan manusia.
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem', paddingBottom: '2rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          Dibuat dengan <Star size={12} color="#fbbf24" style={{ display: 'inline', margin: '0 2px', verticalAlign: 'middle' }} /> untuk penulis, mahasiswa, dan developer di seluruh dunia.<br/>
          &copy; {new Date().getFullYear()} Kris AI V8.
        </p>
      </div>
    </div>
  );
}
