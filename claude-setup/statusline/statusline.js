#!/usr/bin/env node
// Agentic OS Statusline — Modell | aktuelle Aufgabe | Verzeichnis | Context-Meter.
// Liest den Claude-Code-Statusline-Hook (JSON auf stdin) und schreibt eine Zeile auf stdout.
// Faellt bei jedem Fehler still auf eine kuerzere Zeile zurueck — nie crashen, nie haengen.

const fs = require('fs');
const path = require('path');
const os = require('os');

// Claude Code haelt einen Teil des Fensters fuer Auto-Compact frei. Der Anteil ist per
// CLAUDE_CODE_AUTO_COMPACT_WINDOW (Token-Zahl) ueberschreibbar; sonst ~16.5 %.
const DEFAULT_COMPACT_BUFFER_PCT = 16.5;

/** Verbrauchte Kontext-Prozent, skaliert auf den tatsaechlich nutzbaren Bereich. */
function usedContextPct(remainingPct, totalTokens) {
  const acw = parseInt(process.env.CLAUDE_CODE_AUTO_COMPACT_WINDOW || '0', 10);
  const buffer = acw > 0
    ? Math.min(100, (acw / (totalTokens || 1_000_000)) * 100)
    : DEFAULT_COMPACT_BUFFER_PCT;
  const usable = Math.max(0, ((remainingPct - buffer) / (100 - buffer)) * 100);
  return Math.max(0, Math.min(100, Math.round(100 - usable)));
}

/** 10-Segment-Balken mit Ampelfarbe. */
function contextMeter(usedPct) {
  const bar = '█'.repeat(Math.floor(usedPct / 10)) + '░'.repeat(10 - Math.floor(usedPct / 10));
  if (usedPct < 50) return ` \x1b[32m${bar} ${usedPct}%\x1b[0m`;
  if (usedPct < 65) return ` \x1b[33m${bar} ${usedPct}%\x1b[0m`;
  if (usedPct < 80) return ` \x1b[38;5;208m${bar} ${usedPct}%\x1b[0m`;
  return ` \x1b[5;31m💀 ${bar} ${usedPct}%\x1b[0m`;
}

/** activeForm des laufenden Todos dieser Session, '' wenn keins. */
function currentTask(sessionId) {
  if (!sessionId) return '';
  const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
  const todosDir = path.join(claudeDir, 'todos');
  try {
    const newest = fs.readdirSync(todosDir)
      .filter(f => f.startsWith(sessionId) && f.includes('-agent-') && f.endsWith('.json'))
      .map(f => ({ f, mtime: fs.statSync(path.join(todosDir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime)[0];
    if (!newest) return '';
    const todos = JSON.parse(fs.readFileSync(path.join(todosDir, newest.f), 'utf8'));
    return todos.find(t => t.status === 'in_progress')?.activeForm || '';
  } catch {
    return ''; // kein todos-Verzeichnis / kaputte Datei — Statusline laeuft ohne Aufgabe weiter
  }
}

/** Rendert die Statusline aus dem geparsten Hook-Input. Exportiert fuer Tests. */
function renderStatusline(data) {
  const model = data.model?.display_name || 'Claude';
  const dirname = path.basename(data.workspace?.current_dir || process.cwd());
  const remaining = data.context_window?.remaining_percentage;
  const meter = remaining == null
    ? ''
    : contextMeter(usedContextPct(remaining, data.context_window?.total_tokens));
  const task = currentTask(data.session_id);
  const middle = task ? ` \x1b[1m${task}\x1b[0m │` : '';
  return `\x1b[2m${model}\x1b[0m │${middle} \x1b[2m${dirname}\x1b[0m${meter}`;
}

function runStatusline() {
  let input = '';
  // Schliesst stdin nicht (Pipe-Probleme unter Windows/Git Bash), still beenden statt haengen.
  const guard = setTimeout(() => process.exit(0), 3000);
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', c => { input += c; });
  process.stdin.on('end', () => {
    clearTimeout(guard);
    try {
      process.stdout.write(renderStatusline(JSON.parse(input)));
    } catch {
      // Kaputtes/leeres JSON — lieber keine Zeile als eine Fehlermeldung im Prompt.
    }
  });
}

module.exports = { renderStatusline, usedContextPct, contextMeter, currentTask };

if (require.main === module) runStatusline();
