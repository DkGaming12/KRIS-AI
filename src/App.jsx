import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { marked } from 'marked';
import html2canvas from 'html2canvas';
import { BookOpen, User, Globe, FileText, CheckCircle, Image as ImageIcon, Download, Settings, ChevronRight, Save, Sparkles, Sun, Moon, Menu, X, Home, MessageSquare, Ghost, Shield, Info, Zap, LogOut, Wrench, Music, Folder, Users, History, Coins, Edit3, Lightbulb, PenTool, Trash2, Plus, PlusCircle, Copy } from 'lucide-react';
import ToolModal from './components/ToolModal';
import TokenBadge from './components/TokenBadge';
import TokenEmptyModal, { WA_BUY_LINK } from './components/TokenEmptyModal';
import BerandaView from './views/BerandaView';
import BeliTokenView from './views/BeliTokenView';
import MakalahView from './views/MakalahView';
import ChatAIView from './views/ChatAIView';
import GhostwriterView from './views/GhostwriterView';
import RiwayatKaryaView from './views/RiwayatKaryaView';
import PengaturanAkunView from './views/PengaturanAkunView';
import TentangAppView from './views/TentangAppView';
import LoginView from './views/LoginView';
import { chatWithFallback } from './lib/aiClient';
import { useAuth } from './lib/authStore';

const STEPS = [
  { id: 1, name: 'Setup', icon: Settings },
  { id: 2, name: 'Karakter', icon: User },
  { id: 3, name: 'Dunia', icon: Globe },
  { id: 4, name: 'Outline', icon: FileText },
  { id: 5, name: 'Drafting', icon: BookOpen },
  { id: 6, name: 'Export', icon: Save },
];

const STYLE_OPTIONS = [
  "Puitis & Metaforis",
  "Deskriptif & Detail",
  "Dialog Sentris (Fast-paced)",
  "Gelap & Sinis (Dark / Gritty)",
  "Melankolis & Emosional",
  "Humor & Satir",
  "Kasual & Ringan",
  "Sinematik (Visual)",
  "Misterius & Teka-teki",
  "Sastrawi (Literary)",
  "To-the-point & Lugas",
  "Epik & Grandiose",
  "Surealis & Aneh",
  "Nostalgik & Hangat",
  "Cynical & Sarkas",
  "Gaya Jurnal/Buku Harian",
  "Gaya Surat (Epistolary)",
  "Realistis & Membumi",
  "Dongeng & Magis",
  "Absurd & Kocak",
  "Romantis & Penuh Gairah",
  "Klasik & Elegan",
  "Thriller Psikologis (Mind-bending)",
  "Bahasa Gaul (Slang)",
  "Bahasa Baku (Formal)"
];

