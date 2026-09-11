#!/usr/bin/env node
/**
 * kris.js — Kris AI CLI Main Entry Point
 * "Claude Code"-style terminal AI untuk penulis novel Indonesia
 *
 * Usage:
 *   node kris.js           → interactive chat (default)
 *   node kris.js chat      → chat mode
 *   node kris.js novel     → novel wizard
 *   node kris.js tool      → tools menu
 *   node kris.js ghostwrite → ghostwriter mode
 */

import readline from 'readline';
import chalk from 'chalk';
import ora from 'ora';

import {
  printHeader,
  printStatus,
  printHelp,
  printError,
  printSystemMessage,
  printProviderSwitch,
  getUserPrompt,
  printStatusBar,
  printSectionTitle,
  kristalGradient,
} from './lib/ui.js';
import { getProviderStatus } from './lib/aiClient.js';
import { ChatSession, sendMessage } from './commands/chat.js';
import { runNovelWizard } from './commands/novel.js';
import { runToolsMenu } from './commands/tools.js';
import { runGhostwriter } from './commands/ghostwrite.js';

// ─── Global State ──────────────────────────────────────────────
const session = new ChatSession();
let currentMode = 'chat';

// ─── Readline Setup ────────────────────────────────────────────
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  historySize: 100,
  prompt: getUserPrompt(),
  completer: (line) => {
    const commands = ['/chat', '/novel', '/tool', '/ghostwrite', '/history', '/clear', '/status', '/help', '/exit'];
    const hits = commands.filter(c => c.startsWith(line));
    return [hits.length ? hits : commands, line];
  },
});

// ─── Slash Command Handler ─────────────────────────────────────
async function handleSlashCommand(cmd) {
  const [command, ...args] = cmd.split(' ');

  switch (command) {
    case '/chat':
      currentMode = 'chat';
      printSystemMessage('Mode: Chat interaktif. Ketik pesanmu dan AI akan membalas.');
      break;

    case '/novel':
      currentMode = 'novel';
      rl.pause();
      try {
        await runNovelWizard();
      } finally {
        currentMode = 'chat';
        rl.resume();
        rl.prompt();
      }
      break;

    case '/tool':
    case '/tools':
      rl.pause();
      try {
        await runToolsMenu();
      } finally {
        rl.resume();
        rl.prompt();
      }
      break;

    case '/ghostwrite':
    case '/ghost':
      rl.pause();
      try {
        await runGhostwriter();
      } finally {
        rl.resume();
        rl.prompt();
      }
      break;

    case '/history':
      session.printHistory();
      break;

    case '/clear':
    case '/cls':
      printHeader();
      printStatus(
        session.lastProvider,
        'auto'
      );
      printSystemMessage('Layar dibersihkan. Riwayat chat tetap tersimpan.');
      break;

    case '/reset':
      session.clear();
      printSystemMessage('Riwayat percakapan direset.');
      break;

    case '/status': {
      const providers = getProviderStatus();
      console.log('');
      console.log(kristalGradient('  ● Provider Status'));
      console.log('');
      providers.forEach((p, i) => {
        const icon = i === 0 ? chalk.greenBright('✓ ') : chalk.dim('○ ');
        console.log(
          `  ${icon}` +
          chalk.bold(p.name.padEnd(25)) +
          chalk.dim(p.baseURL)
        );
      });
      console.log('');
      break;
    }

    case '/help':
    case '/?':
      printHelp();
      break;

    case '/exit':
    case '/quit':
    case '/q':
      console.log('\n' + chalk.dim('  Sampai jumpa! ✦') + '\n');
      process.exit(0);
      break;

    default:
      printSystemMessage(`Perintah tidak dikenal: ${command}. Ketik /help untuk daftar perintah.`);
  }
}

// ─── Main REPL Loop ────────────────────────────────────────────
async function startREPL() {
  // Check provider
  const providers = getProviderStatus();
  const primary = providers[0];
  const provName = primary?.name || 'Groq';
  const provModel = primary?.models?.default || 'llama3-70b';

  // Print header
  printHeader(provName, provModel);

  // Status bar bawah
  printStatusBar();
  console.log('');

  // Handle Ctrl+C
  rl.on('SIGINT', () => {
    console.log('\n' + chalk.dim('  (Ctrl+C ditekan. Ketik /exit untuk keluar.)'));
    rl.prompt();
  });

  // Show prompt
  rl.prompt();

  // Handle each line of input
  rl.on('line', async (line) => {
    const input = line.trim();

    // Empty input
    if (!input) {
      rl.prompt();
      return;
    }

    // Slash command
    if (input.startsWith('/')) {
      rl.pause();
      await handleSlashCommand(input);
      rl.resume();
      rl.prompt();
      return;
    }

    // Regular chat input
    rl.pause();
    await sendMessage(session, input);
    rl.resume();
    rl.prompt();
  });

  // Handle close
  rl.on('close', () => {
    console.log('\n' + kristalGradient('  Sampai jumpa! ✦') + '\n');
    process.exit(0);
  });
}

// ─── Entry Point ───────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const subcommand = args[0];

  // Direct subcommand (non-interactive)
  if (subcommand && !['chat', 'help', '--help', '-h'].includes(subcommand)) {
    printHeader();
    const providers = getProviderStatus();
    printStatus(providers[0]?.name || '9router', 'auto');

    if (subcommand === 'novel') {
      const rlTemp = readline.createInterface({ input: process.stdin, output: process.stdout });
      rlTemp.close();
      await runNovelWizard();
      process.exit(0);
    } else if (subcommand === 'tool' || subcommand === 'tools') {
      await runToolsMenu();
      process.exit(0);
    } else if (subcommand === 'ghostwrite' || subcommand === 'ghost') {
      await runGhostwriter();
      process.exit(0);
    } else {
      console.log(chalk.red(`  Subcommand tidak dikenal: ${subcommand}`));
      console.log(chalk.dim('  Gunakan: node kris.js [chat|novel|tool|ghostwrite]'));
      process.exit(1);
    }
    return;
  }

  // Help flag
  if (subcommand === 'help' || subcommand === '--help' || subcommand === '-h') {
    printHeader();
    printHelp();
    process.exit(0);
    return;
  }

  // Default: interactive REPL
  await startREPL();
}

main().catch(err => {
  printError(`Fatal error: ${err.message}`);
  process.exit(1);
});
