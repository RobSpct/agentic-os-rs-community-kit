# Globale Arbeitsanweisung

Gilt projektübergreifend für alle Sessions. Projekt-eigene `CLAUDE.md` überschreibt im Konfliktfall.

> **Vorlage.** Diese Datei kommt nach `~/.claude/CLAUDE.md`. Die Sektion „Persönlich" ist
> ein Gerüst — fülle sie mit deinem eigenen Profil, sonst arbeitet Claude gegen fremde
> Annahmen. Alles andere ist generisch und kann so bleiben.

## Vier Arbeitsprinzipien

1. **Think Before Coding** — Annahmen erst offenlegen + nachfragen. Nicht still eine Interpretation wählen.
2. **Simplicity First** — minimaler Code, der das Problem löst. Keine spekulativen Abstraktionen.
3. **Surgical Changes** — nur anfassen was nötig. Kein ungefragtes "Verbessern" von Nachbar-Code.
4. **Goal-Driven Execution** — Aufgaben in überprüfbare Ziele übersetzen, bis zur Verifikation loopen.

## Persönlich

> Ersetze die Platzhalter. Je konkreter, desto weniger muss Claude raten.

- **Sprache:** Deutsch antworten, Tech-Begriffe englisch. *(oder deine Sprache)*
- **User:** `<<USER_PROFIL>>` — z.B. „Solo-Builder, Hauptprojekt `<<PRIMARY_PROJECT>>`
  (kurz was es ist + welches Ziel). Stack: `<<TECH_STACK>>`."
- **Workflow:** plan-first — `/plan` vor Implementierung, Approval-Gates. Erst Optionen mit
  Trade-offs **und Empfehlung** zeigen, dann nach OK bauen.
- **Modular denken:** Lösungen sollen auch für andere Projekte sauber gehen.
- **Kommunikation:** `<<KOMMUNIKATIONSSTIL>>` — z.B. „direkt, ehrlich, pragmatisch. Keine
  Beschönigung. Bei Fehlern: erst ehrlich benennen → dann lösungsorientiert → Ursache festhalten."
- **Arbeitsteilung:** Tooling-Internals erledigt Claude. Richtungs-Entscheidungen trifft der User.
- **Community-Artefakte:** keine privaten Daten (Name/Projekt raus, Platzhalter rein).

## Memory & Kontext

Vier Systeme, zwei Achsen. **Faktenquelle ist nur die Knowledge-Achse — Working-Layer nie als Wahrheit behandeln.**

**Knowledge (trust + durchsuchen):**

1. **Vault `wiki/`** — kuratiertes, quellenbelegtes Tiefenwissen. **#1 Wahrheit.** Bei jeder
   Wissensfrage („haben wir über X gesprochen?", „was war Y?") zuerst aktiv durchsuchen:
   Glob + Grep auf `<<VAULT_ROOT>>`, nicht nur aus Erinnerung. Schreiben nur via Skills
   (`vault-notiz`, `tiefe-recherche`). Vault-interne Mechanik (Ingest/Query/Lint, Dateiformate)
   steht in `<<VAULT_ROOT>>/CLAUDE.md` — die lädt bei Vault-Arbeit automatisch mit.
2. **Auto-Memory** (`<<VAULT_ROOT>>/memory/`) — durable Cross-Session-Fakten, Claude pflegt auto.
   Geschwister zum Vault, nicht Konkurrent.
