#!/usr/bin/env node
// Plan-First Guard — PreToolUse hook (Write|Edit)
// Advisory only — never blocks. Checks the session transcript for a prior
// /plan usage or ExitPlanMode call; if absent on a code edit, nudges Arbeitsprinzip 4.

const fs = require('fs');
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

    const transcriptPath = data.transcript_path;
    if (transcriptPath && fs.existsSync(transcriptPath)) {
      const content = fs.readFileSync(transcriptPath, 'utf8');
      const tail = content.slice(-200000); // last ~200k chars is enough, no full scan needed
      // "/plan" as bare substring matched any path segment (e.g. .claude/plans/) and
      // self-disabled the guard; match only the slash command as standalone user input.
      if (tail.includes('"name":"ExitPlanMode"') || /[">]\/plan[\s\\"<]/.test(tail)) {
        process.exit(0);
      }
    } else {
      process.exit(0); // no transcript available — don't guess
    }

    // Throttle: remind at most once per session.
    if (!shouldRemind(data.session_id, 'plan-first', 'session')) {
      process.exit(0);
    }

    const output = {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        additionalContext: "Kein Plan-Schritt in dieser Session erkannt. Arbeitsprinzip 4 " +
          "(Goal-Driven Execution) / plan-first-Workflow prüfen — falls trivialer Fix bewusst " +
          "übersprungen, ignorieren."
      }
    };

    process.stdout.write(JSON.stringify(output));
  } catch (e) {
    process.exit(0);
  }
});
