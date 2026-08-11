#!/usr/bin/env node
// Tooling Discipline Guard — PreToolUse hook (Write|Edit)
// Advisory only — never blocks. Nudges Ponytail YAGNI-check + Superpowers skill check
// on every code edit, so the reminder survives long-session context drift/compression
// (a hook fires fresh every call; CLAUDE.md text can get compressed away).

const { shouldRemind } = require('./_reminder-throttle.js');

const TRIVIAL_PATTERNS = [
  /\.gitignore$/,
  /\.env/,
  /CLAUDE\.md$/,
  /AGENTS\.md$/,
  /GEMINI\.md$/,
  /settings\.json$/,
  /\.md$/,
];

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const toolName = data.tool_name;

    if (toolName !== 'Write' && toolName !== 'Edit') {
      process.exit(0);
    }

    if (data.tool_input?.is_subagent || data.session_type === 'task') {
      process.exit(0);
    }

    const filePath = data.tool_input?.file_path || data.tool_input?.path || '';
    if (TRIVIAL_PATTERNS.some(p => p.test(filePath))) {
      process.exit(0);
    }

    // Throttle: remind at most once per session per file.
    if (!shouldRemind(data.session_id, 'tooling-discipline', filePath)) {
      process.exit(0);
    }

    const output = {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        additionalContext: "Tooling-Check vor Edit: (1) Ponytail-Leiter durchlaufen — braucht's das? " +
          "stdlib? native? vorhandene Dep? 1 Zeile? (2) Falls kreative Arbeit/Bugfix: relevanten " +
          "Superpowers-Skill (brainstorming/systematic-debugging) schon aufgerufen?"
      }
    };

    process.stdout.write(JSON.stringify(output));
  } catch (e) {
    process.exit(0);
  }
});
