# INSTALL.md — Setup automatisch einrichten

> **An Claude Code:** Diese Datei arbeitest DU ab. Lies sie einmal komplett, frage dann die
> **Stufe** (Schritt 1) und führe **nur die Module dieser Stufe** aus, in der angegebenen
> Reihenfolge. Halte dich an den Sicherheitsregeln-Block — er gilt für jedes Modul.
> Am Ende: Verifikation der Stufe ausführen und Ergebnis melden.
>
> **An den User:** Du musst das hier **nicht** lesen. Sag in Claude Code einfach:
> **„Lies INSTALL.md und richte das Setup bei mir ein."**
> Claude fragt dich, welche Stufe du willst, und macht den Rest.

---

## Platzhalter

Überall im Repo gilt eine Schreibweise: `<<NAME>>`. Diese fünf brauchst du:

| Platzhalter | Bedeutung | Beispiel |
|---|---|---|
| `<<HOME>>` | User-Home | `C:/Users/anna` bzw. `~` |
| `<<VAULT_ROOT>>` | Obsidian-Vault (der Ordner mit `.obsidian/`) | `C:/Users/anna/MeinVault` |
| `<<CLAUDE_DIR>>` | Claude-Ordner | `<<HOME>>/.claude` |
| `<<NODE>>` | node-Executable | `node`, sonst absoluter Pfad |
| `<<PROJECT_NAME>>` | ein Projekt des Users | `Webshop` |

`<<NODE>>` per `where node` (Windows) / `which node` (macOS) auflösen. Liegt node auf dem
PATH, reicht `node` — sonst den absoluten Pfad eintragen (in Anführungszeichen, falls
Leerzeichen enthalten sind).

---

## Sicherheitsregeln (gelten für ALLE Module)

1. **Nie kommentarlos überschreiben.** Existiert eine Zieldatei bereits und unterscheidet sie
   sich, zeige dem User den Unterschied und frage. Ausnahme: Dateien, die diese Installation
   in derselben Sitzung selbst angelegt hat.
2. **Vor jedem Schreiben in eine bestehende Datei ein Backup**: `<datei>.bak-<YYYYMMDD-HHMMSS>`.
3. **`settings.json` wird gemergt, nie ersetzt** — Algorithmus in Modul M4.
4. **Idempotent bleiben.** Ein zweiter Durchlauf darf nichts duplizieren und nichts kaputt
   machen. Vorhandenes und Identisches wird übersprungen, nicht neu geschrieben.
5. **Keine Secrets anfassen.** Keine Tokens erfragen, keine Keys in Dateien schreiben.
6. **Bei Fehlern abbrechen und berichten**, nicht stillschweigend weitermachen. Melde ehrlich,
   was fehlgeschlagen ist — ein halb installiertes Setup, das als fertig gemeldet wird, ist
   schlimmer als ein abgebrochenes.

---

## Schritt 0 — Voraussetzungen prüfen (nicht automatisch installieren)

Prüfe, melde was fehlt, und frage bei fehlenden Pflicht-Punkten, ob trotzdem fortgefahren
werden soll:

| | Prüfung | Gebraucht für |
|---|---|---|
| **Pflicht** | `claude --version` läuft | alles |
| **Pflicht** | `node --version` läuft | Hooks, Roadmap-Aggregator |
| Pflicht ab M1 | Obsidian Desktop installiert | Plugin (`isDesktopOnly`) |
| Optional | `npx ccusage` erreichbar | Token-Bar im Dashboard |
| Optional | Web-Suche verfügbar | `tiefe-recherche`, `competitor-analysis` |

---

## Schritt 1 — Stufe erfragen

Frage den User (bevorzugt per AskUserQuestion, eine Frage, vier Optionen):

> **Welches Setup möchtest du?**

| Stufe | Was du bekommst | Module |
|---|---|---|
| **FULL** | Alles: Obsidian-UI, Second Brain, 18 Skills, globale CLAUDE.md, Hooks, Review-Agents, MCPs | M1 + M2 + M3 + M4 + M6 |
| **MEDIUM** | Obsidian-UI + Second Brain (Vault-Struktur, Auto-Memory, Memory-Hooks) — ohne Skills, ohne globale Config | M1 + M2 + M6 |
| **SMALL** | Nur das Obsidian-UI-Plugin | M1 + M6 |
| **SKILLS-ONLY** | Nur Skills, einzeln auswählbar — kein Plugin, kein Vault | M5 + M6 |

