/**
 * MakalahView.jsx — Fitur Buat Makalah Ilmiah otomatis dengan AI
 * Format: standar akademik Indonesia, sitasi APA, export Word (.docx)
 */
import React, { useState, useRef } from 'react';
import {
  FileText, Upload, Zap, Download, X, BookOpen,
  Search, CheckCircle, AlertCircle, Loader
} from 'lucide-react';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, convertMillimetersToTwip
} from 'docx';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// ─── Konstanta ────────────────────────────────────────────────
const SYSTEM_PROMPT = `Anda adalah asisten akademik ahli penulisan makalah ilmiah berkualitas tinggi sesuai standar akademik Indonesia.

TUGAS: Buat makalah ilmiah LENGKAP dan BERKUALITAS TINGGI.

ATURAN WAJIB:
1. Struktur LENGKAP: Kata Pengantar, Daftar Isi, BAB I Pendahuluan (1.1 Latar Belakang minimal 3 paragraf, 1.2 Rumusan Masalah, 1.3 Tujuan), BAB II Pembahasan (minimal 3 sub-bab × minimal 3 paragraf padat), BAB III Penutup (3.1 Kesimpulan, 3.2 Saran), DAFTAR PUSTAKA.
2. Setiap klaim faktual WAJIB disertai sitasi inline format APA: (Santoso, 2020) atau Menurut Doe (2019, hlm. 45), ...
3. DAFTAR PUSTAKA minimal 5 sumber valid lengkap format APA.
4. Bahasa Indonesia baku, ilmiah, dan formal.
5. JANGAN mengarang referensi fiktif — gunakan sumber yang logis dan dapat dicek validitasnya.
6. Minimal 2000 kata isi (tidak termasuk sampul).
7. Gunakan heading yang jelas: ## untuk BAB, ### untuk sub-bab.
8. Pisahkan setiap bagian dengan baris kosong.

Format output: Markdown bersih, tanpa code block.`;

// ─── Helper: parse Markdown sederhana ke paragraf Word ────────
function parseMarkdownToDocx(mdText) {
  const lines = mdText.split('\n');
  const children = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 },
        children: [new TextRun({
          text: line.replace('## ', '').trim().toUpperCase(),
          bold: true,
          size: 28,
          font: 'Times New Roman'
        })]
      }));
    } else if (line.startsWith('### ')) {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        children: [new TextRun({
          text: line.replace('### ', '').trim(),
          bold: true,
          size: 24,
          font: 'Times New Roman'
        })]
      }));
    } else if (line.startsWith('#### ')) {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
        children: [new TextRun({
          text: line.replace('#### ', '').trim(),
          bold: true,
          size: 24,
          font: 'Times New Roman'
        })]
      }));
    } else if (line.trim() === '') {
      // skip
    } else {
      children.push(new Paragraph({
        alignment: AlignmentType.BOTH,
        spacing: { before: 0, after: 160, line: 360 },
        indent: { firstLine: convertMillimetersToTwip(12.5) },
        children: [new TextRun({
          text: line.trim(),
          size: 24,
          font: 'Times New Roman'
        })]
      }));
    }
  }
  return children;
}

