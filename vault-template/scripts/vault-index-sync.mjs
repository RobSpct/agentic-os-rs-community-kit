#!/usr/bin/env node
// Zweck: Wiki-Seiten ohne Zeile im Vault-Index finden und ergaenzen (bestehende Zeilen bleiben unangetastet).
// Kontext: `memory/project_vault_index_nutzen_beobachten.md` — Index ist Export-Artefakt fuer vault-export,
//          deshalb muss er vollstaendig sein; Lesen laeuft ueber Glob+Grep.
// Erstellt: 2026-08-04
//
// Aufruf (aus dem Vault-Root):
//   node scripts/vault-index-sync.mjs           fehlende Seiten eintragen
//   node scripts/vault-index-sync.mjs --check   nur melden, exit 1 wenn was fehlt (Automation)
//   node scripts/vault-index-sync.mjs --dir X   anderes Vault-Root (Default: cwd)
//
// Warum nur ergaenzen und nie ueberschreiben: die Zusammenfassungen im Index sind
// ueberwiegend handgeschrieben und praeziser als alles, was sich aus der Datei
// ableiten laesst. Vollgenerierung wuerde Kuratierung durch Auto-Text ersetzen.
// Neue Zeilen bekommen den ersten Absatz als Platzhalter — bewusst zum Nachschaerfen.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const dirFlag = args.indexOf('--dir');
const root = dirFlag !== -1 && args[dirFlag + 1] ? args[dirFlag + 1] : process.cwd();

const INDEX = join(root, 'index.md');
const WIKI = join(root, 'wiki');
const MAX_SUMMARY = 200;

if (!existsSync(INDEX) || !existsSync(WIKI)) {
  console.error(`Kein Vault unter "${root}" (erwartet index.md + wiki/). Aus dem Vault-Root aufrufen oder --dir setzen.`);
  process.exit(2);
}

/** Frontmatter-Block als Rohtext, oder '' wenn keiner da ist. */
function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : '';
}

/** tags: liegt in zwei Formen vor — inline `[a, b]` und Block-Liste `- a`. Beide muessen gehen. */
function parseTags(fm) {
  const inline = fm.match(/^tags:[ \t]*\[(.*?)\]/m);
  if (inline) {
    return inline[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  }
  const block = fm.match(/^tags:[ \t]*\r?\n((?:[ \t]*-[ \t]*.+\r?\n?)+)/m);
  if (block) {
    return block[1].split(/\r?\n/)
      .map(l => l.replace(/^[ \t]*-[ \t]*/, '').trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  return [];
}

function parseField(fm, name) {
  const m = fm.match(new RegExp(`^${name}:[ \\t]*(.+)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
}

/**
 * Platzhalter-Zusammenfassung: erster echter Absatz, ohne Ueberschrift/Zitat/Liste.
 * Pipes muessen escaped werden, sonst zerbricht die Markdown-Tabelle.
 */
function firstParagraph(text) {
  const body = text.replace(/^---[\s\S]*?\r?\n---\r?\n/, '');
  const para = body.split(/\r?\n\s*\r?\n/)
    .map(p => p.trim())
    .find(p => p && !p.startsWith('#') && !p.startsWith('>') && !p.startsWith('|') && !p.startsWith('-'));
  if (!para) return '(Zusammenfassung nachtragen)';
  let s = para.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (s.length > MAX_SUMMARY) s = s.slice(0, MAX_SUMMARY - 1).replace(/\s+\S*$/, '') + '…';
  return s.replace(/\|/g, '\\|');
}

const indexText = readFileSync(INDEX, 'utf8');
const eol = indexText.includes('\r\n') ? '\r\n' : '\n';
const lines = indexText.split(/\r?\n/);

// Welche Slugs stehen schon drin? Bewusst tolerant: [[wiki/x]] und [[wiki/x|Alias]].
const indexed = new Set();
for (const line of lines) {
  const m = line.match(/\[\[wiki\/([^\]|]+)(?:\|[^\]]*)?\]\]/);
  if (m) indexed.add(m[1].trim().replace(/\.md$/, ''));
}

const pages = readdirSync(WIKI).filter(f => f.endsWith('.md')).sort();
const missing = pages.map(f => basename(f, '.md')).filter(slug => !indexed.has(slug));

if (missing.length === 0) {
  console.log(`Index vollstaendig — ${pages.length} Wiki-Seiten, alle eingetragen.`);
  process.exit(0);
}

if (checkOnly) {
  console.log(`${missing.length} Wiki-Seite(n) ohne Index-Zeile:`);
  missing.forEach(s => console.log(`  wiki/${s}.md`));
  process.exit(1);
}

// Neue Zeilen bauen.
const rows = missing.map(slug => {
  const text = readFileSync(join(WIKI, slug + '.md'), 'utf8');
  const fm = frontmatter(text);
  const tags = parseTags(fm).join(', ');
  const created = parseField(fm, 'created');
  return `| [[wiki/${slug}]] | ${tags} | ${created} | ${firstParagraph(text)} |`;
});

// Einfuegen ans Ende der Tabelle, NICHT ans Dateiende — nach der Tabelle folgen
// weitere Sektionen (z.B. "## Scripts"), die nicht ueberrannt werden duerfen.
let lastRow = -1;
for (let i = 0; i < lines.length; i++) {
  if (/^\|\s*\[\[wiki\//.test(lines[i])) lastRow = i;
}
if (lastRow === -1) {
  console.error('Keine bestehende Tabellenzeile in index.md gefunden — Format unerwartet, nichts geaendert.');
  process.exit(2);
}

lines.splice(lastRow + 1, 0, ...rows);
writeFileSync(INDEX, lines.join(eol), 'utf8');

console.log(`${rows.length} Zeile(n) ergaenzt, ${indexed.size} bestehende unveraendert:`);
missing.forEach(s => console.log(`  + wiki/${s}`));
console.log('\nZusammenfassungen sind Platzhalter (erster Absatz) — bei Gelegenheit nachschaerfen.');
