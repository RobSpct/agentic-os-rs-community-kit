# Skill-Lager (`~/.claude/skills-library/`)

Das **Lager** ist ein einfaches Muster, um deinen Claude-Root schlank zu halten.

## Warum

Claude lädt zu Session-Beginn die Beschreibungen **aller** Skills in `~/.claude/skills/`.
Viele aktive Skills = Token-Last in jeder Session. Lösung: nur die **regelmäßig
genutzten** Skills bleiben aktiv im Root; selten gebrauchte wandern ins **Lager**
`~/.claude/skills-library/` — dort sind sie **nicht aktiv** (werden nicht geladen),
aber griffbereit.

```
~/.claude/skills/            ← aktiv: wird in jeder Session geladen (Stamm-Skills)
~/.claude/skills-library/    ← Lager: inaktiv, nur Vorrat
<projekt>/.claude/skills/    ← projekt-lokal: nur in diesem Projekt aktiv
```

## Nachzieh-Workflow

Einen Lager-Skill in einem Projekt nutzen = **kopieren** (nicht verschieben):

```
~/.claude/skills-library/<name>/  →  <projekt>/.claude/skills/<name>/
```

So bleibt das Lager der Vorrat und das Projekt bekommt seine eigene Kopie. Trigger-Satz
im Chat: *„hol Skill X aus dem Lager ins Projekt"*.

## Wichtig: `_categories.json` mitpflegen

Die Skill-Matrix im Agentic-OS-Launcher liest `~/.claude/skills/_categories.json`. Beim
**Ein- oder Auslagern** eines Skills muss dort der Name **rein bzw. raus**, sonst zeigt
die Matrix tote Einträge. (Plugin-Skills, die per Name referenziert werden, dürfen ohne
lokalen Ordner drinstehen — das ist korrekt.)

## In diesem Template

Die mitgelieferten Skills (`../skills/`) sind als **aktive Stamm-Skills** gedacht
(Briefing, Board, Competitor + Helfer). Das Lager legst du beim Setup an (siehe
`INSTALL.md`, Schritt 5) — leer oder mit den Skills, die du selten brauchst. Der
**Competitor-Skill** ist eine Ausnahme: er gehört nicht in den globalen Root, sondern
**projekt-lokal** (er merkt sich pro Projekt seine Konfiguration).
