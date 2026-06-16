# INSTALL.md — Agentic OS automatisch einrichten

> **An Claude Code:** Diese Datei ist eine Schritt-für-Schritt-Anleitung, die DU
> abarbeitest, um das Agentic-OS-Plugin beim User einzurichten. Arbeite sie von oben
> nach unten ab. Wo `<<PLATZHALTER>>` steht, frage den User. Mache nichts
> Irreversibles ohne OK. Am Ende steht ein Verifikations-Block — führe ihn aus und
> melde das Ergebnis.
>
> **An den User:** Du musst das hier **nicht** selbst lesen. Öffne Claude Code in
> diesem Ordner und sag einfach:
> **„Lies INSTALL.md und richte AgenticOS bei mir ein."**
> Claude fragt dich beim Setup das Nötige (Vault-Pfad, Skill-Struktur) und macht den Rest.

---

## Was Agentic OS ist

Ein Obsidian-Plugin, das **Claude Code in einem eingebetteten Terminal** direkt in
Obsidian betreibt (Multi-Tab, Pop-out) — plus ein Dashboard mit Skill-Launcher,
Token-Bar, Task-Roadmap, Kanban-Board, Briefing-Tab und Competitor-Cockpit. Läuft
auf **macOS und Windows** (Windows via ConPTY, bereits gepatchtes Bundle — kein
manuelles Patchen nötig).

## Voraussetzungen (prüfen, NICHT automatisch installieren)

Prüfe und melde dem User, was fehlt:

1. **Obsidian** (Desktop) installiert. Plugin ist `isDesktopOnly`.
2. **Claude Code CLI** auf dem PATH (`claude --version` läuft in PowerShell/Terminal).
   Ohne das öffnet das Plugin-Terminal leer — egal was sonst stimmt.
3. **Node.js** (`node --version`) — für den Task-Roadmap-Aggregator (`aggregate.js`).
4. **Optional** (Features funktionieren auch ohne, melde nur als Hinweis):
   - `ccusage` via `npx` — Token-Bar (wird beim ersten Lauf via `npx -y ccusage@latest` geholt).
   - Gmail-/Calendar-MCP (claude.ai-Connector) — Briefing-/Posteingang-Skills.
   - Web-Search/Fetch — Competitor-Analyse (`ctx_fetch_and_index` / WebSearch).

---

## Schritt 1 — Vault-Pfad erfragen

Frage den User nach seinem **Obsidian-Vault-Pfad** (`<<VAULT_ROOT>>`), z.B.
`C:\Users\<Name>\MeinVault` (Windows) oder `~/MeinVault` (macOS). Das ist der Ordner,
der `.obsidian/` enthält. Wenn unklar: User soll in Obsidian unter
*Einstellungen → Über → Vault-Pfad öffnen* nachsehen.

Merke dir auch das **User-Home** (`<<HOME>>`): Windows `C:\Users\<Name>`, macOS/Linux `~`.

## Schritt 2 — Plugin installieren

Kopiere den **gesamten** Ordner `plugin/agentic-os/` (aus diesem Repo) nach:

```
<<VAULT_ROOT>>/.obsidian/plugins/agentic-os/
```

Das enthält `main.js`, `manifest.json`, `styles.css` und `native/` (macOS- +
Windows-Binaries). **Lege `.obsidian/plugins/` an, falls es fehlt.** Überschreibe
keine vorhandene `data.json` (User-Settings) — falls dort schon ein `agentic-os`
liegt, frage den User, ob überschrieben werden soll.

## Schritt 3 — Agentic-OS-Config anlegen (`~/.agentic-os/`)

Lege den Ordner `<<HOME>>/.agentic-os/` an und kopiere dorthin:

- `templates/settings.json` → `<<HOME>>/.agentic-os/settings.json`

Frage den User, ob er die **Akzentfarbe** (`accent`, Default `#E23636`) ändern will —
sonst Default lassen. `tokenLimit5h` (35 Mio.) ist eine Schätzkonstante für die
Token-Bar; als anpassbar erwähnen, nicht zwingend ändern.

## Schritt 4 — Vault-Dateien anlegen (Board + Briefing)

Im Vault-Root (`<<VAULT_ROOT>>/`):

1. `templates/projects.json` → `<<VAULT_ROOT>>/projects.json`.
   Ersetze das Beispiel-Projekt durch die echten Projekte des Users:
   frage nach **Name, Key (Prefix für Ticket-IDs), Emoji, absolutem Pfad zur TODO.md**.
   Der `Inbox`-Eintrag (Briefing-To-Dos) kann bleiben.
2. `templates/integrations.json` → `<<VAULT_ROOT>>/integrations.json` (Jira/GitHub
   bleiben `enabled:false`, bis der User sie aktivieren will).
3. Lege je registriertem Projekt eine `TODO.md` an (falls nicht vorhanden), mit
   Ampel-Sektionen:
   ```markdown
   ## 🔴 Kritisch
   ## 🟡 Wichtig
   ## 🟢 Nice-to-have
   ```
4. Lege `<<VAULT_ROOT>>/Inbox-TODO.md` an (leere Ampel-Struktur) — Ziel der
   Briefing-To-Dos. Lege `<<VAULT_ROOT>>/Briefings/` an (Ordner für die
   Tages-Briefings `YYYY-MM-DD.md`).

## Schritt 5 — Skills installieren (+ Struktur-Wahl)

Die Features Briefing, Board und Competitor brauchen **Skills**. Sie kommen in den
**Claude-Root** (`<<HOME>>/.claude/skills/`), NICHT ins Plugin (der Plugin-Loader liest
Skills nur aus `~/.claude/skills` + Plugin-Caches).

