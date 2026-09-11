import React from 'react';
import { Info, Sparkles, BookOpen, PenTool, Cpu, Star } from 'lucide-react';

export default function TentangAppView() {
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Info size={24} color="#38bdf8" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Tentang Aplikasi</h1>
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
          Sastra Engine V6
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
          Platform revolusioner bagi penulis untuk menciptakan mahakarya fiksi dengan bantuan Artificial Intelligence canggih.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
          <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: '600' }}>
            Version 6.0.0
          </span>
          <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>
            Stable Release
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1.5rem' }}>
        <div className="premium-card-v2" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Cpu size={20} color="#a5b4fc" />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Teknologi Kris AI</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Ditenagai oleh arsitektur LLM modern (OpenAI GPT Models) yang di-prompt khusus menggunakan prompt *masterclass sastra*. 
            Sastra Engine tidak hanya menyusun kata, tapi juga merangkai emosi dan pembangunan dunia yang solid.
          </p>
        </div>

        <div className="premium-card-v2" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <BookOpen size={20} color="#f472b6" />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Fokus Kami</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Sastra Engine V6 didesain agar penulis tidak tergantikan oleh AI, melainkan **terakselerasi** oleh AI. 
            AI berfokus pada draft kasar, outline, dan ideasi, sementara sentuhan emosi akhir tetap di tangan manusia.
          </p>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '3rem', paddingBottom: '2rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Dibuat dengan <Star size={12} color="#fbbf24" style={{ display: 'inline', margin: '0 2px' }} /> untuk para penulis di seluruh dunia.<br/>
          &copy; {new Date().getFullYear()} Kris AI - Sastra Engine.
        </p>
      </div>
    </div>
  );
}
