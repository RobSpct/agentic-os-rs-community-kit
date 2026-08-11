#!/usr/bin/env node
// Memory-Tags-Guard — PreToolUse hook (Write)
// Erzwingt die Projekt-Tag-Pflicht aus AgenticOS/CLAUDE.md technisch:
// jede NEUE Memory- oder Wiki-Datei (<Vault>/memory/*.md, <Vault>/wiki/*.md)
// muss ein befuelltes Top-Level `tags:`-Feld im Frontmatter haben. Das
// Harness-Memory-Template kennt kein tags:-Feld — ohne Guard vergisst jede
// Session es wieder und die Nightly-Curation meldet den fehlenden Tag jede
// Nacht neu. Nur Write (neue Dateien/Rewrites); Edit bleibt frei.

const path = require('path');

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input.replace(/^﻿/, ''));
    if (data.tool_name !== 'Write') process.exit(0);

    const fp = (data.tool_input?.file_path || '').replace(/\\/g, '/');
    // Vault-Pfad aus der Umgebung statt festem Ordnernamen (settings.json -> env.AGENTICOS_VAULT).
    const vault = (process.env.AGENTICOS_VAULT || '').replace(/\\/g, '/').replace(/\/+$/, '');
    if (vault.length === 0) process.exit(0);
    if (!fp.toLowerCase().startsWith(vault.toLowerCase() + '/')) process.exit(0);
    if (!/\/(memory|wiki)\/[^/]+\.md$/i.test(fp)) process.exit(0);
    const base = path.basename(fp);
    if (base === 'MEMORY.md') process.exit(0);

    const content = (data.tool_input?.content || '').replace(/^﻿/, '');
    const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const fmBody = fm ? fm[1] : '';
    const tagMatch = fmBody.match(/^tags:\s*(\[.*?\])?\s*$/m);
    const hasInline = tagMatch && tagMatch[1] && tagMatch[1].replace(/[\[\]\s]/g, '').length > 0;
    const hasList = /^tags:[^\S\r\n]*\r?\n[^\S\r\n]+- \S/m.test(fmBody);
    if (hasInline || hasList) process.exit(0);

    const prefix = base.match(/^project_([a-z0-9-]+)_/i);
    const suggestion = prefix ? prefix[1].toLowerCase() : '<projekt-kuerzel> | cross-projekt';
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: 'Projekt-Tag-Pflicht (AgenticOS/CLAUDE.md): Memory-/Wiki-Eintrag ohne befuelltes ' +
          'Top-Level tags:-Feld im Frontmatter. Ergaenze vor dem erneuten Write z.B.:\n' +
          'tags:\n  - ' + suggestion + '\n' +
          '(zusaetzlich zu name/description/metadata; Querschnitts-Eintraege bekommen cross-projekt).'
      }
    }));
  } catch (e) {
    process.exit(0);
  }
});