**Erst prüfen:** Scanne `<<HOME>>/.claude/skills/`. Hat der User dort schon Skills?
Liegt ein `_categories.json`? Existiert ein Lager `<<HOME>>/.claude/skills-library/`?
Berichte den Ist-Zustand kurz.

**Dann den User fragen, welcher Modus** (siehe auch `skills-library/README.md`):

### Modus A — Volles Setup (Root aufräumen)
- Mitgelieferte Template-Skills nach `<<HOME>>/.claude/skills/` kopieren (aus `skills/`).
- `templates/_categories.json` → `<<HOME>>/.claude/skills/_categories.json`
  (falls der User schon ein `_categories.json` hat: **mergen**, nicht überschreiben —
  Einträge der gelieferten Skills ergänzen).
- Ungenutzte/selten gebrauchte Skills des Users ins Lager
  `<<HOME>>/.claude/skills-library/` verschieben (nur nach Bestätigung pro Block, nie
  blind). Beim Verschieben den Namen in `_categories.json` mitpflegen.
- **Wichtig:** Eine laufende Claude-Session nicht hart unterbrechen — falls Skills
  aktiv genutzt werden, dem User die Umlagerung als Handoff vorschlagen.

### Modus B — Teil-Setup (Root + Projekt unberührt)
- Mitgelieferte Template-Skills nach `<<HOME>>/.claude/skills/` kopieren (additiv, nichts
  Vorhandenes anfassen).
- Lager `<<HOME>>/.claude/skills-library/` anlegen (falls nicht da) +
  `skills-library/README.md` dorthin kopieren.
- Bestehende Root-Skills des Users **nicht** verschieben. Nur auflisten, welche
  ungenutzt scheinen — als Vorschlag, was er später auslagern könnte.
- `_categories.json` nur **additiv** um die gelieferten Skills ergänzen (mergen).

In **beiden** Modi:
- **Competitor-Skill ist projekt-lokal:** `skills/competitor-analysis/` wird NICHT global
  installiert, sondern pro Projekt nach `<projekt>/.claude/skills/competitor-analysis/`
  kopiert (der Skill merkt sich beim ersten Lauf das Projekt). Frage den User, für welche
  Projekte er das Cockpit will, und kopiere dorthin. `templates/competitor-config.example.json`
  zeigt die config-Struktur (wird beim Erst-Lauf automatisch erzeugt).
- `aggregate.js` (im `task-roadmap`-Skill) liest den Vault über die ENV `AGENTICOS_VAULT`
  oder fällt auf `<<HOME>>/AgenticOS` zurück. Weicht der Vault-Pfad ab, setze
  `AGENTICOS_VAULT` (z.B. im SessionStart-Hook, Schritt 6).

## Schritt 6 — Optional: Task-Roadmap automatisch aktualisieren (Hook)

Frage den User, ob die Roadmap beim Start einer Claude-Session automatisch frischen soll.
Wenn ja, ergänze in `<<HOME>>/.claude/settings.json` unter `hooks.SessionStart` einen
fehlertoleranten, asynchronen Eintrag (blockiert die Session nicht):

```json
{
  "type": "command",
  "command": "node \"<<HOME>>/.claude/skills/task-roadmap/aggregate.js\"",
  "timeout": 10,
  "async": true
}
```

Wenn der Vault nicht unter `<<HOME>>/AgenticOS` liegt, setze zusätzlich die ENV
`AGENTICOS_VAULT` auf `<<VAULT_ROOT>>` (im Hook-Command oder global). Vorhandene Hooks
nicht überschreiben — nur ergänzen.

## Schritt 7 — Erstmaliger Roadmap-Lauf

```bash
node "<<HOME>>/.claude/skills/task-roadmap/aggregate.js"
```
(Bei abweichendem Vault: `AGENTICOS_VAULT=<<VAULT_ROOT>>` voranstellen.) Das erzeugt
`<<VAULT_ROOT>>/task-roadmap.json` — die Datenquelle für Board + Übersicht.

## Schritt 8 — Aktivieren + Smoke-Test

1. User: Obsidian neu laden (`Strg/Cmd+P` → „Reload app without saving").
2. User: *Einstellungen → Community-Plugins → Agentic OS* aktivieren.
3. Im Plugin: einen Terminal-Tab öffnen → `claude` muss starten (interaktiver Prompt).
4. Dashboard-Tabs prüfen: ÜBERSICHT, BRIEFING, BOARD, COMPETITOR, RESEARCH, SETTINGS.
5. „+"-Workspace-Picker prüfen: zeigt **Home** + **Vault** (+ Claude Root) — keine
   fremden/privaten Workspaces.

---

## Verifikation (führe aus + melde Ergebnis)

- [ ] `<<VAULT_ROOT>>/.obsidian/plugins/agentic-os/main.js` existiert → `node --check` darauf = OK.
- [ ] `<<HOME>>/.agentic-os/settings.json` existiert + ist valides JSON.
- [ ] `<<VAULT_ROOT>>/projects.json` existiert + ist valides JSON (echte Projekte des Users).
- [ ] `<<HOME>>/.claude/skills/task-roadmap/aggregate.js` existiert + `node --check` = OK.
- [ ] `node aggregate.js` lief durch → `task-roadmap.json` wurde geschrieben.
- [ ] Gewählte Template-Skills liegen in `<<HOME>>/.claude/skills/` (briefing-abarbeiten,
      posteingang, task-roadmap, session-uebergabe, … je nach Modus).
- [ ] Competitor-Skill in den gewünschten Projekt-cwds (falls Cockpit gewünscht).
- [ ] User bestätigt: Terminal spawnt, Tabs sichtbar, Picker zeigt nur Home/Vault.

Melde dem User am Ende kompakt: was installiert wurde, was optional noch fehlt (MCPs,
ccusage), und wie er das erste Briefing / die erste Competitor-Analyse startet.
