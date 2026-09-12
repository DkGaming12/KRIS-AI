---
name: buat-makalah
description: >
  Skill untuk membuat makalah ilmiah akademik berkualitas tinggi secara otomatis menggunakan AI.
  Mencakup pencarian referensi otomatis, format APA/IEEE, sitasi lengkap, dan export ke MS Word (.docx).
---

# SKILL: BUAT MAKALAH ILMIAH AI

## ATURAN UTAMA

### A. REFERENSI & SITASI
1. Jika user mengupload file referensi → ekstrak sumber dari file tersebut.
2. Jika TIDAK ada file referensi → AI WAJIB mencari referensi relevan yang valid secara otomatis.
3. Setiap klaim faktual HARUS disertai sitasi inline: (Santoso, 2020)
4. Daftar Pustaka WAJIB ada di bagian akhir, format APA, minimal 5 sumber.
5. JANGAN mengarang referensi fiktif.

### B. STANDAR FORMAT AKADEMIK INDONESIA
- Ukuran Kertas: A4
- Margin: Atas 4cm, Kiri 4cm, Bawah 3cm, Kanan 3cm
- Font: Times New Roman 12pt
- Spasi: 1,5 spasi
- Perataan: Justify

### C. STRUKTUR WAJIB
1. COVER
2. KATA PENGANTAR
3. DAFTAR ISI
4. BAB I PENDAHULUAN (Latar Belakang, Rumusan Masalah, Tujuan)
5. BAB II PEMBAHASAN (minimal 3 sub-bab, setiap sub-bab minimal 3 paragraf)
6. BAB III PENUTUP (Kesimpulan, Saran)
7. DAFTAR PUSTAKA (APA style)

---

# TEMPLATE & CONTOH FORMAT MAKALAH YANG BENAR

## I. ATURAN LAYOUT DOKUMEN (STANDAR AKADEMIK)

* **Ukuran Kertas:** A4
* **Margin:**
  * Atas (Top): 4 cm
  * Kiri (Left): 4 cm
  * Bawah (Bottom): 3 cm
  * Kanan (Right): 3 cm
* **Font:** Times New Roman, 12 pt
* **Spasi:** 1,5 spasi
* **Perataan:** Justify
* **Penomoran Halaman:**
  * Bagian Awal (Kata Pengantar, Daftar Isi): angka romawi kecil (i, ii, iii)
  * Bab I hingga akhir: angka arab (1, 2, 3) di kanan atas

---

## II. STRUKTUR DAN KERANGKA ISI MAKALAH

### 1. COVER
*(Teks di tengah/Center)*

**JUDUL MAKALAH DI SINI**
*(Huruf kapital, Bold, 14pt)*

[LOGO SEKOLAH/UNIVERSITAS]

Disusun oleh:
Nama Penulis : [Nama Lengkap]
NIM / NIS    : [Nomor Induk]
Kelas / Prodi: [Kelas/Prodi]

**NAMA INSTANSI / FAKULTAS**
**NAMA SEKOLAH / UNIVERSITAS**
**TAHUN 2026**

---

### 2. KATA PENGANTAR

Puji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas segala rahmat-Nya sehingga makalah dengan judul "[Judul Makalah]" ini dapat diselesaikan dengan baik.

Makalah ini disusun untuk memenuhi tugas mata pelajaran/kuliah [Nama Mata Pelajaran]. Penulis mengucapkan terima kasih kepada [Nama Guru/Dosen] selaku pembimbing.

Penulis menyadari bahwa makalah ini masih jauh dari kesempurnaan. Kritik dan saran yang membangun sangat diharapkan.

Kota, September 2026

Penulis

---

### 3. DAFTAR ISI

KATA PENGANTAR .....................................................................  i
DAFTAR ISI ..................................................................................  ii
BAB I PENDAHULUAN ................................................................  1
  1.1 Latar Belakang Masalah .....................................................  1
  1.2 Rumusan Masalah ..............................................................  1
  1.3 Tujuan Penulisan ................................................................  1
