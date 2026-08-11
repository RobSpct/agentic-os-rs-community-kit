#!/usr/bin/env node
// UI-Skill Hint — PreToolUse hook (Write|Edit)
// Advisory only — never blocks. When editing a UI file (.tsx/.jsx/.vue/.svelte/.css/.scss),
// nudges to consider the ui-ux-pro-max skill. Throttled to once per session per file.

const { shouldRemind } = require('./_reminder-throttle.js');

const UI_PATTERNS = [
  /\.tsx$/,
  /\.jsx$/,
  /\.vue$/,
  /\.svelte$/,
  /\.css$/,
  /\.scss$/,
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
    if (!UI_PATTERNS.some(p => p.test(filePath))) {
      process.exit(0);
    }

    if (!shouldRemind(data.session_id, 'ui-skill', filePath)) {
      process.exit(0);
    }

    const output = {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        additionalContext: "UI-Datei in Arbeit. ui-ux-pro-max-Skill erwägen für " +
          "Design/Layout/Typografie/Accessibility (plan/build/review/fix). " +
          "Falls reiner Logik-/Bugfix ohne visuelle Wirkung: ignorieren."
      }
    };

    process.stdout.write(JSON.stringify(output));
  } catch (e) {
    process.exit(0);
  }
});
