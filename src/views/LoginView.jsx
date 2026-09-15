import React, { useState } from 'react';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, MessageCircle, Zap, User } from 'lucide-react';
import { TOKEN_PACKAGES, WELCOME_GRANT } from '../constants/tokenPackages';

const WA_ADMIN_NUMBER = '6285700660475';
const WA_SIGNUP_MSG   = encodeURIComponent(
  'Halo admin Kris AI! Saya ingin mendaftar akun Kris AI. Boleh minta info paket dan aktivasi akun? 🙏'
);
const WA_LINK = `https://wa.me/${WA_ADMIN_NUMBER}?text=${WA_SIGNUP_MSG}`;

export default function LoginView({ onLogin, onGuestLogin, authError, setAuthError }) {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      await onLogin(email.trim(), password);
    } catch {
      // error sudah di-set di authStore
    } finally {
      setLoading(false);
    }
  };

  // ─── Halaman Info Signup ───────────────────────────────────────────────────
  if (showSignup) {
    return (
      <div style={styles.fullScreen}>
        <div style={styles.bgGlow1} />
        <div style={styles.bgGlow2} />

        <div style={styles.card}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={styles.logoBox}>
              <Sparkles size={24} color="white" />
            </div>
            <h1 style={styles.title}>Daftar Akun Kris AI</h1>
            <p style={styles.subtitle}>Pendaftaran dilakukan via WhatsApp Admin</p>
          </div>

          {/* Info Steps */}
          <div style={styles.stepsBox}>
            {[
              { num: '1', text: 'Klik tombol WhatsApp di bawah untuk chat admin' },
              { num: '2', text: 'Pilih paket token sesuai kebutuhan kamu' },
              { num: '3', text: 'Admin akan aktivasi akun & kirim email + password login' },
              { num: '4', text: 'Login dengan kredensial yang dikirim admin' },
            ].map((s) => (
              <div key={s.num} style={styles.stepRow}>
                <div style={styles.stepNum}>{s.num}</div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.55' }}>{s.text}</p>
              </div>
            ))}
          </div>

          {/* Paket Token */}
          <div style={styles.packagesBox}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: '900', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Paket Token
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { name: WELCOME_GRANT.name, tokens: WELCOME_GRANT.tokens, price: WELCOME_GRANT.price, color: WELCOME_GRANT.color, isWelcome: true },
                ...TOKEN_PACKAGES.map((p) => ({ name: p.name.replace('Paket ', ''), tokens: p.tokens, price: p.price, color: p.color })),
              ].map((pkg) => (
                <div key={pkg.name} style={{
                  padding: '10px 12px', borderRadius: '10px',
                  background: `rgba(${pkg.isWelcome ? '52,211,153' : '255,255,255'},0.05)`,
                  border: `1px solid ${pkg.color}30`,
                }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '900', color: pkg.color }}>{pkg.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: '700' }}>{pkg.tokens} token</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: pkg.isWelcome ? pkg.color : 'rgba(255,255,255,0.5)' }}>{pkg.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA WA */}
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.waBtn}
            id="btn-signup-wa"
          >
            <MessageCircle size={20} />
            Chat Admin WhatsApp Sekarang
          </a>

          <button
            onClick={() => { setShowSignup(false); setAuthError(''); }}
            style={styles.backBtn}
            id="btn-back-to-login"
          >
            ← Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  // ─── Halaman Login ─────────────────────────────────────────────────────────
  return (
    <div style={styles.fullScreen}>
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.card}>
        {/* Logo + Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={styles.logoBox}>
            <Sparkles size={24} color="white" />
          </div>
          <h1 style={styles.title}>Kris AI</h1>
          <p style={styles.subtitle}>Sastra Engine V8 — Masuk ke akunmu</p>
        </div>

        {/* Token Info Banner */}
        <div style={styles.tokenBanner}>
          <Zap size={14} color="#fbbf24" />
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>
            User baru dapat <strong style={{ color: '#fbbf24' }}>10.000 token gratis</strong> setelah aktivasi
          </span>
        </div>

        <div style={styles.guestBanner}>
          <div style={{ fontSize: '0.7rem', fontWeight: '900', color: '#60a5fa', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
            Coba Dulu
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'rgba(255,255,255,0.72)', lineHeight: '1.5' }}>
            Masuk sebagai tamu untuk menjelajah fitur utama tanpa daftar. Kamu akan mendapat token demo dan bisa melihat alur kerja Kris AI dulu.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Email */}
          <div>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrapper}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                id="login-email"
                type="email"
                placeholder="kamu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setAuthError(''); }}
                style={styles.input}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                style={{ ...styles.input, paddingRight: '42px' }}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {authError && (
            <div style={styles.errorBox}>
              <span>⚠️ {authError}</span>
            </div>
          )}

          {/* Submit */}
          <button
            id="btn-login-submit"
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            style={{
              ...styles.submitBtn,
              opacity: (loading || !email.trim() || !password.trim()) ? 0.6 : 1,
              cursor:  (loading || !email.trim() || !password.trim()) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              <>Masuk <ArrowRight size={16} /></>
            )}
          </button>

          <button
            id="btn-guest-login"
            type="button"
            onClick={() => onGuestLogin()}
            style={{
              ...styles.submitBtn,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#cbd5e1',
              marginTop: '4px',
              boxShadow: 'none'
            }}
          >
            <User size={16} /> Coba Mode Tamu
          </button>
        </form>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>Belum punya akun?</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Signup CTA */}
        <button
          id="btn-goto-signup"
          onClick={() => setShowSignup(true)}
          style={styles.signupBtn}
        >
          <MessageCircle size={16} />
          Daftar via WhatsApp Admin
        </button>

        <p style={styles.footerNote}>
          Kris AI menggunakan Firebase untuk keamanan akun kamu. API key AI tersimpan aman di servermu sendiri.
        </p>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  fullScreen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 50%, #0a0a0f 100%)',
    position: 'relative',
    overflow: 'hidden',
    padding: '1rem',
  },
  bgGlow1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute',
    bottom: '-20%',
    right: '-10%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '2rem',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
    position: 'relative',
    zIndex: 1,
  },
  logoBox: {
    width: '52px',
    height: '52px',
    background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    boxShadow: '0 0 30px rgba(79,70,229,0.5)',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '900',
    color: '#fff',
    margin: '0 0 4px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '0.82rem',
    color: 'rgba(255,255,255,0.45)',
    margin: 0,
  },
  tokenBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(251,191,36,0.08)',
    border: '1px solid rgba(251,191,36,0.2)',
    borderRadius: '10px',
    padding: '10px 14px',
    marginBottom: '1.25rem',
  },
  guestBanner: {
    background: 'linear-gradient(135deg, rgba(96,165,250,0.12), rgba(14,165,233,0.06))',
    border: '1px solid rgba(96,165,250,0.18)',
    borderRadius: '14px',
    padding: '14px 16px',
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '6px',
    letterSpacing: '0.5px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: 'rgba(255,255,255,0.3)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.92rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.3)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '0.82rem',
    color: '#fca5a5',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontWeight: '800',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    boxShadow: '0 4px 20px rgba(79,70,229,0.4)',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '1.25rem 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.35)',
    whiteSpace: 'nowrap',
  },
  signupBtn: {
    width: '100%',
    padding: '13px',
    background: 'rgba(37,211,102,0.1)',
    border: '1px solid rgba(37,211,102,0.3)',
    borderRadius: '12px',
    color: '#25d366',
    fontWeight: '800',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: '0.68rem',
    color: 'rgba(255,255,255,0.35)',
    marginTop: '1rem',
    lineHeight: '1.5',
  },
  stepsBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '1.25rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '1rem',
  },
  stepRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  stepNum: {
    minWidth: '22px',
    height: '22px',
    background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: '900',
    color: '#fff',
    flexShrink: 0,
  },
  packagesBox: {
    marginBottom: '1.25rem',
  },
  waBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #25d366, #128c7e)',
    border: 'none',
    borderRadius: '14px',
    color: '#fff',
    fontWeight: '900',
    fontSize: '1rem',
    textDecoration: 'none',
    marginBottom: '0.75rem',
    boxShadow: '0 4px 20px rgba(37,211,102,0.35)',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  backBtn: {
    width: '100%',
    padding: '11px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
};
