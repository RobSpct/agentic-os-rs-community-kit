#!/usr/bin/env node
// Memory-Tags-Guard — PreToolUse hook (Write + Edit)
// Erzwingt die Projekt-Tag-Pflicht aus der Vault-CLAUDE.md technisch:
// jede Memory- oder Wiki-Datei (<Vault>/memory/*.md, <Vault>/wiki/*.md)
// muss ein befuelltes Top-Level `tags:`-Feld im Frontmatter haben. Das
// Harness-Memory-Template kennt kein tags:-Feld — ohne Guard vergisst jede
// Session es wieder und die Nightly-Curation meldet den fehlenden Tag jede
// Nacht neu.
//
// Edit wird mitgeprueft: der Auto-Memory-Writer aktualisiert bestehende
// Eintraege per Edit, wodurch ein vorhandener Tag wieder rausfallen kann.
// Geprueft wird der RESULTIERENDE Inhalt (alte Datei + Ersetzung), nicht
// der Patch — ein Edit an einer ohnehin getaggten Datei laeuft also durch.
//
// Zweiter Fallstrick, den die Deny-Message benennt: `tags:` eingerueckt
// unter `metadata:` zaehlt nicht. Obsidian liest nur Top-Level-Properties, ein
// verschachteltes tags: erzeugt weder Tag-Chip noch Graph-Node.

const path = require('path');
const fs = require('fs');

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input.replace(/^﻿/, ''));
    const tool = data.tool_name;
    if (tool !== 'Write' && tool !== 'Edit') process.exit(0);

    const fp = (data.tool_input?.file_path || '').replace(/\\/g, '/');
    // Vault-Pfad aus der Umgebung statt festem Ordnernamen (settings.json -> env.AGENTICOS_VAULT).
    const vault = (process.env.AGENTICOS_VAULT || '').replace(/\\/g, '/').replace(/\/+$/, '');
    if (vault.length === 0) process.exit(0);
    if (!fp.toLowerCase().startsWith(vault.toLowerCase() + '/')) process.exit(0);
    if (!/\/(memory|wiki)\/[^/]+\.md$/i.test(fp)) process.exit(0);
    const base = path.basename(fp);
    if (base === 'MEMORY.md') process.exit(0);

    // Bei Write steht der komplette neue Inhalt im Payload. Bei Edit muss er
    // rekonstruiert werden: Datei von Platte lesen und die Ersetzung anwenden.
    // Jeder Unsicherheitsfall (Datei fehlt, old_string trifft nicht) laeuft
    // fail-open durch — der Guard blockiert nie auf Verdacht.
    let content;
    if (tool === 'Write') {
      content = data.tool_input?.content || '';
    } else {
      const oldStr = data.tool_input?.old_string;
      const newStr = data.tool_input?.new_string;
      if (typeof oldStr !== 'string' || typeof newStr !== 'string') process.exit(0);
      let current;
      try {
        current = fs.readFileSync(data.tool_input.file_path, 'utf8');
      } catch (_) {
        process.exit(0);   // neue Datei per Edit gibt es nicht — nichts zu pruefen
      }
      if (!current.includes(oldStr)) process.exit(0);
      content = data.tool_input?.replace_all
        ? current.split(oldStr).join(newStr)
        : current.replace(oldStr, newStr);
    }
    content = content.replace(/^﻿/, '');

    const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const fmBody = fm ? fm[1] : '';
    const tagMatch = fmBody.match(/^tags:\s*(\[.*?\])?\s*$/m);
    const hasInline = tagMatch && tagMatch[1] && tagMatch[1].replace(/[\[\]\s]/g, '').length > 0;
    const hasList = /^tags:[^\S\r\n]*\r?\n[^\S\r\n]+- \S/m.test(fmBody);
    if (hasInline || hasList) process.exit(0);

    // Steht tags: eingerueckt (typisch: unter metadata:), ist das eine andere
    // Fehlerursache als "fehlt komplett" — und verlangt eine andere Korrektur.
    const nested = fmBody.match(/^[ \t]+tags:[ \t]*(?:\[(.*?)\][ \t]*)?$/m);
    let nestedValues = [];
    if (nested) {
      if (nested[1]) {
        nestedValues = nested[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      } else {
        const block = fmBody.match(/^[ \t]+tags:[ \t]*\r?\n((?:[ \t]+- .*\r?\n?)+)/m);
        if (block) {
          nestedValues = block[1].split(/\r?\n/)
            .map(s => s.replace(/^[ \t]*-[ \t]*/, '').trim().replace(/^["']|["']$/g, ''))
            .filter(Boolean);
        }
      }
    }

    const prefix = base.match(/^project_([a-z0-9-]+)_/i);
    const suggestion = prefix ? prefix[1].toLowerCase() : '<projekt-kuerzel> | cross-projekt';
    const verb = tool === 'Edit' ? 'Edit' : 'Write';

    const reason = nested
      ? 'Projekt-Tag-Pflicht (Vault-CLAUDE.md): das tags:-Feld steht EINGERUECKT (unter metadata:), ' +
        'nicht auf Top-Level. Obsidian liest nur Top-Level-Properties — verschachtelt erzeugt es weder ' +
        'Tag-Chip noch Graph-Node. metadata: unangetastet lassen und zusaetzlich auf Spalte 0 ergaenzen:\n' +
        'tags:\n' + (nestedValues.length ? nestedValues.map(t => '  - ' + t.toLowerCase()).join('\n')
                                          : '  - ' + suggestion) + '\n' +
        '(Tag-Schema klein halten: <projekt-kuerzel> | cross-projekt).'
      : 'Projekt-Tag-Pflicht (Vault-CLAUDE.md): Memory-/Wiki-Eintrag ohne befuelltes ' +
        'Top-Level tags:-Feld im Frontmatter. Ergaenze vor dem erneuten ' + verb + ' z.B.:\n' +
        'tags:\n  - ' + suggestion + '\n' +
        '(zusaetzlich zu name/description/metadata; Querschnitts-Eintraege bekommen cross-projekt).';

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason
      }
    }));
  } catch (e) {
    process.exit(0);
  }
});
