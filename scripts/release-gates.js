// Release-Gates: vor jedem Push ausfuehren (node scripts/release-gates.js).
// Prueft Personendaten, Platzhalter-Konvention, Syntax, JSON, BOMs,
// Skill/Kategorie-Deckung, tabsVisible-Konsistenz, die Repo-Struktur
// sowie Lizenzen und Herkunft (Fremdkomponenten, ccusage-Pin, Skill-Provenienz).
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
// "skaile"/"Kauffmann" sind in LICENSE/NOTICE/README/CLAUDE.md/manifest.json als Attribution
// erlaubt. NOTICE ist der konventionelle Ort fuer die Herkunft eines abgeleiteten Werks.
const attributionOk = new Set(['LICENSE', 'NOTICE', 'README.md', 'CLAUDE.md', 'plugin/agentic-os/manifest.json']);
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
// Dieselbe Datei laeuft im Produkt-Repo (mit product/) und im Community-Repo (ohne).
// product/-Pflichten gelten nur, wo product/ existiert.
console.log('\n=== Gate 8: Struktur ===');
const hasProduct = fs.existsSync(path.join(REPO, 'product'));
const must = ['LICENSE', 'README.md', 'INSTALL.md', 'CLAUDE.md', 'WINDOWS-SETUP.md',
  'THIRD-PARTY-LICENSES.md',
  'plugin/agentic-os/main.js', 'plugin/agentic-os/manifest.json', 'plugin/agentic-os/styles.css',
  'claude-setup/CLAUDE.global.template.md', 'claude-setup/settings.template.json',
  'claude-setup/RTK.md', 'vault-template/CLAUDE.md', 'vault-template/memory/MEMORY.md',
  'vault-template/index.md', 'vault-template/scripts/vault-index-sync.mjs',
  'templates/settings.json', 'templates/projects.json', 'templates/_categories.json'];
if (hasProduct) {
  must.push('product/SKILLS-PROVENANCE.md', 'product/pinned-versions.json',
    'product/PINNED-VERSIONS.md', 'product/compat-check.js', 'product/RELEASE-CHECKLIST.md');
}
const missing = must.filter(m => !fs.existsSync(path.join(REPO, m)));
missing.length ? bad('fehlt: ' + missing.join(', ')) : ok(must.length + ' Pflichtdateien vorhanden');
const hookCount = fs.readdirSync(REPO + '/claude-setup/hooks').length;
const agentCount = fs.readdirSync(REPO + '/claude-setup/agents').length;
hookCount === 13 ? ok('13 Hooks') : bad('Hooks: ' + hookCount + ' (erwartet 13)');
agentCount === 10 ? ok('10 Agents') : bad('Agents: ' + agentCount + ' (erwartet 10)');

// --- Gate 9: Lizenzen und Herkunft ---
console.log('\n=== Gate 9: Lizenzen/Herkunft ===');
const tplPath = REPO + '/THIRD-PARTY-LICENSES.md';
if (!fs.existsSync(tplPath)) {
  bad('THIRD-PARTY-LICENSES.md fehlt');
} else {
  const tpl = fs.readFileSync(tplPath, 'utf8');
  // Jede mitgelieferte Fremdkomponente muss namentlich in der Datei stehen.
  const mustName = ['node-pty', '@xterm/xterm', '@xterm/addon-fit', 'react', 'ccusage'];
  const unnamed = mustName.filter(n => !tpl.includes(n));
  unnamed.length ? bad('nicht in THIRD-PARTY-LICENSES.md: ' + unnamed.join(', '))
                 : ok(mustName.length + ' Fremdkomponenten benannt');
  /Permission is hereby granted/.test(tpl) ? ok('MIT-Volltext enthalten')
                                           : bad('MIT-Volltext fehlt in THIRD-PARTY-LICENSES.md');
}

// ccusage muss auf eine feste Version gepinnt sein — "@latest" bricht das Paket,
// sobald ccusage sein JSON-Format aendert.
const bundleSrc = fs.readFileSync(REPO + '/plugin/agentic-os/main.js', 'utf8');
const ccPins = bundleSrc.match(/ccusage@(?!latest)\d+\.\d+\.\d+/g) || [];
const ccLatest = (bundleSrc.match(/ccusage@latest/g) || []).length;
if (ccLatest > 0) bad('ccusage@latest im Bundle (' + ccLatest + 'x) — auf feste Version pinnen');
else if (ccPins.length === 0) bad('kein ccusage-Versionspin im Bundle gefunden');
else ok('ccusage gepinnt: ' + [...new Set(ccPins)].join(', '));

// Provenienz-Tabelle muss jeden Skill-Ordner kennen (sonst landet Fremdcode ungeprueft im ZIP).
// Nur im Produkt-Repo — das Community-Repo hat kein Release-ZIP und kein product/.
const provPath = REPO + '/product/SKILLS-PROVENANCE.md';
if (!hasProduct) {
  ok('Provenienz/bundle-manifest ohne product/ uebersprungen (Community-Repo)');
} else if (!fs.existsSync(provPath)) {
  bad('product/SKILLS-PROVENANCE.md fehlt');
} else {
  const prov = fs.readFileSync(provPath, 'utf8');
  const unlisted = skillDirs.filter(d => !prov.includes('`' + d + '`'));
  unlisted.length ? bad('Skills ohne Provenienz-Eintrag: ' + unlisted.join(', '))
                  : ok(skillDirs.length + ' Skills in SKILLS-PROVENANCE.md gelistet');
}

