/**
 * chat.js — Mode chat interaktif (default)
 * Multi-turn conversation dengan streaming AI response dalam boxen
 */

import chalk from 'chalk';
import ora from 'ora';
import { streamChatWithFallback } from '../lib/aiClient.js';
import {
  renderAIResponse,
  printStreamStart,
  printStreamEnd,
  printStreamChunk,
  printError,
  printSystemMessage,
  printProviderSwitch,
} from '../lib/ui.js';

// System prompt HARUS bahasa Inggris — AgentRouter memblokir request yang
// terdeteksi berbahasa Indonesia (content-blocked). Model tetap diminta
// menjawab dalam bahasa Indonesia lewat instruksi di bawah.
const SYSTEM_PROMPT = `You are Kris AI, the best creative-writing assistant for Indonesian novelists.
You are an expert in novels, short stories, poetry, and creative content.
Your style: smart, warm, creative, and always motivating writers.
IMPORTANT: Always respond in Indonesian (Bahasa Indonesia) unless the user explicitly asks for another language.
Use markdown to format your answers (bold, headings, lists, code blocks when needed).`;

export class ChatSession {
  constructor() {
    this.history = [];
    this.lastProvider = '9router';
  }

  getMessages() {
    return [{ role: 'system', content: SYSTEM_PROMPT }, ...this.history];
  }

  addUser(content) {
    this.history.push({ role: 'user', content });
  }

  addAssistant(content) {
    this.history.push({ role: 'assistant', content });
  }

  printHistory() {
    if (this.history.length === 0) {
      printSystemMessage('Belum ada riwayat percakapan di sesi ini.');
      return;
    }
    console.log('');
    this.history.forEach((msg, i) => {
      if (msg.role === 'user') {
        console.log(chalk.bold.magentaBright('  you › ') + chalk.white(msg.content));
      } else {
        console.log(chalk.bold.cyanBright('  kris › ') + chalk.dim(msg.content.slice(0, 80) + (msg.content.length > 80 ? '...' : '')));
      }
      if (i < this.history.length - 1) {
        console.log(chalk.dim('  ─'));
      }
    });
    console.log('');
  }

  clear() {
    this.history = [];
  }
}

/**
 * Kirim pesan dan stream responnya dalam boxen
 */
export async function sendMessage(session, userInput) {
  session.addUser(userInput);

  let fullResponse = '';
  let usedProvider = session.lastProvider;

  // Collect streaming chunks
  const chunks = [];

  try {
    // Show "thinking" indicator dulu
    const spinner = ora({
      text: chalk.dim('Kris AI sedang berpikir...'),
      spinner: 'dots2',
      color: 'cyan',
    }).start();

    const result = await streamChatWithFallback(session.getMessages(), {
      onProviderSwitch: name => {
        usedProvider = name;
        spinner.text = chalk.dim(`Menggunakan ${name}...`);
      },
      onChunk: chunk => {
        chunks.push(chunk);
        fullResponse += chunk;
      },
    });

    spinner.stop();
    usedProvider = result.provider || usedProvider;
    session.lastProvider = usedProvider;

    // Render dalam boxen setelah selesai
    renderAIResponse(fullResponse, usedProvider);

    session.addAssistant(fullResponse);
  } catch (error) {
    printError(error.message);
  }
}
