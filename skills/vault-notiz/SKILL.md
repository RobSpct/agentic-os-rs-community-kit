---
name: vault-notiz
description: "Nimmt einen Gedanken, eine Idee oder einen rohen Input und legt ihn als sauber strukturierte Obsidian-Notiz im Vault ab - sinnvoller Titel, kurzes Frontmatter mit tags, klare Struktur und relevante [[Links]] zu vorhandenen Notizen. Trigger (Deutsch): 'notier das', 'pack das in eine notiz', 'speicher das', 'ab ins vault', 'mach ne notiz draus', 'halt das fest', 'ins obsidian'. Trigger (Englisch): 'capture this', 'save this as a note', 'note this down', 'put this in my vault', 'make a note of this', 'jot this down'."
---

# Vault-Notiz Skill

Verwandelt einen rohen Gedanken in eine saubere, Obsidian-native Notiz. Der User wirft etwas hin (eine Idee, ein Insight, eine Entscheidung, ein Link, ein paar Stichpunkte) und du legst daraus eine gut strukturierte Markdown-Datei im Vault ab, die spaeter wiederfindbar und verlinkt ist.

## Kernprinzip

Eine gute Vault-Notiz ist **kein Dump**. Sie ist eine destillierte, wiederfindbare Einheit:

> Wuerde der User diese Notiz in drei Monaten oeffnen und sofort verstehen, worum es geht und wie sie mit dem Rest seines Wissens zusammenhaengt?

Wenn ja → die Notiz ist gut. Wenn der Titel nichtssagend ist oder keine Links existieren → nacharbeiten.

Das Ziel ist immer: **eine Notiz, ein Thema.** Lieber zwei kleine klare Notizen als eine grosse Mischung.

## Sicherheit zuerst

- Du **erstellst nur eine neue Notiz** (Write) und fuegst optional **[[Links]]** hinzu (Edit).
- Du **loeschst oder ueberschreibst niemals** bestehende Notizen ohne ausdrueckliche Bestaetigung.
- Wenn schon eine Notiz mit (fast) demselben Titel existiert: **frag nach**, ob ergaenzen oder neu anlegen.
- Keine privaten Daten in oeffentlich gedachte Notizen (Emails, Tokens, Kundennamen) ungefragt verschriften.

## Wo landet die Notiz?

Vault: `<<VAULT_ROOT>>`. Notizen landen in `wiki/<thema>.md`
(kuratierte Wissensseiten, siehe `AgenticOS/CLAUDE.md`). Nicht in `memory/`
(Auto-Memory, anderer Zweck) und nicht in `raw/` (immutable Quellen-Archiv).

## Workflow

### Schritt 1: Input verstehen und destillieren

Lies den Input des Users genau. Frag dich:

- Was ist der **eine Kerngedanke**? (Das wird der Titel.)
- Ist es eine **Idee**, ein **Insight/Lesson**, eine **Entscheidung**, ein **Howto**, ein **Link/Quelle** oder eine **lose Sammlung**? Der Typ bestimmt die Struktur.
- Fehlt offensichtlich Kontext, ohne den die Notiz spaeter unverstaendlich waere? Wenn ja: **eine** kurze Rueckfrage, nicht fuenf.

Destilliere, statt eins-zu-eins zu kopieren. Stichpunkte zu klaren Saetzen, Gerede zu Kernaussagen.

### Schritt 2: Vorhandene Notizen scannen (fuer Links + Dubletten)

Bevor du schreibst, schau dir den Vault an, damit du sinnvoll verlinken kannst und keine Dublette anlegst:

1. Mit **Glob** alle Markdown-Dateien im Vault finden, z.B. Pattern `<<VAULT_ROOT>>/**/*.md`.
2. Mit **Grep** nach den Kernbegriffen des neuen Themas suchen (Volltext) - findet verwandte Notizen zuverlaessiger als ein Katalog, dessen Zusammenfassungsspalte duenner ist als der Inhalt.
3. Anhand der Dateinamen 2-6 thematisch verwandte Notizen identifizieren, die du als `[[Link]]` setzen kannst.
4. Pruefen, ob es schon eine fast gleichnamige Notiz gibt → falls ja, Schritt aus "Sicherheit zuerst" anwenden.

Nutze fuer Links den **Notiznamen ohne `.md` und ohne Pfad** (Obsidian-Wikilink-Konvention), also `[[Content-Strategie]]`, nicht `[[notes/Content-Strategie.md]]` - ausser der Vault nutzt erkennbar Pfad-Links.

### Schritt 3: Titel und Dateiname festlegen

- **Titel**: konkret und scanbar. "Hook-Pattern: Frage-dann-Antwort" ist gut. "Gedanken" ist schlecht.
- **Dateiname**: aus dem Titel ableiten. Klartext mit Bindestrichen oder Spaces, je nach Vault-Konvention. Keine Sonderzeichen, die Obsidian/Dateisysteme stoeren (`/ \ : * ? " < > |`).
- Bei Datums-relevanten Notizen optional ein `YYYY-MM-DD`-Prefix, wenn der Vault das so macht.

### Schritt 4: Notiz schreiben

Struktur der Datei:

```markdown
---
title: <Klarer Titel>
tags: [<2-4 sinnvolle tags>]
created: <YYYY-MM-DD>
sources:
  - <woher der Gedanke kam, z.B. raw/quelle.md oder "Gespraech mit User">
---

# <Klarer Titel>

<1-2 Saetze: worum geht es, in einem Atemzug erklaert.>

## <passende Sektion(en) je nach Typ>

<Destillierter Inhalt, strukturiert.>

## Verwandt

- [[Verwandte-Notiz-1]]
- [[Verwandte-Notiz-2]]
```

