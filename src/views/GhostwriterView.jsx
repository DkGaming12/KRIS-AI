import React, { useState } from 'react';
import { Ghost, PenTool, Sparkles, Wand2 } from 'lucide-react';
import TokenEstimate from '../components/TokenEstimate';

export default function GhostwriterView({ getClient }) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!content.trim() || isLoading) return;
    setIsLoading(true);
    
    try {
      const client = getClient();
      const response = await client.chat.completions.create({
        __feature: 'ghostwriter',
        messages: [
          { role: "system", content: "Anda adalah Ghostwriter, asisten penulis novel profesional. Lanjutkan teks yang diberikan pengguna secara mulus, perhatikan gaya bahasa, karakter, dan tone. Jangan ulangi kalimat terakhir, langsung sambung dengan kalimat baru." },
          { role: "user", content: `Lanjutkan tulisan berikut (sekitar 200-300 kata):\n\n...${content.slice(-500)}` }
        ],
        temperature: 0.7,
        max_tokens: 2048
      });

      let newText = response.choices[0].message.content;
      newText = newText.replace(/<think>[\s\S]*?<\/think>/, '').trim();

      // Metering otomatis lewat getClient() — tanpa pemotongan manual di sini.

      setContent(prev => prev + (prev.endsWith(' ') || prev.endsWith('\n') ? '' : ' ') + newText);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="view-header">
        <div className="view-header-left">
          <div className="view-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
            <Ghost size={22} />
          </div>
          <div>
            <h1 className="view-title">Ghostwriter</h1>
            <p className="view-subtitle">AI akan melanjutkan tulisanmu saat kamu buntu.</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <TokenEstimate min={350} max={550} />
          <button
            className="btn-primary"
            onClick={handleContinue}
            disabled={isLoading || !content.trim()}
            style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', whiteSpace: 'nowrap' }}
          >
            {isLoading ? <span className="loader"></span> : <><Wand2 size={16} /> Lanjutkan Tulisan</>}
          </button>
        </div>
      </div>

      <div className="premium-card-v2" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1.25rem', background: 'var(--glass-bg)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
