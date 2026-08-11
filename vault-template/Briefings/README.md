# Briefings/

Zwei Sorten Dateien, beide werden vom Dashboard gelesen:

| Muster | Was |
|--------|-----|
| `YYYY-MM-DD.md` | Tages-Briefing. Der BRIEFING-Tab zeigt das neueste. |
| `vault-health-YYYY-MM-DD.md` | Report der Nightly Curation (siehe `../NIGHTLY-CURATION.md`). Der VAULT-Tab liest die offenen Punkte. |

Die Health-Reports bestehen aus Checkbox-Zeilen (`- [ ] Titel: Beschreibung`). Der Skill
`vault-health-abarbeiten` arbeitet sie ab und hakt erledigte Punkte mit `- [x]` ab — das Format
also nicht umbauen, sonst findet der Parser die Zeilen nicht mehr.

Ohne eingerichtete Nightly Curation bleibt der Ordner leer. Das ist kein Fehler; der
BRIEFING-Tab zeigt dann einen Hinweis statt Inhalten.