Beschreibe beim Fragen jeweils in einem Satz, was **fehlt**, nicht nur was enthalten ist.
Nach der Wahl: Module der Reihe nach abarbeiten. **M6 wird in jeder Stufe angeboten**, ist aber
immer eine eigene Ja/Nein-Frage am Ende.

---

# Module

## M1 — Obsidian-Plugin (Agentic OS UI)

**1.1 Vault-Pfad erfragen.** `<<VAULT_ROOT>>` ist der Ordner, der `.obsidian/` enthält.
Bei Unklarheit: Obsidian → *Einstellungen → Über → Vault-Pfad*.

**1.2 Plugin kopieren.** Kompletten Ordner `plugin/agentic-os/` →
`<<VAULT_ROOT>>/.obsidian/plugins/agentic-os/` (enthält `main.js`, `manifest.json`,
`styles.css`, `native/`). `.obsidian/plugins/` anlegen falls nicht vorhanden.
Eine vorhandene `data.json` ist die User-Konfiguration des Plugins — **nie überschreiben**.

**1.3 Dashboard-Settings.** `templates/settings.json` → `<<HOME>>/.agentic-os/settings.json`.
Frage nach der Akzentfarbe (Default `#E23636`). `tokenLimit5h` (35 Mio.) als anpassbare
Schätzkonstante erwähnen — es ist kein offizielles Limit.

