// Release-Gates: vor jedem Push ausfuehren (node scripts/release-gates.js).
// Prueft Personendaten, Platzhalter-Konvention, Syntax, JSON, BOMs,
// Skill/Kategorie-Deckung, tabsVisible-Konsistenz und die Repo-Struktur.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const vm = require('vm');

const REPO = path.resolve(__dirname, '..').split(path.sep).join('/');
let fail = 0;
const ok = (m) => console.log('  OK   ' + m);
const bad = (m) => { console.log('  FAIL ' + m); fail++; };

function walk(d, o = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    // Dieses Skript selbst enthaelt die Suchbegriffe als Muster — sonst findet es sich selbst.
    if (e.name === '.git' || e.name === 'node_modules' || e.name === 'release-gates.js') continue;
    const p = path.join(d, e.name);
    e.isDirectory() ? walk(p, o) : o.push(p);
  }
  return o;
}
const files = walk(REPO);
const rel = (f) => f.replace(/\\/g, '/').replace(REPO.replace(/\\/g, '/') + '/', '');

// --- Gate 1: Personendaten ---
console.log('\n=== Gate 1: Personendaten ===');
// "skaile"/"Kauffmann" sind in LICENSE/README/CLAUDE.md/manifest.json als Attribution erlaubt.
const attributionOk = new Set(['LICENSE', 'README.md', 'CLAUDE.md', 'plugin/agentic-os/manifest.json']);
// CLAUDE.md Zeile "grep -rn ..." ist das Release-Gate-Kommando selbst — es MUSS die
// Suchbegriffe enthalten. Solche Zeilen ausnehmen, sonst prueft das Gate sich selbst.
const isGateCmd = (line) => /grep -rn/.test(line);
// Beispielpfade mit erfundenem Namen (C:/Users/anna/...) sind Doku, kein Leak.
const isExamplePath = (line) => /C:\/Users\/anna\b/.test(line);

const patterns = [
  ['Work User', /Work User/g, () => false, isGateCmd],
  ['HYCO/hyco', /\bHYCO\b|\bhyco\b/g, () => false, isGateCmd],
  ['robin/specht', /robin|specht/gi, () => false, isGateCmd],
  ['abs. C:\\Users', /C:[\\\/]Users[\\\/](?!<)/g, (f) => f.startsWith('plugin/agentic-os/native/'), isExamplePath],
  ['skaile/Kauffmann', /skaile|Kauffmann/gi, (f) => attributionOk.has(f), () => false],
];
for (const [name, re, allowFile, allowLine] of patterns) {
  const hits = [];
  for (const f of files) {
    const r = rel(f);
    if (allowFile(r)) continue;
    let t;
    try { t = fs.readFileSync(f, 'utf8'); } catch { continue; }
    t.split('\n').forEach((line, i) => {
      if (allowLine(line)) return;
      const m = line.match(new RegExp(re.source, re.flags.replace('g', '') + 'g'));
      if (m) hits.push(r + ':' + (i + 1) + ' → ' + line.trim().slice(0, 80));
    });
  }
  hits.length ? bad(name + ':\n         ' + hits.join('\n         ')) : ok(name + ': 0 Treffer');
}

// --- Gate 2: Platzhalter-Konvention ---
console.log('\n=== Gate 2: Platzhalter ===');
// Ausnahmen: fremde API-Doku (YOUR_API_KEY etc.), inhaltliche Beispiele in council,
// und alles unter plugin/ (fremder Code).
const phAllow = (f) => f.startsWith('plugin/') || f.startsWith('skills/agent-reach/')
  || f === 'skills/claude-api/SKILL.md' || f === 'skills/council/SKILL.md'
  || f === 'skills/session-uebergabe/SKILL.md' || f === 'CLAUDE.md' || f === 'INSTALL.md';
const phPatterns = [['{{X}}', /\{\{[A-Z_]+\}\}/g], ['YOUR_', /YOUR_[A-Z_]+/g], ['<You>/<NAME>', /<You>|<NAME>/g], ['<VAULT_ROOT> einfach', /(?<!<)<VAULT_ROOT>(?!>)/g]];
for (const [name, re] of phPatterns) {
  const hits = [];
  for (const f of files) {
    const r = rel(f);
    if (phAllow(r) || !/\.(md|json|js|mjs)$/.test(r)) continue;
    let t; try { t = fs.readFileSync(f, 'utf8'); } catch { continue; }
    const m = t.match(re);
    if (m) hits.push(r + ' (' + m.length + 'x)');
  }
  hits.length ? bad(name + ': ' + hits.join(', ')) : ok(name + ': 0 Treffer');
}

// --- Gate 3: JS-Syntax ---
console.log('\n=== Gate 3: Syntax ===');
for (const f of files) {
  const r = rel(f);
  if (!/\.(js|mjs)$/.test(r)) continue;
  if (r.startsWith('plugin/agentic-os/native/')) continue; // fremder Code
  try {
    execFileSync('node', ['--check', f], { stdio: 'pipe' });
  } catch (e) { bad('node --check ' + r); continue; }
}
ok('node --check ueber alle eigenen .js/.mjs');

