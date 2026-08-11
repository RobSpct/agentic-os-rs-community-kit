# Second Brain — Regeln für Claude

Diese Datei liegt im Vault-Root und lädt automatisch mit, sobald Claude im Vault arbeitet.
Sie beschreibt die **Mechanik** des Second Brain. Die generischen Arbeitsregeln (Write-Routing,
Read-Order, Tooling-Kette) stehen in der globalen `~/.claude/CLAUDE.md`.

## Vault-Struktur

```
<Vault>/
├── raw/               # Quellen-Archiv (immutable)
├── wiki/              # Gepflegte Wissensseiten
├── memory/            # Auto-Memory (Cross-Session-Fakten, kein raw/wiki-Ersatz)
├── Briefings/         # Tages-Briefings + Nightly-Curation-Reports
├── scripts/           # Generische, wiederverwendbare Scripts (siehe scripts/README.md)
├── index.md           # Katalog aller Wiki-Seiten — Export-Artefakt, keine Lese-Pflicht
├── log.md             # Append-only Logbuch
├── CRITICAL_FACTS.md  # Unveränderliche Kernfakten, schneller Einstieg ohne Vault-Scan
└── CLAUDE.md          # Diese Datei
```

## Grundregeln

- `raw/` ist **immutable**: einmal abgelegt, nie ändern, nie löschen.
- `wiki/`-Seiten immer mit YAML-Frontmatter + kurzer Zusammenfassung oben.
- `index.md` nach jedem Update aktualisieren. **Nicht** als Lese-Einstieg — Wissensfragen laufen
  über Glob+Grep (s. Query). Zweck ist `vault-export`: fremde AI-Tools ohne Vault-Zugriff
  bekommen nur diesen Katalog, deshalb muss er vollständig bleiben.
- `log.md` nur oben anfügen, Format: `## [YYYY-MM-DD] operation | Beschreibung`.
- Konzepte mit `[[wikilinks]]` verknüpfen.
- Sprache konsistent halten, Tech-Begriffe im Original lassen.

## Scripts-Ordner

Ziel: generische Scripts nicht jedes Mal neu bauen. Vor Script-Neubau immer erst `scripts/`
prüfen (Glob/Grep), ob's das schon gibt.

- Nur **projekt-unabhängige** Scripts landen hier. Projekt-spezifisches gehört ins jeweilige Repo.
- Jedes Script hat Header-Kommentar (Zweck, optional Kontext-Link, Datum) — siehe `scripts/README.md`.
- Kontext-Link auf Wiki/Memory/Raw als **Pfadangabe in Backticks**, nie als Klartext-Wikilink
  (der Auto-Wikilink-Hook würde sonst zugreifen — Scripts sind kein Lint-Ziel).

## Projekt-Tag-Pflicht

Jede neue Wiki-Seite (`wiki/*.md`) UND jeder neue Memory-Eintrag (`memory/*.md`) bekommt im
`tags:`-Frontmatter zusätzlich zu inhaltlichen Tags einen **Projekt-Tag**, wenn der Eintrag einem
konkreten Repo/Projekt zuzuordnen ist (Beispiel: Projekt „Webshop" → Tag `webshop`,
kleingeschrieben). Cross-Projekt-Einträge (User-Profil, globale Tooling-Notizen) bekommen
explizit `cross-projekt`. Grund: macht Vault/Memory überblickbar und erlaubt gezielte Suche per
Tag statt Volltext-Scan. Gilt nur für neue Einträge, kein rückwirkendes Nachtragen.

**Achtung Format-Konflikt:** Das Harness-Memory-Template (`name`/`description`/`metadata.type`)
sieht standardmäßig **kein** `tags:`-Feld vor — es muss bei jedem neuen Memory-Eintrag bewusst
ergänzt werden, sonst greift die Projekt-Tag-Pflicht nie. Deshalb **technisch erzwungen**:
Der PreToolUse-Hook `~/.claude/hooks/memory-tags-guard.js` verweigert jeden Write einer neuen
`memory/*.md` oder `wiki/*.md` ohne befülltes Top-Level `tags:`-Feld (Edit und `MEMORY.md`
ausgenommen). Der Hook erkennt den Vault über die Umgebungsvariable `AGENTICOS_VAULT` — ist sie
nicht gesetzt, ist er absichtlich inert.

## Auto-Wikilink-Hook (Gotcha)

Ein PostToolUse-Hook (`~/.claude/hooks/vault-wikilink.js`) verlinkt nach jedem Write/Edit auf
`.md`-Dateien im Vault automatisch Klartext-Erwähnungen von `wiki/`-Slugs. Konsequenzen:

- **Referenz-Namen müssen exakt stimmen.** Ein Tippfehler oder ein alter/umbenannter Slug wird
  NICHT als Fehler erkannt — der Hook verlinkt nur existierende Slugs und lässt falsche
  unangetastet stehen → broken wikilink, und Obsidian legt beim Anklicken eine leere Datei an.
- **Backtick-Code-Spans sind sicher** — der Hook lässt sie in Ruhe. Für reine Pfadangaben ohne
  gewünschten Link also Backticks nutzen.
