#!/usr/bin/env node
// Large-Change Hint — PreToolUse hook (Write|Edit)
// Advisory only — never blocks. When a single edit is large
// (Write content > 150 lines, or Edit new_string > 80 lines), nudges to
// consider a Ponytail review pass. Throttled once per session per file.

const { shouldRemind } = require('./_reminder-throttle.js');

const WRITE_LINE_THRESHOLD = 150;
const EDIT_LINE_THRESHOLD = 80;

function lineCount(s) {
  if (!s) return 0;
  return s.split('\n').length;
}

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

    let isLarge = false;
    if (toolName === 'Write') {
      isLarge = lineCount(data.tool_input?.content) > WRITE_LINE_THRESHOLD;
    } else { // Edit
      isLarge = lineCount(data.tool_input?.new_string) > EDIT_LINE_THRESHOLD;
    }
    if (!isLarge) {
      process.exit(0);
    }

    if (!shouldRemind(data.session_id, 'large-change', filePath)) {
      process.exit(0);
    }

    const output = {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        additionalContext: "Große Änderung erkannt. Dem User eine Ponytail-Prüfung anbieten " +
          "(NICHT ungefragt laufen lassen — Token): ponytail-review (Bloat/Over-Engineering), " +
          "ponytail-audit (Codebase-Scan), ponytail-debt (Shortcut-Ledger). " +
          "Passende Variante nennen, User entscheidet."
      }
    };

    process.stdout.write(JSON.stringify(output));
  } catch (e) {
    process.exit(0);
  }
});
