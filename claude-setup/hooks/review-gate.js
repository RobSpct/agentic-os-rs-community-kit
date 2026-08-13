#!/usr/bin/env node
// Review-Gate — Stop hook, block-fähig.
// Blockiert das Turn-Ende, wenn security-relevanter Code geschrieben wurde,
// ohne dass danach der security-reviewer-Agent lief.
// Reihenfolge zählt: ein Review VOR dem Write öffnet das Gate nicht.

const fs = require('fs');
const { shouldRemind } = require('./_reminder-throttle.js');

const SECURITY_PATH = /(auth|clerk|sentry|middleware|session|token|password|secret|credential|webhook|\.env|[\\/]api[\\/])/i;
const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rs|java|rb|php)$/i;
const EXEMPT = [
  /[\\/]\.claude[\\/]/i,
  /[\\/](node_modules|dist|build|\.next|coverage)[\\/]/i,
  /[\\/]Temp[\\/]/i,
  /scratchpad/i,
  /\.(test|spec)\.[jt]sx?$/i,
];

// Vault-Pfad aus der Umgebung statt festem Ordnernamen (settings.json -> env.AGENTICOS_VAULT).
function inVault(fp) {
  const vault = (process.env.AGENTICOS_VAULT || '').replace(/\\/g, '/').replace(/\/+$/, '');
  if (vault.length === 0) return false;
  return fp.replace(/\\/g, '/').toLowerCase().startsWith(vault.toLowerCase() + '/');
}

// Liest das Transcript und liefert die Position (Zeilen-Index) des letzten
// security-relevanten Writes sowie des letzten security-reviewer-Laufs.
function scan(transcriptPath) {
  let raw;
  try {
    const stat = fs.statSync(transcriptPath);
    const MAX = 2 * 1024 * 1024;
    const start = Math.max(0, stat.size - MAX);
    const fd = fs.openSync(transcriptPath, 'r');
    const buf = Buffer.alloc(stat.size - start);
    fs.readSync(fd, buf, 0, buf.length, start);
    fs.closeSync(fd);
    raw = buf.toString('utf8');
    if (start > 0) raw = raw.slice(raw.indexOf('\n') + 1);
  } catch (e) {
    return null;
  }

  let lastWrite = -1;
  let lastReview = -1;
  const files = [];
  const lines = raw.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    let entry;
    try {
      entry = JSON.parse(lines[i]);
    } catch (e) {
      continue;
    }
    const content = entry?.message?.content;
    if (!Array.isArray(content)) continue;

    for (const item of content) {
      if (item?.type !== 'tool_use') continue;

      if (item.name === 'Write' || item.name === 'Edit') {
        const fp = item?.input?.file_path || item?.input?.path || '';
        if (!fp || !CODE_EXT.test(fp)) continue;
        if (EXEMPT.some(p => p.test(fp)) || inVault(fp)) continue;
        if (!SECURITY_PATH.test(fp)) continue;
        lastWrite = i;
        if (!files.includes(fp)) files.push(fp);
      }

      // Agent-Spawn erkennen (Tool heißt je nach Version Agent oder Task).
      if (item.name === 'Agent' || item.name === 'Task') {
        const t = item?.input?.subagent_type || '';
        if (t === 'security-reviewer') lastReview = i;
      }
    }
  }
  return { lastWrite, lastReview, files };
}

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => (input += chunk));
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);

    // Schleifen-Schutz: zweiter Durchlauf nach einem Block läuft immer durch.
    if (data.stop_hook_active) process.exit(0);

    const transcriptPath = data.transcript_path;
    if (!transcriptPath || !fs.existsSync(transcriptPath)) process.exit(0);

    const r = scan(transcriptPath);
    if (!r || r.lastWrite === -1) process.exit(0);

    // Review muss NACH dem letzten security-relevanten Write liegen.
    if (r.lastReview > r.lastWrite) process.exit(0);

    // Throttle: max. 1 Block pro Session — kein Festhalten in Schleifen.
    if (!shouldRemind(data.session_id, 'review-gate', 'session')) process.exit(0);

    const liste = r.files.slice(-5).map(f => f.split(/[\\/]/).pop()).join(', ');
    process.stdout.write(JSON.stringify({
      decision: 'block',
      reason:
        `Security-relevante Änderung ohne security-reviewer: ${liste}.\n` +
        `Jetzt den security-reviewer-Agent auf diese Dateien spawnen, Befunde melden, dann abschließen.\n` +
        `(Gate blockiert 1x pro Session — bewusst überspringen ist danach möglich.)`,
    }));
  } catch (e) {
    process.exit(0);
  }
});
