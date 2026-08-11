#!/usr/bin/env node
// DB-Skill Hint — PreToolUse hook (Write|Edit)
// Advisory only — never blocks. When editing a Prisma/SQL file, nudges to
// consider prisma-patterns/postgres-patterns + database-reviewer agent.
// Throttled to once per session per file.

const { shouldRemind } = require('./_reminder-throttle.js');

const DB_PATTERNS = [
  /\.prisma$/,
  /\.sql$/,
  /\/migrations\//,
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
    if (!DB_PATTERNS.some(p => p.test(filePath))) {
      process.exit(0);
    }

    if (!shouldRemind(data.session_id, 'db-skill', filePath)) {
      process.exit(0);
    }

    const output = {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        additionalContext: "Datenbank-Datei in Arbeit. prisma-patterns/postgres-patterns-Skill " +
          "erwägen, bei Review-Bedarf den database-reviewer-Agent."
      }
    };

    process.stdout.write(JSON.stringify(output));
  } catch (e) {
    process.exit(0);
  }
});
