/**
 * tools.js — Menu alat AI (Buat Premis, Outline, Revisi, dsb.)
 * Replikasi toolsList dari web app ke terminal
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { chatWithFallback } from '../lib/aiClient.js';
import {
  renderAIResponse,
  printSectionTitle,
  printError,
  printSystemMessage,
  kristalGradient,
} from '../lib/ui.js';

// ─── Tool Definitions ──────────────────────────────────────────
const TOOLS = [
  {
    category: '✦ Alat AI',
    items: [
      { name: 'Buat Premis', desc: 'Generate premis unik untuk novelmu', fn: toolBuatPremis },
      { name: 'Buat Outline', desc: 'Generate outline detail novel', fn: toolBuatOutline },
      { name: 'Buat Sinopsis', desc: 'Generate sinopsis menarik', fn: toolBuatSinopsis },
      { name: 'Buat Blurb', desc: 'Generate blurb untuk sampul buku', fn: toolBuatBlurb },
      { name: 'Karakter Builder', desc: 'Bangun profil karakter lengkap', fn: toolKarakterBuilder },
      { name: 'World Building', desc: 'Bangun dunia fiksi novelmu', fn: toolWorldBuilding },
      { name: 'Revisi Naskah', desc: 'Revisi & perbaiki tulisanmu', fn: toolRevisi },
      { name: 'Prompt Cover', desc: 'Generate prompt AI untuk cover novel', fn: toolPromptCover },
    ],
  },
  {
    category: '✦ Kreatif',
    items: [
      { name: 'ATM Novel', desc: 'Analisa novel populer untuk inspirasi', fn: toolATM },
      { name: 'Buat Dialog', desc: 'Tulis dialog seru antar karakter', fn: toolDialog },
      { name: 'Perbaiki Paragraf', desc: 'Enhance satu paragraf yang diberikan', fn: toolPerbaikiParagraf },
      { name: 'Nama Karakter', desc: 'Generate nama karakter unik', fn: toolNamaKarakter },
    ],
  },
];

export async function runToolsMenu() {
  printSectionTitle('✦ WRITER TOOLS — 12+ Alat Penulis AI');

  // Flatten semua tools untuk choices
  const choices = [];
  for (const cat of TOOLS) {
    choices.push(new inquirer.Separator(
      chalk.bold.cyanBright(`\n  ${cat.category}`)
    ));
    cat.items.forEach(t => {
      choices.push({
        name: chalk.white(t.name.padEnd(22)) + chalk.dim(t.desc),
        value: t,
        short: t.name,
      });
    });
  }

  choices.push(new inquirer.Separator(''));
  choices.push({
    name: chalk.dim('  ← Kembali ke chat'),
    value: null,
  });

  const { selected } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message: chalk.cyanBright('Pilih alat:'),
      choices,
      pageSize: 18,
    },
  ]);

  if (!selected) {
    printSystemMessage('Kembali ke mode chat.');
    return;
  }

  console.log('\n' + kristalGradient(`  ● ${selected.name}\n`));
  await selected.fn();
}

// ─── Tool Functions ────────────────────────────────────────────

async function runTool(prompt, title = 'Kris AI') {
  const spinner = ora({
    text: chalk.dim('  AI sedang bekerja...'),
    spinner: 'dots2',
    color: 'cyan',
  }).start();

  try {
    const result = await chatWithFallback(
      [{ role: 'user', content: prompt }],
      { onProviderSwitch: name => { spinner.text = chalk.dim(`  ${name}...`); } }
    );
    spinner.succeed(chalk.greenBright('  Selesai!'));
    renderAIResponse(result.text, title);
  } catch (err) {
    spinner.fail(chalk.red('  Gagal'));
    printError(err.message);
  }
}

async function toolBuatPremis() {
  const { genre, tema, twist } = await inquirer.prompt([
    { type: 'input', name: 'genre', message: chalk.cyanBright('  Genre novel:'), default: 'Romance Fantasy' },
    { type: 'input', name: 'tema', message: chalk.cyanBright('  Tema atau kata kunci:'), default: 'cinta terlarang, takdir' },
    { type: 'input', name: 'twist', message: chalk.cyanBright('  Ada elemen spesial? (opsional):') },
  ]);

  await runTool(
    `Buatkan 3 pilihan premis novel ${genre} yang unik, menarik, dan belum banyak dipakai.
Tema/keyword: ${tema}${twist ? `\nElemen spesial: ${twist}` : ''}

Format setiap premis:
**Premis [N]:**
[2-3 paragraf yang menggambarkan konflik utama, karakter, dan hook yang menarik pembaca]

**Hook line:** "[Satu kalimat paling kuat untuk menarik pembaca]"

---`,
    'Buat Premis'
  );
}

async function toolBuatOutline() {
  const { judul, genre, jumlahBab, premis } = await inquirer.prompt([
    { type: 'input', name: 'judul', message: chalk.cyanBright('  Judul novel:'), validate: v => v.trim() ? true : 'Wajib diisi!' },
    { type: 'input', name: 'genre', message: chalk.cyanBright('  Genre:'), default: 'Romance' },
    { type: 'input', name: 'jumlahBab', message: chalk.cyanBright('  Jumlah bab:'), default: '15' },
    { type: 'input', name: 'premis', message: chalk.cyanBright('  Premis/sinopsis singkat:') },
  ]);

  await runTool(
    `Buat outline novel lengkap:
**Judul:** ${judul}
**Genre:** ${genre}
**Jumlah Bab:** ${jumlahBab}
${premis ? `**Premis:** ${premis}` : ''}

Sertakan:
1. Premis utama
2. Tema & konflik
3. Arc karakter utama
4. Daftar semua bab (judul + sinopsis 2-3 kalimat per bab)
5. Klimaks & resolusi`,
    'Buat Outline'
  );
}

async function toolBuatSinopsis() {
  const { judul, genre, cerita } = await inquirer.prompt([
    { type: 'input', name: 'judul', message: chalk.cyanBright('  Judul novel:') },
    { type: 'input', name: 'genre', message: chalk.cyanBright('  Genre:'), default: 'Romance' },
    { type: 'editor', name: 'cerita', message: chalk.cyanBright('  Ceritakan inti plotnya (buka editor):') },
  ]);

  await runTool(
    `Buatkan sinopsis menarik untuk novel berikut:
Judul: ${judul}
Genre: ${genre}
Plot: ${cerita}

Buat 2 versi sinopsis:
1. Sinopsis pendek (100-150 kata) — untuk platform novel online
2. Sinopsis panjang (300-400 kata) — untuk proposal ke penerbit

Gunakan bahasa yang menggugah emosi dan membuat orang penasaran.`,
    'Buat Sinopsis'
  );
}

async function toolBuatBlurb() {
  const { judul, genre, sinopsis } = await inquirer.prompt([
    { type: 'input', name: 'judul', message: chalk.cyanBright('  Judul novel:') },
    { type: 'input', name: 'genre', message: chalk.cyanBright('  Genre:') },
    { type: 'input', name: 'sinopsis', message: chalk.cyanBright('  Sinopsis singkat:') },
  ]);

  await runTool(
    `Buat 3 variasi blurb untuk sampul belakang novel:
Judul: ${judul}
Genre: ${genre}
Sinopsis: ${sinopsis}

Setiap blurb max 80 kata, harus:
- Memancing rasa penasaran
- Memperkenalkan konflik tanpa spoiler
- Diakhiri dengan pertanyaan/cliffhanger
- Tone sesuai genre ${genre}`,
    'Buat Blurb'
  );
}

async function toolKarakterBuilder() {
  const { nama, peran, genre } = await inquirer.prompt([
    { type: 'input', name: 'nama', message: chalk.cyanBright('  Nama karakter:') },
    { type: 'input', name: 'peran', message: chalk.cyanBright('  Peran (protagonist/antagonis/pendukung):'), default: 'protagonist' },
    { type: 'input', name: 'genre', message: chalk.cyanBright('  Genre novel:'), default: 'Romance' },
  ]);

  await runTool(
    `Bangun profil karakter lengkap untuk:
Nama: ${nama}
Peran: ${peran}
Genre: ${genre}

Sertakan:
- **Penampilan fisik** (detail dan vivid)
- **Kepribadian** (strengths, weaknesses, quirks)
- **Latar belakang** (backstory yang mempengaruhi karakter saat ini)
- **Motivasi & tujuan utama**
- **Ketakutan terbesar**
- **Cara bicara / mannerism** unik
- **Arc karakter** (bagaimana dia akan berubah)
- **Quote iconic** yang mencerminkan kepribadiannya`,
    'Karakter Builder'
  );
}

async function toolWorldBuilding() {
  const { genre, setting, scale } = await inquirer.prompt([
    { type: 'input', name: 'genre', message: chalk.cyanBright('  Genre:'), default: 'Fantasy' },
    { type: 'input', name: 'setting', message: chalk.cyanBright('  Gambaran setting:'), default: 'Kerajaan abad pertengahan dengan sihir' },
    {
      type: 'list',
      name: 'scale',
      message: chalk.cyanBright('  Skala world building:'),
      choices: ['Sederhana (setting saja)', 'Menengah (+ sistem magic/teknologi)', 'Lengkap (full lore & history)'],
    },
  ]);

  await runTool(
    `Buat world building untuk novel ${genre}:
Setting: ${setting}
Detail: ${scale}

Bangun:
- **Geografi & Iklim**
- **Sistem sosial / politik**
- **Budaya & tradisi unik**
${scale.includes('magic') || scale.includes('teknologi') ? '- **Sistem magic/teknologi** (aturan, batasan, sumber kekuatan)' : ''}
${scale.includes('Lengkap') ? '- **Sejarah & lore** (kejadian penting masa lalu)\n- **Konflik yang sudah ada** sebelum cerita mulai\n- **Faksi / kekuatan yang bersaing**' : ''}
- **Detail sensoris** (apa yang dilihat, didengar, dirasakan di dunia ini)`,
    'World Building'
  );
}

async function toolRevisi() {
  const { naskah, instruksi } = await inquirer.prompt([
    {
      type: 'editor',
      name: 'naskah',
      message: chalk.cyanBright('  Paste naskah yang ingin direvisi (buka editor):'),
    },
    {
      type: 'checkbox',
      name: 'instruksi',
      message: chalk.cyanBright('  Apa yang ingin diperbaiki?'),
      choices: [
        'Perbaiki grammar & ejaan',
        'Tingkatkan kualitas dialog',
        'Perkuat deskripsi & visual',
        'Tingkatkan tempo/pacing',
        'Tambah emosi & kedalaman',
        'Konsistensi POV',
        'Variasi kalimat (hindari repetisi)',
      ],
    },
  ]);

  if (!naskah.trim()) {
    printSystemMessage('Tidak ada naskah yang dimasukkan.');
    return;
  }

  await runTool(
    `Revisi naskah berikut dengan fokus pada: ${instruksi.join(', ')}

NASKAH ORIGINAL:
${naskah}

---
Berikan:
1. **Naskah yang sudah direvisi** (tulis ulang secara lengkap)
2. **Catatan revisi** — apa saja yang diubah dan kenapa`,
    'Revisi Naskah'
  );
}

async function toolPromptCover() {
  const { judul, genre, atmosfer } = await inquirer.prompt([
    { type: 'input', name: 'judul', message: chalk.cyanBright('  Judul novel:') },
    { type: 'input', name: 'genre', message: chalk.cyanBright('  Genre:'), default: 'Romance' },
    { type: 'input', name: 'atmosfer', message: chalk.cyanBright('  Atmosfer/mood:'), default: 'Dramatis, gelap, misterius' },
  ]);

  await runTool(
    `Buat 3 prompt detail untuk generate cover novel "${judul}" menggunakan AI image generator (Midjourney/DALL-E style):

Genre: ${genre}
Atmosfer: ${atmosfer}

Setiap prompt harus:
- Dalam Bahasa Inggris
- Sangat detail (karakter, background, lighting, color palette, style)
- Sertakan camera angle & artistic style
- Max 200 kata per prompt
- Ditandai [Prompt 1], [Prompt 2], [Prompt 3]`,
    'Prompt Cover'
  );
}

async function toolATM() {
  const { judul, aspek } = await inquirer.prompt([
    { type: 'input', name: 'judul', message: chalk.cyanBright('  Judul novel yang ingin dianalisa:'), validate: v => v.trim() ? true : 'Wajib diisi!' },
    {
      type: 'checkbox',
      name: 'aspek',
      message: chalk.cyanBright('  Aspek yang ingin dianalisa:'),
      choices: ['Plot structure', 'Character development', 'Writing style', 'Pacing', 'World building', 'Hook & opening', 'Ending'],
    },
  ]);

  await runTool(
    `Analisa novel "${judul}" secara mendalam untuk inspirasi penulisan (metode ATM - Amati Tiru Modifikasi).

Fokus pada: ${aspek.join(', ')}

Untuk setiap aspek:
1. Apa yang dilakukan novel tersebut dengan baik?
2. Teknik spesifik yang digunakan?
3. Bagaimana kita bisa mengadaptasi/memodifikasi untuk novel kita sendiri?

Tutup dengan: **3 Pelajaran Utama** yang bisa langsung diterapkan.`,
    'ATM Novel'
  );
}

async function toolDialog() {
  const { karakter1, karakter2, situasi, tone } = await inquirer.prompt([
    { type: 'input', name: 'karakter1', message: chalk.cyanBright('  Karakter 1 (nama & kepribadian):') },
    { type: 'input', name: 'karakter2', message: chalk.cyanBright('  Karakter 2 (nama & kepribadian):') },
    { type: 'input', name: 'situasi', message: chalk.cyanBright('  Situasi/konteks dialog:') },
    {
      type: 'list',
      name: 'tone',
      message: chalk.cyanBright('  Tone dialog:'),
      choices: ['Romantis & tegang', 'Konflik & emosional', 'Humor & santai', 'Misterius & cryptic', 'Perpisahan & sedih'],
    },
  ]);

  await runTool(
    `Tulis dialog yang kuat antara:
- ${karakter1}
- ${karakter2}

Situasi: ${situasi}
Tone: ${tone}

Ketentuan:
- Dialog harus terasa natural dan karakter-driven (kepribadian terefleksi dalam cara bicara)
- Sertakan action beat / body language di antara dialog
- Buat 2 versi: pendek (5-8 baris) dan panjang (15-20 baris)`,
    'Buat Dialog'
  );
}

async function toolPerbaikiParagraf() {
  const { paragraf, level } = await inquirer.prompt([
    {
      type: 'editor',
      name: 'paragraf',
      message: chalk.cyanBright('  Paste paragraf yang ingin diperbaiki:'),
    },
    {
      type: 'list',
      name: 'level',
      message: chalk.cyanBright('  Level perbaikan:'),
      choices: [
        'Minor — perbaiki saja yang perlu',
        'Medium — tingkatkan kualitas signifikan',
        'Major — tulis ulang dengan tone yang sama',
      ],
    },
  ]);

  await runTool(
    `Perbaiki paragraf berikut (level: ${level}):

ORIGINAL:
${paragraf}

---
Berikan:
1. **Versi yang sudah diperbaiki**
2. **Perubahan yang dilakukan** (bullet points singkat)`,
    'Perbaiki Paragraf'
  );
}

async function toolNamaKarakter() {
  const { genre, budaya, jumlah, gender } = await inquirer.prompt([
    { type: 'input', name: 'genre', message: chalk.cyanBright('  Genre novel:'), default: 'Fantasy' },
    { type: 'input', name: 'budaya', message: chalk.cyanBright('  Budaya/etnis (opsional):'), default: 'campuran Asia-Fantasy' },
    { type: 'number', name: 'jumlah', message: chalk.cyanBright('  Berapa nama yang dibutuhkan?'), default: 10 },
    {
      type: 'list',
      name: 'gender',
      message: chalk.cyanBright('  Gender:'),
      choices: ['Campuran', 'Laki-laki', 'Perempuan', 'Gender neutral'],
    },
  ]);

  await runTool(
    `Generate ${jumlah} nama karakter unik untuk novel ${genre}:
Budaya/inspirasi: ${budaya}
Gender: ${gender}

Format:
| Nama | Makna/Asal | Cocok untuk peran |
|------|-----------|------------------|
...

Tambahkan 3 nama villain/antagonist yang memorable di bagian bawah.`,
    'Nama Karakter'
  );
}
