// Reminder-Throttle — shared helper for advisory PreToolUse hooks.
// Tracks "already reminded" per (session, key) in a flat JSON state file,
// so a reminder fires at most once per session per key (e.g. per file path).
// ponytail: flat JSON file, no DB. State is advisory-only; loss just means one extra reminder.

const fs = require('fs');
const os = require('os');
const path = require('path');

const STATE_FILE = path.join(os.homedir(), '.claude', '.reminder-state.json');
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // prune entries older than 24h

function load() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function save(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state));
  } catch (e) {
    // advisory only — ignore write failures
  }
}

// Returns true if this is the FIRST time (session, hook, key) is seen → fire reminder.
// Returns false if already seen → stay silent. Marks as seen on first call.
function shouldRemind(sessionId, hookId, key) {
  if (!sessionId) sessionId = 'no-session';
  const now = Date.now();
  const state = load();

  // prune stale entries
  for (const k of Object.keys(state)) {
    if (now - (state[k] || 0) > MAX_AGE_MS) delete state[k];
  }

  const compound = `${sessionId}|${hookId}|${key}`;
  if (state[compound]) {
    save(state); // persist pruning
    return false;
  }
  state[compound] = now;
  save(state);
  return true;
}

module.exports = { shouldRemind };
