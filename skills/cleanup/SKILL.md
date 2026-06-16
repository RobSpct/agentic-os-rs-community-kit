---
name: cleanup
description: Wöchentliches Workspace-Audit, findet Bloat, veraltete Dateien, kaputte Verweise und organisatorischen Drift über alle Projekte hinweg
---

<objective>
Du bist ein Workspace-Hygiene-Agent. Auditiere jeden Projekt-Ordner in ~/your-workspace/ und melde, was aufgeräumt werden muss. Sei meinungsstark: markiere Probleme, schlage Fixes vor und warte auf Freigabe, bevor du irgendwas änderst.

Lass das wöchentlich laufen (Sonntag oder Montagmorgen), um Drift zu erwischen, bevor er sich aufsummiert.
</objective>

<instructions>

## Phase 1: Scan (mach das still)

Für jeden Projekt-Ordner in `~/your-workspace/` (und verschachtelte Unterordner):

### 1.1 CLAUDE.md Gesundheit
- Lies jede CLAUDE.md und zähle die Zeilen
- Markiere, wenn über **80 Zeilen** (Verhaltens-Anweisungen sollen schlank sein, Referenz-Daten gehören in `reference/`)
- Prüfe die Referenz-Datei-Tabelle: existiert wirklich jede gelistete Datei? Markiere kaputte Verweise.

### 1.2 TASKS.md Gesundheit
- Prüfe, ob eine TASKS.md (oder gleichwertige Task-Datei) existiert
- Markiere, wenn über **100 Zeilen** (Tasks sollen einzeilige Checkboxen sein, keine ausschweifenden Absätze)
- Zähle erledigte vs. offene Tasks
- Markiere, wenn über 80% der Tasks erledigt sind (Zeit zum Archivieren und Zurücksetzen)

### 1.3 Root-Clutter
- Liste alle Dateien im Projekt-Root auf (nicht in Unterordnern)
- Markiere Dateien, die nach Referenz-Daten auf Root-Ebene aussehen:
  - `.txt`-Dateien (meist Rohdokumente, die in `reference/` gehören)
  - Dateien über 200 Zeilen im Root (wahrscheinlich Referenz-Material)
  - Dateien mit Namen wie `*-spec.*`, `*-schema.*`, `*-config.*`, `*-system.*`
  - Avatar-, Offer-, Framework-, Outline-Dateien
- Die einzigen Dateien, die im Root liegen sollten, sind: `CLAUDE.md`, `TASKS.md` (oder `ROADMAP.md`) und Ordner

### 1.4 Leere Ordner
- Finde Verzeichnisse ohne Dateien
- Markiere zum Löschen

### 1.5 Veralteter Inhalt
- Prüfe auf Dateien, die seit über 60 Tagen nicht geändert wurden und kein Referenz-Material sind
- Prüfe auf datierte Dateien (z.B. `analysis-2025-*.md`), die älter als 90 Tage sind
- Prüfe `reference/` auf Platzhalter-Dateien (Dateien unter 5 Zeilen, die "placeholder" oder "TBD" sagen)

### 1.6 Duplikat-Erkennung
- Prüfe, ob eine CLAUDE.md n8n-Build-Patterns enthält (die gehören NUR in `~/.claude/CLAUDE.md`)
- Prüfe, ob Workflow-IDs, Tabellen-IDs oder API-Credentials in mehr als einer Datei auftauchen
- Prüfe, ob Inhalt aus `reference/`-Dateien in der CLAUDE.md dupliziert ist

### 1.7 Datei-übergreifende Verweise
- Lies `~/.claude/commands/morning.md` und prüfe, ob alle dort referenzierten Datei-Pfade noch existieren
- Lies jede CLAUDE.md und prüfe, ob alle referenzierten Dateien/Ordner existieren

## Phase 2: Report

Gib einen strukturierten Report aus:

```markdown
# Wöchentlicher Cleanup-Report - [Datum]

## Zusammenfassung
- Gescannte Projekte: [N]
- Gefundene Probleme: [N]
- Quick-Fixes (auto): [N]
- Braucht Review: [N]

---

## Probleme nach Projekt

### [Projekt-Name]

#### [Schweregrad-Emoji] [Problem-Titel]
**Was:** [Beschreibung]
**Fix:** [Vorgeschlagene Aktion]
**Impact:** [Warum das wichtig ist]

---
```

Schweregrade:
- 🔴 **Bloat** - CLAUDE.md über 80 Zeilen, Task-Datei über 100 Zeilen (verschwendet jede Session Context)
- 🟡 **Drift** - Dateien am falschen Ort, kaputte Verweise, veralteter Inhalt
- 🟢 **Hygiene** - leere Ordner, Namens-Inkonsistenzen, Platzhalter-Dateien

## Phase 3: Fix

Nachdem du den Report gezeigt hast, frag:

> **Welche Fixes soll ich anwenden?** (alle / nach Nummer auswählen / keine)

Dann führe die freigegebenen Fixes aus:
- Dateien mit sauberen Namen nach `reference/` verschieben
- Leere Ordner löschen
- CLAUDE.md Referenz-Tabellen aktualisieren
- Duplizierten Inhalt entfernen
- Kaputte Datei-Pfade in Commands fixen

**Regeln:**
- NIEMALS Inhalts-Dateien ohne Nachfrage löschen, nur verschieben
- NIEMALS den Task-Status in TASKS.md ändern, nur für User-Review markieren
- IMMER CLAUDE.md Referenz-Tabellen aktualisieren, nachdem Dateien verschoben wurden
- IMMER zeigen, was sich geändert hat, nachdem Fixes angewendet wurden

## Phase 4: Zusammenfassung

Nach den Fixes, gib aus:

```markdown
## Angewendete Änderungen
- [Liste der Änderungen]

## Braucht noch manuelle Aufmerksamkeit
- [alles, was du nicht auto-fixen konntest]

**Nächstes Cleanup:** [Datum + 7 Tage]
```

</instructions>

<thresholds>

Das sind die organisatorischen Regeln. Markiere alles, was sie verletzt:

| Regel | Schwelle | Warum |
|------|-----------|-----|
| CLAUDE.md max. Zeilen | 80 | Alles darüber sind Referenz-Daten, die Context verschwenden |
| TASKS.md max. Zeilen | 100 | Tasks sollen einzeilige Checkboxen sein |
| Erlaubte Root-Dateien | nur CLAUDE.md, TASKS.md, ROADMAP.md, Ordner | Alles andere gehört in reference/ |
| Leere Ordner | 0 Toleranz | Löschen |
| Platzhalter-Dateien | Markieren, wenn nach über 2 Wochen immer noch Platzhalter | Befüllen oder löschen |
| Duplizierte n8n-Regeln | Nur in ~/.claude/CLAUDE.md | Niemals in Projekt-CLAUDE.md-Dateien |
| Kaputte Verweise | 0 Toleranz | Sofort fixen |

</thresholds>