- **Verschachtelungs-Risiko bei manuellen Links:** Wird `wiki/xyz` als Klartext geschrieben
  (ohne Backticks, ohne bestehende Klammern), hängt der Hook einen weiteren Wikilink drum.
  Für Querverweise entweder den vollen `[[wiki/xyz]]`-Link direkt schreiben (dann greift der
  „already linked"-Guard) oder nur den nackten Slug.
- Bei Verdacht auf kaputte Links: Lint-Operation unten, Abschnitt „Broken wikilinks".

---

## Operationen

### Ingest

Ziel: neues Wissen aufnehmen.

1. Zum Thema recherchieren (WebSearch, WebFetch oder eigenes Wissen).
2. Quelle als Markdown in `raw/<thema>-<YYYY-MM-DD>.md` ablegen.
3. Wiki-Seite in `wiki/<thema>.md` erstellen oder aktualisieren.
   - YAML-Frontmatter mit `title`, `tags`, `created`, `sources`.
   - Kurze Zusammenfassung ganz oben.
   - Querverweise mit `[[wikilinks]]` zu verwandten Seiten setzen.
4. `index.md` aktualisieren. Vergessen ist unkritisch — `node scripts/vault-index-sync.mjs`
   trägt fehlende Seiten nach; die Zusammenfassung ist dann ein Platzhalter und darf
   nachgeschärft werden.
5. `log.md` oben eintragen: `## [YYYY-MM-DD] ingest | <Thema> aufgenommen`.

### Query

Ziel: Frage über den Vault beantworten.

**Wichtig:** Bei jeder Wissensfrage („haben wir über X gesprochen?", „was war nochmal Y?")
zuerst den Vault durchsuchen (Glob + Grep auf den Vault-Root). Nicht aus Erinnerung —
`wiki/` ist die kuratierte Wahrheit. Read-Order danach: Auto-Memory → claude-mem.

1. `wiki/` per Glob + Grep durchsuchen (Volltext, nicht nur Dateinamen) — `index.md` ist dafür
   **nicht** der Einstieg, seine Zusammenfassungsspalte ist dünner als der Volltext.
2. Relevante `wiki/`-Seiten lesen.
3. Antwort formulieren — immer mit Quellenangabe aus dem Frontmatter (`sources`).
4. `log.md` oben eintragen: `## [YYYY-MM-DD] query | "<Frage>" beantwortet`.

### Lint

Ziel: Vault-Gesundheit prüfen. Deckt `wiki/` + `memory/` UND den Vault-Root ab.

1. Alle `wiki/`-Seiten UND `memory/`-Einträge einlesen. Root-Ebene (`*.md`, `*.json`,
   `*.canvas`, `*.base`) per Glob auflisten.
2. Prüfen auf:
   - **Widersprüche**: gleiche Fakten, unterschiedliche Aussagen.
   - **Veraltetes**: `created`-Datum älter als 6 Monate ohne neuere Quelle.
   - **Verwaiste Seiten**: in `wiki/` vorhanden, aber nicht in `index.md`. Relevant, weil
     `vault-export` nur den Index ausliefert — was dort fehlt, existiert für fremde AI-Tools
     nicht. **Nicht von Hand suchen:** `node scripts/vault-index-sync.mjs --check` meldet die
     Lücken (exit 1), ohne `--check` trägt es sie ein. Ergänzt nur, überschreibt nie.
   - **Broken wikilinks**: Link (auch Alias-Form) zeigt auf nicht existierende Datei —
     Zielprüfung gegen `wiki/*.md` UND `memory/*.md`, nicht nur `wiki/`. Ein kleines
     Node-Script über den ganzen Vault ist zuverlässiger als Grep pro Seite.
   - **Leere/verwaiste Root-Dateien**: 0-Byte-`.md`-Dateien im Root sind fast immer
     Obsidian-Auto-Create-Folgeschäden eines broken wikilinks — erst den verursachenden Link
     fixen, dann die leere Datei löschen.
   - **Duplikat-/Backup-Dateien**: `.bak` u.ä. im Root — die git-Historie deckt das ab.
   - **Namenlose Canvas/Base-Dateien**: prüfen ob echter Inhalt drin ist, sonst löschen.
3. Befund als Liste ausgeben mit Kategorie, Seite und empfohlener Aktion.
4. `log.md` oben eintragen: `## [YYYY-MM-DD] lint | <N> Probleme gefunden`.

### Nightly Curation

Optional: ein täglich laufender Agent führt die Lint-Operation automatisch aus. Auftrag inkl.
Auto-Apply-Whitelist und Report-only-Grenzen steht in `NIGHTLY-CURATION.md` (Root).
Reports landen in `Briefings/vault-health-YYYY-MM-DD.md`.

---

## Wiki-Seiten Format

```markdown
---
title: Seitentitel
tags: [tag1, tag2, <projekt-tag oder cross-projekt>]
created: YYYY-MM-DD
sources:
  - raw/quelldatei.md
---

Kurze Zusammenfassung (2-3 Sätze).

## Abschnitt

Inhalt mit Querverweis auf [[andere-seite]].
```

> Nur `sources` (Plural) verwenden — nicht `source`. Ein einheitliches Feld hält Lint und
> Export einfach.

## Memory-Eintrag Format

```markdown
---
name: <slug>
description: <ein Satz, wird beim Recall zur Relevanzprüfung gelesen>
metadata:
  type: user | feedback | project | reference
tags:
  - <projekt-tag oder cross-projekt>
---

Der Fakt. Bei feedback/project zusätzlich **Why:** und **How to apply:**.
Verwandtes mit [[wikilinks]] verknüpfen.
```

## index.md Format

```markdown
# Index

| Seite | Tags | Erstellt | Zusammenfassung |
|-------|------|----------|-----------------|
| [[wiki/thema]] | tag1, tag2 | YYYY-MM-DD | Kurzbeschreibung |
```

## log.md Format

```markdown
# Log

## [YYYY-MM-DD] operation | Beschreibung
Detail falls nötig.
```
