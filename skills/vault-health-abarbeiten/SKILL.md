---
name: vault-health-abarbeiten
description: Arbeitet offene Report-only-Punkte aus dem neuesten Nightly-Curation-Report (Briefings/vault-health-YYYY-MM-DD.md) ab — eindeutige Faelle (z.B. veralteter Status in einem Memory-Eintrag, klarer Broken-Link-Fix, eindeutiges Duplikat) direkt fixen und abhaken, mehrdeutige/riskante Faelle einmal gebuendelt fragen und danach abhaken. Haekt NIE Punkte ab ohne die zugehoerige Aenderung tatsaechlich vorgenommen zu haben. Trigger DE: 'vault health abarbeiten', 'kuration abarbeiten', 'nightly report abarbeiten', 'offene vault punkte'. Trigger EN: 'process vault health report', 'work through curation findings'.
---

# Vault-Health-Report abarbeiten

## Ablauf

1. **Neuesten Report finden**: `Briefings/vault-health-*.md` per Glob, sortiert nach
   Datum im Dateinamen, neuester gewinnt.
2. **Offene Punkte extrahieren**: alle Zeilen im Muster `- [ ] <Kurztitel>: <Beschreibung>`
   aus der Report-only-Sektion. Bereits abgehakte (`- [x]`) ignorieren.
3. **Pro Punkt einordnen** (Trust-Modell, analog `briefing-abarbeiten`):
   - **Eindeutig → direkt fixen:**
     - Veralteter/widersprüchlicher Status in einem `memory/*.md`-Eintrag, wenn der
       Report klar sagt was aktuell ist (z.B. "X ist inzwischen erledigt, Memory sagt
       noch offen") → Memory-Eintrag per Edit aktualisieren.
     - Broken Wikilink mit eindeutigem Korrektur-Ziel, das der Report bereits benennt.
     - Test-/Karteileichen-Datei, deren eigener Text um Löschung bittet UND der Report
       bestätigt, dass ihr Zweck erfüllt ist.
   - **Mehrdeutig/riskant → zurückstellen:**
     - Inhaltliche Widersprüche zwischen zwei Wiki-Seiten ohne klare Reihenfolge.
     - Vorschläge zum Merge zweier Notizen.
     - Alles, wo der Report selbst zwei Optionen nennt oder unsicher formuliert
       ("könnte", "eventuell", "prüfen ob").
4. **Eindeutige Punkte**: Änderung durchführen, danach in der Report-Datei die
   Zeile von `- [ ]` auf `- [x]` setzen (Edit-Tool, exakte Zeile matchen).
5. **Mehrdeutige Punkte bündeln**: EINMAL alle offenen mehrdeutigen Punkte gesammelt
   dem User vorlegen (AskUserQuestion oder Aufzählung + Rückfrage). Nach Antwort:
   Änderung durchführen + im selben Lauf abhaken.
6. **Nichts erfinden**: wenn ein Punkt unklar bleibt und keine Antwort möglich ist
   (z.B. User antwortet nicht in dieser Session), NICHT abhaken — offen lassen für
   nächsten Lauf.
7. **Committen + pushen (Pflicht, nicht optional):** Der nächtliche Cloud-Agent
   clont das Repo frisch von GitHub — lokale, uncommittete Fixes sind für ihn
   unsichtbar und er meldet dieselben Punkte am nächsten Tag erneut. Deshalb nach
   jedem Lauf mit mindestens einem direkt gefixten oder abgehakten Punkt:
   - `git pull --rebase` (Nightly-Agent committet parallel auf `master` —
     Konflikt sonst vorprogrammiert).
   - Alle geänderten Dateien (Fixes + abgehakter Report) committen:
     `vault-health: N Punkte abgearbeitet`.
   - `git push origin master`.
   - Kein offener Punkt in diesem Lauf gefixt (alles auf Rückfrage/nächsten Lauf
     verschoben) → kein Commit nötig.
8. **Abschluss**: kurze Zusammenfassung was direkt gefixt wurde, was auf Rückfrage
   wartete, was offen blieb, ob gepusht wurde.

## Nicht anfassen

- `raw/` (immutable).
- `memory/`-Dateien werden nie gelöscht, nur inhaltlich aktualisiert.
- Auto-Apply-Sektion des Reports (schon committet, kein Re-Fix nötig).

## Verwandt

`briefing-abarbeiten` (Schwester-Skill, gleiches Trust-Modell für Mail-Triage),
`wiki/nightly-curation-agent.md`, `NIGHTLY-CURATION.md`.
