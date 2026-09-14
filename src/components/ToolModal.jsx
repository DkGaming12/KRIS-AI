import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Sparkles, Settings, ChevronRight, Coins } from 'lucide-react';
import AIResponse from './AIResponse';
import { TOOL_DEFINITIONS } from '../constants/toolDefinitions';

const ToolModal = ({ tool, isOpen, onClose, onSave, tokens, setTokens, getClient }) => {
  const [formData, setFormData] = useState({});
  const [showForm, setShowForm] = useState(true);
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeInternalTab, setActiveInternalTab] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (tool && isOpen) {
      const def = TOOL_DEFINITIONS[tool.name] || TOOL_DEFINITIONS['default_modal'];
      const initialData = {};
      const initialTabs = {};
      def.fields.forEach(field => { 
        initialData[field.id] = field.default || ''; 
        if (field.type === 'tabs') {
          initialTabs[field.id] = field.options[0];
        }
      });
      setFormData(initialData);
      setActiveInternalTab(initialTabs);
      setErrors({});
      setShowForm(true);
      setOutput('');
    }
  }, [tool, isOpen]);

  if (!isOpen || !tool) return null;

  const toolDef = TOOL_DEFINITIONS[tool.name] || TOOL_DEFINITIONS['default_modal'];

  const handleInputChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: null }));
  };

  const handleTabChange = (fieldId, option) => {
    setActiveInternalTab(prev => ({ ...prev, [fieldId]: option }));
  };

  const handleGenerate = async () => {
    let currentErrors = {};
    let hasError = false;

    toolDef.fields.forEach(field => {
      if (field.condition && activeInternalTab[Object.keys(field.condition)[0]] !== Object.values(field.condition)[0]) {
        return;
      }
      if (field.type !== 'tabs') {
         if (!formData[field.id] || formData[field.id].toString().trim() === '') {
           currentErrors[field.id] = 'Wajib diisi atau dipilih.';
           hasError = true;
         }
      }
    });

    if (hasError) {
      setErrors(currentErrors);
      return;
    } else {
      setErrors({});
    }

    if (tokens !== undefined && tokens <= 0) {
      return;
    }

    setIsGenerating(true);
    
    const summary = Object.entries(formData).filter(([k, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n- ');
    const userPrompt = `Anda adalah Kris Ai, asisten penulis kelas master (Sastra & Web Novel). Anda bertugas membantu penulis fiksi dengan fitur alat: "${tool.name}".\n\nDetail masukan pengguna:\n- ${summary}\n\nTolong hasilkan output yang komprehensif, kreatif, profesional, dan langsung bisa digunakan sesuai tujuan alat (tanpa teks basa-basi pembuka). Format output dengan baik (gunakan paragraf, poin, atau markdown jika diperlukan).`;

    try {
      const client = getClient ? getClient() : null;
      if (!client) {
        throw new Error('Client AI tidak tersedia. Pastikan OmniRoute berjalan atau API Key dikonfigurasi.');
      }

      const response = await client.chat.completions.create({
        messages: [
          { role: 'system', content: 'Anda adalah Kris Ai, asisten penulis kelas master (Sastra & Web Novel).' },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4096,
      });

      const generatedText = response.choices[0]?.message?.content || "Maaf, mesin tidak mengembalikan konten apa pun.";
      
      const wordCount = generatedText.split(/\s+/).filter(w => w.length > 0).length;
      if (setTokens) {
        setTokens(prev => {
          let tokenUsed = Math.ceil((wordCount / 3500) * 12);
          if (tokenUsed < 1 && wordCount > 0) tokenUsed = 1;
          return Math.max(0, prev - tokenUsed);
        });
      }

      setOutput(generatedText);
      setShowForm(false);
    } catch (err) {
      console.error("Kris AI Generation Error:", err);
      setOutput(`[KONEKSI GAGAL] \n\nMesin Kris AI gagal memproses permintaan Anda.\n\nAlasan:\n${err.message}\n\nSolusi: Pastikan koneksi AI sudah dikonfigurasi dengan benar.`);
      setShowForm(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefresh = () => {
    const initialData = {};
    toolDef.fields.forEach(field => { initialData[field.id] = field.default || ''; });
    setFormData(initialData);
    setOutput('');
    setShowForm(true);
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{
        width: '100%', background: 'var(--bg-card)',
        borderRadius: '2rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.14)', color: '#6366f1', borderRadius: '14px' }}>
              <tool.icon size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{tool.name}</h2>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Writer Engine Tool</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {output && (
              <button 
                onClick={() => setShowForm(!showForm)} 
                style={{ background: showForm ? 'rgba(99, 102, 241, 0.1)' : 'none', border: 'none', color: showForm ? '#6366f1' : 'var(--text-secondary)', cursor: 'pointer', padding: '8px', borderRadius: '10px' }}
              >
                <Settings size={22} />
              </button>
            )}
            <button onClick={handleRefresh} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><RefreshCw size={20} /></button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={28} /></button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          {showForm ? (
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {toolDef.fields.map(field => {
                  // Check conditions
                  if (field.condition && activeInternalTab[Object.keys(field.condition)[0]] !== Object.values(field.condition)[0]) {
                    return null;
                  }

                  const isFullWidth = field.type === 'textarea' || field.type === 'tabs';

                  return (
                    <div key={field.id} style={{ gridColumn: isFullWidth ? '1 / -1' : 'auto' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {field.label}
                      </label>
                      
                      {field.type === 'text' && (
                        <input className="form-input" type="text" placeholder={field.placeholder} value={formData[field.id] || ''} onChange={(e) => handleInputChange(field.id, e.target.value)} style={{ border: errors[field.id] ? '1px solid #ef4444' : undefined }} />
                      )}

                      {field.type === 'textarea' && (
                        <textarea className="form-textarea" rows="4" placeholder={field.placeholder} value={formData[field.id] || ''} onChange={(e) => handleInputChange(field.id, e.target.value)} style={{ border: errors[field.id] ? '1px solid #ef4444' : undefined }} />
                      )}

                      {field.type === 'select' && (
                        <select className="form-select" value={formData[field.id] || ''} onChange={(e) => handleInputChange(field.id, e.target.value)} style={{ border: errors[field.id] ? '1px solid #ef4444' : undefined, outline: 'none' }}>
                          <option value="">Pilih Opsi...</option>
                          {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      )}

                      {field.type === 'radio' && (
                        <div style={{ display: 'flex', gap: '1rem', padding: errors[field.id] ? '2px' : 0, border: errors[field.id] ? '1px solid #ef4444' : '1px solid transparent', borderRadius: '1.25rem' }}>
                          {field.options.map(opt => (
                            <button
                              key={opt}
                              onClick={() => handleInputChange(field.id, opt)}
                              style={{
                                flex: 1, padding: '0.75rem', borderRadius: '1rem', border: '1px solid',
                                borderColor: formData[field.id] === opt ? '#6366f1' : 'var(--border-color)',
                                background: formData[field.id] === opt ? 'rgba(99, 102, 241, 0.1)' : 'var(--glass-bg)',
                                color: formData[field.id] === opt ? '#6366f1' : 'var(--text-secondary)',
                                fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                              }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {errors[field.id] && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 'bold' }}>{errors[field.id]}</p>}

                      {field.type === 'tabs' && (
                        <div style={{ display: 'flex', background: 'var(--glass-bg)', padding: '4px', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                          {field.options.map(opt => (
                            <button
                              key={opt}
                              onClick={() => handleTabChange(field.id, opt)}
                              style={{
                                flex: 1, padding: '0.6rem', borderRadius: '0.75rem', border: 'none',
                                background: activeInternalTab[field.id] === opt ? '#6366f1' : 'transparent',
                                color: activeInternalTab[field.id] === opt ? 'white' : 'var(--text-secondary)',
                                fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer'
                              }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--glass-bg)', padding: '0.6rem 1rem', borderRadius: '0.8rem', border: '1px solid var(--border-color)' }}>
                  <Coins size={16} color="#fbbf24" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                    Estimasi: <span style={{ color: '#fbbf24' }}>Dinamic (Maks ~10) Token</span>
                  </span>
                </div>
                
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', padding: '1rem 3.5rem', gap: '12px' }}
                >
                  {isGenerating ? 'Sinkronisasi Data...' : <><Sparkles size={20} /> Jalankan Alat</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-fade">
              <AIResponse
                content={output} 
                onSave={() => onSave(output, tool.name)}
                onContinue={() => { /* Handoff logic */ }} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolModal;
