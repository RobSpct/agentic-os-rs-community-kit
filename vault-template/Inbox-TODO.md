# Inbox

Sammelstelle für Aufgaben ohne eigenes Projekt. Wird als Projekt „Inbox" in `projects.json`
registriert und landet damit in Task-Roadmap und Board.

Tag-Syntax je Zeile (alles optional außer dem Text):
`- [ ] Text @id:INBOX-1 @status:todo @prio:wichtig`

- `@status:` — `todo` | `doing` | `review` | `done` (Board-Spalte)
- `@prio:` — `kritisch` | `wichtig` | `normal` (Ampel in der Übersicht)
- `@id:` — stabile ID, wird beim ersten Aggregieren automatisch vergeben
- `- [x]` statt `- [ ]` bedeutet erledigt

## Kritisch

## Wichtig

## Normal

- [ ] Beispiel-Aufgabe — Zeile löschen, sobald echte To-Dos da sind @status:todo @prio:normal
