import chalk from 'chalk';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import os from 'os';

// ─── marked setup ─────────────────────────────────────────────
marked.use(
  markedTerminal({
    heading: (text, level) => {
      const fns = [chalk.bold.white, chalk.bold.cyan, chalk.bold.blue];
      const fn = fns[level - 1] || chalk.bold;
      return '\n' + fn(text) + '\n';
    },
    code: (code, lang) => {
      const label = lang ? chalk.dim(' ' + lang + ' ') + '\n' : '';
      const body = code.split('\n').map(l => '  ' + chalk.greenBright(l)).join('\n');
      return '\n' + label + chalk.dim('  ' + '─'.repeat(44)) + '\n' + body + '\n' + chalk.dim('  ' + '─'.repeat(44)) + '\n';
    },
    codespan: code => chalk.bgBlack.greenBright(' ' + code + ' '),
    strong: text => chalk.bold(text),
    em: text => chalk.italic.dim(text),
    blockquote: text => text.split('\n').map(l => chalk.dim('  └ ') + chalk.italic(l)).join('\n') + '\n',
    hr: () => chalk.dim('  ' + '─'.repeat(60)) + '\n',
    listitem: text => chalk.dim('  • ') + text,
    link: (href, _t, text) => chalk.cyan.underline(text) + chalk.dim(' (' + href + ')'),
    paragraph: text => text + '\n',
  })
);

// ─── Pixel robot logo (Claude Code style) ─────────────────────
// Mirip robot merah Claude Code: kepala kotak, mata, badan, kaki
const R = s => chalk.hex('#e53e3e').bold(s);
const D = s => chalk.hex('#8b0000').bold(s);

const PIXEL_LOGO = [
  R(' ██████████ '),
  R(' █') + D('██') + R('  ') + D('██') + R('█ '),
  R(' ██████████ '),
  R(' ████████   '),
  R('    ██  ██  '),
  R('    ██  ██  '),
];

const VERSION = 'v1.0.0';
const CWD = process.cwd().replace(os.homedir(), '~');

// ─── Print header ─────────────────────────────────────────────
export function printHeader(providerName = 'Groq', model = 'llama3-70b') {
  console.clear();
  console.log('');

  const infoLines = [
    chalk.bold.white('Kris AI ') + chalk.dim(VERSION),
    chalk.dim(model + ' (' + providerName + ')') + chalk.dim(' · Auto-Fallback'),
    chalk.dim(CWD),
  ];

  for (let i = 0; i < Math.max(PIXEL_LOGO.length, infoLines.length); i++) {
    const left  = PIXEL_LOGO[i] !== undefined ? PIXEL_LOGO[i] : '              ';
    const right = infoLines[i]  !== undefined ? infoLines[i]  : '';
    console.log(left + '  ' + right);
  }

  console.log('');
}

// ─── Status (compat) ──────────────────────────────────────────
export function printStatus() {}

// ─── Help ─────────────────────────────────────────────────────
export function printHelp() {
  console.log('');
  console.log(chalk.bold.white('  Kris AI — Slash Commands'));
  console.log(chalk.dim('  ' + '─'.repeat(44)));
  const cmds = [
    ['/chat',       'Mode chat interaktif (default)'],
    ['/novel',      'Novel generator wizard'],
    ['/tool',       'Alat AI (premis, outline, dll)'],
    ['/ghostwrite', 'Ghostwriter AI'],
    ['/history',    'Riwayat percakapan'],
    ['/clear',      'Bersihkan layar'],
    ['/status',     'Cek status provider AI'],
    ['/exit',       'Keluar'],
  ];
  cmds.forEach(([cmd, desc]) => {
    console.log('  ' + chalk.cyan(cmd.padEnd(14)) + chalk.dim(desc));
  });
  console.log('');
  console.log(chalk.dim('  Tips: ') + chalk.white('? for shortcuts') + chalk.dim(' · ') + chalk.white('Ctrl+C') + chalk.dim(' to interrupt'));
  console.log('');
}

// ─── Thinking indicator ──────────────────────────────────────
let _timer = null;
let _start = null;

export function startThinking() {
  _start = Date.now();
  process.stdout.write('\n');
  _timer = setInterval(() => {
    const s = ((Date.now() - _start) / 1000).toFixed(0);
    process.stdout.write('\r' + chalk.dim('* Thinking\u2026 ' + s + 's'));
  }, 500);
}

export function stopThinking() {
  if (_timer) {
    clearInterval(_timer);
    _timer = null;
    const s = ((Date.now() - _start) / 1000).toFixed(0);
    const t = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    process.stdout.write('\r' + chalk.dim('* Brewed for ' + s + 's · done ' + t) + '\n');
  }
}

// ─── Render AI response ───────────────────────────────────────
export function renderAIResponse(text, _provider) {
  const rendered = marked(text).trimEnd();
  const indented = rendered.split('\n').map(l => '  ' + l).join('\n');
  console.log('\n' + indented + '\n');
}

// ─── Streaming ───────────────────────────────────────────────
export function printStreamChunk(chunk) {
  process.stdout.write(chunk);
}

export function printStreamStart() {
  process.stdout.write('\n  ');
}

export function printStreamEnd() {
  process.stdout.write('\n\n');
}

// ─── Messages ────────────────────────────────────────────────
export function printSystemMessage(msg) {
  console.log(chalk.dim('  \u2514 ' + msg));
}

export function printError(msg) {
  console.log('\n  ' + chalk.red('\u2514 ') + chalk.red(msg) + '\n');
}

export function printProviderSwitch(name) {
  console.log(chalk.dim('\n  \u21aa ' + name + '\u2026'));
}

export function printSectionTitle(title) {
  console.log('');
  console.log(chalk.dim('  ' + '─'.repeat(44)));
  console.log('  ' + chalk.bold.white(title));
  console.log(chalk.dim('  ' + '─'.repeat(44)));
  console.log('');
}

// ─── Prompt & status bar ─────────────────────────────────────
export function getUserPrompt() {
  return '\n' + chalk.bold.white('> ');
}

export function printStatusBar() {
  const cols = process.stdout.columns || 80;
  console.log(chalk.dim('─'.repeat(cols)));
  console.log(chalk.dim('" /help · ? for shortcuts · /exit to quit'));
}

// ─── Compat ──────────────────────────────────────────────────
export const kristalGradient = t => chalk.cyan(t);
export const goldGradient    = t => chalk.yellow(t);
