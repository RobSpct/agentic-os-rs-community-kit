#!/usr/bin/env node
// Skill-Routing Reminder — UserPromptSubmit hook
// Advisory only — never blocks. Injects a compact routing map BEFORE the model
// decides how to respond, so process skills fire pre-implementation instead of
// post-Write. Fires on prompt 1 and every 5th prompt after, so the rule
// survives long sessions and compaction.
// ponytail: flat JSON counter file, per-session, pruned after 24h.

const fs = require('fs');
const os = require('os');
const path = require('path');

const COUNTER_FILE = path.join(os.homedir(), '.claude', '.routing-counter.json');
const EVERY_N = 5;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

const ROUTING_MAP =
  "Tooling-Routing (CLAUDE.md, immer aktiv): " +
  "VOR jeder Implementierung passenden Superpowers-Process-Skill aufrufen — " +
  "Feature/Neubau → superpowers:brainstorming, Bug/Fehlverhalten → superpowers:systematic-debugging, " +
  "Multi-Step → superpowers:writing-plans, vor 'fertig' → superpowers:verification-before-completion. " +
  "NACH nicht-trivialem Code-Edit passenden Review-Agent spawnen: " +
  "typescript-reviewer / react-reviewer / database-reviewer / security-reviewer / " +
  "silent-failure-hunter / performance-optimizer (Perf/Bundle); Build-Fail → " +
  "build-error-resolver bzw. react-build-resolver. " +
  "Ponytail-Leiter gilt bei jedem Code. GSD nur explizit via /gsd:… . " +
  "Ausführung bleibt beim Modell — aber Skill-Check kommt vor der ersten Antwort.";

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);

    if (data.tool_input?.is_subagent || data.session_type === 'task') {
      process.exit(0);
    }

    const sessionId = data.session_id || 'no-session';
    let state = {};
    try { state = JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf8')); } catch (e) {}

    const now = Date.now();
    for (const k of Object.keys(state)) {
      if (now - (state[k]?.ts || 0) > MAX_AGE_MS) delete state[k];
    }

    const entry = state[sessionId] || { count: 0, ts: now };
    entry.count += 1;
    entry.ts = now;
    state[sessionId] = entry;
    try { fs.writeFileSync(COUNTER_FILE, JSON.stringify(state)); } catch (e) {}

    if (entry.count % EVERY_N !== 1) {
      process.exit(0);
    }

    const output = {
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: ROUTING_MAP
      }
    };
    process.stdout.write(JSON.stringify(output));
  } catch (e) {
    process.exit(0);
  }
});