// --- Gate 4: JSON ---
console.log('\n=== Gate 4: JSON ===');
let jsonCount = 0;
for (const f of files) {
  const r = rel(f);
  if (!r.endsWith('.json')) continue;
  if (r.startsWith('plugin/agentic-os/native/')) continue;
  try { JSON.parse(fs.readFileSync(f, 'utf8')); jsonCount++; }
  catch (e) { bad('JSON kaputt: ' + r + ' — ' + e.message); }
}
ok(jsonCount + ' JSON-Dateien valide');

// --- Gate 5: BOM ---
console.log('\n=== Gate 5: BOM ===');
const boms = files.filter(f => {
  if (!/\.(md|json|js|mjs|css)$/.test(f)) return false;
  if (rel(f).startsWith('plugin/agentic-os/native/')) return false;
  const b = fs.readFileSync(f);
  return b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF;
}).map(rel);
boms.length ? bad('BOM in: ' + boms.join(', ')) : ok('keine BOMs');

// --- Gate 6: Skills <-> _categories ---
console.log('\n=== Gate 6: Skills/Kategorien ===');
const cat = JSON.parse(fs.readFileSync(REPO + '/templates/_categories.json', 'utf8'));
const catKeys = Object.keys(cat).filter(k => !k.startsWith('_'));
const skillDirs = fs.readdirSync(REPO + '/skills', { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name);
const noCat = skillDirs.filter(d => !catKeys.includes(d));
const dead = catKeys.filter(k => !skillDirs.includes(k));
noCat.length ? bad('Skills ohne Kategorie: ' + noCat.join(', ')) : ok(skillDirs.length + ' Skills, alle kategorisiert');
dead.length ? bad('tote Kategorie-Eintraege: ' + dead.join(', ')) : ok('keine toten Kategorie-Eintraege');
const noSkillMd = skillDirs.filter(d => !fs.existsSync(REPO + '/skills/' + d + '/SKILL.md'));
noSkillMd.length ? bad('ohne SKILL.md: ' + noSkillMd.join(', ')) : ok('jede Skill hat SKILL.md');
// name-Feld im Frontmatter
const noName = skillDirs.filter(d => !/^name:\s*\S/m.test(fs.readFileSync(REPO + '/skills/' + d + '/SKILL.md', 'utf8')));
noName.length ? bad('ohne name im Frontmatter: ' + noName.join(', ')) : ok('jede SKILL.md hat name');

// --- Gate 7: tabsVisible-Konsistenz Bundle <-> Template ---
console.log('\n=== Gate 7: tabsVisible ===');
const main = fs.readFileSync(REPO + '/plugin/agentic-os/main.js', 'utf8');
const dm = main.match(/tabsVisible:\{([^}]*)\}/);
const bundleKeys = dm ? dm[1].split(',').map(s => s.split(':')[0].trim()).sort() : [];
const tmplKeys = Object.keys(JSON.parse(fs.readFileSync(REPO + '/templates/settings.json', 'utf8')).tabsVisible).sort();
JSON.stringify(bundleKeys) === JSON.stringify(tmplKeys)
  ? ok('Bundle und Template gleich: ' + bundleKeys.join(', '))
  : bad('Bundle [' + bundleKeys + '] != Template [' + tmplKeys + ']');

// --- Gate 8: erwartete Struktur ---
console.log('\n=== Gate 8: Struktur ===');
const must = ['LICENSE', 'README.md', 'INSTALL.md', 'CLAUDE.md', 'WINDOWS-SETUP.md',
  'plugin/agentic-os/main.js', 'plugin/agentic-os/manifest.json', 'plugin/agentic-os/styles.css',
  'claude-setup/CLAUDE.global.template.md', 'claude-setup/settings.template.json',
  'claude-setup/RTK.md', 'vault-template/CLAUDE.md', 'vault-template/memory/MEMORY.md',
  'vault-template/index.md', 'vault-template/scripts/vault-index-sync.mjs',
  'templates/settings.json', 'templates/projects.json', 'templates/_categories.json'];
const missing = must.filter(m => !fs.existsSync(path.join(REPO, m)));
missing.length ? bad('fehlt: ' + missing.join(', ')) : ok(must.length + ' Pflichtdateien vorhanden');
const hookCount = fs.readdirSync(REPO + '/claude-setup/hooks').length;
const agentCount = fs.readdirSync(REPO + '/claude-setup/agents').length;
hookCount === 11 ? ok('11 Hooks') : bad('Hooks: ' + hookCount + ' (erwartet 11)');
agentCount === 10 ? ok('10 Agents') : bad('Agents: ' + agentCount + ' (erwartet 10)');

console.log('\n' + (fail ? '### ' + fail + ' GATE(S) FEHLGESCHLAGEN' : '### ALLE GATES GRUEN'));
process.exit(fail ? 1 : 0);
