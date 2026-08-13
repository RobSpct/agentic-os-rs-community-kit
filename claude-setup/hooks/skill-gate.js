#!/usr/bin/env node
// Skill-Gate — PreToolUse hook (Write|Edit), deny-fähig.
// Erzwingt einen Superpowers-Process-Skill vor größeren Code-Änderungen.
// Escape-Hatch: deny feuert max. 1x pro (Session, Datei) — der zweite Versuch läuft durch.

const fs = require('fs');
const { shouldRemind } = require('./_reminder-throttle.js');

const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|py|prisma|sql|vue|svelte|go|rs|java|rb|php)$/i;
// Nicht-Produktivcode: Doku, Config, Planung, Claude-Setup, Temp.
const EXEMPT = [
  /[\\/]plans?[\\/]/i,
  /[\\/]\.planning[\\/]/i,
  /[\\/]\.claude[\\/]/i,
  /[\\/](node_modules|dist|build|\.next|coverage)[\\/]/i,
  /[\\/]Temp[\\/]/i,
  /scratchpad/i,
  /\.(test|spec)\.[jt]sx?$/i,
];

// Vault-Pfad aus der Umgebung statt festem Ordnernamen (settings.json -> env.AGENTICOS_VAULT).
// Notizen/Memory im Vault sind kein Produktivcode — ohne gesetzten Env greift kein Vault-Ausschluss.
function inVault(fp) {
  const vault = (process.env.AGENTICOS_VAULT || '').replace(/\\/g, '/').replace(/\/+$/, '');
  if (vault.length === 0) return false;
  return fp.replace(/\\/g, '/').toLowerCase().startsWith(vault.toLowerCase() + '/');
}

const BIG_CHANGE_LINES = 80;

// Zählt echte Skill-tool_use-Items im Transcript.
// Bewusst KEIN Substring-Grep: der String `"name":"Skill"` taucht auch in
// Assistant-Prosa auf (z.B. wenn über diesen Hook geredet wird) und würde das
// Gate selbst aushebeln — dieselbe Bug-Klasse wie der alte plan-first-Substring-Bug.
function hasSuperpowersSkillCall(transcriptPath) {
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
    if (start > 0) raw = raw.slice(raw.indexOf('\n') + 1); // angeschnittene erste Zeile verwerfen
  } catch (e) {
    return true; // Transcript unlesbar → nicht blockieren (nie raten)
  }

  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch (e) {
      continue; // kaputte/partielle Zeile überspringen
    }
    const content = entry?.message?.content;
    if (!Array.isArray(content)) continue;
    for (const item of content) {
      if (item?.type !== 'tool_use') continue;
      if (item?.name !== 'Skill') continue;
      const skill = item?.input?.skill;
      if (typeof skill === 'string' && skill.startsWith('superpowers:')) return true;
    }
  }
  return false;
}

function countLines(str) {
  if (!str) return 0;
  return str.split('\n').length;
}

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => (input += chunk));
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const toolName = data.tool_name;
    if (toolName !== 'Write' && toolName !== 'Edit') process.exit(0);

    // Subagenten laufen mit eigenem Auftrag — kein Gate.
    if (data.tool_input?.is_subagent || data.session_type === 'task') process.exit(0);

    const filePath = data.tool_input?.file_path || data.tool_input?.path || '';
    if (!filePath || !CODE_EXT.test(filePath)) process.exit(0);
    if (EXEMPT.some(p => p.test(filePath)) || inVault(filePath)) process.exit(0);

    const transcriptPath = data.transcript_path;
    if (!transcriptPath || !fs.existsSync(transcriptPath)) process.exit(0);

    if (hasSuperpowersSkillCall(transcriptPath)) process.exit(0);

    // Umfang bestimmen: neue Datei = Neubau, sonst Zeilen der Änderung.
    // Nur Write kann einen Neubau sein — ein Edit setzt eine bestehende Datei voraus.
    const isNewFile = toolName === 'Write' && !fs.existsSync(filePath);
    const changeSize = toolName === 'Write'
      ? countLines(data.tool_input?.content)
      : countLines(data.tool_input?.new_string);
    const isBig = isNewFile || changeSize > BIG_CHANGE_LINES;

    if (!isBig) {
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          additionalContext:
            'Kleine Code-Änderung ohne vorherigen Superpowers-Skill. Bei Bugfix: ' +
            'superpowers:systematic-debugging erwägen. Bei trivialem Edit ignorieren.',
        },
      }));
      process.exit(0);
    }

    // Throttle: pro Session und Datei nur einmal blockieren.
    if (!shouldRemind(data.session_id, 'skill-gate', filePath)) process.exit(0);

    const skill = isNewFile ? 'superpowers:brainstorming' : 'superpowers:systematic-debugging';
    const grund = isNewFile
      ? 'Neue Code-Datei (Neubau)'
      : `Große Änderung (${changeSize} Zeilen)`;

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          `${grund} ohne vorherigen Superpowers-Process-Skill (Arbeitsprinzip 1 + Tooling-Kette).\n` +
          `Jetzt aufrufen: ${skill} — danach diesen Write erneut ausführen.\n` +
          `Bewusst überspringen: derselbe Write ein zweites Mal läuft durch (Gate feuert 1x pro Datei/Session).`,
      },
    }));
  } catch (e) {
    process.exit(0);
  }
});
