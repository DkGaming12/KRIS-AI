import React, { useState } from 'react';
import { Ghost, PenTool, Sparkles, Wand2 } from 'lucide-react';

export default function GhostwriterView({ getClient, spendTokens }) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!content.trim() || isLoading) return;
    setIsLoading(true);
    
    try {
      const client = getClient();
      const response = await client.chat.completions.create({
        messages: [
          { role: "system", content: "Anda adalah Ghostwriter, asisten penulis novel profesional. Lanjutkan teks yang diberikan pengguna secara mulus, perhatikan gaya bahasa, karakter, dan tone. Jangan ulangi kalimat terakhir, langsung sambung dengan kalimat baru." },
          { role: "user", content: `Lanjutkan tulisan berikut (sekitar 200-300 kata):\n\n...${content.slice(-500)}` }
        ],
        temperature: 0.7,
        max_tokens: 2048
      });
      
      let newText = response.choices[0].message.content;
      newText = newText.replace(/<think>[\s\S]*?<\/think>/, '').trim();

      // Kurangi token diam-diam
      if (spendTokens && newText) {
        spendTokens(newText).catch(() => {});
      }

      setContent(prev => prev + (prev.endsWith(' ') || prev.endsWith('\n') ? '' : ' ') + newText);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Ghost size={24} color="#8b5cf6" />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Ghostwriter</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>AI akan melanjutkan tulisanmu saat kamu buntu.</p>
          </div>
        </div>
        <button 
          className="btn-primary" 
          onClick={handleContinue} 
          disabled={isLoading || !content.trim()}
          style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}
        >
          {isLoading ? <span className="loader"></span> : <><Wand2 size={16} /> Lanjutkan Tulisan</>}
        </button>
      </div>

      <div className="premium-card-v2" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><PenTool size={14} /> Editor Fokus</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong>{content.trim().split(/\s+/).filter(w => w.length > 0).length}</strong> kata
          </div>
        </div>
        
        <textarea 
          className="form-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Mulai ketik paragraf pertamamu di sini, lalu klik 'Lanjutkan Tulisan' jika kamu butuh bantuan AI..."
          style={{ 
            flex: 1, 
            border: 'none', 
            borderRadius: '0 0 16px 16px',
            padding: '24px',
            fontSize: '1.05rem',
            lineHeight: '1.8',
            resize: 'none',
            background: 'transparent'
          }}
        />
      </div>
    </div>
  );
}
