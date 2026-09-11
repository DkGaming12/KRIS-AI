import React, { useState } from 'react';
import { User, Lock, CheckCircle, AlertCircle, Palette, ShieldAlert, MessageCircle, Zap, UserPlus } from 'lucide-react';
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { addTokensByEmail, adminCreateUser } from '../lib/authStore';

const WA_ADMIN_NUMBER = '6285700660475';
const WA_RESET_MSG = encodeURIComponent(
  'Halo admin Kris AI! Saya minta reset password untuk akun saya. Terima kasih 🙏'
);
const WA_RESET_LINK = `https://wa.me/${WA_ADMIN_NUMBER}?text=${WA_RESET_MSG}`;

/* ─── Reusable feedback banner ───────────────────────── */
function Feedback({ type, message }) {
  if (!message) return null;
  const isOk = type === 'success';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '10px 14px', borderRadius: '10px', marginTop: '12px',
      background: isOk ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
      border: `1px solid ${isOk ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
      fontSize: '0.82rem',
      color: isOk ? '#10b981' : '#ef4444',
    }}>
      {isOk
        ? <CheckCircle size={14} />
        : <AlertCircle size={14} />}
      {message}
    </div>
  );
}

/* ─── Section card wrapper ────────────────────────────── */
function Section({ icon, title, children }) {
  return (
    <div className="premium-card-v2" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
        {icon}
        <h2 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────── */
export default function PengaturanAkunView({ theme, toggleTheme }) {
  const currentUser = auth?.currentUser;

  /* ── Username state ── */
  const [displayName, setDisplayName]   = useState(currentUser?.displayName || '');
  const [nameStatus, setNameStatus]     = useState({ type: '', msg: '' });
  const [savingName, setSavingName]     = useState(false);

  /* ── Password state ── */
  const [currentPass, setCurrentPass]   = useState('');
  const [newPass, setNewPass]           = useState('');
  const [confirmPass, setConfirmPass]   = useState('');
  const [passStatus, setPassStatus]     = useState({ type: '', msg: '' });
  const [savingPass, setSavingPass]     = useState(false);

  /* ── Admin Top-up state ── */
  const [topupEmail, setTopupEmail]     = useState('');
  const [topupAmount, setTopupAmount]   = useState('');
  const [topupStatus, setTopupStatus]   = useState({ type: '', msg: '' });
  const [isToppingUp, setIsToppingUp]   = useState(false);

  /* ── Admin Add User state ── */
  const [addEmail, setAddEmail]         = useState('');
  const [addPassword, setAddPassword]   = useState('');
  const [addTokens, setAddTokens]       = useState('10000');
  const [addStatus, setAddStatus]       = useState({ type: '', msg: '' });
  const [isAdding, setIsAdding]         = useState(false);

  const isAdmin = currentUser?.email === 'didikpurnomoipung21@gmail.com' || currentUser?.email === 'didikpurnomoipu@gmail.com';

  /* ── Save display name ── */
  const handleSaveName = async () => {
    if (!displayName.trim()) {
      setNameStatus({ type: 'error', msg: 'Nama tidak boleh kosong.' });
      return;
    }
    if (!currentUser) {
      setNameStatus({ type: 'error', msg: 'Sesi tidak ditemukan. Coba login ulang.' });
      return;
    }
    setSavingName(true);
    setNameStatus({ type: '', msg: '' });
    try {
      await updateProfile(currentUser, { displayName: displayName.trim() });
      setNameStatus({ type: 'success', msg: 'Nama berhasil diperbarui!' });
    } catch (e) {
      setNameStatus({ type: 'error', msg: `Gagal menyimpan: ${e.message}` });
    } finally {
      setSavingName(false);
    }
  };

  /* ── Change password ── */
  const handleChangePassword = async () => {
    setPassStatus({ type: '', msg: '' });

    if (!currentPass || !newPass || !confirmPass) {
      setPassStatus({ type: 'error', msg: 'Semua field wajib diisi.' });
      return;
    }
    if (newPass.length < 6) {
      setPassStatus({ type: 'error', msg: 'Password baru minimal 6 karakter.' });
      return;
    }
    if (newPass !== confirmPass) {
      setPassStatus({ type: 'error', msg: 'Konfirmasi password tidak cocok.' });
      return;
    }
    if (!currentUser) {
      setPassStatus({ type: 'error', msg: 'Sesi tidak ditemukan. Coba login ulang.' });
      return;
    }

    setSavingPass(true);
    try {
      // Re-authenticate dulu sebelum ganti password
      const credential = EmailAuthProvider.credential(currentUser.email, currentPass);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPass);
      setPassStatus({ type: 'success', msg: 'Password berhasil diubah!' });
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (e) {
      const msg = e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential'
        ? 'Password saat ini salah.'
        : `Gagal mengubah password: ${e.message}`;
      setPassStatus({ type: 'error', msg });
    } finally {
      setSavingPass(false);
    }
  };

  /* ── Admin Top-up handler ── */
  const handleAdminTopup = async () => {
    setTopupStatus({ type: '', msg: '' });
    const amount = parseInt(topupAmount, 10);

    if (!topupEmail || !amount) {
      setTopupStatus({ type: 'error', msg: 'Email dan jumlah token wajib diisi.' });
      return;
    }
    
    setIsToppingUp(true);
    try {
      await addTokensByEmail(topupEmail.trim(), amount);
      setTopupStatus({ type: 'success', msg: `Berhasil menambahkan ${amount.toLocaleString('id-ID')} token ke ${topupEmail}!` });
      setTopupEmail('');
      setTopupAmount('');
    } catch (e) {
      setTopupStatus({ type: 'error', msg: e.message || 'Terjadi kesalahan saat top up.' });
    } finally {
      setIsToppingUp(false);
    }
  };

  /* ── Admin Add User handler ── */
  const handleAdminAddUser = async () => {
    setAddStatus({ type: '', msg: '' });
    if (!addEmail || !addPassword) {
      setAddStatus({ type: 'error', msg: 'Email dan password wajib diisi.' });
      return;
    }
    if (addPassword.length < 6) {
      setAddStatus({ type: 'error', msg: 'Password minimal 6 karakter.' });
      return;
    }
    
    setIsAdding(true);
    try {
      await adminCreateUser(addEmail.trim(), addPassword, addTokens);
      setAddStatus({ type: 'success', msg: `Berhasil membuat akun ${addEmail}!` });
      setAddEmail('');
      setAddPassword('');
      setAddTokens('10000');
    } catch (e) {
      setAddStatus({ type: 'error', msg: e.message || 'Gagal membuat pengguna.' });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '680px', margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <User size={24} color="#a5b4fc" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Pengaturan Akun</h1>
      </div>

      {/* Profile info */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '1rem 1.25rem', borderRadius: '14px', marginBottom: '1.5rem',
        background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '900', fontSize: '1.2rem', color: 'white',
        }}>
          {(currentUser?.displayName || currentUser?.email || 'U')[0].toUpperCase()}
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>
            {currentUser?.displayName || '(Belum ada nama)'}
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {currentUser?.email || '-'}
          </p>
        </div>
      </div>

      {/* ── Ubah Username ── */}
      <Section icon={<User size={17} color="#a5b4fc" />} title="Ubah Nama Tampilan">
        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
          Nama Tampilan
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Masukkan nama baru..."
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            style={{ flex: 1 }}
          />
          <button
            className="btn-primary"
            onClick={handleSaveName}
            disabled={savingName}
            style={{ padding: '0 20px', whiteSpace: 'nowrap', opacity: savingName ? 0.6 : 1 }}
          >
            {savingName ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
        <Feedback type={nameStatus.type} message={nameStatus.msg} />
      </Section>

      {/* ── [KHUSUS ADMIN] Top-up Token ── */}
      {isAdmin && (
        <Section icon={<Zap size={17} color="#fbbf24" />} title="Admin: Top-up Token Pengguna">
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', marginBottom: '14px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '0.82rem', color: '#fbbf24', fontWeight: '700' }}>Mode Administrator Aktif</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Email Pengguna
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Contoh: user@gmail.com"
                  value={topupEmail}
                  onChange={(e) => setTopupEmail(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Jumlah Token
                </label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Contoh: 100000"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            
            <button
              onClick={handleAdminTopup}
              disabled={isToppingUp}
              style={{
                width: '100%', marginTop: '14px', padding: '12px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none',
                color: 'white', fontWeight: '700', borderRadius: '10px',
                cursor: isToppingUp ? 'not-allowed' : 'pointer', opacity: isToppingUp ? 0.6 : 1
              }}
            >
              {isToppingUp ? 'Memproses Top-up...' : 'Top-up Token Sekarang'}
            </button>
            <Feedback type={topupStatus.type} message={topupStatus.msg} />
          </div>

          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', marginTop: '1rem' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '0.82rem', color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <UserPlus size={15} /> Buat Akun Pengguna Baru
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Email
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Contoh: newuser@gmail.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Password
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Minimal 6 karakter"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Bonus Token Awal
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={addTokens}
                  onChange={(e) => setAddTokens(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            
            <button
              onClick={handleAdminAddUser}
              disabled={isAdding}
              style={{
                width: '100%', marginTop: '14px', padding: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none',
                color: 'white', fontWeight: '700', borderRadius: '10px',
                cursor: isAdding ? 'not-allowed' : 'pointer', opacity: isAdding ? 0.6 : 1
              }}
            >
              {isAdding ? 'Membuat Akun...' : 'Daftarkan Pengguna'}
            </button>
            <Feedback type={addStatus.type} message={addStatus.msg} />
          </div>
        </Section>
      )}

      {/* ── Ubah Password ── */}
      <Section icon={<Lock size={17} color="#f472b6" />} title="Ubah Password">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Password Saat Ini
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Password Baru
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Minimal 6 karakter"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Ulangi password baru"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
            />
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={handleChangePassword}
          disabled={savingPass}
          style={{ width: '100%', marginTop: '14px', padding: '12px', opacity: savingPass ? 0.6 : 1 }}
        >
          {savingPass ? 'Memproses...' : 'Ubah Password'}
        </button>

        <Feedback type={passStatus.type} message={passStatus.msg} />

        {/* Reset via admin */}
        <div style={{
          marginTop: '14px', padding: '12px 14px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <ShieldAlert size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Lupa password atau tidak bisa login?{' '}
            <a
              href={WA_RESET_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#25d366', fontWeight: '700', textDecoration: 'none' }}
            >
              <MessageCircle size={11} style={{ display: 'inline', marginRight: '3px', verticalAlign: 'middle' }} />
              Hubungi Admin via WhatsApp
            </a>{' '}
            untuk reset password.
          </p>
        </div>
      </Section>

      {/* ── Tampilan ── */}
      <Section icon={<Palette size={17} color="#38bdf8" />} title="Tampilan Antarmuka">
        <div style={{ display: 'flex', gap: '10px' }}>
          {['dark', 'light'].map((t) => (
            <button
              key={t}
              onClick={() => { if (theme !== t) toggleTheme(); }}
              style={{
                flex: 1, padding: '12px', borderRadius: '10px',
                background: theme === t ? 'rgba(99,102,241,0.1)' : 'transparent',
                border: theme === t ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <strong style={{ fontSize: '0.88rem', display: 'block' }}>
                {t === 'dark' ? '🌙 Mode Gelap' : '☀️ Mode Terang'}
              </strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {t === 'dark' ? 'Estetik & Nyaman' : 'Bersih & Jelas'}
              </span>
            </button>
          ))}
        </div>
      </Section>

    </div>
  );
}