const MultiSelectDropdown = ({ options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const toggleOption = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(item => item !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const val = inputValue.trim();
      if (!selected.includes(val)) {
        onChange([...selected, val]);
      }
      setInputValue('');
    }
  };

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(inputValue.toLowerCase()));

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div className="dropdown-header" onClick={() => setIsOpen(!isOpen)}>
        {selected.length === 0 ? (
          <span style={{color: 'var(--text-secondary)'}}>{placeholder}</span>
        ) : (
          <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1}}>
            {selected.map(s => (
              <span key={s} className="dropdown-tag" onClick={(e) => { e.stopPropagation(); toggleOption(s); }}>
                {s} <span style={{marginLeft: '4px', fontWeight: 'bold'}}>&times;</span>
              </span>
            ))}
          </div>
        )}
        <span style={{marginLeft: 'auto'}}>{isOpen ? '▲' : '▼'}</span>
      </div>
      
      {isOpen && (
        <div className="dropdown-menu">
          <input className="form-input dropdown-input" 
            type="text" 
            placeholder="Cari gaya atau ketik sendiri lalu Enter..." 
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={e => e.stopPropagation()}
            autoFocus
          />
          <div className="dropdown-options">
            {filteredOptions.length > 0 ? filteredOptions.map(opt => (
              <div 
                key={opt} 
                className={`dropdown-option ${selected.includes(opt) ? 'selected' : ''}`}
                onClick={() => toggleOption(opt)}
              >
                <span style={{width: '24px', display: 'inline-block'}}>{selected.includes(opt) ? '✓' : ''}</span>
                {opt}
              </div>
            )) : (
              <div style={{padding: '10px 14px', color: 'var(--text-secondary)'}}>
                Tekan Enter untuk menambah "{inputValue}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


const toolsList = [
  // Produktivitas
  { name: 'Dengar Lagu', icon: Music, category: 'Produktivitas' },
  { name: 'Komunitas', icon: Users, category: 'Produktivitas' },
  { name: 'Nambah Token', icon: Coins, category: 'Produktivitas' },
  { name: 'Folder Data', icon: Folder, category: 'Produktivitas' },
  { name: 'Riwayat Pembelian', icon: History, category: 'Produktivitas' },
  { name: 'Download Novel', icon: Download, category: 'Produktivitas' },
  // Alat AI
  { name: 'Mau Revisi?', icon: MessageSquare, category: 'Alat AI' },
  { name: 'Revisi Naskah', icon: Edit3, category: 'Alat AI' },
  { name: 'Buat Premis', icon: Lightbulb, category: 'Alat AI' },
  { name: 'Premis GN', icon: Lightbulb, category: 'Alat AI' },
  { name: 'Premis Mega', icon: Sparkles, category: 'Alat AI' },
  { name: 'Buat Outline', icon: FileText, category: 'Alat AI' },
  { name: 'New Outline Maker', icon: BookOpen, category: 'Alat AI' },
  { name: 'Buat Sinopsis', icon: FileText, category: 'Alat AI' },
  { name: 'Buat Blurb', icon: MessageSquare, category: 'Alat AI' },
  { name: 'Prompt Cover', icon: Wrench, category: 'Alat AI' },
  { name: 'Karakter Builder', icon: User, category: 'Alat AI' },
  { name: 'World Building', icon: Globe, category: 'Alat AI' },
  // Kreatif
  { name: 'Text Editor', icon: Edit3, category: 'Kreatif' },
  { name: 'Cover Manual', icon: PenTool, category: 'Kreatif' },
  { name: 'ATM Novel', icon: Folder, category: 'Kreatif' },
  { name: 'Statistik Affiliate', icon: Users, category: 'Kreatif' },
];

const categoryColors = {
  'Produktivitas': { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)', border: 'rgba(96, 165, 250, 0.25)' },
  'Alat AI': { color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)', border: 'rgba(167, 139, 250, 0.25)' },
  'Kreatif': { color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)', border: 'rgba(52, 211, 153, 0.25)' },
};

const ToolsDrawer = ({ isOpen, onClose, onSelectTool }) => {
  const categories = [...new Set(toolsList.map(t => t.category))];
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 39 }}
        />
      )}
      <aside className={`right-sidebar ${isOpen ? 'open' : ''}`} style={{ background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', zIndex: 40 }}>
        <div style={{ padding: '1.75rem 1.5rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Wrench size={18} color="var(--brand-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>Writer Tools</h2>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '1px', margin: 0 }}>22+ alat penulis AI</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {categories.map(cat => {
            const catStyle = categoryColors[cat] || categoryColors['Produktivitas'];
            const catTools = toolsList.filter(t => t.category === cat);
            return (
              <div key={cat} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                  <div style={{ height: '1px', width: '14px', background: catStyle.color, borderRadius: '1px' }}></div>
                  <span style={{ fontSize: '0.58rem', fontWeight: '900', color: catStyle.color, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{cat}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {catTools.map((item, idx) => (
                    <button key={idx} onClick={() => { onSelectTool({ name: item.name, icon: item.icon }); onClose(); }} className="tool-item-btn">
                      <div style={{ color: catStyle.color, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: catStyle.bg, borderRadius: '8px', border: `1px solid ${catStyle.border}` }}>
                        <item.icon size={15} />
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: '600', color: 'var(--text-secondary)', lineHeight: '1.3', textAlign: 'center' }}>
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};

const MainLayoutWrapper = ({ children, isSidebarOpen, setIsSidebarOpen, isToolsOpen, setIsToolsOpen, setActiveTool, theme, toggleTheme, currentView, setCurrentView, resetProgress, user, userProfile, tokenBalance, onSignOut, isGuestMode }) => {
  return (
    <div className="layout-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="noise-bg"></div>
      <div className="glow-edge-right"></div>
      
      <div className="marquee-banner">
        <div className="marquee-content">
          <span style={{ paddingRight: '60px' }}>✦ PABRIKASI NOVEL & CODING LEBIH CEPAT DENGAN KRIS AI V8 — ASISTEN KREATIF ALL-IN-ONE 2026</span>
          <span style={{ paddingRight: '60px' }}>✦ PROMO AKTIF: AKSES SULTAN AI DISKON 20% — KUOTA TERBATAS HARI INI!</span>
          <span style={{ paddingRight: '60px' }}>✦ PABRIKASI NOVEL & CODING LEBIH CEPAT DENGAN KRIS AI V8 — ASISTEN KREATIF ALL-IN-ONE 2026</span>
          <span style={{ paddingRight: '60px' }}>✦ PROMO AKTIF: AKSES SULTAN AI DISKON 20% — KUOTA TERBATAS HARI INI!</span>
        </div>
      </div>

      <header className="mobile-header md-hidden">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(79, 70, 229, 0.5)'
          }}>
            <Sparkles size={16} color="white" />
          </div>
          <span className="glow-text" style={{ fontWeight: '900', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>Kris Ai</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="menu-btn">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '0', overflowY: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{
            padding: '1.75rem 1.5rem 1.25rem', borderBottom: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', gap: '12px', position: 'relative'
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(79, 70, 229, 0.5), 0 0 40px rgba(79, 70, 229, 0.2)', flexShrink: 0
            }}>
              <Sparkles size={20} color="white" />
            </div>
            <div>
              <h1 className="glow-text tracking-tight" style={{ fontWeight: '900', fontSize: '1.4rem', color: 'var(--text-primary)', lineHeight: '1' }}>Kris Ai</h1>
              <p style={{ fontSize: '0.55rem', color: '#0ea5e9', fontWeight: '900', letterSpacing: '2px', marginTop: '3px' }}>SASTRA ENGINE V8</p>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <p className="nav-section-label">MENU UTAMA</p>
              <button className={`nav-item ${currentView === 'beranda' ? 'active' : ''}`} onClick={() => setCurrentView('beranda')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: currentView === 'beranda' ? 'rgba(165, 180, 252, 0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    <Home size={16} color={currentView === 'beranda' ? '#a5b4fc' : 'var(--text-secondary)'} />
                  </div>
                  <span>Beranda</span>
                </div>
              </button>
              <button className={`nav-item ${currentView === 'chat' ? 'active' : ''}`} onClick={() => setCurrentView('chat')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: currentView === 'chat' ? 'rgba(165, 180, 252, 0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    <MessageSquare size={16} color={currentView === 'chat' ? '#a5b4fc' : 'var(--text-secondary)'} />
                  </div>
                  <span>Chat AI</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#fbbf24', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '999px', fontWeight: '900', border: '1px solid rgba(234,179,8,0.3)', letterSpacing: '0.5px' }}>BETA</span>
                </div>
              </button>
              <button className={`nav-item ${currentView === 'generator' ? 'active' : ''}`} onClick={() => setCurrentView('generator')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: currentView === 'generator' ? 'rgba(165, 180, 252, 0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    <BookOpen size={16} color={currentView === 'generator' ? '#a5b4fc' : 'var(--text-secondary)'} />
                  </div>
                  <span>Novel Generator</span>
                </div>
                {currentView === 'generator' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ChevronRight size={14} color="#a5b4fc" />
                  </div>
                )}
              </button>
              <button className={`nav-item ${currentView === 'makalah' ? 'active' : ''}`} onClick={() => setCurrentView('makalah')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: currentView === 'makalah' ? 'rgba(167, 139, 252, 0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    <FileText size={16} color={currentView === 'makalah' ? '#a78bfa' : 'var(--text-secondary)'} />
                  </div>
                  <span>Buat Makalah</span>
                </div>
              </button>
              <button className={`nav-item ${currentView === 'riwayat' ? 'active' : ''}`} onClick={() => setCurrentView('riwayat')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: currentView === 'riwayat' ? 'rgba(165, 180, 252, 0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    <Download size={16} color={currentView === 'riwayat' ? '#a5b4fc' : 'var(--text-secondary)'} />
                  </div>
                  <span>Unduh Karya</span>
                </div>
              </button>
              <button className={`nav-item ${currentView === 'ghostwriter' ? 'active' : ''}`} onClick={() => setCurrentView('ghostwriter')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: currentView === 'ghostwriter' ? 'rgba(165, 180, 252, 0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    <Ghost size={16} color={currentView === 'ghostwriter' ? '#8b5cf6' : 'var(--text-secondary)'} />
                  </div>
                  <span>Ghostwriter</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={12} color="#fbbf24" />
                </div>
              </button>
            </div>

            <div>
              <p className="nav-section-label">TOOLS & FITUR</p>
              <button className="sidebar-tool-btn" onClick={() => setIsToolsOpen(!isToolsOpen)}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(14,165,233,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Wrench size={15} color="var(--brand-primary)" />
                </div>
                <span>Writer Tools</span>
                <span style={{ marginLeft: 'auto', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '999px', fontWeight: '900', border: '1px solid rgba(99,102,241,0.3)' }}>20+</span>
              </button>
              
              <button className={`nav-item ${currentView === 'riwayat' ? 'active' : ''}`} onClick={() => setCurrentView('riwayat')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: currentView === 'riwayat' ? 'rgba(165, 180, 252, 0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    <FileText size={16} color={currentView === 'riwayat' ? '#a5b4fc' : 'var(--text-secondary)'} />
                  </div>
                  <span>Riwayat Karya</span>
                </div>
              </button>
              <button className={`nav-item ${currentView === 'pengaturan' ? 'active' : ''}`} onClick={() => setCurrentView('pengaturan')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: currentView === 'pengaturan' ? 'rgba(165, 180, 252, 0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    <Settings size={16} color={currentView === 'pengaturan' ? '#a5b4fc' : 'var(--text-secondary)'} />
                  </div>
                  <span>Pengaturan Akun</span>
                </div>
              </button>
              <button className={`nav-item ${currentView === 'tentang' ? 'active' : ''}`} onClick={() => setCurrentView('tentang')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: currentView === 'tentang' ? 'rgba(165, 180, 252, 0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    <Info size={16} color={currentView === 'tentang' ? '#a5b4fc' : 'var(--text-secondary)'} />
                  </div>
                  <span>Tentang App</span>
                </div>
              </button>
              
              <button 
                onClick={() => setCurrentView('belitoken')}
                className={`nav-item ${currentView === 'belitoken' ? 'active' : ''}`}
                style={{ 
                  background: currentView === 'belitoken' 
                    ? 'linear-gradient(135deg, rgba(37, 211, 102, 0.2), rgba(18, 140, 126, 0.2))' 
                    : 'linear-gradient(135deg, rgba(37, 211, 102, 0.1), rgba(18, 140, 126, 0.1))', 
                  border: '1px solid rgba(37, 211, 102, 0.2)', 
                  marginTop: '0.5rem' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #25d366, #128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    <Zap size={16} color="white" />
                  </div>
                  <span style={{ color: '#25d366', fontWeight: '800' }}>Beli Token</span>
                </div>
              </button>
            </div>
          </nav>

          <div style={{ marginTop: 'auto', padding: '1.25rem 1rem', borderTop: '1px solid var(--border-color)' }}>
            {isGuestMode && (
              <div style={{
                marginBottom: '0.85rem',
                padding: '0.8rem 0.9rem',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(96,165,250,0.12), rgba(14,165,233,0.06))',
                border: '1px solid rgba(96,165,250,0.2)',
              }}>
                <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: '900', color: '#60a5fa', letterSpacing: '1px', textTransform: 'uppercase' }}>Mode Tamu Aktif</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Data demo tetap ada selama tab ini dibuka. Cocok untuk mencoba fitur sebelum daftar.
                </p>
              </div>
            )}

            {/* Token Badge — hanya tampilkan saldo, tanpa detail biaya per-aksi */}
            <TokenBadge tokenBalance={tokenBalance} onBuyClick={() => setCurrentView('belitoken')} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '0.9rem', boxShadow: '0 0 10px rgba(79, 70, 229, 0.4)', flexShrink: 0 }}>
                  {(userProfile?.displayName || user?.displayName || user?.email)?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.2', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {userProfile?.displayName || user?.displayName || (user?.email?.split('@')[0] || 'User')}
                  </p>
                  <p style={{ fontSize: '0.6rem', color: isGuestMode ? '#60a5fa' : 'var(--text-secondary)', marginTop: '1px', lineHeight: '1', fontWeight: isGuestMode ? '800' : '400' }}>
                    {isGuestMode ? 'Tamu' : 'Member'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={toggleTheme} title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'} style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                </button>
                <button onClick={resetProgress} title="Reset Progres" style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#f43f5e', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  <Trash2 size={15} />
                </button>
                <button onClick={onSignOut} title="Keluar" style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#f43f5e', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content animate-fade">
        <div className="main-content-inner">
          {children}
        </div>
      </main>

      <ToolsDrawer isOpen={isToolsOpen} onClose={() => setIsToolsOpen(false)} onSelectTool={(tool) => setActiveTool(tool)} />

      {isSidebarOpen && (
        <div className="md-hidden animate-fade" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 30 }} onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  // ─── Auth ────────────────────────────────────────────────────────────────
  const { user, userProfile, tokenBalance, loading: authLoading, authError, setAuthError, signIn, signInAsGuest, signOut, spendTokens, isAuthenticated } = useAuth();
  const isGuestMode = Boolean(user?.isGuest || userProfile?.isGuest);
  
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Jika token habis, tampilkan modal beli token (hanya sekali saat saldo terdeteksi habis)
  useEffect(() => {
    if (!authLoading && isAuthenticated && !isGuestMode && tokenBalance <= 0) {
      setShowTokenModal(true);
    }
  }, [tokenBalance, authLoading, isAuthenticated, isGuestMode]);

  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('kris_ai_step');
    try {
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (parsed !== null) return parsed;
      }
    } catch (e) {
      console.warn("Corrupted step in localStorage");
    }
    return 1;
  });
  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState(null);
  const [customStyleInput, setCustomStyleInput] = useState('');
  
  // Kris AI V8 Layout State
  const [currentView, setCurrentView] = useState('beranda');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };
  
  const [novelData, setNovelData] = useState(() => {
    const defaultData = {
      title: 'Judul Novel',
      penName: '',
      premise: '',
      blurb: '',
      style: [],
      targetChapters: 5,
      targetWordsPerChapter: 1000,
      modelName: 'auto',
      characters: '',
      world: '',
      outline: '',
      chapters: [],
      coverUrl: null,
      coverBackgroundUrl: null,
      coverTagline: null,
      previousContext: '',
      seriesNumber: 1,
      genre: ''
    };
    const saved = localStorage.getItem('kris_ai_novelData');
    try {
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (parsed) {
          return { ...defaultData, ...parsed, chapters: parsed.chapters || [], style: parsed.style || [] };
        }
      }
    } catch (e) {
      console.warn("Corrupted novelData in localStorage");
    }
    return defaultData;
  });

  const coverRef = useRef(null);
  const [isCompositing, setIsCompositing] = useState(false);

  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    const saved = localStorage.getItem('kris_ai_currentChapterIndex');
    try {
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (parsed !== null) return parsed;
      }
    } catch (e) {
      console.warn("Corrupted currentChapterIndex in localStorage");
    }
    return 0;
  });

  const hiddenChapterRef = useRef(null);

  const handleCopyChapter = async () => {
    try {
      if (!hiddenChapterRef.current) return;
      const htmlContent = hiddenChapterRef.current.innerHTML;
      const plainText = novelData.chapters[currentChapterIndex] || '';
      
      const blobHtml = new Blob([htmlContent], { type: "text/html" });
      const blobText = new Blob([plainText], { type: "text/plain" });
      
      const data = [new ClipboardItem({
        "text/html": blobHtml,
        "text/plain": blobText,
      })];
      
      await navigator.clipboard.write(data);
      alert("Teks berhasil disalin beserta formatnya! Silakan paste (Ctrl+V / Cmd+V) di Word atau Google Docs.");
    } catch (err) {
      try {
        await navigator.clipboard.writeText(novelData.chapters[currentChapterIndex] || '');
        alert("Format rich-text tidak didukung browser ini, teks biasa berhasil disalin.");
      } catch (e) {
        alert("Gagal menyalin: " + e.message);
      }
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('kris_ai_step', JSON.stringify(step));
      localStorage.setItem('kris_ai_currentChapterIndex', JSON.stringify(currentChapterIndex));
      
      // Handle potential QuotaExceededError with large base64 images
      try {
        localStorage.setItem('kris_ai_novelData', JSON.stringify(novelData));
      } catch (e) {
        console.warn("Storage quota exceeded, saving without cover image...", e);
        const novelDataWithoutCover = { ...novelData, coverUrl: null, coverBackgroundUrl: null };
        localStorage.setItem('kris_ai_novelData', JSON.stringify(novelDataWithoutCover));
      }
    } catch (err) {
      console.error("Gagal menyimpan progress lokal:", err);
    }
  }, [step, novelData, currentChapterIndex]);

  const resetProgress = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset progres pembuatan novel? Data yang belum tersimpan akan hilang.')) {
      localStorage.removeItem('kris_ai_step');
      localStorage.removeItem('kris_ai_novelData');
      localStorage.removeItem('kris_ai_currentChapterIndex');
      
      setStep(1);
      setCurrentChapterIndex(0);
      setNovelData({
        title: 'Judul Novel',
        penName: '',
        premise: '',
        blurb: '',
        style: [],
        targetChapters: 5,
        targetWordsPerChapter: 1000,
        modelName: 'auto',
        characters: '',
        world: '',
        outline: '',
        chapters: [],
        coverUrl: null,
        previousContext: '',
        seriesNumber: 1
      });
    }
  };

  const startSequel = () => {
    if (window.confirm(`Apakah Anda yakin ingin memulai Buku ${novelData.seriesNumber + 1} (Sekuel)? Judul, premis, outline, dan isi episode saat ini akan dikosongkan untuk memberi ruang buku baru, tapi karakter dan dunia akan dipertahankan.`)) {
      const newContext = `${novelData.previousContext ? novelData.previousContext + '\\n\\n' : ''}=== RINGKASAN BUKU ${novelData.seriesNumber} ===\\nJudul: ${novelData.title}\\nOutline:\\n${novelData.outline}`;
      
      setNovelData(prev => ({
        ...prev,
        title: `Buku ${prev.seriesNumber + 1}`,
        premise: '',
        blurb: '',
        outline: '',
        chapters: [],
        coverUrl: null,
        previousContext: newContext,
        seriesNumber: prev.seriesNumber + 1
      }));
      setStep(1);
      setCurrentChapterIndex(0);
    }
  };

  const handleCreateNewNovel = () => {
    if (window.confirm("Apakah Anda yakin ingin membuat novel baru? Data pada editor saat ini (jika ada) akan dikosongkan.")) {
      setNovelData({
        title: 'Judul Novel',
        penName: '',
        premise: '',
        blurb: '',
        style: [],
        targetChapters: 5,
        targetWordsPerChapter: 1000,
        modelName: 'auto',
        characters: '',
        world: '',
        outline: '',
        chapters: [],
        coverUrl: null,
        coverBackgroundUrl: null,
        coverTagline: null,
        previousContext: '',
        seriesNumber: 1,
        genre: ''
      });
      setIdeaForm({
        rawIdea: '',
        genre: '',
        theme: '',
        targetAudience: ''
      });
      setStep(1);
      setCurrentChapterIndex(0);
    }
  };

  // Idea Generator State
  const [ideaForm, setIdeaForm] = useState({
    genre: 'Bebas / Terserah AI',
    rawIdea: ''
  });

  const updateIdeaForm = (key, value) => {
    setIdeaForm(prev => ({ ...prev, [key]: value }));
  };

  // Helper to update state
  const updateData = (key, value) => {
    setNovelData(prev => ({ ...prev, [key]: value }));
  };

  // Fungsi wrapper getClient — untuk kompatibilitas dengan ChatAIView & GhostwriterView
  const getClient = () => ({
    chat: {
      completions: {
        create: (params) => chatWithFallback(params, setActiveProvider)
      }
    }
  });

  // ─── Helper: Deteksi teks repetitif, rusak, atau gibberish (degenerasi model) ───
  const detectRepetition = (text) => {
    if (!text || text.length < 100) return false;
    // Bersihkan tanda baca untuk analisis kata
    const cleanText = text.replace(/[.,!?;:"'()\[\]{}—–-]/g, ' ');
    const words = cleanText.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    if (words.length < 10) return false;

    // Cek 1: Kata-kata kehilangan spasi (kata sangat panjang = gabungan kata tanpa spasi)
    const longWords = words.filter(w => w.length > 50);
    if (longWords.length >= 3) return true;
    const avgLen = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    if (avgLen > 25) return true;

    // Cek 2: Gibberish — terlalu banyak kata super pendek (1-2 huruf)
    // Pattern: "Ei. Ei. Kai. Cai. Bos. S." = model output rusak
    if (words.length >= 30) {
      const tinyWords = words.filter(w => w.length <= 2);
      if (tinyWords.length / words.length > 0.45) return true; // >45% kata super pendek
    }

    // Cek 3: Terlalu banyak titik relatif terhadap panjang teks (tanda fragmentasi)
    const periodCount = (text.match(/\./g) || []).length;
    if (words.length >= 20 && periodCount / words.length > 0.4) return true;

    if (words.length < 50) return false;

    // Cek 4: Satu kata muncul > 15% dari total kata
    const freq = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    const maxFreq = Math.max(...Object.values(freq));
    if (maxFreq / words.length > 0.15) return true;

    // Cek 5: N-gram 4 kata muncul > 5 kali
    if (words.length >= 20) {
      const ngrams = {};
      for (let i = 0; i <= words.length - 4; i++) {
        const gram = words.slice(i, i + 4).join(' ');
        ngrams[gram] = (ngrams[gram] || 0) + 1;
      }
      const maxNgram = Math.max(...Object.values(ngrams));
      if (maxNgram > 5) return true;
    }
    return false;
  };

  // ─── Helper: Ekstrak outline hanya untuk episode tertentu ───
  const extractEpisodeOutline = (fullOutline, episodeNumber) => {
    if (!fullOutline) return '';
    const lines = fullOutline.split('\n');
    let collecting = false;
    let result = [];
    // Cari pattern seperti "Episode 3", "Bab 3", "3.", "**Episode 3**", dll.
    const epPatterns = [
      new RegExp(`(?:episode|ep|bab|chapter)\\s*${episodeNumber}\\b`, 'i'),
      new RegExp(`^\\s*\\**\\s*${episodeNumber}[.\\)\\:]`, 'i'),
      new RegExp(`^\\s*\\**\\s*Episode\\s+${episodeNumber}\\b`, 'i'),
    ];
    const nextEpPatterns = [
      new RegExp(`(?:episode|ep|bab|chapter)\\s*${episodeNumber + 1}\\b`, 'i'),
      new RegExp(`^\\s*\\**\\s*${episodeNumber + 1}[.\\)\\:]`, 'i'),
      new RegExp(`^\\s*\\**\\s*Episode\\s+${episodeNumber + 1}\\b`, 'i'),
    ];
    for (const line of lines) {
      if (!collecting) {
        if (epPatterns.some(p => p.test(line))) {
          collecting = true;
          result.push(line);
        }
      } else {
        if (nextEpPatterns.some(p => p.test(line))) {
          break; // Sudah masuk episode berikutnya
        }
        result.push(line);
      }
    }
    // Jika tidak berhasil parse, fallback: kirim outline lengkap tapi dipotong
    if (result.length === 0) {
      return fullOutline.substring(0, 800) + '\n... (outline dipotong)';
    }
    return result.join('\n').trim();
  };

  const DEFAULT_SYSTEM_MESSAGE = `Kamu adalah seorang penulis novel fiksi profesional dan editor senior berkaliber internasional. KAMU WAJIB MENULIS SELURUH TEKS DALAM BAHASA INDONESIA. JANGAN PERNAH MENULIS DALAM BAHASA INGGRIS ATAU BAHASA LAIN.

ATURAN PENULISAN:

1. BAHASA: Seluruh output HARUS dalam Bahasa Indonesia yang baik dan natural. Gunakan kosa kata Indonesia yang kaya. DILARANG KERAS menulis dalam bahasa Inggris.

2. SHOW, DON'T TELL: Jangan mendeskripsikan perasaan karakter secara mentah (SALAH: "Budi sedih", "Siti marah"). Deskripsikan lewat aksi, bahasa tubuh, dan pikiran (BENAR: "Budi menatap kosong ke luar jendela, membiarkan kopinya mendingin di atas meja", "Rahang Siti mengeras, tangannya mengepal hingga buku-buku jarinya memutih.").

3. FORMAT DIALOG PROFESIONAL:
   - Setiap PERGANTIAN PEMBICARA harus di PARAGRAF BARU. Jangan gabungkan dialog dua karakter dalam satu paragraf.
   - Tanda kutip ganda ("...") untuk mengapit dialog.
   - Tanda baca di DALAM tanda kutip jika diikuti dialogue tag:
     BENAR: "Aku tidak mau pergi," kata Rina pelan.
     SALAH: "Aku tidak mau pergi", kata Rina pelan.
   - Jika dialog diikuti aksi (bukan dialogue tag), gunakan titik lalu kalimat baru:
     BENAR: "Aku tidak mau pergi." Rina melipat kedua tangannya di dada.

4. PACING & STRUKTUR: Variasikan panjang kalimat. Kalimat pendek untuk ketegangan dan aksi. Kalimat panjang mengalir untuk deskripsi naratif dan introspeksi. Pastikan alur cerita mengalir natural.

5. KONSISTENSI POV: Pertahankan satu sudut pandang dalam satu adegan. Jangan melompat ke isi kepala karakter lain tanpa pemisah adegan yang jelas.

6. DETAIL SENSORI (PANCA INDRA): Jangan hanya mengandalkan penglihatan. Libatkan semua indra:
   - Pendengaran: derak lantai kayu, detak jam, dengung lampu.
   - Penciuman: bau tanah basah, aroma kopi, bau besi berkarat.
   - Perabaan: angin dingin menusuk, permukaan sutra lembut, kasarnya bata.
   - Pengecapan: rasa metalik darah, manis gula aren.

7. KARAKTER HIDUP: Dialog harus mencerminkan kepribadian, latar belakang, usia, dan status sosial karakter. Anak jalanan tidak berbicara seperti profesor. Setiap karakter punya suara unik.

8. ANTI-KLISE: Jauhi frasa usang ("mata berbinar bagai bintang", "waktu seakan berhenti"). Ciptakan metafora segar dan orisinal yang relevan dengan tema novel.

9. ANTI-REPETISI: DILARANG KERAS mengulang kata, frasa, atau kalimat yang sama berturut-turut. Setiap paragraf HARUS membawa informasi baru atau perkembangan cerita.

10. KOHERENSI: Setiap kalimat harus berhubungan logis dengan sebelum dan sesudahnya. Narasi mengalir natural antar paragraf.

11. FORMAT OUTPUT: JANGAN cantumkan judul episode/bab di awal teks. Langsung mulai dengan paragraf cerita.

Tugasmu menghasilkan teks BERBAHASA INDONESIA berkualitas setara buku terbitan penerbit mayor (Best Seller). INGAT: SELURUH TEKS HARUS DALAM BAHASA INDONESIA.`;

  const generateText = async (prompt, systemMessage = DEFAULT_SYSTEM_MESSAGE, retryCount = 0) => {
    setLoading(true);
    try {
      // Pada retry: naikkan temperature, dan hapus penalty agar model lebih bebas
      const temp = Math.min(0.7 + (retryCount * 0.2), 1.0);
      const freqPenalty = retryCount === 0 ? 0.15 : 0;
      const presPenalty = retryCount === 0 ? 0.1 : 0;
      const response = await chatWithFallback({
        model: novelData.modelName || 'auto',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: temp,
        max_tokens: 8000,
        frequency_penalty: freqPenalty,
        presence_penalty: presPenalty,
      }, setActiveProvider);
      let content = response.choices[0].message.content;
      content = content.replace(/<think>[\s\S]*?<\/think>/, '').trim();

      // Deteksi repetisi — jika terdeteksi, retry dengan temperature lebih tinggi
      if (detectRepetition(content) && retryCount < 2) {
        console.warn(`[generateText] Repetisi terdeteksi (percobaan ke-${retryCount + 1}), retry dengan temperature lebih tinggi...`);
        return generateText(prompt, systemMessage, retryCount + 1);
      }

      // ── Kurangi token diam-diam berdasarkan panjang output ──
      // User tidak tahu berapa yang dipotong, hanya lihat saldo turun pelan
      if (user && content) {
        spendTokens(content).catch(() => {}); // fire-and-forget, jangan blokir UI
      }

      return content;
    } catch (error) {
      alert('Error: ' + error.message);
      return '';
    } finally {
      setLoading(false);
    }
  };

  // Logics for each step
  const handleGenerateCharacters = async () => {
    const styleText = Array.isArray(novelData.style) ? novelData.style.join(', ') : novelData.style;
    const prompt = `Premis: ${novelData.premise}\nBlurb: ${novelData.blurb}\nGaya Bahasa: ${styleText}${novelData.previousContext ? `\n\nKonteks Kejadian Buku Sebelumnya:\n${novelData.previousContext}` : ''}\nBuatlah profil untuk 3-5 karakter utama (Nama, Penampilan, Kepribadian, Motivasi). WAJIB tulis dalam Bahasa Indonesia.`;
    const result = await generateText(prompt);
    if (result) {
        updateData('characters', result);
        setStep(2);
    }
  };

  const handleGenerateWorld = async () => {
    const prompt = `Premis: ${novelData.premise}\nKarakter:\n${novelData.characters}${novelData.previousContext ? `\n\nKonteks Kejadian Buku Sebelumnya:\n${novelData.previousContext}` : ''}\nBuatlah deskripsi tentang dunia/latar tempat cerita ini berlangsung (Lokasi, Waktu, Atmosfer, Aturan Khusus). WAJIB tulis dalam Bahasa Indonesia.`;
    const result = await generateText(prompt);
    if (result) {
        updateData('world', result);
        setStep(3);
    }
  };

  const handleGenerateOutline = async () => {
    const prompt = `Target Episode: ${novelData.targetChapters}\nPremis: ${novelData.premise}\nKarakter:\n${novelData.characters}\nDunia:\n${novelData.world}${novelData.previousContext ? `\n\nKonteks Kejadian Buku Sebelumnya:\n${novelData.previousContext}` : ''}\nBuatlah kerangka plot episode-demi-episode dalam BAHASA INDONESIA. Berikan judul setiap episode dan ringkasan kejadiannya. Pastikan jumlahnya tepat ${novelData.targetChapters} episode.`;
    const result = await generateText(prompt);
    if (result) {
        updateData('outline', result);
        setStep(4);
    }
  };

  const handleGenerateCover = async () => {
    setLoading(true);
    try {
      const styleText = Array.isArray(novelData.style) ? novelData.style.join(', ') : novelData.style;
      
      const taglinePrompt = `Buatlah SATU kalimat epik pendek (maksimal 8-10 kata) yang misterius atau dramatis untuk tagline poster novel berjudul "${novelData.title}". Berdasarkan blurb: ${novelData.blurb}. HANYA BERIKAN TEKS TAGLINE-NYA SAJA (tanpa tanda kutip, tanpa penjelasan).`;
      let tagline = await generateText(taglinePrompt);
      tagline = (tagline || "Antara Cahaya dan Kegelapan, Sebuah Takdir Terukir.").replace(/['"]/g, '').toUpperCase();
      
      const promptDesigner = `Kamu adalah ahli pembuat prompt gambar AI untuk BACKGROUND cover novel. 
Tugasmu merancang SATU prompt gambar (dalam bahasa INGGRIS) yang sangat epik, sinematik, dan mendetail untuk dikirim ke AI Image Generator.
ATURAN SANGAT PENTING: NO TEXT, NO WORDS, NO TYPOGRAPHY, NO WATERMARK. GAMBAR HARUS MURNI ILUSTRASI LATAR BELAKANG DAN/ATAU KARAKTER.
BALAS HANYA DENGAN TEKS PROMPT INGGRIS-NYA SAJA (tanpa kutip, tanpa penjelasan).

Judul: ${novelData.title}
Blurb: ${novelData.blurb}
Nuansa/Style: ${styleText}

ATURAN GAYA VISUAL:
- 2D digital illustration, premium novel cover art, sophisticated anime/manhwa-inspired illustration
- Cinematic composition, detailed environment, atmospheric lighting
- Portrait 2:3 vertical layout
- ABSOLUTELY NO TEXT OR LETTERS IN THE IMAGE`;

      let optimizedPrompt = await generateText(promptDesigner);
      optimizedPrompt = optimizedPrompt ? optimizedPrompt.trim() : `A professional background art for a novel cover. ${novelData.premise ? novelData.premise.substring(0, 150) : ''}. Style: ${styleText}, 2D digital illustration, highly detailed, cinematic lighting. No text, no letters, no words.`;
      
      const randomSeed = Math.floor(Math.random() * 1000000);
      const bgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(optimizedPrompt)}?width=1024&height=1536&nologo=true&seed=${randomSeed}&model=flux`;
      
      updateData('coverTagline', tagline);
      updateData('coverBackgroundUrl', bgUrl);
      
      setIsCompositing(true);
      
      // Fallback timeout in case image loading hangs indefinitely
      setTimeout(() => {
        if (isCompositing) {
          setIsCompositing(false);
          setLoading(false);
        }
      }, 30000); // 30 seconds max
      
    } catch (error) {
      alert("Gagal memproses background cover: " + error.message);
      setLoading(false);
    }
  };

  const handleCompositorImageLoad = async () => {
    if (!coverRef.current || !isCompositing) return;
    
    // Give it a tiny bit of time to ensure fonts are rendered
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(coverRef.current, {
          useCORS: true,
          scale: 1.5, // High res but not too heavy
          backgroundColor: '#000000',
          logging: false
        });
        const finalImageUrl = canvas.toDataURL("image/jpeg", 0.9);
        updateData('coverUrl', finalImageUrl);
      } catch (e) {
        console.error("Gagal melakukan compositing:", e);
        alert("Gagal merender tipografi cover.");
      } finally {
        setIsCompositing(false);
        setLoading(false);
      }
    }, 500);
  };

  const handleUploadCover = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateData('coverUrl', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoGenerateIdeas = async () => {
    if (!ideaForm.rawIdea.trim()) return;
    setLoading(true);
    try {
      const sequelContext = novelData.previousContext ? `\n\nKONTEKS BUKU SEBELUMNYA (Jadikan referensi utama untuk menjaga kesinambungan cerita):\n${novelData.previousContext}\n` : '';
      const prompt = `Saya punya ide cerita kasar berikut ini:
"${ideaForm.rawIdea}"
Genre yang kuinginkan: ${ideaForm.genre}${sequelContext}
Tolong kembangkan ide kasar di atas menjadi sebuah ide novel yang sangat menarik, rapi, dan profesional.
Balas HANYA dengan format ini tanpa tambahan teks lain:
JUDUL: [Judul yang menarik]
GENRE: [1-2 Genre spesifik novel ini, misal: Fantasy Romance, Sci-Fi Thriller, dll]
PREMIS: [Premis singkat 1-2 kalimat]
BLURB: [Sinopsis belakang buku yang memancing rasa penasaran, 2-3 paragraf]
GAYA: [Gaya bahasa yang direkomendasikan]`;
      const result = await generateText(prompt);
      if (result) {
        const titleMatch = result.match(/JUDUL:\s*(.*)/i);
        const genreMatch = result.match(/GENRE:\s*(.*)/i);
        const premiseMatch = result.match(/PREMIS:\s*(.*)/i);
        const blurbMatch = result.match(/BLURB:\s*([\s\S]*?)GAYA:/i);
        const styleMatch = result.match(/GAYA:\s*(.*)/i);

        if (titleMatch) updateData('title', titleMatch[1].trim());
        if (genreMatch) updateData('genre', genreMatch[1].trim());
        if (premiseMatch) updateData('premise', premiseMatch[1].trim());
        if (blurbMatch) updateData('blurb', blurbMatch[1].trim());
        if (styleMatch) updateData('style', styleMatch[1].trim().split(',').map(s=>s.trim()));
      }
    } catch (err) {
      alert("Gagal generate ide: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const countWords = (text) => text.trim().split(/\s+/).filter(w => w.length > 0).length;

  const handleProofreadChapter = async () => {
    const chapterContent = novelData.chapters[currentChapterIndex];
    if (!chapterContent || chapterContent.trim() === '') {
      alert("Tidak ada teks untuk dikoreksi.");
      return;
    }
    setLoading(true);
    const prompt = `Tolong koreksi teks novel di bawah ini. 
Tugasmu:
1. Perbaiki semua typo (salah ketik).
2. Perbaiki tata bahasa dan ejaan sesuai standar penulisan novel fiksi yang baik.
3. Ganti kata atau kalimat yang kaku agar aliran ceritanya lebih mulus tanpa mengubah gaya bahasa penulis secara drastis.
4. JANGAN mengubah jalan cerita, JANGAN menambah adegan baru, dan JANGAN memotong adegan yang ada.
5. Berikan HANYA teks hasil koreksi secara penuh tanpa embel-embel kalimat pembuka atau penutup. Jangan menambahkan judul episode jika tidak ada.

TEKS YANG HARUS DIKOREKSI:
${chapterContent}`;

    try {
      const result = await generateText(prompt);
      if (result) {
        const newChapters = [...novelData.chapters];
        newChapters[currentChapterIndex] = result.trim();
        updateData('chapters', newChapters);
      }
    } catch (e) {
      alert("Gagal melakukan koreksi: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChapter = async () => {
    setLoading(true);
    let chapterContent = novelData.chapters[currentChapterIndex] || "";
    let currentWords = countWords(chapterContent);
    const target = novelData.targetWordsPerChapter;
    const sequelContext = novelData.previousContext ? `\n\n[INFO SERI: Novel ini adalah sekuel. Konteks buku sebelumnya:\n${novelData.previousContext}]\n` : '';
    const styleText = Array.isArray(novelData.style) ? novelData.style.join(', ') : novelData.style;

    // Ekstrak outline hanya untuk episode yang sedang ditulis
    const episodeOutline = extractEpisodeOutline(novelData.outline, currentChapterIndex + 1);

    try {
      let iteration = 0;
      
      // Ambil akhir cerita dari bab sebelumnya agar nyambung
      let previousChapterContext = "";
      if (currentChapterIndex > 0) {
        const prevChap = novelData.chapters[currentChapterIndex - 1] || "";
        const lastPart = prevChap.slice(-1500).trim();
        if (lastPart) {
          previousChapterContext = `\n\n[TRANSISI DARI EPISODE SEBELUMNYA]:\nEpisode ${currentChapterIndex} berakhir dengan:\n"... ${lastPart}"\n\nLanjutkan secara mulus dari sini. Jangan mengulang adegan, tapi lanjutkan dampaknya.`;
        }
      }

      // Ambil awal cerita dari bab berikutnya (jika sudah ada) untuk menjembatani plot
      let nextChapterContext = "";
      if (currentChapterIndex < novelData.chapters.length - 1) {
        const nextChap = novelData.chapters[currentChapterIndex + 1] || "";
        const firstPart = nextChap.substring(0, 800).trim();
        if (firstPart) {
          nextChapterContext = `\n\n[ARAH AKHIR EPISODE]:\nEpisode ${currentChapterIndex + 2} sudah diawali dengan:\n"${firstPart} ..."\n\nPastikan akhir episode ini mengarah ke sana secara natural.`;
        }
      }

      while (currentWords < target && iteration < 5) {
        const wordsRemaining = target - currentWords;
        let prompt = "";

        if (iteration === 0 && chapterContent === "") {
          // ── Prompt pertama: tulis dari awal ──
          prompt = `TULIS DALAM BAHASA INDONESIA. Tulislah isi Episode ${currentChapterIndex + 1}. Langsung mulai dengan paragraf cerita, JANGAN cantumkan judul atau header "Episode X".

Premis: ${novelData.premise}
Gaya Bahasa: ${styleText}
${sequelContext}

Outline Episode ${currentChapterIndex + 1}:
${episodeOutline}

Karakter Utama (ringkas):
${(novelData.characters || '').substring(0, 1200)}

Latar Dunia (ringkas):
${(novelData.world || '').substring(0, 800)}
${previousChapterContext}
${nextChapterContext}

INSTRUKSI PENULISAN:
- WAJIB TULIS SELURUH CERITA DALAM BAHASA INDONESIA. JANGAN pakai Bahasa Inggris.
- Tulis sedetail mungkin dengan deskripsi suasana, emosi, dan dialog yang hidup.
- Setiap paragraf harus membawa perkembangan cerita yang BARU — JANGAN mengulang informasi.
- Variasikan struktur kalimat agar tidak monoton.
- Target: minimal ${target} kata.`;
        } else {
          // ── Prompt lanjutan: tambah kata ──
          prompt = `TULIS DALAM BAHASA INDONESIA. Lanjutkan penulisan Episode ${currentChapterIndex + 1}. Saat ini sudah ${currentWords} kata, target minimal ${target} kata (kurang ~${wordsRemaining} kata lagi).

Outline Episode ${currentChapterIndex + 1}:
${episodeOutline}

ATURAN WAJIB:
- WAJIB TULIS DALAM BAHASA INDONESIA. JANGAN pakai Bahasa Inggris.
- LANJUTKAN langsung dari konteks terakhir di bawah — JANGAN mengulangi kalimat atau adegan yang sudah ada.
- JANGAN menggunakan kata atau frasa yang sama berulang-ulang.
- Kembangkan plot sesuai outline, tambah detail, konflik, atau dialog mendalam.
- JANGAN membuat episode baru, cukup lanjutkan episode ini.

Konteks terakhir (lanjutkan dari sini):
"... ${chapterContent.slice(-1500)}"`;
        }

        const chunk = await generateText(prompt);
        if (!chunk) break;

        // Jika chunk terdeteksi repetitif meski sudah retry, skip chunk ini
        if (detectRepetition(chunk)) {
          console.warn(`[handleGenerateChapter] Chunk iterasi ${iteration} masih repetitif setelah retry, skip.`);
          iteration++;
          continue;
        }

        chapterContent += (iteration > 0 ? "\n\n" : "") + chunk;
        currentWords = countWords(chapterContent);
        iteration++;
        
        const newChapters = [...novelData.chapters];
        newChapters[currentChapterIndex] = chapterContent;
        updateData('chapters', newChapters);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex >= novelData.targetChapters - 1) {
      setStep(6);
    } else {
      setCurrentChapterIndex(prev => prev + 1);
    }
  };

  const saveToHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('kris_ai_history') || '[]');
      const newNovel = {
        ...novelData,
        id: novelData.id || Date.now().toString(),
        createdAt: novelData.createdAt || new Date().toISOString(),
        date: new Date().toISOString()
      };
      const filtered = history.filter(h => h.id !== newNovel.id);
      filtered.unshift(newNovel);
      localStorage.setItem('kris_ai_history', JSON.stringify(filtered));
      if (!novelData.id) {
        updateData('id', newNovel.id);
        updateData('createdAt', newNovel.createdAt);
      }
    } catch (e) {
      console.error("Gagal menyimpan riwayat:", e);
    }
  };

  const generateHTMLForExport = (novelArg) => {
    const novel = (novelArg && !novelArg.nativeEvent) ? novelArg : novelData;
    let content = '';
    if (novel.coverUrl || novel.coverBackgroundUrl) {
      const imgUrl = novel.coverUrl || novel.coverBackgroundUrl;
      content += `<div class="cover-page" style="text-align: center;">
        <img src="${imgUrl}" style="max-width: 100%; max-height: 800px;" />
      </div>`;
    }
    content += `<div class="title-page">
      <h1>${novel.title}</h1>
      <h2>Oleh: ${novel.penName || 'Anonim'}</h2>
    </div>`;
    
    (novel.chapters || []).forEach((chap, idx) => {
      const htmlChap = marked.parse(chap || '');
      content += `<div class="chapter">
        <h2>Episode ${idx + 1}</h2>
        ${htmlChap}
      </div>`;
    });
    
    return `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${novel.title}</title>
        <style>
          @page { margin: 1in; }
          body { font-family: 'Times New Roman', serif; font-size: 12pt; padding: 20px; }
          p { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; text-align: justify; margin-bottom: 12pt; text-indent: 0.5in; }
          h1 { text-align: center; font-size: 24pt; margin-bottom: 10px; }
          h2 { text-align: center; font-size: 18pt; margin-bottom: 24pt; }
          .title-page { text-align: center; page-break-after: always; break-after: page; margin-top: 25%; margin-bottom: 25%; }
          .cover-page { page-break-after: always; break-after: page; }
          .chapter { page-break-before: always; break-before: page; }
          .chapter:first-of-type { page-break-before: auto; break-before: auto; }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
  };

  const handleExportWord = (novelArg) => {
    const novel = (novelArg && !novelArg.nativeEvent) ? novelArg : novelData;
    const htmlContent = generateHTMLForExport(novel);
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${novel.title.replace(/\s+/g, '_')}_Novel.doc`;
    a.click();
    URL.revokeObjectURL(url);
    if (novel === novelData) saveToHistory();
  };

  const handleExportPDF = (novelArg) => {
    const novel = (novelArg && !novelArg.nativeEvent) ? novelArg : novelData;
    let htmlContent = generateHTMLForExport(novel);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      // Use setTimeout to allow large cover images and fonts to render before triggering print dialog
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        if (novel === novelData) saveToHistory();
      }, 1000);
    } else {
      alert("Popup diblokir! Tolong izinkan popup browser Anda untuk membuka PDF.");
    }
  };

  const handleExportMarkdown = (novelArg) => {
    const novel = (novelArg && !novelArg.nativeEvent) ? novelArg : novelData;
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
    if (novel === novelData) saveToHistory();
  };

  // ─── Auth Guard ───────────────────────────────────────────────────────────
  // Tampilkan loading saat cek session awal
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0f, #0d0d1a)',
        flexDirection: 'column', gap: '16px',
      }}>
        <div style={{
          width: '48px', height: '48px',
          background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
          borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px rgba(79,70,229,0.5)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          <Sparkles size={22} color="white" />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Memuat Kris AI...</p>
      </div>
    );
  }

  // Tampilkan login jika belum auth
  if (!isAuthenticated) {
    return (
      <LoginView
        onLogin={signIn}
        onGuestLogin={signInAsGuest}
        authError={authError}
        setAuthError={setAuthError}
      />
    );
  }

  return (
    <>
    {showTokenModal && <TokenEmptyModal onClose={() => setShowTokenModal(false)} />}
    <MainLayoutWrapper
      isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
      isToolsOpen={isToolsOpen} setIsToolsOpen={setIsToolsOpen}
      setActiveTool={setActiveTool}
      theme={theme} toggleTheme={toggleTheme}
      currentView={currentView} setCurrentView={setCurrentView}
      resetProgress={resetProgress}
      user={user}
      userProfile={userProfile}
      tokenBalance={tokenBalance}
      onSignOut={signOut}
        isGuestMode={isGuestMode}
    >
    <div className="app-container">
      {!activeTool ? (
        <>
          {currentView === 'beranda' && <BerandaView setCurrentView={setCurrentView} />}
          {currentView === 'belitoken' && <BeliTokenView />}
          {currentView === 'makalah' && <MakalahView getClient={getClient} spendTokens={spendTokens} tokenBalance={tokenBalance} />}
          {currentView === 'chat' && <ChatAIView getClient={getClient} spendTokens={spendTokens} tokenBalance={tokenBalance} />}
          {currentView === 'ghostwriter' && <GhostwriterView getClient={getClient} spendTokens={spendTokens} />}
          {currentView === 'riwayat' && (
            <RiwayatKaryaView 
              onExportWord={handleExportWord}
              onExportPDF={handleExportPDF}
              onLoadNovel={(novel, targetChapterIndex = null) => {
                setNovelData(novel);
                
                if (targetChapterIndex !== null) {
                  setCurrentChapterIndex(targetChapterIndex);
                  setStep(5);
                  localStorage.setItem('kris_ai_novelData', JSON.stringify(novel));
                  localStorage.setItem('kris_ai_step', '5');
                  localStorage.setItem('kris_ai_currentChapterIndex', targetChapterIndex.toString());
                } else {
                  setCurrentChapterIndex(Math.max(0, (novel.chapters?.length || 1) - 1));
                  setStep(novel.chapters?.length > 0 ? 3 : 2);
                  localStorage.setItem('kris_ai_novelData', JSON.stringify(novel));
                  localStorage.setItem('kris_ai_step', novel.chapters?.length > 0 ? '3' : '2');
                  localStorage.setItem('kris_ai_currentChapterIndex', Math.max(0, (novel.chapters?.length || 1) - 1).toString());
                }
                
                setCurrentView('generator');
              }}
              onSequelNovel={(novel) => {
                const nextSeries = (novel.seriesNumber || 1) + 1;
                const context = `Ini adalah sekuel (Buku ${nextSeries}) dari novel berjudul "${novel.title}".\nPremis buku sebelumnya: ${novel.premise}\nKarakter utama: ${novel.characters}\nDunia: ${novel.world}`;
                
                setNovelData({
                  title: `${novel.title} (Buku ${nextSeries})`,
                  penName: novel.penName,
                  premise: '',
                  blurb: '',
                  style: novel.style || [],
                  targetChapters: novel.targetChapters,
                  targetWordsPerChapter: novel.targetWordsPerChapter,
                  modelName: novel.modelName,
                  characters: '',
                  world: '',
                  outline: '',
                  chapters: [],
                  coverUrl: null,
                  coverBackgroundUrl: null,
                  coverTagline: null,
                  previousContext: context,
                  seriesNumber: nextSeries,
                  genre: novel.genre
                });
                
                setIdeaForm({
                  genre: novel.genre || 'Bebas / Terserah AI',
                  rawIdea: `Tolong buatkan sekuel (kelanjutan cerita) dari buku sebelumnya yang berjudul "${novel.title}". Fokus cerita kali ini adalah: `
                });
                
                setStep(1);
                setCurrentChapterIndex(0);
                setCurrentView('generator');
              }}
            />
          )}
          {currentView === 'pengaturan' && <PengaturanAkunView theme={theme} toggleTheme={toggleTheme} />}
          {currentView === 'tentang' && <TentangAppView />}
          
          {currentView === 'generator' && (
            <>
              <div className="header fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1>AI Novel Generator</h1>
                  <p>Sistem Pabrikasi Novel Tercepat & Cerdas</p>
                </div>
                {step > 1 && (
                  <button className="btn-secondary" onClick={handleCreateNewNovel} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PlusCircle size={16} /> Mulai Novel Baru
                  </button>
                )}
              </div>
          
          <div className="main-content-area scrollable">
            <div className="steps-container animate-fade">
              {STEPS.map((s) => {
                const Icon = s.icon;
                const isActive = step === s.id;
                const isCompleted = step > s.id;
                return (
                  <div key={s.id} className="step-wrapper">
                    <div 
                      className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                      title={s.name}
                    >
                      {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                    </div>
                    <span className="step-label" style={{ color: isActive ? 'var(--brand-primary)' : isCompleted ? 'var(--brand-secondary)' : 'var(--text-secondary)' }}>
                      {s.name}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="premium-card-v2 animate-fade" style={{padding: "2.5rem", borderRadius: "1.5rem"}}>
              {step === 1 && (
                <div>
                  <div className="step-header">
                    <h2>
                      <Settings size={24} color="var(--brand-primary)" /> Tahap 1: Setup Dasar
                    </h2>
                    <p>Tentukan arah cerita, judul, dan persona novelmu secara mendetail.</p>
                  </div>
                  
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Judul Novel</label>
                      <input className="form-input" value={novelData.title} onChange={e => updateData('title', e.target.value)} placeholder="Misteri Lembah Kabut" />
                    </div>
                    <div className="form-group">
                      <label>Nama Pena (Author)</label>
                      <input className="form-input" value={novelData.penName} onChange={e => updateData('penName', e.target.value)} placeholder="K.A. Wijaya" />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label>Gaya Bahasa (Genre Dominan & Tone)</label>
                      <input className="form-input" value={novelData.style} onChange={e => updateData('style', e.target.value)} placeholder="Misteri, Dark, Puitis" />
                    </div>
                    <div className="form-group">
                      <label>Model AI (Opsional)</label>
                      <input className="form-input" value={novelData.modelName} onChange={e => updateData('modelName', e.target.value)} placeholder="auto, gpt-4o" title="Ubah jika menggunakan OmniRoute dan butuh model spesifik" />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label>Target Jumlah Bab</label>
                      <input className="form-input" type="number" min="1" max="50" value={novelData.targetChapters} onChange={e => updateData('targetChapters', parseInt(e.target.value))} />
                    </div>
                    <div className="form-group">
                      <label>Target Kata per Episode (Akurat)</label>
                      <input className="form-input" type="number" min="100" max="5000" step="100" value={novelData.targetWordsPerChapter} onChange={e => updateData('targetWordsPerChapter', parseInt(e.target.value))} />
                    </div>
                  </div>

                  <div className="step-header" style={{ marginTop: '2rem' }}>
                    <h2>
                      <Sparkles size={24} color="var(--brand-primary)" /> Ide Cerita (Premis & Blurb)
                    </h2>
                    <p>Racik ide cerita dari pilihan atau tulis sendiri, AI akan menyempurnakannya.</p>
                  </div>

                  <div className="neon-border" style={{borderRadius: '16px', padding: '24px', marginBottom: '32px', background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.05), rgba(0,0,0,0))'}}>
                    <h3 style={{marginBottom: '12px', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem'}}>
                      <Sparkles size={20} /> Asisten Peracik Ide
                    </h3>
                    <p style={{color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.85rem', lineHeight: '1.6'}}>Punya ide acak tapi bingung menyusunnya? Tuliskan saja ide kasarmu di sini, dan AI akan merapikannya menjadi Judul, Premis, dan Blurb yang sangat memikat untuk dibaca.</p>
                    
                    <div className="form-group" style={{marginBottom: '16px'}}>
                      <label style={{fontSize: '0.85rem'}}>Ide Kasar (Ceritakan secara singkat)</label>
                      <textarea className="form-textarea" 
                        value={ideaForm.rawIdea} 
                        onChange={e => updateIdeaForm('rawIdea', e.target.value)} 
                        placeholder="Misal: cerita ttg anak sma yg tiba-tiba dapet kekuatan denger pikiran kucing, trus dia bantu mecahin kasus pembunuhan..." 
                        style={{minHeight: '80px', padding: '10px', fontSize: '0.9rem'}}
                      />
                    </div>

                    <div className="form-group" style={{marginBottom: '16px'}}>
                      <label style={{fontSize: '0.85rem'}}>Genre (Sebagai panduan AI)</label>
                      <select className="form-select" value={ideaForm.genre} onChange={e => updateIdeaForm('genre', e.target.value)} style={{padding: '10px', fontSize: '0.9rem'}}>
                        <option>Bebas / Terserah AI</option>
                        <option>Fantasi</option>
                        <option>Sci-Fi</option>
                        <option>Romantis</option>
                        <option>Misteri / Detektif</option>
                        <option>Horor</option>
                        <option>Slice of Life</option>
                        <option>Isekai / Portal Fantasy</option>
                      </select>
                    </div>

                    <button className="btn-primary" onClick={handleAutoGenerateIdeas} disabled={loading || !ideaForm.rawIdea.trim()} style={{width: '100%', padding: '14px', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
                      {loading ? <span className="loader"></span> : <><Sparkles size={18} /> Rapihkan Jadi Premis & Blurb</>}
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Premis Cerita (Ide Utama)</label>
                    <textarea className="form-textarea" 
                      value={novelData.premise} 
                      onChange={e => updateData('premise', e.target.value)}
                      placeholder="Seorang detektif yang bisa melihat hantu harus menyelesaikan kasus pembunuhan sahabatnya sendiri..."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Blurb (Sinopsis Belakang Buku)</label>
                    <textarea className="form-textarea" 
                      value={novelData.blurb} 
                      onChange={e => updateData('blurb', e.target.value)}
                      placeholder="Ketika kematian bukan lagi akhir..."
                    />
                  </div>

                  <div style={{display: 'flex', gap: '12px', marginTop: '24px'}}>
                    <button className="btn-primary" style={{width: '100%'}} onClick={handleGenerateCharacters} disabled={loading}>
                      {loading ? <span className="loader"></span> : 'Lanjut ke Karakter'}
                      {!loading && <ChevronRight size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="fade-in">
                  <div className="step-header">
                    <h2>
                      <User size={24} color="var(--brand-primary)" /> Tahap 2: Pengembangan Karakter
                    </h2>
                    <p>AI telah merekomendasikan karakter berdasarkan premismu. Silakan edit profil ini sebebasnya jika ada yang kurang cocok.</p>
                  </div>
                  
                  <textarea className="form-textarea" 
                    style={{ minHeight: '300px' }}
                    value={novelData.characters} 
                    onChange={e => updateData('characters', e.target.value)}
                  />
                  
                  <div style={{display: 'flex', gap: '12px', marginTop: '24px'}}>
                    <button className="btn-secondary" onClick={() => setStep(1)}>Kembali</button>
                    <button className="btn-primary" onClick={handleGenerateWorld} disabled={loading}>
                      {loading ? <span className="loader"></span> : 'Lanjut ke Dunia'}
                      {!loading && <ChevronRight size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="fade-in">
                  <div className="step-header">
                    <h2>
                      <Globe size={24} color="var(--brand-primary)" /> Tahap 3: World Building
                    </h2>
                    <p>Latar tempat dan aturan dunia telah disusun oleh AI. Periksa dan modifikasi jika diperlukan.</p>
                  </div>
                  
                  <textarea className="form-textarea" 
                    style={{ minHeight: '300px' }}
                    value={novelData.world} 
                    onChange={e => updateData('world', e.target.value)}
                  />
                  
                  <div style={{display: 'flex', gap: '12px', marginTop: '24px'}}>
                    <button className="btn-secondary" onClick={() => setStep(2)}>Kembali</button>
                    <button className="btn-primary" onClick={handleGenerateOutline} disabled={loading}>
                      {loading ? <span className="loader"></span> : 'Lanjut ke Outline'}
                      {!loading && <ChevronRight size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="fade-in">
                  <div className="step-header">
                    <h2>
                      <FileText size={24} color="var(--brand-primary)" /> Tahap 4: Kerangka Plot (Outline)
                    </h2>
                    <p>Berikut adalah kerangka alur novel per bab. Kamu bisa menyuntingnya untuk mengubah arah cerita.</p>
                  </div>
                  
                  <textarea className="form-textarea" 
                    style={{ minHeight: '400px' }}
                    value={novelData.outline} 
                    onChange={e => updateData('outline', e.target.value)}
                  />
                  
                  <div style={{display: 'flex', gap: '12px', marginTop: '24px'}}>
                    <button className="btn-secondary" onClick={() => setStep(3)}>Kembali</button>
                    <button className="btn-primary" onClick={() => {
                      if (novelData.chapters.length === 0) {
                        updateData('chapters', Array(novelData.targetChapters).fill(''));
                      }
                      setStep(5);
                    }}>
                      Mulai Menulis Episode (Drafting)
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="fade-in">
                  <div className="step-header">
                    <h2>
                      <BookOpen size={24} color="var(--brand-primary)" /> Tahap 5: Editor Bab
                    </h2>
                    <p>AI akan menulis episode demi episode. Word count ditargetkan akurat sesuai inputmu di awal.</p>
                  </div>

                  <div style={{display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap'}}>
                    {novelData.chapters.map((_, idx) => (
                      <button 
                        key={idx} 
                        className={currentChapterIndex === idx ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => setCurrentChapterIndex(idx)}
                        style={{padding: '8px 12px', fontSize: '0.9rem', background: currentChapterIndex === idx ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'var(--glass-bg)', border: currentChapterIndex === idx ? 'none' : '1px solid var(--border-color)'}}
                      >
                        Episode {idx + 1}
                      </button>
                    ))}
                  </div>

                  <div style={{background: 'var(--surface-color)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '24px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                      <h3 style={{margin: 0, fontSize: '1.2rem', color: 'var(--brand-primary)'}}>Editor Episode {currentChapterIndex + 1}</h3>
                      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                        <button onClick={handleCopyChapter} className="btn-secondary" style={{padding: '4px 12px', fontSize: '0.85rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                          <Copy size={14} /> Salin Bab
                        </button>
                        <div style={{fontSize: '0.85rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.35)', padding: '4px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)'}}>
                          <strong style={{color: 'white'}}>{countWords(novelData.chapters[currentChapterIndex] || '')}</strong> / {novelData.targetWordsPerChapter} kata
                        </div>
                      </div>
                    </div>

                    <div ref={hiddenChapterRef} style={{ display: 'none' }}>
                      <ReactMarkdown>{novelData.chapters[currentChapterIndex] || ''}</ReactMarkdown>
                    </div>

                    <textarea className="form-textarea" 
                      style={{ minHeight: '400px' }}
                      value={novelData.chapters[currentChapterIndex] || ''} 
                      onChange={e => {
                        const newChapters = [...novelData.chapters];
                        newChapters[currentChapterIndex] = e.target.value;
                        updateData('chapters', newChapters);
                      }}
                      placeholder="Klik Generate atau mulai ketik secara manual..."
                    />
                  </div>
                  
                  <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '24px', alignItems: 'center'}}>
                    <button className="btn-secondary" onClick={() => {
                      if (currentChapterIndex > 0) {
                        setCurrentChapterIndex(prev => prev - 1);
                      } else {
                        setStep(4);
                      }
                    }}>Kembali</button>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-secondary" onClick={handleProofreadChapter} disabled={loading} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        {loading ? <span className="loader"></span> : <><Wrench size={18} /> Koreksi AI</>}
                      </button>
                      <button className="btn-primary" onClick={handleGenerateChapter} disabled={loading} style={{background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        {loading ? <span className="loader"></span> : <><PenTool size={18} /> Tulis / Lanjutkan Episode {currentChapterIndex + 1}</>}
                      </button>
                    </div>

                    <button className="btn-primary" style={{backgroundColor: '#10b981'}} onClick={handleNextChapter}>
                      {currentChapterIndex < novelData.targetChapters - 1 ? 'Lanjut Episode Berikutnya' : 'Selesai & Ke Export'}
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="fade-in">
                  <div className="step-header">
                    <h2>
                      <Save size={24} color="var(--brand-primary)" /> Tahap 6: Finalisasi & Ekspor
                    </h2>
                    <p>Karyamu sudah siap. Periksa cover dan detail, lalu unduh dalam format yang kamu inginkan.</p>
                  </div>

                  <div className="grid-2" style={{alignItems: 'start'}}>
                    {/* Left Panel: Cover & Visuals */}
                    <div className="neon-border" style={{borderRadius: '16px', padding: '24px', background: 'var(--glass-bg)'}}>
                      <h3 style={{marginBottom: '16px', fontSize: '1.2rem'}}>Cover Novel</h3>
                      <div 
                        style={{
                          width: '100%', 
                          aspectRatio: '2/3', 
                          background: 'rgba(0,0,0,0.3)', 
                          borderRadius: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          border: '1px dashed rgba(255,255,255,0.2)',
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        {novelData.coverUrl ? (
                          <img src={novelData.coverUrl} alt="Cover Novel" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        ) : (
                          <div style={{textAlign: 'center', padding: '20px', color: 'var(--text-secondary)'}}>
                            <ImageIcon size={48} style={{opacity: 0.5, marginBottom: '10px'}} />
                            <p>Belum ada cover.</p>
                          </div>
                        )}
                        
                        <div style={{position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', gap: '8px'}}>
                          <button className="btn-primary" onClick={handleGenerateCover} disabled={loading || isCompositing} style={{flex: 1, padding: '8px', fontSize: '0.85rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)'}}>
                            {(loading || isCompositing) ? <span className="loader" style={{width: '16px', height: '16px'}}></span> : 'Generate AI'}
                          </button>
                          <label className="btn-secondary" style={{flex: 1, padding: '8px', fontSize: '0.85rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', color: 'white'}}>
                            Upload
                            <input type="file" accept="image/*" onChange={handleUploadCover} style={{display: 'none'}} />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right Panel: Details & Export */}
                    <div>
                      <div className="neon-border" style={{borderRadius: '16px', padding: '24px', background: 'var(--glass-bg)', marginBottom: '24px'}}>
                        <h3 style={{marginBottom: '16px', fontSize: '1.2rem'}}>Detail Karya</h3>
                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                          <tbody>
                            <tr>
                              <td style={{padding: '12px 0', color: 'var(--text-secondary)', width: '30%', verticalAlign: 'top'}}>Judul</td>
                              <td style={{padding: '12px 0', fontWeight: 'bold', width: '70%', verticalAlign: 'top'}}>{novelData.title || '-'}</td>
                            </tr>
                            <tr style={{borderTop: '1px solid var(--border-color)'}}>
                              <td style={{padding: '12px 0', color: 'var(--text-secondary)', verticalAlign: 'top'}}>Penulis</td>
                              <td style={{padding: '12px 0', fontWeight: 'bold', verticalAlign: 'top'}}>{novelData.penName || '-'}</td>
                            </tr>
                            <tr style={{borderTop: '1px solid var(--border-color)'}}>
                              <td style={{padding: '12px 0', color: 'var(--text-secondary)', verticalAlign: 'top'}}>Genre</td>
                              <td style={{padding: '12px 0', fontWeight: 'bold', verticalAlign: 'top'}}>{novelData.genre || (ideaForm.genre !== 'Bebas / Terserah AI' ? ideaForm.genre : 'Diadaptasi Otomatis (Generate ulang ide)')}</td>
                            </tr>
                            <tr style={{borderTop: '1px solid var(--border-color)'}}>
                              <td style={{padding: '12px 0', color: 'var(--text-secondary)', verticalAlign: 'top'}}>Gaya Bahasa</td>
                              <td style={{padding: '12px 0', fontWeight: 'bold', verticalAlign: 'top'}}>{Array.isArray(novelData.style) ? novelData.style.join(', ') : (novelData.style || '-')}</td>
                            </tr>
                            <tr style={{borderTop: '1px solid var(--border-color)'}}>
                              <td style={{padding: '12px 0', color: 'var(--text-secondary)', verticalAlign: 'top'}}>Total Bab</td>
                              <td style={{padding: '12px 0', fontWeight: 'bold', verticalAlign: 'top'}}>{novelData.chapters.length} Bab</td>
                            </tr>
                            <tr style={{borderTop: '1px solid var(--border-color)'}}>
                              <td style={{padding: '12px 0', color: 'var(--text-secondary)', verticalAlign: 'top'}}>Total Kata</td>
                              <td style={{padding: '12px 0', fontWeight: 'bold', verticalAlign: 'top'}}>{novelData.chapters.reduce((acc, chap) => acc + countWords(chap || ''), 0).toLocaleString()} Kata</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="neon-border" style={{borderRadius: '16px', padding: '24px', background: 'var(--glass-bg)'}}>
                        <h3 style={{marginBottom: '16px', fontSize: '1.2rem'}}>Opsi Unduh</h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                          <button className="btn-primary" onClick={handleExportWord} style={{padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(135deg, #2b579a, #1a365d)'}}>
                            <Download size={20} />
                            <div style={{textAlign: 'left'}}>
                              <div style={{fontWeight: 'bold'}}>Unduh MS Word (.doc)</div>
                              <div style={{fontSize: '0.75rem', opacity: 0.8}}>Sempurna untuk diedit & dicetak</div>
                            </div>
                          </button>
                          
                          <button className="btn-primary" onClick={handleExportPDF} style={{padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(135deg, #e11d48, #9f1239)'}}>
                            <Download size={20} />
                            <div style={{textAlign: 'left'}}>
                              <div style={{fontWeight: 'bold'}}>Unduh PDF (.pdf)</div>
                              <div style={{fontSize: '0.75rem', opacity: 0.8}}>Format paten, mudah dibaca di HP</div>
                            </div>
                          </button>

                          <button className="btn-secondary" onClick={handleExportMarkdown} style={{padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', borderRadius: '999px'}}>
                            <Download size={20} />
                            <div style={{textAlign: 'left'}}>
                              <div style={{fontWeight: 'bold'}}>Unduh Markdown (.md)</div>
                              <div style={{fontSize: '0.75rem', opacity: 0.8}}>Format teks murni & web</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{marginTop: '40px', textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center'}}>
                    <button className="btn-secondary" style={{padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '999px'}} onClick={() => setStep(5)}>
                      <ChevronRight size={18} style={{transform: 'rotate(180deg)'}} /> Kembali ke Penulisan
                    </button>
                    <button className="btn-primary" style={{padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10b981, #059669)'}} onClick={startSequel}>
                      <BookOpen size={18} /> Tulis Buku Sekuel Baru
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          </>
          )}

          {/* Hidden Compositor for Cover Typography */}
          <div style={{ position: 'fixed', top: '-9999px', left: '-9999px' }}>
            {isCompositing && novelData.coverBackgroundUrl && (
              <div 
                ref={coverRef}
                style={{
                  width: '1024px',
                  height: '1536px',
                  position: 'relative',
                  backgroundImage: `url(${novelData.coverBackgroundUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '100px 80px',
                  fontFamily: '"Times New Roman", serif',
                  color: 'white',
                  textAlign: 'center',
                  boxSizing: 'border-box'
                }}
              >
                {/* Dark Gradient Overlay for readability */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.9) 100%)',
                  zIndex: 1
                }} />
                
                <div style={{ zIndex: 2, position: 'relative' }}>
                  <h2 style={{ 
                    fontSize: '48px', 
                    fontWeight: '400', 
                    letterSpacing: '12px', 
                    textTransform: 'uppercase',
                    margin: 0,
                    textShadow: '0 4px 12px rgba(0,0,0,0.8)'
                  }}>
                    {novelData.penName || "PENULIS"}
                  </h2>
                </div>

                <div style={{ zIndex: 2, position: 'relative' }}>
                  <h1 style={{ 
                    fontSize: '140px', 
                    fontWeight: '700', 
                    lineHeight: '1.1',
                    textTransform: 'uppercase',
                    margin: '0 0 40px 0',
                    textShadow: '0 8px 24px rgba(0,0,0,0.9)',
                    fontFamily: 'Impact, sans-serif'
                  }}>
                    {novelData.title || "JUDUL NOVEL"}
                  </h1>
                  <p style={{
                    fontSize: '36px',
                    fontStyle: 'italic',
                    margin: 0,
                    color: '#e2e8f0',
                    textShadow: '0 4px 12px rgba(0,0,0,0.8)'
                  }}>
                    {novelData.coverTagline || "Sebuah kisah epik dimulai di sini."}
                  </p>
                </div>

                <img 
                  src={novelData.coverBackgroundUrl} 
                  style={{ display: 'none' }} 
                  onLoad={handleCompositorImageLoad}
                  onError={() => {
                    console.error("Gagal memuat gambar dari server AI.");
                    setIsCompositing(false);
                    setLoading(false);
                    alert("Gagal memuat gambar dari server AI. Silakan coba lagi nanti.");
                  }}
                  alt="Trigger Load"
                  crossOrigin="anonymous"
                />
              </div>
            )}
          </div>

        </>
      ) : (
        <ToolModal tool={activeTool} isOpen={!!activeTool} onClose={() => setActiveTool(null)} onSave={() => {}} getClient={getClient} />
      )}
    </div>
    </MainLayoutWrapper>
    </>
  );
}
