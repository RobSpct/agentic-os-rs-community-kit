---
name: skill-creator
description: Erstelle, bearbeite, auditiere und organisiere Claude Code Skills und CLAUDE.md Files. Use when du neue Skills baust, Skill-Descriptions fixt, Projekt-Files umstrukturierst oder aufgeblähte CLAUDE.md Files aufräumst. Use auch, wenn der User sagt "organisier meine Files".
---

# Skill Creator & Workspace Organizer

Erstell neue Skills, pfleg bestehende und halt CLAUDE.md Files schlank.

---

## Skill-Anatomie

```
skill-name/
├── SKILL.md (Pflicht)
│   ├── YAML-Frontmatter: name + description (Pflicht)
│   └── Markdown-Anleitung (Pflicht)
├── scripts/       (optional) Ausführbarer Code: deterministisch, token-effizient
├── references/    (optional) Docs, die on-demand in den Context geladen werden
└── assets/        (optional) Files, die im Output genutzt werden, nicht in den Context geladen
```

### Wie Skills laden (Progressive Disclosure)

1. **Metadata** (name + description): immer im Context. ~100 Wörter pro Skill. Alle Skills teilen sich ein 2%-Context-Budget (~16K Zeichen gesamt).
2. **SKILL.md Body**: wird geladen, wenn der Skill triggert. Halt ihn unter 5K Wörtern.
3. **Gebündelte Resources**: werden von Claude bei Bedarf geladen. Unbegrenzt.

### Description-Regeln (kritisch für Auto-Invocation)

Das `description:`-Feld entscheidet, ob Claude den Skill automatisch aufruft. Regeln:

- **Erstes Wort = Aktions-Verb** ("Build", "Write", "Analyze", "Download", "Configure")
- **"Use when..."-Klausel einbauen** mit konkreten Trigger-Szenarien
- **Unter 300 Zeichen halten**: lange Descriptions verschwenden das geteilte Budget
- **Nur eine Zeile**: keine mehrzeiligen YAML-Descriptions
- **Kein Jargon im ersten Satz**: starte mit dem, was der User tatsächlich sagen würde
- **Querverweis auf verwandte Skills**, wenn Abgrenzung nötig ist ("Für X nutze stattdessen /other-skill")
- **Brand-/projekt-agnostisch**: Skills sind global, die Projekt-CLAUDE.md liefert den Brand-Kontext
- **Dritte Person** ("This skill should be used when..." oder "Use when...")

**Gut:** `"Write short-form video scripts using proven hook patterns. Use when scripting TikTok, Reels, or Shorts for any brand."`

**Schlecht:** `"Write TikTok scripts in a specific person's voice based on proven winning patterns"` (auf eine Person + eine Plattform festgenagelt)

### Naming-Regeln

- Hyphen-case, lowercase: `content-scripter`, nicht `Content_Scripter`
- Max 40 Zeichen
- Keine redundanten Suffixe: `nano-banana`, nicht `nano-banana-pro-prompts-recommend-skill`
- Der Verzeichnis-Name muss zum `name:`-Feld im Frontmatter passen

---

## Einen neuen Skill erstellen

### Schritt 1: Use Case verstehen

Frag den User:
- Wobei soll dieser Skill helfen? (konkrete Beispiele)
- Was würdest du sagen, um ihn zu triggern? (natürliche Sprache)
- Gibt es schon einen ähnlichen Skill? (check `~/.claude/skills/`)

### Schritt 2: Gerüst anlegen

Leg die Skill-Struktur direkt mit deinen eigenen Tools an. Erstell das Verzeichnis und das SKILL.md-Template:

```bash
mkdir -p ~/.claude/skills/<skill-name>
```

Dann schreib mit dem Write-Tool ein `SKILL.md` mit diesem Grundgerüst:

```markdown
---
name: <skill-name>
description: <Aktions-Verb> ... Use when ...
---

# <Skill-Titel>

<1-2 Sätze, was der Skill ermöglicht.>

## Anleitung

<Imperative Schritte.>
```

Leg `scripts/`, `references/` oder `assets/` nur an, wenn der Skill sie wirklich braucht.

### Schritt 3: Den Skill schreiben

Füll SKILL.md aus:
1. **Frontmatter**: name + description nach den Regeln oben
2. **Overview**: 1-2 Sätze dazu, was es ermöglicht
3. **Anleitung**: imperative Stimme ("Um X zu tun, führ Y aus"), nicht zweite Person
4. **Resource-Referenzen**: verweise nach Bedarf auf scripts/, references/, assets/

