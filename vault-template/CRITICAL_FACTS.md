# Critical Facts

Schneller Einstieg ohne Vault-Scan. Hier stehen nur Dinge, die sich **selten ändern** und die
Claude in fast jeder Session braucht. Kurz halten — diese Datei ist kein zweites Wiki.

## User

- **Name / Rolle:** <<USER_NAME>>, <z.B. Solo-Entwickler>
- **Arbeitsweise:** <z.B. plan-first, Approval vor Implementierung>
- **Sprache:** <z.B. Deutsch, Tech-Begriffe englisch>

## Projekte (aktiv)

| Projekt | Kürzel/Tag | Pfad | Kurz |
|---------|-----------|------|------|
| <<PROJECT_NAME>> | `<tag>` | `<<HOME>>/Dev/<projekt>` | <ein Satz> |

## Vault-Regeln (Kurzfassung)

- Wissensfrage → erst `wiki/` per Glob+Grep durchsuchen, dann `memory/`.
- Neue Notiz → `wiki/` bei wiederverwendbarem Wissen, `memory/` bei Status-Fakten.
- Jede neue `wiki/`- und `memory/`-Datei braucht ein befülltes `tags:`-Feld.
- `raw/` ist immutable. `memory/`-Dateien werden nie gelöscht.
- Details: `CLAUDE.md` im Vault-Root.
