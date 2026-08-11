---
name: vault-export
description: "Erzeugt einen portablen Snapshot des kuratierten Vault-Wissens (wiki/ + index.md), lesbar fuer andere AI-Tools/Sessions ohne vollen Vault-Zugriff. Kein raw/, kein memory/ (interne Arbeitslayer). Trigger (Deutsch): 'exportier den vault', 'snapshot vom brain', 'vault-export', 'exportier mein wissen'. Trigger (Englisch): 'export the vault', 'snapshot my second brain', 'vault export'."
---

# Vault-Export Skill

Erzeugt einen sauberen, konsolidierten Snapshot des `wiki/`-Wissens im AgenticOS-Vault — fuer andere Tools, Geraete oder Sessions, die keinen vollen Vault-Zugriff haben, aber den aktuellen Wissensstand brauchen.

## Was wird exportiert

- `index.md` (Katalog-Metadaten: Seite, Tags, Erstellt, Zusammenfassung).
- Alle `wiki/*.md`-Seiten: Frontmatter (`title`, `tags`, `created`, `sources`) + voller Inhalt.
- `CRITICAL_FACTS.md`, falls vorhanden.

**Bewusst NICHT exportiert:**
- `raw/` — Rohquellen, nicht destilliert, kein Mehrwert im Snapshot.
- `memory/` — Session-/Projekt-interne Fakten, nicht fuer Cross-Tool-Konsum gedacht.
- `.obsidian/`, Skills, Scripts — kein Wissen, reine Vault-Mechanik.

## Workflow

### Schritt 1: Format klaeren

Wenn nicht eindeutig aus dem Auftrag hervorgeht, frag kurz (eine Frage, mit Empfehlung):

- **JSON** (Empfehlung fuer "fuer ein anderes Tool/AI") — maschinenlesbar, ein Array von `{path, title, tags, created, sources, content}`.
- **Markdown** (Empfehlung fuer "fuer einen Kollegen/Menschen") — eine zusammengefasste `.md`-Datei mit allen Wiki-Seiten hintereinander, Inhaltsverzeichnis oben.

### Schritt 2: Vault einlesen

1. `index.md` lesen (Glob + Read) als Strukturuebersicht.
2. Alle `wiki/*.md`-Dateien einlesen (Glob `wiki/**/*.md`).
3. Pro Datei Frontmatter (YAML zwischen `---`) parsen + restlichen Inhalt uebernehmen.

### Schritt 3: Snapshot schreiben

Zielordner: `AgenticOS/exports/` (anlegen falls nicht vorhanden — dieser Ordner ist gitignored, da reproduzierbar aus `wiki/`).

Dateiname: `vault-snapshot-YYYY-MM-DD.json` bzw. `.md` (echtes Systemdatum, nicht raten).

**JSON-Struktur:**
```json
{
  "exported": "YYYY-MM-DD",
  "source": "AgenticOS Vault wiki/",
  "pages": [
    {
      "path": "wiki/beispiel-seite.md",
      "title": "Beispiel-Seite",
      "tags": ["tag1", "tag2"],
      "created": "YYYY-MM-DD",
      "sources": ["raw/quelle.md"],
      "content": "Voller Markdown-Inhalt nach dem Frontmatter."
    }
  ]
}
```

**Markdown-Struktur:** Ein Dokument, oben ein Inhaltsverzeichnis (Titel + Anker je Seite), darunter jede Wiki-Seite als eigener `##`-Abschnitt mit Tags/Datum als Meta-Zeile, dann der volle Inhalt.

### Schritt 4: Kurze Rueckmeldung

Sag dem User: wie viele Seiten exportiert wurden, wohin (voller Pfad), welches Format. Keine Inhaltszusammenfassung — der Snapshot spricht fuer sich.

## Sicherheit

- Reiner Lesevorgang auf `wiki/`/`index.md`, keine Aenderung am Vault selbst.
- Snapshot-Datei ueberschreibt nie einen bestehenden Snapshot vom selben Tag ohne Rueckfrage (Timestamp im Dateinamen macht das meist ohnehin obsolet).
- Kein automatisches Hochladen/Versenden des Snapshots — der User entscheidet, was er damit macht.

_Teil des Agentic OS Skill-Bundles._
