---
name: task-roadmap
description: Aktualisiert die "Task Roadmap" im Agentic-OS-Dashboard — sammelt offene To-Dos aller registrierten Projekte (projects.json → je TODO.md) und schreibt das Anzeige-Modell task-roadmap.json in den Vault. Trigger DE 'task roadmap', 'roadmap aktualisieren', 'aufgaben einsammeln', 'projekt-todos aktualisieren', 'task liste aktualisieren'. Trigger EN 'task roadmap', 'refresh roadmap', 'update task roadmap', 'aggregate project todos'. Auch wenn der User fragt, warum eine Projekt-Aufgabe nicht im Dashboard auftaucht.
---

# Task Roadmap — Aggregator

Sammelt offene Aufgaben aus allen registrierten Projekten ein und füllt damit das
verschachtelte "Task Roadmap"-Widget im Agentic-OS-Obsidian-Dashboard.

## Architektur (wie es zusammenhängt)

```
projects.json   ──►  aggregate.js  ──►  task-roadmap.json  ──4s──►  Dashboard-Baum
(Registry)           (dieser Skill)     (Anzeige-Modell)            (Projekt▸Ampel▸To-Do)
   ▲
   └─ je Projekt eine TODO.md (kanonische Quelle, vom User/session-uebergabe gepflegt)
```

- **Registry:** `<<VAULT_ROOT>>/projects.json` — Liste der Projekte:
  ```json
  [ { "name": "MyProject", "key": "PROJ", "emoji": "🚀", "todo": "<<HOME>>/Dev/MyProject/TODO.md" } ]
  ```
  `key` = Issue-Key-Prefix für die stabilen Ticket-IDs (`@id:KEY-N`, JIRA-nah). Fehlt `key`,
  wird er aus `name` abgeleitet (Uppercase, gekürzt).
- **Pro Projekt `TODO.md`:** Ampel-Sektionen + Checkboxen:
  ```markdown
  ## 🔴 Kritisch
  - [ ] offene Aufgabe
  - [x] erledigt
  ## 🟡 Wichtig
  - [ ] ...
  ## 🟢 Nice-to-have
  - [ ] ...
  ```
  Erkannte Ampeln: 🔴/Kritisch/Muss, 🟡/Wichtig/Sollte, 🟢/Nice/Optional. Checkboxen ohne
  Sektion landen unter 🟡.
- **Anzeige-Modell:** `<<VAULT_ROOT>>/task-roadmap.json` (wird generiert, nicht
  von Hand editieren). Abhaken im Dashboard schreibt `done` hierhin zurück; ein erneuter Lauf
  bewahrt diesen Status (gleiche Task-ID).

## Inline-Tags (Scrum / GitHub-Kette)

Eine `TODO.md`-Zeile = ein Ticket. Tags hängen ans Zeilenende, werden aus dem Anzeige-Text
gelöst und separat als Felder getragen. Alle optional — außer `@id:`, das der Aggregator
automatisch vergibt.

| Tag | Beispiel | Feld im JSON | Zweck |
|---|---|---|---|
| `@id:` | `@id:PROJ-42` | `id` | **Stabile Ticket-ID** (Prefix aus `projects.json/key`). Wird **auto-vergeben** und in die TODO.md zurückgeschrieben, wenn sie fehlt. Überlebt Textänderungen → Klammer für JIRA + GitHub. |
| `@status:` | `@status:in-progress` | `status` | Kanban-Spalte (`backlog`/`todo`/`in-progress`/`done`). `[x]` = done. |
| `@epic:` | `@epic:legal` | `epic` | Epic-Zuordnung (Board-Gruppierung). |
| `@story:` | `@story:dsgvo` | `story` | Story-Zuordnung. |
| `@sprint:` | `@sprint:2026-S1` | `sprint` | Sprint — **Board-Filter + Sprint-Gruppierung**. |
| `@jira:` | `@jira:PROJ-7` | `jiraKey`/`jiraUrl` | JIRA-Issue-Key (Link aus `integrations.json/jira.domain`). |
| `@branch:` | `@branch:feat/x` | `branch`/`branchUrl` | GitHub-Branch (Link aus `github.repo`). |
| `@pr:` | `@pr:42` | `prNumber`/`prUrl` | GitHub-Pull-Request. |
| `@commit:` | `@commit:abc1234` | `commits[]` | GitHub-Commit(s), mehrere erlaubt. |

GitHub/JIRA-Links werden ohne API aus `integrations.json` (`github.repo` = `owner/repo`,
`jira.domain`) abgeleitet. Fehlt repo/domain → Badge ohne Link. Verknüpfungs-Tags in der
TODO.md **schlagen** den Vorlauf-JSON-Stand; ohne Tag bleibt ein per Sync gesetzter Wert erhalten.

> **Stabilität:** Vor der ersten `@id:`-Vergabe legt der Aggregator je TODO.md ein `TODO.md.bak`
> an. Zweiter Lauf ist idempotent (vergibt nichts neu, schreibt nicht).

## Wann ausführen

- Manuell auf Zuruf (`/task-roadmap`, "roadmap aktualisieren").
- Automatisch beim Claude-SessionStart im Agentic-OS-Terminal (Hook in settings.json ruft
  dasselbe Script).

## Ausführung

Führe das Aggregator-Script aus (deterministisch, idempotent, kein LLM nötig):

```bash
node "<<CLAUDE_DIR>>/skills/task-roadmap/aggregate.js"
```
(`<<CLAUDE_DIR>>` = dein Claude-Ordner, z.B. `C:/Users/<dein-name>/.claude` bzw. `~/.claude`.)

Danach kurz bestätigen: wie viele Projekte/Aufgaben eingesammelt wurden (Script gibt eine
Zeile aus) und dass das Dashboard binnen ~4 s aktualisiert.

## Neues Projekt hinzufügen

1. `projects.json` um einen Eintrag ergänzen (name, emoji, absoluter Pfad zur TODO.md).
2. Im Projekt eine `TODO.md` mit Ampel-Sektionen + `- [ ]` anlegen.
3. Script laufen lassen → erscheint als neuer Ast im Dashboard-Baum.

## Pflege der Projekt-TODO.md (Konvention)

- Quelle der Wahrheit für offene Aufgaben eines Projekts ist dessen `TODO.md`.
- `session-uebergabe` soll am Ende einer Projekt-Session diese `TODO.md` aktualisieren
  (neue offene Punkte eintragen, erledigte auf `- [x]` setzen) — so bleibt die Roadmap
  ohne Handarbeit aktuell.