// ─── Helper: export ke Word (.docx) ───────────────────────────
async function exportToWord(title, author, institution, markdownContent) {
  const cm4 = convertMillimetersToTwip(40);
  const cm3 = convertMillimetersToTwip(30);
  const W_A4 = convertMillimetersToTwip(210);
  const H_A4 = convertMillimetersToTwip(297);

  const coverChildren = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 2000, after: 400 },
      children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 32, font: 'Times New Roman' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
      children: [new TextRun({ text: 'MAKALAH', bold: true, size: 28, font: 'Times New Roman' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 150 },
      children: [new TextRun({ text: 'Disusun oleh:', size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 80 },
      children: [new TextRun({ text: author || 'Penulis', bold: true, size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 150 },
      children: [new TextRun({ text: institution || '', bold: true, size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 150, after: 150 },
      children: [new TextRun({ text: new Date().getFullYear().toString(), size: 24, font: 'Times New Roman' })]
    }),
  ];

  const bodyChildren = parseMarkdownToDocx(markdownContent);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: W_A4, height: H_A4, orientation: 'portrait' },
            margin: { top: cm4, left: cm4, bottom: cm3, right: cm3 }
          }
        },
        children: [...coverChildren, ...bodyChildren]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Makalah - ${title}.docx`);
}

// ─── Komponen Utama ────────────────────────────────────────────
export default function MakalahView({ getClient, spendTokens, tokenBalance }) {
  const [step, setStep] = useState('form');
  const [judul, setJudul] = useState('');
  const [author, setAuthor] = useState('');
  const [institution, setInstitution] = useState('');
  const [subject, setSubject] = useState('');
  const [refText, setRefText] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [makalahContent, setMakalahContent] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const fileRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        setRefText(fullText);
      } catch (err) {
        console.error('Error reading PDF:', err);
        setError('Gagal membaca file PDF. Pastikan file tidak korup atau ber-password.');
      }
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => setRefText(evt.target.result);
      reader.readAsText(file);
    }
  };

  const handleGenerate = async () => {
    if (!judul.trim()) { setError('Judul makalah wajib diisi.'); return; }
    if ((tokenBalance ?? 0) <= 0) { setError('Token habis. Silakan beli token terlebih dahulu.'); return; }
    setError('');
    setStep('generating');

    const refSection = refText.trim()
      ? `REFERENSI YANG DIBERIKAN USER:\n${refText.trim()}`
      : 'REFERENSI: Tidak ada — cari referensi yang relevan dan valid secara otomatis sesuai judul.';

    const userPrompt = `Judul Makalah: "${judul}"
Mata Pelajaran/Kuliah: "${subject || 'Umum'}"
Penulis: "${author || 'Penulis'}"
Instansi: "${institution || ''}"

${refSection}

Buat makalah ilmiah LENGKAP dan BERKUALITAS TINGGI sesuai aturan yang telah ditetapkan.`;

    try {
      const client = getClient();
      let fullText = '';
      const stream = await client.chat.completions.create({
        model: 'openrouter/auto',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        stream: true,
        max_tokens: 6000,
      });
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content || '';
        fullText += delta;
        setMakalahContent(fullText);
      }
      if (spendTokens) await spendTokens(fullText);
      setStep('result');
    } catch (err) {
      console.error(err);
      setError('Gagal membuat makalah: ' + (err.message || 'Error tidak diketahui.'));
      setStep('form');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToWord(judul, author, institution, makalahContent);
    } catch (e) {
      console.error(e);
      setError('Gagal mengekspor ke Word: ' + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => { setStep('form'); setMakalahContent(''); setError(''); };

  // ─── FORM ───────────────────────────────────────
  if (step === 'form') return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <BookOpen size={24} color="#a78bfa" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Buat Makalah AI</h1>
        <span style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', fontSize: '0.7rem', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', border: '1px solid rgba(167,139,250,0.3)' }}>BETA</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>📌 Judul Makalah <span style={{ color: '#f43f5e' }}>*</span></label>
          <input type="text" className="form-input" placeholder='Contoh: "Dampak Perubahan Iklim terhadap Ketahanan Pangan di Indonesia"' value={judul} onChange={(e) => setJudul(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>👤 Nama Penulis</label>
          <input type="text" className="form-input" placeholder="Nama lengkap Anda" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>🏫 Instansi / Universitas</label>
          <input type="text" className="form-input" placeholder="Nama sekolah/universitas" value={institution} onChange={(e) => setInstitution(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>📚 Mata Pelajaran / Mata Kuliah</label>
          <input type="text" className="form-input" placeholder='Contoh: "Ilmu Lingkungan", "Ekonomi Pertanian"' value={subject} onChange={(e) => setSubject(e.target.value)} style={{ width: '100%' }} />
        </div>
      </div>

      <div style={{ border: '2px dashed rgba(167,139,250,0.25)', borderRadius: '16px', padding: '1.5rem', background: 'rgba(167,139,250,0.03)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Upload size={20} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: '700', margin: '0 0 4px 0', fontSize: '0.9rem' }}>Upload File Referensi <span style={{ color: 'var(--text-secondary)', fontWeight: '400' }}>(Opsional)</span></p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0 0 10px 0', lineHeight: '1.5' }}>Upload file PDF atau .txt berisi materi/referensi Anda. Jika tidak ada, AI akan mencari referensi otomatis.</p>
            <input type="file" ref={fileRef} accept=".txt,.md,.pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current?.click()} style={{ padding: '8px 16px', borderRadius: '10px', background: fileName ? 'rgba(16,185,129,0.15)' : 'rgba(167,139,250,0.1)', border: `1px solid ${fileName ? 'rgba(16,185,129,0.3)' : 'rgba(167,139,250,0.3)'}`, color: fileName ? '#10b981' : '#a78bfa', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {fileName ? <><CheckCircle size={14} /> {fileName}</> : <><Upload size={14} /> Pilih File (.pdf / .txt)</>}
            </button>
            {fileName && (
              <button onClick={() => { setFileName(''); setRefText(''); }} style={{ marginTop: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <X size={12} /> Hapus file
              </button>
            )}
          </div>
        </div>
        {!fileName && (
          <div style={{ marginTop: '1rem', padding: '10px 14px', background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: '10px' }}>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Search size={13} /><strong>Mode Auto-Referensi aktif</strong> — AI akan menemukan referensi jurnal & buku ilmiah yang relevan secara otomatis
            </p>
          </div>
        )}
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} color="#f43f5e" /><span style={{ color: '#f43f5e', fontSize: '0.85rem' }}>{error}</span>
        </div>
      )}

      <button onClick={handleGenerate} disabled={!judul.trim()} style={{ padding: '16px', borderRadius: '14px', background: judul.trim() ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(255,255,255,0.05)', border: 'none', color: 'white', fontWeight: '800', fontSize: '1rem', cursor: judul.trim() ? 'pointer' : 'not-allowed', opacity: judul.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: judul.trim() ? '0 8px 30px rgba(124,58,237,0.4)' : 'none', transition: 'all 0.2s' }}>
        <Zap size={20} />Buat Makalah dengan AI
      </button>
    </div>
  );

  // ─── GENERATING ─────────────────────────────────
  if (step === 'generating') return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Loader size={20} color="#a78bfa" style={{ animation: 'spin 1s linear infinite' }} />
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Menyusun makalah… harap tunggu</h2>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem', whiteSpace: 'pre-wrap', fontFamily: 'Georgia, serif', fontSize: '0.9rem', lineHeight: '1.8', color: 'var(--text-primary)' }}>
        {makalahContent || <span style={{ color: 'var(--text-secondary)' }}>AI sedang menulis makalah Anda…</span>}
      </div>
    </div>
  );

  // ─── RESULT ──────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '860px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={22} color="#10b981" />
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Makalah Selesai! 🎉</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleReset} style={{ padding: '10px 18px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <X size={15} /> Buat Baru
          </button>
          <button onClick={handleExport} disabled={isExporting} style={{ padding: '10px 18px', borderRadius: '10px', background: 'linear-gradient(135deg, #1d6f42, #2e9c5f)', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(29,111,66,0.4)', opacity: isExporting ? 0.6 : 1 }}>
            <Download size={15} />{isExporting ? 'Mengekspor...' : 'Download Word (.docx)'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} color="#f43f5e" /><span style={{ color: '#f43f5e', fontSize: '0.85rem' }}>{error}</span>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', background: 'white', color: '#1a1a1a', borderRadius: '16px', padding: '3rem 4rem', fontFamily: 'Times New Roman, Georgia, serif', fontSize: '12pt', lineHeight: '1.8', boxShadow: '0 0 40px rgba(0,0,0,0.4)' }}>
        <h1 style={{ textAlign: 'center', fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{judul}</h1>
        {(author || institution) && (
          <p style={{ textAlign: 'center', marginTop: 0, fontSize: '11pt', color: '#444' }}>{author}{institution ? ` — ${institution}` : ''}</p>
        )}
        <hr style={{ margin: '1rem 0 1.5rem 0', borderColor: '#ccc' }} />
        <div style={{ whiteSpace: 'pre-wrap' }}>{makalahContent}</div>
      </div>
    </div>
  );
}
