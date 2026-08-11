# Memory Index

Ladeliste der Auto-Memory (`memory/`). Wird **jede Session vollständig in den Kontext geladen** —
deshalb Zeilenzahl **unter 140 halten**.

**Was hier NICHT reingehört:**
- **Wiki-Notizen** (`wiki/`) — die haben ihren eigenen Katalog in `../index.md` und werden bei
  Bedarf per Glob+Grep gefunden. Eine Zeile hier würde nur Kontext-Budget fressen.
- **Abgeschlossene Arbeit** ohne offene Punkte — das Wissen steht im Commit bzw. im Wiki.
  Die Memory-Datei bleibt liegen, die Zeile kommt raus.

Aussortierte Einträge werden **nicht gelöscht** — nur aus dieser Liste entfernt. Die Dateien
bleiben im Ordner und sind per Grep auffindbar.

Zeilenformat: `- [Titel](dateiname.md) — Kurzbeschreibung`. Offene Punkte mit `OFFEN:` markieren.

## <Projekt A>

<!-- - [Beispiel-Eintrag](beispiel-memory.md) — wofür der Eintrag gut ist -->

## Cross-Projekt

<!-- Einträge, die für mehrere Projekte gelten -->