**1.4 Aktivieren.** User bittet: Obsidian neu laden (`Strg/Cmd+P` → „Reload app without
saving"), dann *Einstellungen → Community-Plugins → Agentic OS* aktivieren.

**1.5 Smoke-Test.** Terminal-Tab öffnen → `claude` startet. Tabs sichtbar. Der
„+"-Workspace-Picker zeigt Home / Vault / Claude Root — keine fremden Einträge.

## M2 — Second Brain (Vault-Struktur + Auto-Memory)

**2.1 Vault-Gerüst.** Inhalt von `vault-template/` → `<<VAULT_ROOT>>/`, **mergend**:
Nur Dateien anlegen, die noch nicht existieren. Vorhandene `CLAUDE.md`, `index.md`, `log.md`
usw. nicht anfassen — stattdessen dem User sagen, welche Datei übersprungen wurde und was
darin stünde.

**2.2 Registry.** `templates/projects.json` → `<<VAULT_ROOT>>/projects.json`. Ersetze das
Beispiel durch die echten Projekte: frage nach **Name, Key (Prefix für Ticket-IDs), Emoji,
absolutem Pfad zur `TODO.md`**. Der `Inbox`-Eintrag darf bleiben.
`templates/integrations.json` → `<<VAULT_ROOT>>/integrations.json` (Jira/GitHub bleiben
`enabled:false`).

**2.3 TODO.md je Projekt** anlegen, falls nicht vorhanden:

```markdown
## 🔴 Kritisch
## 🟡 Wichtig
## 🟢 Nice-to-have
```

**2.4 Vault-Variable + Auto-Memory.** In `<<CLAUDE_DIR>>/settings.json` (Merge-Regeln aus M4
beachten, auch wenn M4 selbst nicht läuft):

```json
{
  "env": { "AGENTICOS_VAULT": "<<VAULT_ROOT>>" },
  "autoMemoryEnabled": true,
  "autoMemoryDirectory": "<<VAULT_ROOT>>/memory"
}
```

Ohne `AGENTICOS_VAULT` sind die Vault-Hooks absichtlich inert — die Variable ist der Schalter,
der das Second Brain scharf macht.

**2.5 Memory-Hooks** (auch ohne M4 sinnvoll, weil sie die Vault-Disziplin erzwingen):
`claude-setup/hooks/memory-tags-guard.js` und `vault-wikilink.js` →
`<<CLAUDE_DIR>>/hooks/`, dazu die passenden Einträge aus `claude-setup/settings.template.json`
(PreToolUse `Write|Edit` bzw. PostToolUse `Write|Edit`) in die `settings.json` mergen.

## M3 — Skills (komplett)

Skills gehören in den **Claude-Root** (`<<CLAUDE_DIR>>/skills/`), nicht ins Plugin — der
Plugin-Loader liest nur von dort.

**3.1 Ist-Zustand melden.** Scanne `<<CLAUDE_DIR>>/skills/`: Wie viele Skills liegen dort?
Gibt es `_categories.json`? Existiert `<<CLAUDE_DIR>>/skills-library/`?

**3.2 Modus wählen lassen:**

- **Additiv (Default, empfohlen):** Die 18 Skills aus `skills/` dazukopieren, nichts
  Vorhandenes anfassen. Bei Namensgleichheit fragen.
- **Aufräumen:** Zusätzlich ungenutzte Skills des Users nach `<<CLAUDE_DIR>>/skills-library/`
  auslagern — **nur nach Bestätigung pro Skill**, nie blind. `skills-library/README.md`
  dorthin kopieren. Läuft gerade eine Claude-Session, die Skills nutzt: als Handoff
  vorschlagen statt mitten im Betrieb zu verschieben.

**3.3 Kategorien mergen.** `templates/_categories.json` → `<<CLAUDE_DIR>>/skills/_categories.json`.
Existiert die Datei schon: **mergen** (Einträge ergänzen, bestehende behalten). Die Matrix im
Dashboard zeigt sonst tote Einträge.

**3.4 competitor-analysis ist projekt-lokal.** Nicht global installieren, sondern pro Projekt
nach `<projekt>/.claude/skills/competitor-analysis/`. Frage, für welche Projekte das Cockpit
gewünscht ist. `templates/competitor-config.example.json` zeigt die Struktur; die echte
`config.json` erzeugt der Skill beim ersten Lauf.

**3.5 Roadmap-Erstlauf** (wenn M2 lief):

```bash
<<NODE>> "<<CLAUDE_DIR>>/skills/task-roadmap/aggregate.js"
```

Erzeugt `<<VAULT_ROOT>>/task-roadmap.json` — Datenquelle für Übersicht und Board.
Bei abweichendem Vault `AGENTICOS_VAULT=<<VAULT_ROOT>>` voranstellen.

## M4 — Globales Claude-Setup

**4.1 Globale CLAUDE.md.** `claude-setup/CLAUDE.global.template.md` →
`<<CLAUDE_DIR>>/CLAUDE.md`.
Existiert dort schon eine Datei: **nicht überschreiben.** Zeige dem User die Unterschiede und
biete an, Abschnitte einzeln zu übernehmen. Danach die Platzhalter der Sektion „Persönlich"
gemeinsam mit dem User füllen (`<<USER_PROFIL>>`, `<<PRIMARY_PROJECT>>`, `<<TECH_STACK>>`,
`<<KOMMUNIKATIONSSTIL>>`) — eine Vorlage mit unausgefüllten Platzhaltern ist schlechter als
keine, weil Claude dann gegen Phantom-Annahmen arbeitet.
`<<VAULT_ROOT>>` in der Datei ebenfalls ersetzen.

**4.2 Hooks + Agents + Statusline kopieren:**

| Von | Nach |
|---|---|
| `claude-setup/hooks/*` | `<<CLAUDE_DIR>>/hooks/` |
| `claude-setup/agents/*` | `<<CLAUDE_DIR>>/agents/` |
| `claude-setup/statusline/statusline.js` | `<<CLAUDE_DIR>>/statusline/` |

Danach `<<NODE>> --check` über jede kopierte `.js`/`.mjs` laufen lassen.

**4.3 settings.json mergen — der heikelste Schritt.** Genau so vorgehen:

1. Backup: `<<CLAUDE_DIR>>/settings.json` → `settings.json.bak-<YYYYMMDD-HHMMSS>`.
2. `claude-setup/settings.template.json` laden, die Platzhalter `<<NODE>>`, `<<CLAUDE_DIR>>`,
   `<<VAULT_ROOT>>` ersetzen. Die `_comment`- und `_hinweise`-Felder **nicht** übernehmen.
3. Deep-Merge in die bestehende `settings.json`:
   - Skalare Werte (`autoMemoryEnabled`, `tui`, …): nur setzen, wenn noch nicht vorhanden.
     Vorhandene User-Werte gewinnen.
   - `env`: Schlüssel ergänzen, vorhandene nicht überschreiben.
   - **Hook-Arrays additiv:** Für jeden Hook-Eintrag prüfen, ob ein Eintrag mit demselben
     `command`-String schon existiert. Wenn ja → überspringen (das macht Re-Runs idempotent).
     Wenn nein → an das Array des passenden Events/Matchers anhängen. **Niemals** bestehende
     Hook-Einträge entfernen oder ersetzen.
4. Weglassen, wenn die Voraussetzung fehlt: den `context-mode-cache-heal.mjs`-Eintrag ohne
   context-mode-Plugin, den `aggregate.js`-Eintrag ohne `task-roadmap`-Skill.
5. Ergebnis als JSON parsen. Schlägt das fehl: Backup zurückspielen und abbrechen.

**4.4 MCP-Server registrieren** (account-frei, keine Tokens nötig):

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp
claude mcp add memory -- npx -y @modelcontextprotocol/server-memory
claude mcp add sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking
```

Danach `claude mcp list` — die drei müssen auftauchen. Schon vorhandene nicht doppelt anlegen.

**4.5 rtk (optional, eigene Ja/Nein-Frage).** rtk ist ein externes Binary zur Reduktion von
Bash-Ausgaben. Wenn der User will:

1. Nach der aktuellen offiziellen Installationsanweisung installieren.
2. `rtk --version` prüfen. **Achtung Namenskollision:** Es gibt ein zweites Projekt namens
   „rtk". Wenn `rtk gain` fehlschlägt, ist das falsche installiert — dann abbrechen und
   den User informieren, statt einen kaputten Hook einzutragen.
3. `rtk init -g` registriert den PreToolUse:Bash-Hook.
4. `claude-setup/RTK.md` → `<<CLAUDE_DIR>>/RTK.md` und die Zeile `@RTK.md` ans Ende von
   `<<CLAUDE_DIR>>/CLAUDE.md` anhängen.
5. Verifikation: `rtk gain` läuft.

Schlägt irgendetwas davon fehl oder lehnt der User ab: **keinen rtk-Hook eintragen.** Das
restliche Setup ist davon unberührt.

## M5 — Skills einzeln auswählen

Zeige dem User diese Tabelle und lass ihn auswählen (Mehrfachauswahl):

| Skill | Was er tut | Braucht |
|---|---|---|
| `agent-reach` | Recherche auf X, Reddit, YouTube, GitHub, RSS u.a. | externe CLIs je Plattform |
| `claude-api` | Apps gegen die Claude API / das Anthropic SDK bauen | — |
| `cleanup` | Workspace-Audit: Bloat, veraltete Dateien, tote Verweise | — |
| `competitor-analysis` | Mitbewerber-Scan mit Threat-Score, speist den COMPETITOR-Tab | Web-Suche, projekt-lokal |
| `context-budget` | Auditiert den Context-Window-Verbrauch | — |
| `council` | Entscheidung aus mehreren Rollen pressure-testen (schnell, inline) | — |
| `erklaer-mir` | Tech-Jargon in Klartext übersetzen (read-only) | — |
| `find-skills` | Neue Skills finden und installieren | — |
| `llm-council` | Große Council-Variante: 5 Advisors, Peer-Review, Verdikt | mehr Tokens |
| `mcp-builder` | MCP-Server bauen (Python/TypeScript) | — |
| `session-uebergabe` | Handoff-Dokument am Session-Ende | — |
| `skill-creator` | Skills und CLAUDE.md-Dateien bauen und aufräumen | — |
| `summarize` | Beliebige Inhalte zusammenfassen | — |
| `task-roadmap` | Projekt-TODOs einsammeln, speist Übersicht + Board | Vault, `projects.json` |
| `tiefe-recherche` | Mehrquellen-Recherche mit Zitaten, optional als Vault-Notiz | Web-Suche |
| `vault-export` | Portabler Snapshot des Wiki-Wissens | Vault |
| `vault-health-abarbeiten` | Offene Punkte aus Nightly-Curation-Reports abarbeiten | Vault |
| `vault-notiz` | Gedanken als strukturierte Vault-Notiz ablegen | Vault |

Kopiere die gewählten nach `<<CLAUDE_DIR>>/skills/` und merge ihre Einträge aus
`templates/_categories.json` (Regeln wie M3.3). Bei Vault-Skills ohne eingerichteten Vault:
darauf hinweisen, dass sie erst mit MEDIUM/FULL sinnvoll laufen.

## M6 — Tooling-Plugins (opt-in, jede Stufe)

Frage: **„Sollen die Tooling-Plugins mitinstalliert werden?"** Diese liegen nicht im Repo —
Claude Code holt sie selbst aus den Marketplaces.

```
/plugin marketplace add obra/superpowers-marketplace
/plugin marketplace add jnuyens/gsd-plugin
/plugin marketplace add DietrichGebert/ponytail
/plugin marketplace add JuliusBrussee/caveman
/plugin marketplace add mksglu/context-mode
/plugin marketplace add thedotmack/claude-mem
/plugin marketplace add kepano/obsidian-skills
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin marketplace add Egonex-AI/Understand-Anything
/plugin marketplace add anthropics/skills
```

Dann installieren:

```
/plugin install superpowers@superpowers-marketplace
/plugin install gsd@gsd-plugin
/plugin install ponytail@ponytail
/plugin install caveman@caveman
/plugin install context-mode@context-mode
/plugin install claude-mem@thedotmack
/plugin install obsidian@obsidian-skills
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
/plugin install understand-anything@understand-anything
/plugin install example-skills@anthropic-agent-skills
```

| Plugin | Wofür |
|---|---|
| superpowers | Prozess-Disziplin: brainstorming, TDD, systematic-debugging, writing-plans |
| gsd | Phasen-Workflow für ganze Projekte (spec → plan → execute → verify) |
| ponytail | Build-Philosophie: die einfachste Lösung, die trägt (YAGNI) |
| caveman | Knapper Antwort-Stil |
| context-mode | Große Tool-Ausgaben in einer Sandbox verarbeiten statt im Kontext |
| claude-mem | Session-Gedächtnis über Sessions hinweg |
| obsidian | Obsidian-Formate: Canvas, Bases, Wikilinks |
| ui-ux-pro-max | UI/UX-Wissen für Frontend-Arbeit |
| understand-anything | Codebase als Knowledge Graph |
| example-skills | Anthropics Beispiel-Skills |

Der User kann einzelne abwählen. Nach der Installation `/plugin` öffnen oder Claude Code neu
starten und melden, welche gelistet sind. Keine Funktionstests fremder Plugins.

Falls M4 lief und context-mode **nicht** installiert wurde: den
`context-mode-cache-heal.mjs`-Hook wieder aus der `settings.json` entfernen.

---

# Verifikation

Führe die Punkte deiner Stufe aus und melde jeden einzeln als erfüllt/nicht erfüllt.
Nichts abhaken, was du nicht tatsächlich geprüft hast.

**Nach M1 (alle Stufen außer SKILLS-ONLY):**
- [ ] `<<VAULT_ROOT>>/.obsidian/plugins/agentic-os/main.js` existiert, `<<NODE>> --check` = OK
- [ ] `<<HOME>>/.agentic-os/settings.json` ist valides JSON
- [ ] User bestätigt: Plugin aktiv, Terminal startet `claude`, Picker zeigt nur Home/Vault/Claude Root

**Nach M2 (FULL, MEDIUM):**
- [ ] `<<VAULT_ROOT>>/CLAUDE.md`, `index.md`, `log.md`, `memory/MEMORY.md` existieren
- [ ] `<<VAULT_ROOT>>/projects.json` ist valides JSON und enthält echte Projekte
- [ ] `env.AGENTICOS_VAULT` steht in der `settings.json` und zeigt auf `<<VAULT_ROOT>>`
- [ ] Guard-Test: Eine `memory/test.md` **ohne** `tags:` schreiben lassen → muss blockiert
      werden. Danach Testdatei entfernen.
- [ ] `<<NODE>> scripts/vault-index-sync.mjs --check` im Vault läuft ohne Fehler

**Nach M3 (FULL):**
- [ ] 18 Skills liegen in `<<CLAUDE_DIR>>/skills/` (bzw. die im Aufräum-Modus gewählte Menge)
- [ ] `_categories.json` enthält alle installierten Skills, keine toten Einträge
- [ ] `task-roadmap.json` wurde erzeugt (wenn M2 lief)

**Nach M4 (FULL):**
- [ ] `<<CLAUDE_DIR>>/CLAUDE.md` existiert, „Persönlich" ist ausgefüllt, keine `<<…>>` mehr drin
- [ ] Alle Hooks und Agents liegen am Ziel, `--check` grün
- [ ] `settings.json` ist valides JSON, das Backup existiert, vorher vorhandene Hooks sind noch da
- [ ] `claude mcp list` zeigt context7, memory, sequential-thinking
- [ ] Nur falls rtk gewählt: `rtk gain` läuft

**Nach M5 (SKILLS-ONLY):**
- [ ] Die gewählten Skills liegen in `<<CLAUDE_DIR>>/skills/`, jede mit `SKILL.md`
- [ ] `_categories.json` gemergt

**Nach M6 (falls gewählt):**
- [ ] Die gewählten Plugins erscheinen in `/plugin`

**Abschlussmeldung an den User:**
1. Was installiert wurde (Stufe + Module).
2. Was übersprungen oder abgelehnt wurde und warum.
3. Was noch Handarbeit braucht — insbesondere: Claude Code neu starten, damit Hooks,
   Plugins und MCPs greifen.
4. Ein konkreter erster Schritt zum Ausprobieren, passend zur Stufe (z.B. „öffne den
   Terminal-Tab und frag `/council` etwas" oder „leg mit `/vault-notiz` deine erste Notiz an").
