# Agentic OS RS Community Kit — das komplette Claude-Code-Setup

Ein komplettes, sofort nutzbares Claude-Code-Setup: **Claude Code in einem eingebetteten
Terminal in Obsidian**, ein Dashboard drumherum, ein Second Brain mit Auto-Memory, kuratierte
Skills, Hooks und Review-Agents.

Installiert wird es von Claude Code selbst — du sagst einen Satz, beantwortest ein paar Fragen,
fertig.

> Basiert auf dem Obsidian-Plugin „Agentic OS" von Sebastian Kauffmann
> ([skaile.de](https://skaile.de), [Original-Repo](https://github.com/sebaskauf/agentic-os)).
> Diese Distribution ergänzt einen Windows-Port (ConPTY) — macOS läuft weiterhin —,
> mehrere Dashboard-Features, das Second-Brain-Setup und die Paketierung als Template.

---

## Installation — ein Prompt

Öffne Claude Code in einem beliebigen Ordner und sag:

> **„Klone https://github.com/RobSpct/agentic-os-rs-community-kit, lies INSTALL.md
> und richte das Setup bei mir ein."**

Claude klont das Repo, fragt dich **welche Stufe** du willst, und arbeitet den Rest ab.

Alternativ selbst klonen, Claude Code im Ordner öffnen und sagen:
„Lies INSTALL.md und richte das Setup bei mir ein."

## Die vier Stufen

| Stufe | Obsidian-UI | Second Brain | Skills | Globale Config |
|---|:---:|:---:|:---:|:---:|
| **FULL** | ✅ | ✅ | ✅ 19 | ✅ CLAUDE.md, Hooks, Agents, MCPs |
| **MEDIUM** | ✅ | ✅ | — | nur Memory-Hooks |
| **SMALL** | ✅ | — | — | — |
| **SKILLS-ONLY** | — | — | ✅ einzeln wählbar | — |

Die **Tooling-Plugins** (Superpowers, GSD, Ponytail, Caveman, context-mode, claude-mem u.a.)
sind in jeder Stufe eine eigene Ja/Nein-Frage am Ende.

Unsicher? **FULL** nehmen. Alles ist einzeln abwählbar, und der Installer fragt vor jedem
Eingriff in bestehende Dateien.

---

## Was drin ist

### Obsidian-UI (`plugin/agentic-os/`)

| Feature | Was es tut |
|---|---|
| **Terminal** | Claude Code als Multi-Tab-Terminal in Obsidian (node-pty / ConPTY), Pop-out, Workspace-Picker |
| **Skill-Launcher** | Deine `~/.claude/skills` als klickbare Matrix, nach Kategorie gruppiert |
| **Token-Bar** | 5-Stunden-Verbrauch via `ccusage`, Prozent gegen ein anpassbares Limit |
| **Task-Roadmap** | Offene To-Dos aller Projekte als Baum. `TODO.md` je Projekt ist die Wahrheit |
| **Kanban-Board** | Drag-&-Drop mit Scrum-Tags (`@id`/`@epic`/`@sprint`/`@jira`/`@branch`/`@pr`) |
| **Briefing** | Tages-Briefing aus dem Vault als abhakbare Liste |
| **Vault-Health** | Offene Punkte der Nightly Curation, direkt abarbeitbar |
| **Competitor** | Mitbewerber-Analyse mit Threat-Score und Radar (skill-gestützt) |

### Second Brain (`vault-template/`)

Ein Vault-Gerüst mit klarer Arbeitsteilung: `raw/` für unveränderliche Quellen, `wiki/` für
kuratiertes Wissen, `memory/` für Cross-Session-Fakten. Dazu die Regeln, nach denen Claude das
pflegt (Ingest / Query / Lint), und zwei Hooks, die die Disziplin erzwingen statt sie nur zu
empfehlen — einer blockt Notizen ohne Tags, einer verlinkt Erwähnungen automatisch.

### Skills (`skills/`)

19 kuratierte Skills — Recherche (`tiefe-recherche`, `agent-reach`, `summarize`), Vault-Arbeit
(`vault-notiz`, `vault-export`, `vault-health-abarbeiten`), Entscheidungen (`council`,
`llm-council`), Bauen (`claude-api`, `mcp-builder`, `skill-creator`) und mehr. Vollständige
Liste mit Voraussetzungen: [`INSTALL.md`](INSTALL.md), Modul M5.

### Globale Config (`claude-setup/`)

Die `CLAUDE.md`-Vorlage mit Memory-Routing und Skill-Routing, 13 Hooks (darunter zwei
scharfe Gates: `skill-gate` erzwingt Process-Skills vor großen Code-Änderungen,
`review-gate` erzwingt den Security-Review vor Turn-Ende), 10 Review-Agents
(TypeScript, React, Security, Performance …), eine Statusline und ein `settings.json`-Template.
Der Installer **mergt** in eine vorhandene Konfiguration, statt sie zu ersetzen.

---

## Repo-Struktur

```
plugin/agentic-os/   Das Obsidian-Plugin (main.js, manifest.json, styles.css, native/)
skills/              19 kuratierte Skills → ~/.claude/skills
claude-setup/        Globales Setup: CLAUDE.md-Vorlage, Hooks, Agents, settings-Template
vault-template/      Second-Brain-Gerüst → dein Obsidian-Vault
templates/           Config-Vorlagen (Dashboard, Projekt-Registry, Integrationen)
skills-library/      Konzept: inaktive Skills auslagern statt löschen
INSTALL.md           Die Installationsanleitung, die Claude abarbeitet
WINDOWS-SETUP.md     Windows-Hintergrund + Troubleshooting
```

## Voraussetzungen

- **Claude Code CLI** auf dem PATH
- **Node.js**
- **Obsidian** (Desktop) — nur für die Stufen mit UI, das Plugin ist Desktop-only
- Optional: `ccusage` (Token-Bar), Web-Suche (Recherche- und Competitor-Skills)

## Plattformen

**Windows** ist der getestete Pfad — der ConPTY-Port, `.cmd`-Spawn über `cmd.exe /c` und das
`npx`-Shell-Handling stecken bereits im Bundle. Hintergrund und Troubleshooting:
[`WINDOWS-SETUP.md`](WINDOWS-SETUP.md).

**macOS** wird mitgeliefert (die node-pty-Binaries für `darwin-arm64` und `darwin-x64` sind
enthalten) und sollte funktionieren, ist aber nicht durchgetestet — Rückmeldungen willkommen.

## Lizenz

MIT, siehe [`LICENSE`](LICENSE).

Plugin-Grundlage © Sebastian Kauffmann — [sebaskauf/agentic-os](https://github.com/sebaskauf/agentic-os),
ebenfalls MIT. Windows-Port, Dashboard-Features und Community-Paketierung von RobSpct.
