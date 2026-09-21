# CLAUDE.md

Leitet Claude Code beim Arbeiten **an diesem Repo** an (nicht beim Installieren — das steht
in `INSTALL.md`).

## Was das ist

Die Community-Version eines kompletten Claude-Code-Setups: das Obsidian-Plugin **Agentic OS**
(Claude Code im eingebetteten Terminal, node-pty / ConPTY, Multi-Tab, Dashboard), ein
Second-Brain-Vault-Template, 19 kuratierte Skills, Hooks, Review-Agents und eine
CLAUDE.md-Vorlage. Ein User installiert das per Prompt in vier Stufen (FULL / MEDIUM / SMALL /
SKILLS-ONLY).

Basiert auf dem Plugin von Sebastian Kauffmann (skaile.de); Windows-Port, Dashboard-Features
und Paketierung von RobSpct. Lizenz MIT, siehe `LICENSE`.

## Projektstruktur

```
plugin/agentic-os/     Das Plugin (main.js minifiziert, manifest.json, styles.css, native/)
skills/                19 Skills → ~/.claude/skills (competitor-analysis: projekt-lokal)
claude-setup/          Globales Setup: CLAUDE.global.template.md, hooks/, agents/,
                       statusline/, settings.template.json, RTK.md
vault-template/        Second-Brain-Gerüst → Vault des Users
templates/             Config-Vorlagen (settings/projects/integrations/_categories/competitor)
skills-library/        Konzept-Doku: inaktive Skills auslagern
docs/                  README-Screenshots + Social Preview (aus HTML gerendert, s.u.)
INSTALL.md             Stufen-Installer (Prosa für Claude, KEIN Shell-Skript)
README.md              Einstieg für den User
WINDOWS-SETUP.md       Windows-Hintergrund + Troubleshooting
```

> **Kein `skills/`-Ordner im Plugin.** Der Plugin-Loader liest Skills ausschließlich aus
> `~/.claude/skills` + `~/.claude/plugins/cache/<id>/skills`. Die `skills/` hier sind ein
> getrennter Installations-Strang.

## Konventionen

**Platzhalter: ausschließlich `<<NAME>>`.** Vokabular: `<<HOME>>`, `<<VAULT_ROOT>>`,
`<<CLAUDE_DIR>>`, `<<NODE>>`, `<<PROJECT_NAME>>`. Kein `{{X}}`, kein `<You>`, kein `YOUR_*`
(letzteres nur in fremder API-Doku, die wir zitieren).

**Sprache:** Deutsch, Tech-Begriffe englisch.

**Der Installer ist Prosa, kein Skript.** `INSTALL.md` wird von Claude gelesen und agentisch
ausgeführt. Also: eindeutige Anweisungen, klare Reihenfolge, benannte Verifikationsschritte —
keine Bash-Einzeiler, die auf einer fremden Maschine raten müssen.

## Plugin patchen — Pflicht-Workflow

`main.js` ist minifiziert (~700 KB, praktisch eine Zeile). Patchen ist chirurgisch:

