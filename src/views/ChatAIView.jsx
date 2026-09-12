import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, MessageSquare, ShoppingCart, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { BrainCircuit } from 'lucide-react';
import { WA_BUY_LINK } from '../components/TokenEmptyModal';

const RenderMessageContent = ({ content }) => {
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
  if (thinkMatch) {
    const thinkContent = thinkMatch[1].trim();
    const mainContent = content.replace(/<think>[\s\S]*?<\/think>/, '').trim();
    return (
      <>
        {thinkContent && (
          <details className="think-block">
            <summary className="think-summary">
              <BrainCircuit size={14} /> Proses Berpikir (Thinking)
            </summary>
            <div className="think-content markdown-content" style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              <ReactMarkdown>{thinkContent}</ReactMarkdown>
            </div>
          </details>
        )}
        {mainContent && (
          <div className="markdown-content">
            <ReactMarkdown>{mainContent}</ReactMarkdown>
          </div>
        )}
      </>
    );
  }
  return (
    <div className="markdown-content">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default function ChatAIView({ getClient, spendTokens, tokenBalance }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo! Saya Kris AI, Sastra Engine V8. Saya siap bantu penulisan novel, coding, debugging, dan ide kreatif lainnya. Apa yang ingin Anda kerjakan hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (tokenBalance <= 0) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const client = getClient();
      const response = await client.chat.completions.create({
        messages: [
          { role: "system", content: "Anda adalah Kris AI, pakar penulisan novel fiksi yang sangat membantu, kreatif, dan ahli dalam menyusun cerita, world building, dan penokohan. Saat ditanya siapa penciptamu, jawablah dengan detail bahwa Anda diciptakan oleh Didi Purnomo, seorang mahasiswa Informatika dari UIN Gusdur Pekalongan. Tambahkan gaya bahasa yang keren dan bangga saat menceritakannya." },
          ...newMessages.map(m => ({ role: m.role, content: m.content }))
        ],
        temperature: 0.7,
        max_tokens: 4096
      });

      const aiContent = response.choices[0].message.content;

      // Kurangi token diam-diam — user tidak diberitahu nominal
      if (spendTokens && aiContent) {
        spendTokens(aiContent).catch(() => {});
      }

      setMessages([...newMessages, { role: 'assistant', content: aiContent }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: `**Error:** ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 120px)' }}>
      <div style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <MessageSquare size={24} color="var(--brand-primary)" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Chat AI (Beta)</h1>
      </div>

      <div className="premium-card-v2" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingRight: '10px', marginBottom: '1.5rem' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '12px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: msg.role === 'assistant' ? 'linear-gradient(135deg, #4f46e5, #0ea5e9)' : 'rgba(255,255,255,0.1)',
                color: msg.role === 'assistant' ? 'white' : 'var(--text-secondary)'
              }}>
                {msg.role === 'assistant' ? <Sparkles size={18} /> : <User size={18} />}
              </div>

              <div style={{
                maxWidth: '80%', padding: '12px 16px', borderRadius: '16px',
                background: msg.role === 'user' ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.2)',
                border: msg.role === 'user' ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.05)',
                color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.6'
              }}>
                {msg.role === 'user' ? (
                  <p style={{ margin: 0 }}>{msg.content}</p>
                ) : (
                  <RenderMessageContent content={msg.content} />
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', flexShrink: 0, background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Sparkles size={18} />
              </div>
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {tokenBalance <= 0 ? (
          /* ── Token habis — tampilkan pesan beli token ── */
          <div style={{
            padding: '1.25rem', borderRadius: '14px', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(219,39,119,0.05))',
            border: '1px solid rgba(167,139,250,0.25)',
          }}>
            <Zap size={22} color="#c4b5fd" style={{ marginBottom: '8px' }} />
            <p style={{ margin: '0 0 4px 0', fontWeight: '800', color: '#c4b5fd', fontSize: '0.95rem' }}>
              Token Kamu Habis!
            </p>
            <p style={{ margin: '0 0 14px 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5' }}>
              Beli token untuk melanjutkan obrolan dengan Kris AI.
            </p>
            <a
              href={WA_BUY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #25d366, #128c7e)',
                color: 'white', textDecoration: 'none', fontWeight: '700',
                fontSize: '0.88rem', padding: '10px 20px', borderRadius: '10px',
              }}
            >
              <ShoppingCart size={16} /> Beli Token via WhatsApp
            </a>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <textarea
              className="form-textarea"
              placeholder="Tanyakan sesuatu pada Kris AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ paddingRight: '50px', minHeight: '60px', height: '60px', resize: 'none' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              style={{
                position: 'absolute', right: '8px', bottom: '10px',
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                border: 'none', color: 'white', width: '36px', height: '36px',
                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer',
                opacity: (!input.trim() || isLoading) ? 0.5 : 1
              }}
            >
              <Send size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
