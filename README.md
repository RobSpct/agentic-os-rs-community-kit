# Agentic OS — Claude Code im Obsidian-Terminal (Windows + macOS)

Ein Obsidian-Plugin, das **Claude Code in einem eingebetteten Terminal** direkt in
Obsidian betreibt — plus ein Dashboard, das deine Arbeit zum Kommandozentrum macht.
Diese Version ist ein **Community-Template**: ein frischer Claude Code richtet es dir
mit **einem Prompt** ein.

> Basiert auf dem Plugin „Agentic OS" von Sebastian Kauffmann ([skaile.de](https://skaile.de)).
> Diese Distribution ergänzt einen **Windows-Port** (ConPTY) und mehrere Dashboard-Features
> und macht alles als selbst-installierbares Template nutzbar.

---

## Quickstart — ein Prompt

1. Dieses Repo klonen oder herunterladen.
2. Claude Code **in diesem Ordner** öffnen.
3. Diesen Prompt eingeben:

   > **„Lies INSTALL.md und richte AgenticOS bei mir ein."**

Claude liest [`INSTALL.md`](INSTALL.md), fragt dich das Nötige (Vault-Pfad, deine
Projekte, Skill-Struktur) und installiert Plugin, Skills und Config. Du musst sonst
nichts von Hand machen.

> Lieber selbst Hand anlegen? `INSTALL.md` ist auch für Menschen lesbar — Schritt 1–8.

---

## Features

| Feature | Was es tut |
|---|---|
| **Terminal** | Claude Code als Multi-Tab-Terminal in Obsidian (node-pty / ConPTY), Pop-out, Workspace-Picker (Home / Vault). |
| **Skill-Launcher** | Deine `~/.claude/skills` als klickbare Matrix, gruppiert nach Familie/Kategorie. |
| **Token-Bar** | 5-Stunden-Token-Verbrauch via `ccusage` (Prozent gegen anpassbares Limit). |
| **Task-Roadmap** (ÜBERSICHT) | Offene To-Dos aller Projekte als aufklappbarer Baum. `TODO.md` je Projekt = Wahrheit. |
| **Kanban-Board** (BOARD) | Drag-&-Drop-Board mit Scrum-Tags (`@id`/`@epic`/`@sprint`/`@jira`/`@branch`/`@pr`). |
| **Briefing** (BRIEFING) | Tägliches E-Mail-Briefing als abhakbare Handlungsliste (Skill-gestützt). |
| **Competitor-Cockpit** (COMPETITOR) | Projekt-relative Mitbewerber-Analyse mit Threat-Score + Radar (Skill-gestützt). |
| **Graph + Settings** | Vault-Graph-Widget; Settings-Tab für Akzentfarbe, Tabs, Integrationen. |

---

## Was drin ist

```
plugin/agentic-os/      Das fertige Plugin (main.js, manifest.json, styles.css,
                        native/ für macOS + Windows). Bereits Windows-gepatcht.
skills/                 Die Skills, die Briefing / Board / Competitor brauchen.
                        Kommen nach ~/.claude/skills (Competitor projekt-lokal).
skills-library/         Erklärt das „Lager"-Konzept (inaktive Skills auslagern).
templates/              Config-Vorlagen (settings.json, projects.json, … mit Platzhaltern).
INSTALL.md              Die 1-Prompt-Installationsanleitung (von Claude abarbeitbar).
WINDOWS-SETUP.md        Erklärt die Windows-Fixes, die im Bundle bereits stecken (+ Troubleshooting).
CLAUDE.md               Projekt-Kontext für Claude beim Arbeiten am Plugin.
```

## Voraussetzungen

- **Obsidian** (Desktop) — Plugin ist Desktop-only.
- **Claude Code CLI** auf dem PATH.
- **Node.js** (für den Task-Roadmap-Aggregator).
- Optional: `ccusage` (Token-Bar), Gmail-/Calendar-MCP (Briefing), Web-Search (Competitor).

## Windows

Das ausgelieferte Bundle ist **bereits Windows-tauglich** — du musst nichts patchen.
Was unter Windows nötig war (ConPTY-Drain ohne `worker_threads`, `.cmd`-Spawn via
`cmd.exe /c`, `npx`-Shell-Handling) steckt schon drin. Hintergrund + Troubleshooting:
[`WINDOWS-SETUP.md`](WINDOWS-SETUP.md).

## Lizenz / Attribution

Plugin-Grundlage © Sebastian Kauffmann (skaile.de). Windows-Port + Dashboard-Features
als Community-Distribution. Skills und Templates sind frei anpassbar.