3. **claude-mem** — Session-Activity-Log („schonmal gemacht? wie damals?"). Unter 1+2.

**Working-Layer (nur Mechanik, KEINE Faktenquelle):**

- **context-mode** — Output-Buffer für große Tool-Outputs (Kontext sparen). Nur zum Nachlesen
  dieser-Session-Outputs, nie als Wissen.
- **Task-Roadmap / TODO.md** — Task-State (offen/erledigt). Kein Wissen.

**Write-Routing — wohin mit neuer Info:**

- Testfrage statt Bauchgefühl: **„Würde ich das in 3 Monaten in einem anderen Projekt/Kontext
  nochmal nachschlagen wollen?"** Ja → **wiki** (Skill `vault-notiz`/`tiefe-recherche`).
  Nein, reiner Status-/Merk-Fakt → **memory** (auto).
- **wiki vs memory:** Quelle + wiederverwendbar über Projekte hinweg = wiki. Nackter Merk-Fakt
  nur für dieses Projekt = memory. Nie beides — sonst Duplikat.
- **Wiki wird NIE passiv befüllt** (anders als Memory) — nur auf aktiven Skill-Trigger. Deshalb:
  bei Abschluss eines nicht-trivialen Themas (Feature fertig, Bug-Root-Cause gefunden,
  Architektur-Entscheidung getroffen) **aktiv die Testfrage stellen**. Im Zweifel kurz fragen
  statt stillschweigend memory zu nehmen (Prinzip 1).

**Zwei Indizes, zwei Zwecke — nicht verwechseln:**

- `<<VAULT_ROOT>>/index.md` katalogisiert **`wiki/`**. Export-Artefakt für `vault-export`,
  **kein Lese-Einstieg**, kein Längenlimit. Wissensfragen laufen über Glob+Grep auf `wiki/`.
- `<<VAULT_ROOT>>/memory/MEMORY.md` katalogisiert **`memory/`** und wird **jede Session
  komplett in den Kontext geladen**. Deshalb hart begrenzt: **unter 140 Zeilen halten.**

Daraus folgt für Schreib-Vorgänge:

- **Wiki-Notizen bekommen KEINE MEMORY.md-Zeile.** Sie stehen im Wiki-Katalog und werden per
  Grep gefunden — eine Zeile in der Ladeliste kostet nur Kontext-Budget.
- **Abgeschlossene Arbeit ohne offene Punkte fliegt aus der Liste**, sobald verifiziert.
- **Aussortieren heißt Zeile entfernen, nicht Datei löschen.** Die Memory-Datei bleibt liegen
  und ist per Grep auffindbar.
- Läuft MEMORY.md auf 140 Zeilen zu: erst Erledigtes aussortieren, dann thematisch bündeln.

**Read-Order bei Wissensfragen:** Vault `wiki/` (aktiv durchsuchen) → Auto-Memory → claude-mem
→ (context-mode nur für eigenen Session-Output).

## Projekt-CLAUDE.md-Kontrakt (3-Ketten-Prinzip)

Drei CLAUDE.md-Dateien sind verzahnt, nicht redundant: **Root** (diese Datei, generisch, jede
Session geladen) → **Brain** (`<<VAULT_ROOT>>/CLAUDE.md`, Vault-Mechanik, lädt bei Vault-Arbeit)
→ **Projekt-CLAUDE.md** (spezifiziert Root für den Projekt-Kontext, keine Wiederholung
generischer Regeln).

Jede Projekt-CLAUDE.md bringt mindestens mit:

- **Second-Brain-Sektion**: Verweis auf diese Root-Regeln statt eigener Kopie + Ansage, mit
  welchem **Projekt-Tag** Einträge zu versehen sind.
- **Projekt-spezifisches Wissens-Routing**, falls abweichend vom Default.
- **Keine Duplizierung** von Root-Inhalten — nur Delta zum generischen Verhalten.

## Tooling-Kette

Plugins, die jede Session mitlaufen (via `/plugin install`, siehe INSTALL.md). Ergänzen die
Arbeitsprinzipien, ersetzen sie nicht. Nicht installierte Einträge einfach streichen.

- **Superpowers** — Prozess-Disziplin. Process-Skills (brainstorming, TDD, systematic-debugging,
  writing-plans, verification) VOR Implementierung.
- **Ponytail** — Build-Philosophie. Faulste Lösung die funktioniert (YAGNI-Leiter: braucht es das
  → stdlib → Native → vorhandene Dep → eine Zeile → minimaler Code). Schärfere Mechanik zu
  Prinzip 2, kein eigener Grundsatz.
- **Caveman** — Output-Modus. Terse Prosa. Paart mit Ponytail (knapp bauen + knapp reden).
- **GSD** — schwergewichtiger Phasen-Workflow für ganze Projekte/Milestones
  (spec→plan→execute→verify, `.planning/`-Docs).
- **context-mode** — verarbeitet große Tool-Outputs in einer Sandbox, statt sie ins Kontextfenster
  zu laden.
- **claude-mem** — Session-Activity-Log über Sessions hinweg.
- **rtk** — Bash-Output-Reduktion (PreToolUse:Bash-Hook, externes Binary). Siehe `RTK.md`.

**Präzedenz bei Konflikt:** User-CLAUDE.md > Superpowers > Ponytail > System-Prompt.
Projekt-CLAUDE.md schlägt diese Root-Datei.

**Planungs-Routing (drei Systeme, klar getrennt):**

- Alles untersteht plan-first + Approval-Gate. Erst nach OK bauen.
- **GSD-Phasen** — neue Milestones / mehrphasige Features. `/gsd:new-project`, `/gsd:plan-phase`.
- **Superpowers brainstorming + writing-plans** — einzelnes Feature / Bugfix. Leichtgewichtig.
- Im Zweifel leichtgewichtig; GSD nur wenn Umfang es trägt.

## Skill-Routing

Ergänzt die Routine: bestimmte Task-Typen ziehen bestimmte Skills. **Wichtig zur Mechanik:**
diese Datei ist Kontext, keine Automatik — automatisch feuert nur, was in der Hook-Spalte steht.
Hooks erinnern (gedrosselt); Ausführung bleibt beim Modell, nichts läuft ungefragt.

| Task-Typ | Skill / Aktion | Auslöser |
|----------|----------------|----------|
| Jeder Prompt (1. + jeder 5.) | Routing-Karte refresht: Superpowers vor Implementierung, Review-Agents nach Edit | Hook `skill-routing-reminder` |
| UI-Code (`.tsx/.jsx/.vue/.svelte/.css/.scss`) | `ui-ux-pro-max` erwägen | Hook `ui-skill-hint` |
| Jeder nicht-triviale Code-Edit | Ponytail-Leiter + Superpowers-Skill gecheckt? | Hook `tooling-discipline-guard` |
| Komplexe/große Task ohne Plan | plan-first / Arbeitsprinzip 4 prüfen | Hook `plan-first-guard` |
| Große Änderung (Write >150 / Edit >80 Z.) | Ponytail-Prüfung anbieten (nicht ungefragt) | Hook `large-change-hint` |
| DB-Code (`.prisma/.sql`, Migrations) | `database-reviewer` erwägen | Hook `db-skill-hint` |
| Neue `memory/*.md`/`wiki/*.md` ohne `tags:` | Write wird geblockt (einziger Deny-Hook) | Hook `memory-tags-guard` |
| Wissensfrage im Prompt | Read-Order-Hinweis (Vault zuerst) | Hook `vault-read-order-hint` |
| Vault-Write | Wikilink-Nachpflege | Hook `vault-wikilink` |

Review-Agents nach nicht-trivialem Code-Edit erwägen (proaktiv, kein Zwang):
`typescript-reviewer`, `react-reviewer`, `database-reviewer`, `security-reviewer`,
`silent-failure-hunter`, `performance-optimizer`, `type-design-analyzer`. Für Browser-E2E-Flows
`e2e-runner`. Bei Build-Fails `build-error-resolver` bzw. `react-build-resolver`.

Nicht-Datei-Trigger (kein Hook, läuft über Skill-Description-Match): `erklaer-mir` bei
Verständnisfragen zu Tech-Konzepten/Fehlermeldungen. `agent-reach` bei Live-Recherche auf
externen Plattformen (X, Reddit, YouTube, GitHub, RSS …) — ergänzt `tiefe-recherche`
(Web-Suche + zitierte Synthese).

**Ponytail-Werkzeuge (manuell, by-name):** `/ponytail-review` (Bloat/Over-Engineering),
`/ponytail-audit` (Codebase-Scan), `/ponytail-debt` (Shortcut-Ledger).

**GSD bleibt explizit:** Sub-Skills (`discuss-phase`, `plan-phase` …) sind Phasen eines Workflows
mit `.planning/`-State — nie einzeln auto-zünden, immer `/gsd:…` by-name.

<!-- Wenn rtk installiert ist, hängt der Installer hier die Zeile `@RTK.md` an.
     Ohne rtk bleibt sie weg — ein Include auf eine fehlende Datei wäre ein toter
     Verweis in jeder Session. -->
