import React, { useState, useEffect, useRef } from 'react';
import { Copy, Save, ChevronRight, RefreshCw, Check, Sparkles } from 'lucide-react';

function extractWebPreview(content) {
  const htmlFence = content.match(/```html\s*([\s\S]*?)```/i);
  const cssFence = content.match(/```css\s*([\s\S]*?)```/i);
  const jsFence = content.match(/```(?:js|javascript)\s*([\s\S]*?)```/i);

  let html = htmlFence?.[1]?.trim() || '';
  const css = cssFence?.[1]?.trim() || '';
  const js = jsFence?.[1]?.trim() || '';

  const looksLikeRawHtml = /<!doctype\s+html|<html[\s>]/i.test(content);
  if (!html && looksLikeRawHtml) {
    html = content.trim();
  }

  if (!html && !css && !js) return null;

  const hasDocumentShell = /<!doctype\s+html|<html[\s>]/i.test(html);
  const bodyHtml = html && !hasDocumentShell
    ? html
    : html || '<div style="font-family: system-ui; padding: 24px; color: #e5e7eb;">Preview web siap.</div>';

  if (hasDocumentShell) {
    let finalHtml = html;
    if (css) {
      finalHtml = finalHtml.replace('</head>', `<style>${css}</style></head>`);
    }
    if (js) {
      finalHtml = finalHtml.replace('</body>', `<script>${js}</script></body>`);
    }
    return finalHtml;
  }

  return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body { margin: 0; min-height: 100%; background: #0b1020; color: #e5e7eb; font-family: Inter, system-ui, sans-serif; }
      * { box-sizing: border-box; }
      ${css}
    </style>
  </head>
  <body>
    ${bodyHtml}
    <script>
      ${js}
    </script>
  </body>
</html>`;
}

const AIResponse = ({ content, onSave, onContinue }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef(null);
  const previewHtml = extractWebPreview(content);

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

      {!isTyping && previewHtml && (
        <div style={{
          marginTop: '1.5rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.9rem' }}>
            <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px rgba(16,185,129,0.7)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: '900', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Preview Web Otomatis
            </span>
          </div>
          <div style={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            overflow: 'hidden',
            background: '#0b1020',
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
          }}>
            <iframe
              title="Preview Web"
              sandbox="allow-scripts"
              srcDoc={previewHtml}
              style={{ width: '100%', minHeight: '420px', border: 'none', background: '#fff' }}
            />
          </div>
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Preview ini muncul otomatis jika hasil AI berisi HTML, CSS, atau JavaScript web.
          </p>
        </div>
      )}

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
