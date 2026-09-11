/**
 * novel.js — Novel generator wizard step-by-step
 * Replikasi fitur web app NovelGenerator ke terminal
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { chatWithFallback } from '../lib/aiClient.js';
import {
  renderAIResponse,
  printSectionTitle,
  printSystemMessage,
  printError,
  kristalGradient,
} from '../lib/ui.js';
import boxen from 'boxen';

const STYLE_OPTIONS = [
  'Puitis & Metaforis',
  'Deskriptif & Detail',
  'Dialog Sentris (Fast-paced)',
  'Gelap & Sinis (Dark / Gritty)',
  'Melankolis & Emosional',
  'Humor & Satir',
  'Kasual & Ringan',
  'Sinematik (Visual)',
  'Misterius & Teka-teki',
  'Sastrawi (Literary)',
  'Romantis & Penuh Gairah',
  'Thriller Psikologis (Mind-bending)',
  'Epik & Grandiose',
  'Surealis & Aneh',
  'Absurd & Kocak',
];

const GENRE_OPTIONS = [
  'Romance', 'Fantasy', 'Sci-Fi', 'Thriller', 'Horror',
  'Mystery', 'Drama', 'Action', 'Slice of Life', 'Isekai',
  'Webtoon', 'Historical', 'Dystopia', 'Literary Fiction',
];

export async function runNovelWizard() {
  printSectionTitle('✦ NOVEL GENERATOR WIZARD');

  console.log(chalk.dim('  Ikuti langkah demi langkah untuk membuat novelmu.\n'));

  // ── Step 1: Setup ──────────────────────────────────────────
  console.log(kristalGradient('  ● Step 1/6 — SETUP DASAR\n'));

  const setup = await inquirer.prompt([
    {
      type: 'input',
      name: 'judul',
      message: chalk.cyanBright('  Judul novel:'),
      validate: v => v.trim() ? true : 'Judul tidak boleh kosong!',
    },
    {
      type: 'checkbox',
      name: 'genre',
      message: chalk.cyanBright('  Genre (pilih satu atau lebih):'),
      choices: GENRE_OPTIONS,
      validate: v => v.length > 0 ? true : 'Pilih minimal 1 genre!',
    },
    {
      type: 'checkbox',
      name: 'gaya',
      message: chalk.cyanBright('  Gaya penulisan:'),
      choices: STYLE_OPTIONS,
    },
    {
      type: 'input',
      name: 'jumlahBab',
      message: chalk.cyanBright('  Jumlah bab:'),
      default: '10',
      validate: v => Number(v) > 0 ? true : 'Harus angka positif!',
    },
    {
      type: 'input',
      name: 'targetKata',
      message: chalk.cyanBright('  Target kata per bab:'),
      default: '1500',
    },
    {
      type: 'input',
      name: 'targetPembaca',
      message: chalk.cyanBright('  Target pembaca:'),
      default: 'Remaja hingga dewasa muda',
    },
  ]);

  // ── Step 2: Karakter ───────────────────────────────────────
  console.log('\n' + kristalGradient('  ● Step 2/6 — KARAKTER UTAMA\n'));

  const karakter = await inquirer.prompt([
    {
      type: 'input',
      name: 'namaProtagonist',
      message: chalk.cyanBright('  Nama protagonist:'),
      validate: v => v.trim() ? true : 'Isi nama protagonist!',
    },
    {
      type: 'input',
      name: 'deskripsiProtagonist',
      message: chalk.cyanBright('  Deskripsi protagonist (karakter, latar belakang):'),
    },
    {
      type: 'input',
      name: 'namaAntagonist',
      message: chalk.cyanBright('  Nama antagonist (opsional):'),
    },
    {
      type: 'input',
      name: 'karakter3',
      message: chalk.cyanBright('  Karakter pendukung lain (opsional):'),
    },
  ]);

  // ── Step 3: Dunia ──────────────────────────────────────────
  console.log('\n' + kristalGradient('  ● Step 3/6 — WORLD BUILDING\n'));

  const dunia = await inquirer.prompt([
    {
      type: 'input',
      name: 'setting',
      message: chalk.cyanBright('  Setting / latar cerita:'),
      default: 'Indonesia modern',
    },
    {
      type: 'input',
      name: 'era',
      message: chalk.cyanBright('  Era / zaman:'),
      default: 'Masa kini',
    },
    {
      type: 'input',
      name: 'atmosfer',
      message: chalk.cyanBright('  Atmosfer / mood cerita:'),
      default: 'Dramatis dengan sentuhan romantis',
    },
    {
      type: 'input',
      name: 'detailDunia',
      message: chalk.cyanBright('  Detail dunia tambahan (opsional):'),
    },
  ]);

  // ── Step 4: Generate Outline ───────────────────────────────
  console.log('\n' + kristalGradient('  ● Step 4/6 — GENERATE OUTLINE\n'));

  const outlinePrompt = `Buatkan outline novel lengkap dengan detail berikut:

**Judul:** ${setup.judul}
**Genre:** ${setup.genre.join(', ')}
**Gaya Penulisan:** ${setup.gaya.join(', ')}
**Jumlah Bab:** ${setup.jumlahBab}
**Target Pembaca:** ${setup.targetPembaca}

**Protagonis:** ${karakter.namaProtagonist} — ${karakter.deskripsiProtagonist}
${karakter.namaAntagonist ? `**Antagonis:** ${karakter.namaAntagonist}` : ''}
${karakter.karakter3 ? `**Pendukung:** ${karakter.karakter3}` : ''}

**Setting:** ${dunia.setting}
**Era:** ${dunia.era}
**Atmosfer:** ${dunia.atmosfer}
${dunia.detailDunia ? `**Detail Dunia:** ${dunia.detailDunia}` : ''}

Buat outline dengan format:
- Premis utama (1 paragraf)
- Tema sentral
- Konflik utama
- Arc karakter protagonist
- Daftar ${setup.jumlahBab} bab dengan judul + sinopsis singkat setiap bab (2-3 kalimat)
- Plot twist / klimaks
- Ending`;

  const spinner = ora({
    text: chalk.dim(`  Generating outline ${setup.judul}...`),
    spinner: 'star',
    color: 'cyan',
  }).start();

  let outlineText = '';
  try {
    const result = await chatWithFallback(
      [{ role: 'user', content: outlinePrompt }],
      { onProviderSwitch: name => { spinner.text = chalk.dim(`  Menggunakan ${name}...`); } }
    );
    outlineText = result.text;
    spinner.succeed(chalk.greenBright('  Outline berhasil dibuat!'));
  } catch (err) {
    spinner.fail(chalk.red('  Gagal generate outline'));
    printError(err.message);
    return;
  }

  renderAIResponse(outlineText, 'Novel Outline');

  // ── Step 5: Drafting ───────────────────────────────────────
  console.log('\n' + kristalGradient('  ● Step 5/6 — DRAFTING\n'));

  const { mulaiDrafting } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'mulaiDrafting',
      message: chalk.cyanBright('  Mulai generate draft bab pertama sekarang?'),
      default: true,
    },
  ]);

  let draftText = '';

  if (mulaiDrafting) {
    const { babMulai } = await inquirer.prompt([
      {
        type: 'number',
        name: 'babMulai',
        message: chalk.cyanBright('  Mulai dari bab berapa?'),
        default: 1,
      },
    ]);

    const draftPrompt = `Kamu adalah penulis novel profesional Indonesia.
Berdasarkan outline berikut:

${outlineText}

Tulis **Bab ${babMulai}** dari novel "${setup.judul}" dengan ketentuan:
- Genre: ${setup.genre.join(', ')}
- Gaya: ${setup.gaya.join(', ')}
- Target kata: ~${setup.targetKata} kata
- Atmosfer: ${dunia.atmosfer}

Tulis bab yang engaging, dengan pembuka yang menarik, konflik yang terasa, dan ending yang membuat pembaca ingin lanjut.
Gunakan dialog yang natural, deskripsi yang vivid, dan POV yang konsisten.`;

    const draftSpinner = ora({
      text: chalk.dim(`  Menulis Bab ${babMulai}...`),
      spinner: 'aesthetic',
      color: 'magenta',
    }).start();

    try {
      const result = await chatWithFallback(
        [{ role: 'user', content: draftPrompt }],
        { onProviderSwitch: name => { draftSpinner.text = chalk.dim(`  ${name} sedang menulis...`); } }
      );
      draftText = result.text;
      draftSpinner.succeed(chalk.greenBright(`  Bab ${babMulai} selesai!`));
    } catch (err) {
      draftSpinner.fail(chalk.red('  Gagal generate bab'));
      printError(err.message);
    }

    if (draftText) {
      renderAIResponse(draftText, `Bab ${babMulai}`);
    }
  }

  // ── Step 6: Export ─────────────────────────────────────────
  console.log('\n' + kristalGradient('  ● Step 6/6 — EXPORT\n'));

  const { doExport } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'doExport',
      message: chalk.cyanBright('  Simpan outline & draft ke file .txt?'),
      default: true,
    },
  ]);

  if (doExport) {
    const timestamp = new Date().toISOString().slice(0, 10);
    const safeTitle = setup.judul.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const filename = `${safeTitle}_${timestamp}.txt`;
    const outputPath = resolve(process.cwd(), filename);

    const content = [
      `NOVEL: ${setup.judul}`,
      `Genre: ${setup.genre.join(', ')}`,
      `Dibuat: ${new Date().toLocaleDateString('id-ID')}`,
      '',
      '═'.repeat(60),
      'OUTLINE',
      '═'.repeat(60),
      '',
      outlineText,
      '',
      draftText ? '═'.repeat(60) : '',
      draftText ? 'DRAFT' : '',
      draftText ? '═'.repeat(60) : '',
      draftText ? '' : '',
      draftText || '',
    ].join('\n');

    writeFileSync(outputPath, content, 'utf-8');
    console.log(
      '\n' +
      boxen(
        chalk.greenBright('✓ File tersimpan!\n\n') +
        chalk.white('  📄 ') + chalk.cyanBright(filename) + '\n' +
        chalk.dim(`  ${outputPath}`),
        {
          padding: { top: 1, bottom: 1, left: 2, right: 2 },
          borderStyle: 'round',
          borderColor: 'green',
        }
      )
    );
  }

  printSystemMessage('Novel wizard selesai! Ketik /novel untuk mulai proyek baru.');
}
