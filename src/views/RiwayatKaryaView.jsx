import React, { useState, useEffect } from 'react';
import { History, BookOpen, Download, Trash2, Edit3, ChevronRight, PlusCircle, FileText, File, X, ChevronLeft } from 'lucide-react';
import { marked } from 'marked';

export default function RiwayatKaryaView({ onLoadNovel, onSequelNovel, onExportWord, onExportPDF }) {
  const [history, setHistory] = useState([]);
  const [readerNovel, setReaderNovel] = useState(null);
  const [readerChapterIndex, setReaderChapterIndex] = useState(0);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const data = JSON.parse(localStorage.getItem('kris_ai_history') || '[]');
      setHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteItem = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus karya ini dari riwayat?")) {
      const newData = history.filter(h => h.id !== id);
      localStorage.setItem('kris_ai_history', JSON.stringify(newData));
      setHistory(newData);
    }
  };

  const handleExport = (novel) => {
    let content = `# ${novel.title}\nOleh: ${novel.penName}\n\n`;
    content += `## Premis\n${novel.premise}\n\n`;
    content += `## Blurb\n${novel.blurb}\n\n`;
    content += `---\n\n`;
    
    novel.chapters.forEach((chap, idx) => {
      content += `# Episode ${idx + 1}\n\n${chap}\n\n---\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${novel.title.replace(/\s+/g, '_')}_Novel.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="view-header">
        <div className="view-header-left">
          <div className="view-icon" style={{ background: 'linear-gradient(135deg, #fb7185, #e11d48)' }}>
            <History size={22} />
          </div>
          <div>
            <h1 className="view-title">Riwayat Karya & Unduh</h1>
            <p className="view-subtitle">Baca, lanjutkan, dan unduh karya yang pernah dibuat</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <BookOpen size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p>Belum ada karya yang disimpan. Buat novel pertamamu sekarang!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1.5rem' }}>
            {history.map((novel, idx) => (
              <div key={novel.id || idx} className="premium-card-v2" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{novel.title}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(novel.date).toLocaleDateString()}
                  </span>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {novel.premise}
                </p>

                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0' }}>
                  <span><strong>{novel.chapters?.length || 0}</strong> Episode</span>
                  <span><strong>{novel.style}</strong></span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button 
                    className="btn-primary" 
                    onClick={() => {
                      setReaderNovel(novel);
                      setReaderChapterIndex(0);
                    }}
                    style={{ flex: 1, padding: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'linear-gradient(135deg, #4f46e5, #4338ca)' }}
                    title="Baca novel ini per bab"
                  >
                    <BookOpen size={14} /> Buka
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={() => onSequelNovel(novel)}
                    style={{ flex: 1, padding: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'linear-gradient(135deg, #d946ef, #a21caf)' }}
                    title="Buat novel lanjutan dari cerita ini"
                  >
                    <PlusCircle size={14} /> Sekuel
                  </button>
                  
                  <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                    <button 
                      className="btn-secondary"
                      onClick={() => onExportPDF(novel)}
                      style={{ padding: '8px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRight: '1px solid rgba(255,255,255,0.1)', borderRadius: 0 }}
                      title="Unduh PDF"
                    >
                      <File size={14} />
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => onExportWord(novel)}
                      style={{ padding: '8px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRight: '1px solid rgba(255,255,255,0.1)', borderRadius: 0 }}
                      title="Unduh Word (.doc)"
                    >
                      <FileText size={14} />
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => handleExport(novel)}
                      style={{ padding: '8px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 0 }}
                      title="Unduh Markdown (.md)"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => deleteItem(novel.id)}
                    style={{ 
                      padding: '8px', background: 'rgba(244,63,94,0.1)', color: '#fb7185', 
                      border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px'
                    }}
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {readerNovel && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' }}>
          <div style={{ width: '90%', maxWidth: '1000px', height: '85vh', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', display: 'flex', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            
            {/* Sidebar Daftar Bab */}
            <div style={{ width: '250px', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Daftar Episode</h3>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                {(readerNovel.chapters || []).map((_, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setReaderChapterIndex(idx)}
                    style={{ 
                      padding: '12px 16px', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      marginBottom: '4px',
                      backgroundColor: readerChapterIndex === idx ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                      color: readerChapterIndex === idx ? '#818cf8' : 'var(--text-secondary)',
                      fontWeight: readerChapterIndex === idx ? '600' : 'normal',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (readerChapterIndex !== idx) e.target.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (readerChapterIndex !== idx) e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    Episode {idx + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Area Baca */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{readerNovel.title} - Episode {readerChapterIndex + 1}</h2>
                </div>
                <button 
                  onClick={() => setReaderNovel(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px' }}
                >
                  <X size={24} />
                </button>
              </div>

              <div
                className="markdown-content"
                style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', backgroundColor: 'var(--bg-secondary)', fontSize: '1.05rem' }}
                dangerouslySetInnerHTML={{ __html: marked.parse(readerNovel.chapters[readerChapterIndex] || '*Episode ini masih kosong.*') }}
              />

              <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-primary)' }}>
                <button 
                  className="btn-secondary"
                  disabled={readerChapterIndex === 0}
                  onClick={() => setReaderChapterIndex(prev => prev - 1)}
                  style={{ opacity: readerChapterIndex === 0 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <ChevronLeft size={16} /> Sebelumnya
                </button>
                
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    onLoadNovel(readerNovel, readerChapterIndex);
                    setReaderNovel(null);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  <Edit3 size={16} /> Lanjutkan Menulis
                </button>

                <button 
                  className="btn-secondary"
                  disabled={readerChapterIndex === (readerNovel.chapters?.length || 1) - 1}
                  onClick={() => setReaderChapterIndex(prev => prev + 1)}
                  style={{ opacity: readerChapterIndex === (readerNovel.chapters?.length || 1) - 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  Selanjutnya <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