Lösch alle ungenutzten Resource-Verzeichnisse (nicht jeder Skill braucht alle drei).

### Schritt 4: Validieren

Prüf den Skill manuell gegen diese Checkliste (per Read auf das fertige SKILL.md):

- [ ] YAML-Frontmatter ist syntaktisch korrekt (öffnet und schließt mit `---`)
- [ ] `name:` existiert, ist lowercase Hyphen-case und passt zum Verzeichnis-Namen
- [ ] `description:` existiert, ist eine einzige Zeile und unter 300 Zeichen
- [ ] Die Description startet mit einem Aktions-Verb und enthält eine "Use when..."-Klausel
- [ ] Der Body hat eine klare Überschrift und imperative Anleitung
- [ ] Es gibt keine toten Verweise auf scripts/references/assets, die nicht existieren

Optional kannst du die Frontmatter im Bash-Tool gegenchecken:

```bash
head -10 ~/.claude/skills/<skill-name>/SKILL.md
```

---

## Bestehende Skills bearbeiten

### Description-Audit

Um alle Skill-Descriptions zu auditieren:

```bash
# Alle Skills mit ihren Descriptions auflisten
for dir in ~/.claude/skills/*/; do
  name=$(basename "$dir")
  desc=$(grep -A1 "^description:" "$dir/SKILL.md" 2>/dev/null | head -1 | sed 's/description: //')
  echo "$name: $desc"
done
```

Prüf jede Description gegen die Description-Regeln oben. Häufige Fixes:
- Fehlende "Use when..."-Klausel ergänzen
- Brand-spezifische Sprache durch generische Trigger ersetzen
- Wortreiche Descriptions kürzen
- Querverweise ergänzen, um ähnliche Skills abzugrenzen

### Einen Skill umbenennen

1. Verzeichnis umbenennen: `mv ~/.claude/skills/old-name ~/.claude/skills/new-name`
2. Das `name:`-Feld im SKILL.md-Frontmatter anpassen, damit es passt
3. Querverweise in den Descriptions anderer Skills aktualisieren

---

## CLAUDE.md Files organisieren

### Wann optimieren

- CLAUDE.md hat mehr als 300 Zeilen
- Claude liefert verwirrte oder schlechte Ergebnisse
- Das File mischt Verhaltensanweisungen mit Reference-Daten
- Beim Aufsetzen eines neuen Projekts

### Klassifizierungs-Regeln

**BEHALTEN in CLAUDE.md (Verhalten):**
- Projekt-Overview (max 2-3 Absätze)
- Kritische Regeln ("Immer X vor Y", "Niemals Z")
- Action-Patterns ("Wenn der User X sagt, tu Y")
- Cross-System-Workflows (Prozessschritte, keine Feld-Namen)
- Command-Index (Name + Einzeiler, Details in `.claude/commands/`)
- Reference-File-Index (Pointer auf `reference/`-Files)

**AUSLAGERN nach `reference/` (Daten):**
- API-curl-Beispiele (>3 Zeilen)
- Tabellen-/Feld-ID-Listen
- JSON-Schemas oder Payload-Beispiele
- System-Konfigurationsblöcke
- Credential-/Token-Details

**LÖSCHEN (Duplikate):**
- Inhalt, der "Siehe reference/X.md" sagt, ihn aber trotzdem wiederholt
- "Quick Reference"-Sektionen, die früheren Inhalt duplizieren
- Command-Beschreibungen, die schon in `.claude/commands/`-Files stehen

### Prozess

1. **Auditieren**: Zeilen zählen, jede Sektion klassifizieren
2. **Vorschlagen**: Vorher/Nachher-Metriken zeigen, jede Änderung auflisten
3. **Ausführen** (nach User-Freigabe): reference/-Files anlegen, CLAUDE.md neu schreiben
4. **Berichten**: Zeilen-Counts vorher/nachher, Reduktion in Prozent

### Reference-File-Naming

| Content-Typ | Pattern | Beispiel |
|-------------|---------|---------|
| API-Beispiele | `[system]-api.md` | `meta-ads-api.md` |
| Schemas | `[system]-schema.md` | `airtable-schema.md` |
| System-Config | `[system]-config.md` | `ghl-config.md` |
| Kombinierter Index | `systems-index.md` | `systems-index.md` |

### Ziel-Metriken

| Bewertung | Zeilen | Größe |
|--------|-------|------|
| Optimal | 100-200 | 3-6 KB |
| Akzeptabel | 200-300 | 6-10 KB |
| Nachbessern | 300-500 | 10-16 KB |
| Kritisch | 500+ | 16+ KB |
