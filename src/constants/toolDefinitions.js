/**
 * Comprehensive definitions for all 20 Giyani AI Writer Tools.
 * Each tool defines its specific input fields to match slpen.tech.
 */

export const TOOL_DEFINITIONS = {
  // --- A. Creative Assistance Tools ---
  'Buat Premis': {
    fields: [
      { id: 'model', label: 'Model AI', type: 'radio', options: ['Flash', 'Pro'], default: 'Flash' },
      { id: 'negara', label: 'Negara Latar Cerita', type: 'text', placeholder: 'Indonesia, Jepang, Inggris...' },
      { id: 'genre_m', label: 'Genre Malebook (Protagonis Pria)', type: 'select', options: ['Urban', 'Fantasy', 'Romance', 'Action', 'Mystery'] },
      { id: 'genre_f', label: 'Genre Femalebook (Protagonis Wanita)', type: 'select', options: ['Billionaire', 'Marriage', 'Romance', 'School', 'Transmigration'] },
      { id: 'manual', label: 'Detail Cerita Sendiri (Opsional)', type: 'textarea', placeholder: 'Atau ketik genre/detail cerita sendiri...' }
    ],
    instruction: 'Hasilkan premis mendalam sesuai model yang dipilih.'
  },
  'Premis GN': {
    fields: [
      { id: 'mc', label: 'Nama Tokoh Utama (MC)', type: 'text', placeholder: 'Contoh: Arianne / Bastian' },
      { id: 'gender', label: 'Jenis Kelamin MC', type: 'radio', options: ['Pria', 'Wanita'] },
      { id: 'tema', label: 'Tema Besar', type: 'select', options: ['Competition', 'Survival', 'Romance', 'Revenge'] },
      { id: 'trope', label: 'Trope / Pola Cerita', type: 'select', options: ['Contract Marriage', 'Hidden Identity', 'Enemy to Lover'] }
    ],
  },
  'Premis Mega': {
    fields: [
      { id: 'mc', label: 'Tokoh Utama', type: 'text', placeholder: 'Ye Chen, Satya...' },
      { id: 'heroine', label: 'Heroine / Pasangan', type: 'text', placeholder: 'Su Yan, Nabila...' },
      { id: 'mode', label: 'Konfigurasi', type: 'radio', options: ['Kisah Baru', 'Sekuel'] },
      { id: 'dimensi', label: 'Latar Dimensi / Tema Dunia', type: 'select', options: ['Cultivation', 'Modern Magic', 'Systems', 'Apocalypse'] },
      { id: 'cheat', label: 'Konsep OP (Cheat)', type: 'select', options: ['Sign-in System', 'Prestige Level', 'Memory from Future'] }
    ]
  },
  'Buat Outline': {
    fields: [
      { id: 'sinopsis', label: 'Sinopsis Cerita', type: 'textarea', placeholder: 'Contoh: Seorang ksatria yang kehilangan ingatannya...' },
      { id: 'jumlah_bab', label: 'Jumlah Bab', type: 'number', default: 15 },
      { id: 'alur', label: 'Gaya Alur', type: 'select', options: ['Alur Maju (Linear)', 'Alur Mundur (Flashback)', 'Alur Campuran', 'Alur Melingkar', 'Alur Episodik'] }
    ]
  },
  'New Outline Maker': {
    fields: [
      { id: 'judul', label: 'Judul Novel', type: 'text', placeholder: 'Masukkan judul novel...' },
      { id: 'target', label: 'Target Tamat', type: 'text', placeholder: 'Default: 100 Bab' },
      { id: 'fl', label: 'Nama Female Lead', type: 'text' },
      { id: 'ml', label: 'Nama Male Lead', type: 'text' },
      { id: 'bahasa', label: 'Bahasa Output', type: 'select', options: ['Indonesia', 'English', 'Melayu'] },
      { id: 'pov', label: 'Tipe Alur / POV', type: 'select', options: ['POV 1 (Saya)', 'POV 3 (Dia)'] },
      { id: 'ide', label: 'Ide Kasar / Premis', type: 'textarea' }
    ]
  },
  'Buat Sinopsis': {
    fields: [
      { id: 'model', label: 'Model AI', type: 'radio', options: ['Flash', 'Pro'] },
      { id: 'judul', label: 'Judul/Proyek', type: 'text' },
      { id: 'premis', label: 'Detail Premis/Alur', type: 'textarea', placeholder: 'Jelaskan poin-poin penting cerita...' }
    ]
  },
  'Buat Blurb': {
    fields: [
      { id: 'model', label: 'Model AI', type: 'radio', options: ['Flash', 'Pro'] },
      { id: 'sinopsis', label: 'Sinopsis Novel', type: 'textarea', placeholder: 'Paste sinopsis Anda di sini untuk dijadikan blurb pemasaran...' }
    ]
  },

  // --- B. Visual & Analysis Tools ---
  'Prompt Cover': {
    fields: [
      { id: 'ratio', label: 'Format (Aspect Ratio)', type: 'select', options: ['3:4 (Novel)', '5:1 (Banner)', '1:1', '16:9'] },
      { id: 'judul', label: 'Judul Buku', type: 'text' },
      { id: 'penulis', label: 'Nama Penulis', type: 'text' },
      { id: 'sinopsis', label: 'Sinopsis Singkat & Suasana', type: 'textarea', placeholder: 'Ceritakan inti cerita, suasana, dan elemen kunci...' },
      { id: 'style', label: 'Gaya Visual', type: 'select', options: ['Digital Painting', '3D Render', 'Classic Oil', 'Anime'] }
    ]
  },
  'Cover Manual': {
    fields: [
      { id: 'template', label: 'Template Dasar', type: 'select', options: ['Fantasy Dark', 'Romance Sweet', 'Action Intense', 'Minimalist Clean'] },
      { id: 'font', label: 'Tipe Tipografi', type: 'select', options: ['Serif (Elegant)', 'Sans (Modern)', 'Script (Handwriting)'] },
      { id: 'overlay', label: 'Efek Overlay', type: 'select', options: ['Dust & Scratches', 'Light Leaks', 'Flares', 'None'] },
      { id: 'posisi', label: 'Tata Letak Judul', type: 'radio', options: ['Atas', 'Tengah', 'Bawah'] }
    ]
  },
  'ATM Novel': {
    fields: [
      { id: 'link', label: 'Link / Judul Karya (URL)', type: 'text', placeholder: 'https://www.wattpad.com/story/...' },
      { id: 'gaya', label: 'Gaya Penulisan Target', type: 'select', options: ['Default', 'Puitis', 'Hardcore', 'Dark', 'Komedi', 'Dewasa'] },
      { id: 'target', label: 'Target Analisa', type: 'radio', options: ['Ekstrak Outline', 'Gaya Bahasa', 'Bedah Karakter'] }
    ]
  },

  // --- B2. Novel Specific Tools ---
  'Karakter Builder': {
    fields: [
      { id: 'nama', label: 'Nama Karakter', type: 'text', placeholder: 'Contoh: Aria Dewangga, Bastian...' },
      { id: 'usia', label: 'Usia', type: 'text', placeholder: 'Contoh: 22 tahun' },
      { id: 'gender', label: 'Gender', type: 'radio', options: ['Pria', 'Wanita', 'Non-Binary'] },
      { id: 'peran', label: 'Peran dalam Cerita', type: 'select', options: ['Protagonis Utama (MC)', 'Antagonis Utama', 'Love Interest', 'Sahabat/Sidekick', 'Mentor', 'Villain Bayangan'] },
      { id: 'kepribadian', label: 'Kepribadian MBTI / Tipe', type: 'select', options: ['INTJ (Arsitek - Dingin & Strategis)', 'ENFP (Pejuang - Karismatik)', 'INFJ (Advokat - Misterius)', 'ESTP (Pemimpin - Bold)', 'ISFJ (Pelindung - Setia)', 'Lainnya (Jelaskan di bawah)'] },
      { id: 'latar', label: 'Latar Belakang / Backstory', type: 'textarea', placeholder: 'Ceritakan masa lalu sang karakter: keluarga, trauma, pengalaman formative...' },
      { id: 'tujuan', label: 'Tujuan Utama (Goal)', type: 'textarea', placeholder: 'Apa yang ingin dicapai karakter ini dalam cerita?' },
      { id: 'ketakutan', label: 'Ketakutan / Kelemahan', type: 'text', placeholder: 'Contoh: Takut ditinggalkan, tidak bisa mempercayai orang...' },
      { id: 'arc', label: 'Character Arc', type: 'select', options: ['Positive Arc (Tumbuh & Berkembang)', 'Negative Arc (Jatuh & Korup)', 'Flat Arc (Tetap Kuat, Ubah Dunia)', 'Tragedy Arc'] }
    ],
    instruction: 'Bangun profil karakter novel yang sangat mendalam dan konsisten.'
  },
  'World Building': {
    fields: [
      { id: 'nama_dunia', label: 'Nama Dunia / Setting', type: 'text', placeholder: 'Contoh: Kerajaan Aetheria, Kota Neo-Jakarta 2150...' },
      { id: 'genre', label: 'Genre Dunia', type: 'select', options: ['High Fantasy (Magic & Swords)', 'Sci-Fi / Cyberpunk', 'Post-Apocalypse', 'Modern Urban Fantasy', 'Historical Fiction', 'Xianxia / Cultivation', 'Isekai / Reincarnation'] },
      { id: 'era', label: 'Era / Zaman', type: 'select', options: ['Kuno / Medieval', 'Modern (Kini)', 'Masa Depan (Futuristik)', 'Lintas Waktu / Alternatif'] },
      { id: 'sistem_kekuasaan', label: 'Sistem Kekuasaan / Magic System', type: 'textarea', placeholder: 'Jelaskan bagaimana kekuatan, sihir, atau teknologi bekerja di dunia ini...' },
      { id: 'geografi', label: 'Geografi & Lokasi Utama', type: 'textarea', placeholder: 'Gambarkan tempat-tempat penting: kota, kerajaan, hutan, penjara bawah tanah...' },
      { id: 'faksi', label: 'Faksi / Kelompok Utama', type: 'textarea', placeholder: 'Contoh: Kerajaan Utara vs Selatan, Guild Petualang, Organisasi Bayangan...' },
      { id: 'konflik_makro', label: 'Konflik Makro (Big Picture)', type: 'textarea', placeholder: 'Apa ancaman terbesar yang membayangi seluruh dunia?' },
      { id: 'budaya', label: 'Budaya & Tradisi Unik', type: 'text', placeholder: 'Contoh: Ritual kelahiran, sistem kasta, bahasa khusus...' }
    ],
    instruction: 'Ciptakan latar dunia novel yang kohesif, imersif, dan detail untuk dijadikan panduan penulisan.'
  },

  // --- C. Editing & Management Tools ---
  'Revisi Naskah': {
    fields: [
      { id: 'judul', label: 'Judul Naskah', type: 'text' },
      { id: 'fokus', label: 'Fokus Perbaikan', type: 'select', options: ['Diksi & Narasi', 'Logika Plot', 'Dialog Karakter', 'Typo & PUEBI'] },
      { id: 'naskah', label: 'Paste Seluruh Isi Naskah', type: 'textarea', placeholder: 'Paste naskah (Bab 1, 2, dst) di sini...' }
    ]
  },
  'Mau Revisi?': {
    fields: [
      { id: 'arsip', label: 'Item Yang Ingin Direvisi', type: 'select', options: ['Premis', 'Sinopsis', 'Blurb', 'Outline', 'Draf Bab'] },
      { id: 'metode', label: 'Metode AI', type: 'select', options: ['Sempurnakan (Rewrite)', 'Kembangkan (Expand)', 'Ringkas (Summarize)'] },
      { id: 'judul', label: 'Judul Proyek', type: 'text' },
      { id: 'naskah_mentah', label: 'Naskah Mentah', type: 'textarea' }
    ]
  },
  'Text Editor': {
    fields: [
      { id: 'mode', label: 'Mode Fokus', type: 'select', options: ['Drafting (Fast)', 'Editing (Precision)', 'Reading (Immersive)'] },
      { id: 'autosave', label: 'Interval Autosave', type: 'select', options: ['30 Detik', '1 Menit', '5 Menit', 'Manual Only'] },
      { id: 'theme', label: 'Tema Workspace', type: 'select', options: ['Midnight Blue', 'Deep Black', 'Sepia Paper'] }
    ]
  },

  // --- D. Utility & Community Tools ---
  'Dengar Lagu': {
    fields: [
      { id: 'playlist', label: 'Pilih Suasana Musik', type: 'select', options: ['Lo-fi Coding/Writing', 'Epic Fantasy Battle', 'Sad Melancholy', 'Chill Cafe Vibes', 'Horror Ambience'] },
      { id: 'volume', label: 'Default Volume', type: 'select', options: ['Soft (20%)', 'Medium (50%)', 'Immersive (80%)'] }
    ]
  },
  'Komunitas': {
    fields: [
      { id: 'forum', label: 'Pilih Kategori Forum', type: 'select', options: ['Tips Menulis', 'Bedah Karya Member', 'Lomba & Event', 'Curhat Author', 'Promosi Novel'] },
      { id: 'sort', label: 'Urutkan Berdasarkan', type: 'select', options: ['Terbaru', 'Paling Viral', 'Belum Terjawab'] }
    ]
  },
  'Nambah Token': {
    fields: [
      { id: 'paket', label: 'Pilih Paket Token', type: 'select', options: ['Bronze (5,000 Kata)', 'Silver (15,000 Kata)', 'Gold (50,000 Kata)', 'Sultan (Unli)', 'Alien (Unli + Private Cloud)'] },
      { id: 'metode', label: 'Metode Pembayaran', type: 'select', options: ['QRIS', 'Transfer Bank', 'E-Wallet (Dana/OVO)', 'Pulsa'] }
    ]
  },
  'Folder Data': {
    fields: [
      { id: 'folder', label: 'Pilih Folder', type: 'select', options: ['Proyek Utama', 'Arsip Karya', 'Ide / Coretan', 'Database Riset'] },
      { id: 'view', label: 'Tampilan Data', type: 'select', options: ['List View', 'Grid View', 'Timeline View'] }
    ]
  },
  'Riwayat Pembelian': {
    fields: [
      { id: 'filter', label: 'Filter Status', type: 'select', options: ['Semua Pesanan', 'Berhasil', 'Menunggu Pembayaran', 'Gagal'] },
      { id: 'tgl', label: 'Rentang Waktu', type: 'select', options: ['Bulan Ini', '3 Bulan Terakhir', 'Tahun Ini', 'Semua Waktu'] }
    ]
  },
  'Download Novel': {
    fields: [
      { id: 'format', label: 'Format Ekspor', type: 'select', options: ['DOCX (Microsoft Word)', 'PDF (E-book Mode)', 'TXT (Plain Text)', 'EPUB (Standard)'] },
      { id: 'quality', label: 'Kualitas Output', type: 'select', options: ['Standard (Fast)', 'HD Precision (Semantic Formatting)'] },
      { id: 'include', label: 'Sertakan Elemen', type: 'radio', options: ['Isi Saja', 'Isi + Outline', 'Isi + Blurb'] }
    ]
  },
  'Statistik Affiliate': {
    fields: [
      { id: 'period', label: 'Periode Laporan', type: 'select', options: ['Hari Ini', 'Minggu Ini', 'Bulan Ini', 'Sepanjang Masa'] },
      { id: 'metric', label: 'Metrik Utama', type: 'select', options: ['Klik Link', 'Pendaftaran Akun', 'Total Komisi Pencairan'] }
    ]
  },

  'default_modal': {
    fields: [
      { id: 'input', label: 'Detail Permohonan', type: 'textarea', placeholder: 'Jelaskan apa yang ingin Anda sampaikan...' }
    ]
  }
};
