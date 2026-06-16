# CLAUDE.md

Leitet Claude Code beim Arbeiten am **Agentic OS** Plugin (Community-Template) an.

## Was das ist

**Agentic OS** ist ein Obsidian-Plugin, das **Claude Code in einem eingebetteten
Terminal** direkt in Obsidian betreibt (node-pty / ConPTY, Multi-Tab, Pop-out) — plus
ein Dashboard mit Skill-Launcher, Token-Bar, Task-Roadmap, Kanban-Board, Briefing-Tab
und Competitor-Cockpit. Basiert auf dem Plugin von Sebastian Kauffmann (skaile.de),
hier als selbst-installierbares Community-Template mit Windows-Port + Dashboard-Features.

Setup: siehe `INSTALL.md` (1-Prompt-Installation). Windows-Hintergrund: `WINDOWS-SETUP.md`.

## Tech Stack

| Layer | Technologie |
|---|---|
| Host | Obsidian Plugin API (Desktop-only, `isDesktopOnly:true`) |
| UI | React über jsx-runtime, gebündelt in **minifiziertem `main.js`** (eine Zeile) |
| Terminal | node-pty — Windows: ConPTY (`win32-x64` N-API-Binaries) |
| Styling | `styles.css` |
| Skills | liegen im Claude-Root (`~/.claude/skills`), NICHT im Plugin. Loader liest `~/.claude/skills` + Plugin-Caches zur Laufzeit. |
| Token-Bar | `ccusage` CLI via `npx` (5-Stunden-Block) |

## Projektstruktur

```
plugin/agentic-os/        Das Plugin (main.js, manifest.json, styles.css, native/)
skills/                   Skills für Briefing/Board/Competitor (→ ~/.claude/skills)
skills-library/           Lager-Konzept (inaktive Skills)
templates/                Config-Vorlagen (settings/projects/integrations/_categories/competitor-config)
INSTALL.md README.md WINDOWS-SETUP.md
```

> **Kein eingebetteter `skills/`-Ordner im Plugin.** Der Plugin-Loader liest Skills
> ausschließlich aus `~/.claude/skills` + `~/.claude/plugins/cache/<id>/skills`. Ein
> Plugin-eigener `skills/`-Ordner würde ignoriert. Die `skills/` in diesem Repo sind ein
> **getrennter Installations-Strang** (kommen in den Claude-Root, via `INSTALL.md`).

## Plugin patchen — Pflicht-Workflow

`main.js` ist minifiziert (~660 KB, eine Zeile). Patchen ist chirurgisch:

1. **Read-only analysieren** zuerst (Node-Snippet / Grep), Patch-Stelle finden.
2. **Byte-Replace mit eindeutigem Anker** — Trefferzahl **== 1** verifizieren, sonst ABBRUCH.
3. **Backup vor jedem Patch** (`main.js.bak`).
4. Schreiben als **UTF-8 ohne BOM** — sonst bricht das Bundle. Nie OS-Copy-Befehle für JS
   nutzen, die UTF-16/NUL erzeugen können.
5. **`node --check main.js`** nach jedem Patch — muss grün sein.

## Architektur-Kernpunkte

- **Workspaces:** cwd-Picker im „+"-Popup. Default-Workspaces: **Home** + **Vault** (dynamisch
  über den Obsidian-Vault-Pfad) + Claude Root (`~/.claude`). Workspace ist ein freier String —
  eigene cwd-Zweige im Resolver ergänzbar.
- **Terminal-Spawn (Windows):** `claude.cmd` direkt spawnen scheitert (ERROR 193) → läuft über
  `cmd.exe /c claude.cmd <args>`.
- **ConPTY-Drain:** node-pty nutzt sonst `worker_threads.Worker`, was im Obsidian-Renderer
  verboten ist → ersetzt durch Inline-Socket-Piping (`native/win32-x64/lib/windowsConoutConnection.js`).
- **Token-Bar:** `ccusage` via `npx` (Windows braucht `cmd.exe /c`-Wrap). Prozent =
  `verbraucht / tokenLimit5h` (Schätzkonstante in `settings.json`, kein offizielles Limit).
- **Task-Roadmap / Kanban:** `TODO.md` je Projekt = Wahrheit → `aggregate.js` → `task-roadmap.json`
  (abgeleitet, nicht von Hand editieren). Registry: `<vault>/projects.json`. Status als
  `@status:`-Tag in der TODO.md-Zeile, `done` = `- [x]`.
- **Competitor:** projekt-lokaler Skill (`<projekt>/.claude/skills/competitor-analysis/`),
  Tab „COMPETITOR" mit Dropdown. Schema v2, defensiv gegen v1.

## Bekannte Tücken

- `.cmd` ist kein ausführbares PE → immer über `cmd.exe /c`.
- `npx`-Spawn ohne korrektes Shell-Handling → ENOENT (Token-Bar leer).
- `worker_threads` im Obsidian-Renderer verboten → „Failed to construct 'Worker'".
- ccusage rastert den 5h-Block auf volle Stunde → Reset-Zeit weicht von Claude.ai ab; ehrlich
  als Schätzung labeln.

## Second Brain — Vault-Regeln (Empfehlung)

Wenn du Agentic OS als persönliches Second Brain nutzt, lege im Vault eine Wissens-Struktur an
und pflege sie:

- **Query** — bei Wissensfragen zuerst den Vault durchsuchen (Glob + Grep), nicht aus Erinnerung.
- **Ingest** — neues Wissen ablegen (z.B. `raw/<thema>-<datum>.md` immutable Quelle,
  `wiki/<thema>.md` gepflegte Seite mit Frontmatter + `[[wikilinks]]`, Index aktualisieren).
- **Lint** — auf Widersprüche, Veraltetes, verwaiste Seiten, broken wikilinks prüfen.

So bleibt der Vault die persistente Wissensquelle über Sessions hinweg.

## Arbeitsweise

- **Erst planen, dann bauen** bei größeren Eingriffen — Optionen mit Trade-offs + Empfehlung,
  Approval abwarten.
- **Bei Fehlern:** ehrlich + direkt benennen → lösungsorientiert → Ursache festhalten.
- **Backups vor riskanten Schritten**, nichts Unwiederbringliches ohne OK.
- **Modular denken** — Features sollen auch für andere Projekte sauber gehen.