// bundle-manifest.json ist die Mechanik, SKILLS-PROVENANCE.md die Begruendung —
// driften die auseinander, landet Fremdcode im ZIP oder ein eigener Skill fehlt darin.
const bmPath = REPO + '/product/bundle-manifest.json';
if (!hasProduct) {
  // uebersprungen — Meldung kam schon beim Provenienz-Block
} else if (!fs.existsSync(bmPath)) {
  bad('product/bundle-manifest.json fehlt');
} else {
  const bm = JSON.parse(fs.readFileSync(bmPath, 'utf8'));
  const listed = bm.skillsBundled.concat(Object.keys(bm.skillsInstallTime).filter(k => k !== '_comment'));
  const fehlend = skillDirs.filter(d => !listed.includes(d));
  const geister = listed.filter(s => !skillDirs.includes(s));
  fehlend.length ? bad('Skills ohne bundle-manifest-Eintrag: ' + fehlend.join(', '))
                 : ok(skillDirs.length + ' Skills im bundle-manifest erfasst');
  if (geister.length) bad('bundle-manifest nennt nicht vorhandene Skills: ' + geister.join(', '));
  // Jeder gebundelte Skill muss in der Provenienz-Tabelle auch als bundle markiert sein.
  if (fs.existsSync(provPath)) {
    const provText = fs.readFileSync(provPath, 'utf8');
    const falschMarkiert = bm.skillsBundled.filter(s => {
      const zeile = provText.split('\n').find(l => l.includes('`' + s + '`'));
      return zeile && !/\|\s*bundle\s*\|?\s*$/.test(zeile.trim());
    });
    falschMarkiert.length
      ? bad('als bundle gepackt, aber nicht als bundle dokumentiert: ' + falschMarkiert.join(', '))
      : ok('bundle-manifest deckt sich mit SKILLS-PROVENANCE.md');
  }
}

// Die Statusline darf keinen fremden Workflow-Code mehr enthalten (GSD-Herkunft, Block 2).
const slPath = REPO + '/claude-setup/statusline/statusline.js';
const sl = fs.readFileSync(slPath, 'utf8');
const slForeign = ['gsd-hook-version', 'GSD', '.planning'].filter(m => sl.includes(m));
slForeign.length ? bad('Fremd-Marker in statusline.js: ' + slForeign.join(', '))
                 : ok('statusline.js frei von Fremd-Markern');

// --- Gate 10: Versions-Matrix ---
// Die Matrix ist nur etwas wert, wenn sie zum Code passt. Driftet sie ab, meldet
// compat-check beim Kaeufer einen Fehler, den es im Repo gar nicht gibt.
console.log('\n=== Gate 10: Versions-Matrix ===');
const pvPath = REPO + '/product/pinned-versions.json';
if (!hasProduct) {
  ok('ohne product/ uebersprungen (Community-Repo)');
} else if (!fs.existsSync(pvPath)) {
  bad('product/pinned-versions.json fehlt');
} else {
  const pv = JSON.parse(fs.readFileSync(pvPath, 'utf8'));

  // ccusage-Pin: Matrix gegen Bundle.
  const bundle = fs.readFileSync(REPO + '/plugin/agentic-os/main.js', 'utf8');
  const ccPin = pv.pinned && pv.pinned.ccusage && pv.pinned.ccusage.version;
  if (!ccPin) bad('kein ccusage-Pin in der Matrix');
  else if (bundle.includes('ccusage@' + ccPin)) ok('ccusage-Pin deckt sich mit dem Bundle: ' + ccPin);
  else bad('Matrix sagt ccusage@' + ccPin + ', im Bundle steht das nicht');

  // minAppVersion: Matrix gegen Plugin-Manifest.
  const mf = JSON.parse(fs.readFileSync(REPO + '/plugin/agentic-os/manifest.json', 'utf8'));
  const obsMin = pv.required && pv.required.obsidian && pv.required.obsidian.min;
  obsMin === mf.minAppVersion
    ? ok('obsidian minAppVersion deckt sich: ' + obsMin)
    : bad('Matrix sagt obsidian ' + obsMin + ', manifest.json sagt ' + mf.minAppVersion);

  // Marketplaces: Matrix gegen INSTALL.md (M6). Ein Eintrag, der nur an einer Stelle
  // steht, wird beim Pflegen zuverlaessig vergessen.
  const install = fs.readFileSync(REPO + '/INSTALL.md', 'utf8');
  const fehlendM6 = pv.marketplaces.entries
    .map(e => e.marketplace)
    .filter(m => !install.includes(m));
  fehlendM6.length
    ? bad('in der Matrix, aber nicht in INSTALL.md M6: ' + fehlendM6.join(', '))
    : ok(pv.marketplaces.entries.length + ' Marketplaces decken sich mit INSTALL.md');

  // PINNED-VERSIONS.md ist generiert — muss zur Matrix passen.
  try {
    execFileSync(process.execPath, [REPO + '/product/gen-pinned-doc.js', '--check'],
      { encoding: 'utf8', stdio: 'pipe' });
    ok('PINNED-VERSIONS.md ist aus der Matrix erzeugt und aktuell');
  } catch {
    bad('PINNED-VERSIONS.md weicht ab -> node product/gen-pinned-doc.js');
  }
}

console.log('\n' + (fail ? '### ' + fail + ' GATE(S) FEHLGESCHLAGEN' : '### ALLE GATES GRUEN'));
process.exit(fail ? 1 : 0);
