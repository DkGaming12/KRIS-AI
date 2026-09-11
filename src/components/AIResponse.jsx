import React, { useState, useEffect, useRef } from 'react';
import { Copy, Save, ChevronRight, RefreshCw, Check, Sparkles } from 'lucide-react';

const AIResponse = ({ content, onSave, onContinue }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    setIsTyping(true);

    // Skip animation for very long content (>3000 chars), show instantly
    if (content.length > 3000) {
      setDisplayedText(content);
      setIsTyping(false);
      return;
    }

    intervalRef.current = setInterval(() => {
      if (i < content.length) {
        setDisplayedText(content.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(intervalRef.current);
      }
    }, 12);

    return () => clearInterval(intervalRef.current);
  }, [content]);

  const skipTyping = () => {
    clearInterval(intervalRef.current);
    setDisplayedText(content);
    setIsTyping(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade" style={{ padding: '0.5rem 0', position: 'relative' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', background: '#6366f1', borderRadius: '50%', boxShadow: '0 0 10px #6366f1', animation: isTyping ? 'pulseGlow 1s infinite' : 'none' }}></div>
          <span style={{ fontSize: '0.72rem', fontWeight: '900', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {isTyping ? 'Menghasilkan Teks...' : 'Hasil Generasi AI'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {isTyping && (
            <button
              onClick={skipTyping}
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}
            >
              <Sparkles size={12} /> Tampilkan Semua
            </button>
          )}
          {!isTyping && (
            <button
              onClick={handleCopy}
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {copied ? <><Check size={12} color="#10b981" /> Tersalin</> : <><Copy size={12} /> Salin Teks</>}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{
        fontSize: '1rem', lineHeight: '1.9', color: 'var(--text-primary)',
        whiteSpace: 'pre-wrap', minHeight: '80px', fontFamily: "'Outfit', system-ui",
        position: 'relative'
      }}>
        {displayedText}
        {isTyping && (
          <span style={{
            display: 'inline-block', width: '2px', height: '1.1em',
            background: '#6366f1', marginLeft: '2px', verticalAlign: 'middle',
            animation: 'blink 1s infinite'
          }}></span>
        )}
      </div>

      {/* Action Footer */}
      {!isTyping && (
        <div className="animate-fade" style={{
          marginTop: '2rem', paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center'
        }}>
          <button
            onClick={() => onSave(content)}
            className="btn-primary"
            style={{ padding: '0.65rem 1.4rem', fontSize: '0.88rem', borderRadius: '0.75rem', gap: '6px' }}
          >
            <Save size={16} /> Simpan ke Folder
          </button>
          <button
            onClick={onContinue}
            style={{
              padding: '0.65rem 1.4rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)',
              background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: '0.88rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            Lanjut Tulisan <ChevronRight size={16} />
          </button>
          <button
            style={{
              padding: '0.65rem 1.4rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)',
              background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.88rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <RefreshCw size={16} /> Tulis Ulang
          </button>
        </div>
      )}

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 8px #6366f1; }
          50% { box-shadow: 0 0 18px #6366f1; }
        }
      `}</style>
    </div>
  );
};

export default AIResponse;