1. **Read-only analysieren** zuerst (Node-Snippet / Grep), Patch-Stelle finden.
2. **Anker aus der Datei selbst schneiden**, nicht aus dem Kopf nachbauen — Escapes in
   minifiziertem Code (`\\` vs. `\`) nachzubilden geht schief.
3. **Trefferzahl verifizieren** (i.d.R. == 1), sonst ABBRUCH.
4. **Klammer-Balance prüfen.** Ein Ausschnitt kann unbalanciert sein (z.B. Balance −1, weil er
   einen weiter oben geöffneten Block schließt). Der Ersatz muss dieselbe Balance haben.
5. **Vor dem Schreiben Syntax prüfen** (`new vm.Script(...)` auf dem Ergebnis) — nicht erst
   danach. Kaputte Datei gar nicht erst schreiben.
6. **Backup in den Scratchpad**, nicht ins Repo (`.bak` ist gitignored, aber der Working Tree
   soll sauber bleiben).
7. Schreiben als **UTF-8 ohne BOM**, LF-Zeilenenden. Nie OS-Copy-Befehle nutzen, die UTF-16
   oder CRLF erzeugen.
8. **`node --check main.js`** nach jedem Patch.

**Nicht blind Zeichen ersetzen.** Umlaute und Em-Dashes liegen korrekt als UTF-8 im Bundle;
was in mancher Konsole nach Mojibake aussieht, ist meist nur die Anzeige. Erst messen
(Codepoints ausgeben), dann fixen.

## Architektur-Kernpunkte

- **Workspaces:** cwd-Picker im „+"-Popup. Default: Home, Vault (dynamisch über
  `app.vault.adapter.getBasePath()`), Claude Root (`~/.claude`), neutral (Home).
- **Terminal-Spawn (Windows):** `claude.cmd` direkt spawnen scheitert (ERROR 193) → läuft über
  `cmd.exe /c claude.cmd <args>`.
- **ConPTY-Drain:** node-pty nutzt sonst `worker_threads.Worker`, im Obsidian-Renderer
  verboten → ersetzt durch Inline-Socket-Piping
  (`native/win32-x64/lib/windowsConoutConnection.js`).
- **Token-Bar:** `ccusage` via `npx` (Windows braucht `cmd.exe /c`-Wrap). Prozent =
  `verbraucht / tokenLimit5h` (Schätzkonstante, kein offizielles Limit).
- **Task-Roadmap / Kanban:** `TODO.md` je Projekt = Wahrheit → `aggregate.js` →
  `task-roadmap.json` (abgeleitet, nicht von Hand editieren). Registry:
  `<vault>/projects.json`. Status als `@status:`-Tag, `done` = `- [x]`.
- **Briefing:** liest `<Vault>/Briefings` (über `bi()`, den Vault-Helper des Bundles).
- **Jira-Autolink:** Domain und Project-Key kommen aus `integrations.json` über
  `readSettings()`, gecacht (5 s). Ohne aktivierte Jira-Integration wird nicht verlinkt.
- **Competitor:** projekt-lokaler Skill, Tab „COMPETITOR" mit Dropdown. Schema v2, defensiv
  gegen v1.

## Bekannte Tücken

- `.cmd` ist kein ausführbares PE → immer über `cmd.exe /c`.
- `npx`-Spawn ohne korrektes Shell-Handling → ENOENT (Token-Bar leer).
- `worker_threads` im Obsidian-Renderer verboten → „Failed to construct 'Worker'".
- ccusage rastert den 5h-Block auf volle Stunde → Reset-Zeit weicht von Claude.ai ab; ehrlich
  als Schätzung labeln.
- `templates/settings.json` und die `settingsDefaults()` im Bundle müssen dieselben
  `tabsVisible`-Schlüssel kennen, sonst verschwinden Tabs stillschweigend.

## README-Screenshots (`docs/`)

Das Dashboard ist ein Obsidian-Plugin ohne HTTP-Server — es lässt sich **nicht** wie eine
Web-App im Browser aufrufen und abfotografieren. Die Bilder in `docs/` entstehen deshalb aus
HTML-Dateien, die das echte `plugin/agentic-os/styles.css` einbinden und das Markup aus
`main.js` nachbauen (React mit Inline-Styles; Klassen wie `.tab`, `.kanban-card`, `.tool-card`
kommen aus dem Stylesheet). Gerendert wird per Chrome-Screenshot.

Daraus folgen zwei Regeln:

- **Farben und Maße nie von Hand erfinden.** Die Variablen stehen im Stylesheet
  (`--accent: #E23636`, `--bg: #0a0a0a`, `--border: #2a2a2a`). Ändert sich das Plugin-Styling,
  müssen die Screenshots neu gerendert werden, sonst zeigt die README einen Stand, den es
  nicht mehr gibt.
- **Nur Beispieldaten.** Keine echten Projektnamen, Pfade, Ticket-Keys oder Beträge —
  Gate 1 prüft nur Text, nicht Bildinhalte, und würde einen Leak im PNG nicht bemerken.

`social-preview.png` (1280×640) ist zusätzlich das Bild unter Repo-Settings → Social preview;
LinkedIn und andere Plattformen ziehen es beim Teilen des Links.

## Release-Hygiene

Vor jedem Push:

```bash
node scripts/release-gates.js
```

Prüft in acht Gates: Personendaten (Pfade, Projektnamen, Klarnamen — Attribution nur in
`LICENSE`/`README.md`/`CLAUDE.md`/`manifest.json` erlaubt), Platzhalter-Konvention, `node --check`
über alle eigenen `.js`/`.mjs`, JSON-Validität, BOMs, Deckung `skills/` ↔ `_categories.json`,
`tabsVisible`-Konsistenz zwischen Bundle und Template sowie die erwartete Repo-Struktur.
Exit-Code 1 bei jedem Fund.

Neue Ausnahmen sparsam ergänzen: Eine Ausnahme, die einen echten Leak durchlässt, ist teurer
als ein Fehlalarm, den man einmal von Hand prüft.

## Arbeitsweise

- **Erst planen, dann bauen** bei größeren Eingriffen — Optionen mit Trade-offs + Empfehlung.
- **Bei Fehlern:** ehrlich benennen → lösungsorientiert → Ursache festhalten.
- **Nie ins Live-Setup des Users schreiben.** `~/.claude`, `~/.claude.json` und der echte Vault
  sind beim Arbeiten an diesem Repo **read-only Quellen**. Geschrieben wird nur ins Repo, in
  den Scratchpad und in bewusst angelegte Testumgebungen.
- **Modular denken** — Features sollen auch für andere Setups sauber funktionieren.
