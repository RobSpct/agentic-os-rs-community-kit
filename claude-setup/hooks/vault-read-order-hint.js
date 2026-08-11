#!/usr/bin/env node
// Vault Read-Order Hint — UserPromptSubmit hook
// Advisory only — can't block (UserPromptSubmit only appends context).
// Heuristic, intentionally fuzzy: nudges Vault->Auto-Memory->claude-mem read order
// on question-shaped prompts that aren't clearly a build/fix task.

const QUESTION_RE = /\b(wie|was|warum|wieso|wo ist|wo liegt)\b/i;
const TASK_RE = /\b(fix|implementier|baue|erstelle|schreib|refactor|repariere)\w*/i;

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const prompt = data.prompt || '';

    if (!QUESTION_RE.test(prompt) || TASK_RE.test(prompt)) {
      process.exit(0);
    }

    const output = {
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: "Falls Wissensfrage: Read-Order beachten — Vault `wiki/` → Auto-Memory → " +
          "claude-mem, bevor aus Konversation/Training geantwortet wird."
      }
    };

    process.stdout.write(JSON.stringify(output));
  } catch (e) {
    process.exit(0);
  }
});