**Projekt-Tag-Pflicht** (siehe `AgenticOS/CLAUDE.md`): gehoert die Notiz klar zu
einem Repo/Projekt → Projekt-Tag kleingeschrieben ins `tags:`-Array (Schema:
`<projekt-kuerzel>`, z.B. `webshop` / `app`). Cross-Projekt-Wissen
(User-Profil, generisches Tooling) → explizit `cross-projekt`.

**Sektionen nach Notiz-Typ** (waehle adaptiv, erzwinge nicht alle):

| Typ | Sinnvolle Sektionen |
|-----|---------------------|
| Idee | Kerngedanke, Warum interessant, Naechster Schritt |
| Insight / Lesson | Was gelernt, Kontext/Ausloeser, Konsequenz |
| Entscheidung | Entscheidung, Begruendung, Verworfene Alternativen |
| Howto | Ziel, Schritte, Stolperfallen |
| Quelle / Link | Quelle (URL), Kernaussage, Eigene Einordnung |
| Lose Sammlung | Stichpunkte gruppiert nach Unterthema |

Regeln fuer den Inhalt:

- Deutsch schreiben, Tech-Begriffe (Claude Code, MCP, Vault, Frontmatter) englisch lassen.
- Umlaute korrekt (ä ö ü ß), keine Em-Dashes.
- Kurze, klare Saetze. Kein Fuelltext.
- `created`-Datum aus dem echten Systemdatum nehmen, nicht raten.
- `tags` ohne `#` im Frontmatter-Array (Obsidian-Konvention), z.B. `tags: [content, hook]`.

### Schritt 5: Index aktualisieren (Pflicht, nicht optional)

`index.md` ist der Master-Katalog aller Wiki-Seiten (siehe `AgenticOS/CLAUDE.md`)
und muss nach jeder neuen Notiz mit **Edit** eine Zeile bekommen:
`| [[wiki/thema]] | tag1, tag2 | YYYY-MM-DD | Kurzbeschreibung |`.
Niemals den Index sonst umstrukturieren - nur die eine Zeile anhaengen.

### Schritt 6: log.md-Eintrag (Pflicht)

Oben in `log.md` (append-only, neueste Eintraege oben) eine Zeile ergaenzen:
`## [YYYY-MM-DD] ingest | <Thema> aufgenommen`.

### Schritt 7: Auto-Wikilink-Hook beachten

Ein PostToolUse-Hook verlinkt nach dem Schreiben automatisch Klartext-Erwaehnungen
existierender Wiki-Slugs zu `[[wiki/slug|Text]]`. Konsequenzen:
- Referenz-Namen muessen exakt zum echten Slug passen (Tippfehler/alter Slug wird
  nicht erkannt, bleibt als broken Link stehen).
- Reine Pfadangaben ohne Link-Absicht in Backticks setzen (`` `wiki/xyz` ``) -
  die laesst der Hook in Ruhe.
- Details: `AgenticOS/CLAUDE.md`, Abschnitt "Auto-Wikilink-Hook (Gotcha)".

### Schritt 8: Kurze Rueckmeldung

Sag dem User in 1-2 Zeilen:

- Wie die Notiz heisst und wo sie liegt (voller Pfad).
- Mit welchen vorhandenen Notizen sie verlinkt ist.
- Dass `index.md` + `log.md` aktualisiert wurden.

Keine Roman-Zusammenfassung. Der User wollte etwas festhalten, nicht eine Praesentation.

## Beispiel (verkuerzt)

User: "notier das mal - Hooks die mit einer Frage starten performen bei mir besser als Statement-Hooks, hab ich diese Woche gemerkt"

Ergebnis-Datei `<<VAULT_ROOT>>\wiki\frage-hooks-schlagen-statement-hooks.md`:

```markdown
---
title: Frage-Hooks schlagen Statement-Hooks
tags: [content, hook, insight]
created: 2026-06-03
sources:
  - Gespraech mit User
---

# Frage-Hooks schlagen Statement-Hooks

Hooks, die mit einer Frage starten, performen bei mir aktuell besser als Statement-Hooks.

## Was gelernt
- Frage-Hooks ziehen mehr Watchtime in den ersten 3 Sekunden.

## Kontext
- Beobachtung aus der laufenden Woche, noch nicht hart A/B-getestet.

## Naechster Schritt
- Bewusst ein Statement- gegen ein Frage-Hook-Video testen.

## Verwandt
- [[Hook-Archetypen]]
- [[Content-Strategie]]
```

Rueckmeldung an User: "Liegt als `wiki/frage-hooks-schlagen-statement-hooks.md`, verlinkt mit [[Hook-Archetypen]] und [[Content-Strategie]], `index.md`+`log.md` aktualisiert."

## Checkliste vor dem Speichern

- [ ] Ein Thema, ein klarer Titel.
- [ ] Frontmatter mit `title`, `tags` (inkl. Projekt-Tag falls zutreffend), `created` (echtes Datum), `sources`.
- [ ] Inhalt destilliert, nicht roh kopiert.
- [ ] Mindestens 1-2 sinnvolle `[[Links]]` (falls passende Notizen existieren).
- [ ] Keine Dublette ohne Rueckfrage angelegt.
- [ ] `index.md`-Zeile ergaenzt.
- [ ] `log.md`-Eintrag oben ergaenzt.
- [ ] Vollen Pfad an den User zurueckgemeldet.

_Teil des Agentic OS Skill-Bundles - frei anpassbar._