BAB II PEMBAHASAN .................................................................  2
  2.1 [Topik 1] .............................................................................  2
  2.2 [Topik 2] .............................................................................  4
  2.3 [Topik 3] .............................................................................  5
BAB III PENUTUP ........................................................................  6
  3.1 Kesimpulan ..........................................................................  6
  3.2 Saran ....................................................................................  6
DAFTAR PUSTAKA .......................................................................  7

---

### BAB I: PENDAHULUAN

#### 1.1 Latar Belakang Masalah
[Alasan topik penting dibahas. Dari umum ke khusus, minimal 3 paragraf.]

#### 1.2 Rumusan Masalah
1. Apa saja faktor yang memengaruhi [Topik]?
2. Bagaimana dampak dari [Topik] terhadap [aspek terkait]?

#### 1.3 Tujuan Penulisan
1. Untuk mengetahui faktor yang memengaruhi [Topik].
2. Untuk menganalisis dampak dari [Topik].

---

### BAB II: PEMBAHASAN

#### 2.1 [Judul Sub-Bab 1]
[Pembahasan, teori, argumen dengan sitasi. Contoh: Menurut Santoso (2020), ...]

#### 2.2 [Judul Sub-Bab 2]
[Analisis lanjutan. Kutipan format APA: (Doe, 2019, hlm. 45)]

#### 2.3 [Judul Sub-Bab 3]
[Pembahasan tambahan yang memperkaya isi makalah.]

---

### BAB III: PENUTUP

#### 3.1 Kesimpulan
[Poin-poin ringkas hasil temuan dari Bab II sebagai jawaban atas Rumusan Masalah.]

#### 3.2 Saran
[Rekomendasi kepada pembaca, instansi terkait, atau peneliti selanjutnya.]

---

### DAFTAR PUSTAKA (Format APA)

[Nama Belakang], [Inisial]. (Tahun). *Judul Buku*. Kota: Penerbit.

[Nama Belakang], [Inisial]. (Tahun). Judul Artikel. *Nama Jurnal*, Volume(Isu), Halaman. https://doi.org/...

[Lembaga]. (Tahun). *Judul Dokumen*. Diakses dari https://...

---

## PROMPT SISTEM AI MAKALAH

Gunakan ini sebagai system prompt saat memanggil AI untuk membuat makalah:

```
Anda adalah asisten akademik ahli penulisan makalah ilmiah standar akademik Indonesia.

TUGAS: Buat makalah ilmiah LENGKAP dengan judul: "[JUDUL]"

ATURAN WAJIB:
1. Struktur HARUS lengkap: Cover, Kata Pengantar, Daftar Isi, BAB I, BAB II, BAB III, Daftar Pustaka
2. Setiap klaim faktual WAJIB sitasi inline format APA: (Santoso, 2020)
3. BAB II minimal 3 sub-bab, tiap sub-bab minimal 3-4 paragraf padat
4. Daftar Pustaka minimal 5 sumber valid, format APA lengkap
5. Bahasa Indonesia baku, ilmiah, dan formal
6. JANGAN mengarang referensi fiktif
7. Minimal 2000 kata isi

REFERENSI: [REFERENSI_USER atau "cari otomatis yang relevan dan valid"]

Output: Markdown bersih, siap dikonversi ke Word.
```

## SPESIFIKASI EXPORT WORD (.docx)

Gunakan library `docx` (npm) dengan konfigurasi:
- PageSize: A4 (11906 x 16838 twips)
- Margins: top/left 2268 twips (4cm), bottom/right 1701 twips (3cm)
- Default font: Times New Roman, 12pt
- Line spacing: 276 (1.5 lines)
- Heading BAB: Bold, 14pt, ALL CAPS, center
- Heading sub-bab: Bold, 12pt, left
- Body: 12pt, justified, indent 720 twips (1.25cm)
