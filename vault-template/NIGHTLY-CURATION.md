# Nightly Curation — Auftrag für den Cloud-Agent

Dieses Dokument ist der vollständige Arbeitsauftrag für die tägliche Nightly-Curation-Routine (siehe `CLAUDE.md` (Vault-Root), Operation "Lint"). Die Routine selbst bleibt dünn — sie clont dieses Repo und befolgt exakt diese Datei. Änderungen am Auftrag erfolgen hier, nicht in der Routinen-Konfiguration.

## Scope

Lint-Operation nach `CLAUDE.md` (Vault-Root) über `wiki/`, `memory/` UND Vault-Root (`*.md`, `*.json`, `*.canvas`, `*.base`). Broken-Link-Scan per kleinem Node-Script:
- Alle `link` und `Alias` extrahieren, Ziel vor erstem `|` oder `#` nehmen.
- Prüfen gegen Basename UND relativen Pfad aller `.md`-Dateien in `wiki/` UND `memory/`.
- Nur Klartext-Links zählen — Inline-Backtick-Code-Spans (`` `wiki/xyz` ``) sind bewusste Pfadangaben, keine Links, nicht anfassen.

`index.md`-Vollständigkeit nicht von Hand prüfen, sondern per fertigem Script im Repo:
`node scripts/vault-index-sync.mjs --check` listet fehlende Seiten und endet mit Exit-Code 1;
ohne `--check` trägt derselbe Aufruf sie ein (Details unter Auto-Apply Punkt 3).

## Auto-Apply-Whitelist (committen erlaubt)

Nur diese vier Aktionen dürfen ohne Rückfrage direkt committet werden:

1. **Broken wikilinks mit eindeutigem Ziel fixen.** Eindeutig heißt: genau ein existierender Slug passt (z.B. bekannter Namens-Drift durch Umbenennung/Konsolidierung). Bei mehreren möglichen Zielen oder keinem Treffer → nicht anfassen, in den Report.
2. **0-Byte-Karteileichen im Root löschen** — aber nur NACHDEM der verursachende Link (Punkt 1) gefixt wurde, sonst entsteht die Datei beim nächsten Obsidian-Öffnen erneut.
3. **`index.md`-Sync**: verwaiste `wiki/`-Seiten (existieren als Datei, fehlen in der Tabelle) eintragen; Einträge für gelöschte Seiten austragen.
   - **Eintragen läuft per Script, nicht von Hand:** `node scripts/vault-index-sync.mjs` (aus dem Repo-Root). Es ergänzt fehlende Zeilen und rührt bestehende nicht an. Die Ausgabe nennt jede ergänzte Seite — diese Liste in den `log.md`-Eintrag übernehmen.
   - Die vom Script erzeugte Zusammenfassung ist ein **Platzhalter** (erster Absatz der Seite). Das ist so gewollt und **kein** Report-Punkt. Bestehende Zusammenfassungen sind handkuratiert und dürfen weder vom Script noch vom Agent überschrieben werden.
   - **Austragen bleibt Handarbeit:** Zeilen, deren `wiki/`-Datei nicht mehr existiert, entfernt das Script nicht (es ergänzt nur). Solche Zeilen selbst löschen — aber erst prüfen, ob die Seite wirklich weg ist und nicht bloß umbenannt wurde; bei Umbenennung ist es ein Broken-Link-Fall nach Punkt 1.
4. **Genau ein `log.md`-Eintrag oben**, Format: `## [YYYY-MM-DD] nightly-curation | N Fixes, M Report-Punkte`. Kein zweiter Eintrag am selben Tag.
5. **Fehlendes `tags:`-Feld bei `memory/project_<projekt>_*.md` ergänzen**, wenn der Projekt-Bezug eindeutig aus dem Dateinamen-Präfix ableitbar ist (z.B. `project_webshop_*.md` → `tags: [webshop]`). Bei Namen ohne erkennbares Projekt-Präfix oder Mehrdeutigkeit → nicht anfassen, in den Report.

## Report-only (niemals selbst ändern)

Diese Kategorien nur beschreiben, nie selbst umsetzen:

- Inhaltliche Widersprüche (gleiche Fakten, unterschiedliche Aussagen)
- Veraltetes (`created`-Datum älter als 6 Monate ohne neuere Quelle)
- Duplikate zwischen Memory-Einträgen und Wiki-Seiten
- Mehrdeutige Broken Links (mehr als ein mögliches Ziel)
- Alle sonstigen inhaltlichen Merge- oder Umbau-Vorschläge

Report-Ziel: `Briefings/vault-health-YYYY-MM-DD.md`. Format je Punkt: Kategorie, betroffene Datei, empfohlene Aktion — analog zum Lint-Befund-Format in `CLAUDE.md` (Vault-Root). Gibt es nichts zu berichten, keine Report-Datei anlegen.

**Format-Pflicht:** Jeder Report-only-Fund ist eine eigene Zeile im Muster
`- [ ] <Kurztitel>: <Beschreibung inkl. betroffener Datei(en) und Empfehlung>`.
Kein Fließtext-Absatz mehr pro Fund — ein Fund = eine Checkbox-Zeile, auch wenn
die Beschreibung mehrere Sätze braucht (in der Zeile bleiben, keine Zeilenumbrüche
innerhalb der Beschreibung). Grund: UI (`VAULT`-Tab) und Skill
`vault-health-abarbeiten` parsen diese Zeilen einzeln und haken sie nach Erledigung
via `- [x]` ab.

## Harte Leitplanken

- `raw/` ist immutable — niemals anfassen, auch nicht bei offensichtlichen Fehlern.
- `memory/`-Dateien niemals löschen (Grundregel des Vaults, gilt auch hier).
- Keine inhaltlichen Wiki-Texte umschreiben — nur strukturelle Fixes aus der Whitelist oben.
- **Circuit-Breaker:** Wenn mehr als 20 Dateien von Fixes betroffen wären, NICHTS automatisch anwenden. Stattdessen alles (inkl. der eigentlich auto-fixbaren Punkte) in den Report schreiben und einen Hinweis ergänzen, dass der Circuit-Breaker ausgelöst hat. Schutz gegen Runaway-Umbauten durch einen fehlerhaften Lauf.
  - Gezählt werden **geänderte Dateien**, nicht geänderte Zeilen. Der `index.md`-Sync ist deshalb immer genau **eine** Datei, egal wie viele Zeilen er ergänzt — er darf den Breaker nicht auslösen. Grund: der Sync ist rein additiv und überschreibt nichts, das Runaway-Risiko, gegen das der Breaker schützt, existiert hier nicht.
- Keine Befunde → kein Commit, keine Report-Datei, keine Log-Zeile.
- Commit-Message-Prefix: `nightly-curation: <kurze Zusammenfassung>`. Push auf den Default-Branch.

## Nicht in diesem Scope

- Keine neuen Wiki-Seiten erstellen (das ist Ingest, kein Lint).
- Keine Skills ausführen außer der eigenen Lint-Logik.
- Keine Netzwerk-Zugriffe außer git clone/push auf dieses Repo.
