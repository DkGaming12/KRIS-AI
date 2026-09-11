/**
 * ghostwrite.js — Mode Ghostwriter AI
 * User describe scene/chapter → AI tulis secara lengkap
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { chatWithFallback } from '../lib/aiClient.js';
import {
  renderAIResponse,
  printSectionTitle,
  printSystemMessage,
  printError,
  kristalGradient,
} from '../lib/ui.js';

const GHOSTWRITE_SYSTEM = `Kamu adalah ghostwriter profesional Indonesia dengan keahlian sastra tinggi.
Tugasmu: mengubah deskripsi/brief singkat dari user menjadi tulisan yang indah, engaging, dan berkualitas tinggi.
Tulis dengan gaya yang immersive, deskripsi vivid, dialog natural, dan emosi yang terasa.
Selalu tulis dalam Bahasa Indonesia yang kaya kecuali diminta lain.`;

export async function runGhostwriter() {
  printSectionTitle('✦ GHOSTWRITER AI');

  console.log(
    chalk.dim('  Mode ghostwriter: describe apa yang ingin kamu tulis,\n') +
    chalk.dim('  dan Kris AI akan menulisnya untukmu.\n')
  );

  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: chalk.cyanBright('  Pilih mode ghostwriter:'),
      choices: [
        { name: chalk.white('Tulis Bab/Scene') + chalk.dim('   — describe scene, AI tulis bab lengkap'), value: 'bab' },
        { name: chalk.white('Lanjutkan Cerita') + chalk.dim(' — paste ending terakhir, AI lanjutkan'), value: 'lanjut' },
        { name: chalk.white('Tulis Ulang') + chalk.dim('      — berikan draft kasar, AI perbaiki'), value: 'rewrite' },
        { name: chalk.white('Tulis Bebas') + chalk.dim('      — describe apapun, AI tulis'), value: 'bebas' },
      ],
    },
  ]);

  if (mode === 'bab') {
    await ghostwriteBab();
  } else if (mode === 'lanjut') {
    await ghostwriteLanjut();
  } else if (mode === 'rewrite') {
    await ghostwriteRewrite();
  } else {
    await ghostwriteBebas();
  }
}

async function ghostwriteBab() {
  console.log('\n' + kristalGradient('  ● Tulis Bab/Scene\n'));

  const answers = await inquirer.prompt([
    { type: 'input', name: 'judul', message: chalk.cyanBright('  Judul bab (opsional):') },
    {
      type: 'input',
      name: 'desc',
      message: chalk.cyanBright('  Describe scene ini (siapa, dimana, apa yang terjadi):'),
      validate: v => v.trim() ? true : 'Wajib diisi!',
    },
    { type: 'input', name: 'mood', message: chalk.cyanBright('  Mood/atmosfer:'), default: 'Dramatis & emosional' },
    { type: 'input', name: 'target', message: chalk.cyanBright('  Target kata:'), default: '1500' },
    { type: 'input', name: 'pov', message: chalk.cyanBright('  POV (sudut pandang):'), default: 'Orang ketiga, close POV protagonis' },
    {
      type: 'input',
      name: 'catatan',
      message: chalk.cyanBright('  Catatan khusus (detail penting, dialog yang harus ada, dll):'),
    },
  ]);

  const prompt = `${GHOSTWRITE_SYSTEM}

Tulis bab/scene dengan detail berikut:
${answers.judul ? `**Judul Bab:** ${answers.judul}` : ''}
**Deskripsi:** ${answers.desc}
**Mood/Atmosfer:** ${answers.mood}
**Target Kata:** ~${answers.target} kata
**POV:** ${answers.pov}
${answers.catatan ? `**Catatan:** ${answers.catatan}` : ''}

Mulai langsung dengan tulisan (bukan penjelasan). Buat opening yang kuat, konflik yang terasa, dan closing yang meninggalkan kesan.`;

  await runGhostwriteGeneration(prompt, answers.judul || 'Bab Baru');
}

async function ghostwriteLanjut() {
  console.log('\n' + kristalGradient('  ● Lanjutkan Cerita\n'));

  const { lastPart, arahan, target } = await inquirer.prompt([
    {
      type: 'editor',
      name: 'lastPart',
      message: chalk.cyanBright('  Paste bagian cerita terakhir (buka editor):'),
    },
    {
      type: 'input',
      name: 'arahan',
      message: chalk.cyanBright('  Mau ke mana cerita selanjutnya?'),
      validate: v => v.trim() ? true : 'Wajib diisi!',
    },
    { type: 'input', name: 'target', message: chalk.cyanBright('  Target kata kelanjutan:'), default: '1000' },
  ]);

  const prompt = `${GHOSTWRITE_SYSTEM}

Ini adalah bagian terakhir dari cerita:
---
${lastPart}
---

Lanjutkan cerita dengan arah: ${arahan}
Target: ~${target} kata

Penting:
- Jaga konsistensi tone, gaya, dan POV
- Pastikan transisi natural dari bagian sebelumnya
- Ending kelanjutan ini harus membuat pembaca ingin baca lebih`;

  await runGhostwriteGeneration(prompt, 'Kelanjutan Cerita');
}

async function ghostwriteRewrite() {
  console.log('\n' + kristalGradient('  ● Tulis Ulang\n'));

  const { draft, instruksi } = await inquirer.prompt([
    {
      type: 'editor',
      name: 'draft',
      message: chalk.cyanBright('  Paste draft kasar yang ingin ditulis ulang:'),
    },
    {
      type: 'input',
      name: 'instruksi',
      message: chalk.cyanBright('  Instruksi khusus (tone, gaya, atau aspek yang ingin diubah):'),
      default: 'Tingkatkan kualitas sastra, buat lebih immersive dan emosional',
    },
  ]);

  const prompt = `${GHOSTWRITE_SYSTEM}

Tulis ulang draft berikut menjadi versi yang jauh lebih baik:

DRAFT KASAR:
${draft}

Instruksi: ${instruksi}

Pertahankan: plot, karakter, dan inti cerita yang sama.
Tingkatkan: kualitas prosa, deskripsi, dialog, dan pacing.
Tulis versi final yang siap publish.`;

  await runGhostwriteGeneration(prompt, 'Tulis Ulang');
}

async function ghostwriteBebas() {
  console.log('\n' + kristalGradient('  ● Tulis Bebas\n'));

  const { brief } = await inquirer.prompt([
    {
      type: 'editor',
      name: 'brief',
      message: chalk.cyanBright('  Describe apapun yang ingin kamu tulis (buka editor):'),
    },
  ]);

  const prompt = `${GHOSTWRITE_SYSTEM}

Tulis berdasarkan brief berikut dengan kualitas tertinggi:

${brief}

Tulis langsung tanpa penjelasan. Tunjukkan keahlian ghostwriting terbaikmu.`;

  await runGhostwriteGeneration(prompt, 'Tulisan Ghostwriter');
}

async function runGhostwriteGeneration(prompt, title) {
  const spinner = ora({
    text: chalk.dim('  Ghostwriter AI sedang menulis...'),
    spinner: 'aesthetic',
    color: 'magenta',
  }).start();

  try {
    const result = await chatWithFallback(
      [{ role: 'user', content: prompt }],
      {
        onProviderSwitch: name => {
          spinner.text = chalk.dim(`  ${name} sedang menulis...`);
        },
      }
    );
    spinner.succeed(chalk.greenBright('  Selesai ditulis!'));
    renderAIResponse(result.text, `Ghostwriter · ${title}`);
    printSystemMessage('Ketik /ghostwrite untuk session ghostwrite baru, atau lanjut chat.');
  } catch (err) {
    spinner.fail(chalk.red('  Gagal'));
    printError(err.message);
  }
}
