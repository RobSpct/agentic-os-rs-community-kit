# Scripts

Generische, projekt-unabhängige Scripts. Kein Copy-Paste-Neubau mehr — hier nachschauen, ob's das schon gibt.

## Regeln

- **Generisch heißt generisch.** Kein Projekt-Name/-Pfad im Script selbst. Passt ein Script nur zu einem Projekt, gehört es dorthin, nicht hierher.
- **Jedes Script kriegt einen Header** (Kommentar-Block oben in der Datei):
  ```
  # Zweck: <eine Zeile>
  # Kontext: <Link auf wiki/raw/memory-Eintrag, wo der Use-Case herkommt — optional>
  # Erstellt: YYYY-MM-DD
  ```
- **Kontext-Link ist optional, aber wenn gesetzt: echter Pfad, kein Freitext-Wikilink.** Also `wiki/plugin-patching-workflow.md` als Pfadangabe in Backticks, NICHT `[[wiki/plugin-patching-workflow]]` — sonst hängt der Auto-Wikilink-Hook (siehe `CLAUDE.md` im Vault-Root) das Script selbst ins Wiki-Link-Netz, und Scripts sind kein Lint-Ziel für Broken-Link-Checks. Backticks schützen zusätzlich davor.
- **Keine toten Links:** wird der referenzierte Wiki/Memory-Eintrag umbenannt oder gelöscht, Header-Kommentar mitpflegen (kein Auto-Sync).
- **Sprache/Format:** Kommentare Deutsch, Code wie im Zielprojekt üblich (meist TS/JS/PowerShell/Bash).

## Ablage

Flach, kein Unterordner-Zwang. Bei wachsender Zahl nach Zweck gruppieren (`scripts/patching/`, `scripts/vault/`, …).
