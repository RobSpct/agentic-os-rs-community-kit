// Selbstcheck der Statusline: node claude-setup/statusline/statusline.test.js
const assert = require('assert');
const { renderStatusline, usedContextPct, contextMeter } = require('./statusline.js');

// Kontext-Skalierung: volles Fenster = 0 % verbraucht, leer = 100 %.
assert.strictEqual(usedContextPct(100, 1_000_000), 0);
assert.strictEqual(usedContextPct(16.5, 1_000_000), 100);
// Unterhalb des Auto-Compact-Puffers bleibt es bei 100 %, kein Wert >100.
assert.strictEqual(usedContextPct(0, 1_000_000), 100);

// Balken hat immer 10 Segmente.
const plain = contextMeter(37).replace(/\x1b\[[0-9;]*m/g, '');
assert.ok(/[█░]{10} 37%/.test(plain), plain);

// Ohne Kontext-Feld und ohne Session: nur Modell + Verzeichnis.
const line = renderStatusline({ model: { display_name: 'Opus' }, workspace: { current_dir: '/a/b/proj' } });
assert.ok(line.includes('Opus') && line.includes('proj'), line);
assert.ok(!line.includes('%'), 'ohne context_window darf kein Meter erscheinen');

// Fehlende Felder duerfen nicht werfen.
assert.doesNotThrow(() => renderStatusline({}));

console.log('OK statusline');
