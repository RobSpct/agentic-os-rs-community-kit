---
name: session-uebergabe
description: "Schreibt am Ende einer Arbeits-Session ein praegnantes Handoff-Dokument, damit die naechste Claude-Session sofort den vollen Kontext hat (was gemacht wurde, aktueller Stand, naechste Schritte, offene Punkte, wichtige Pfade). Trigger DE: 'session handoff', 'uebergabe', 'handoff', 'handoff schreiben', 'fass die session zusammen', 'session zusammenfassen', 'wo waren wir', 'kontext fuer naechste session', 'session dokumentieren'. Trigger EN: 'session handoff', 'write handoff', 'summarize the session', 'where were we', 'context for next session', 'document the session'."
---

# Session-Uebergabe

Dein Job: am Ende einer Arbeits-Session ein kurzes, dichtes Handoff-Dokument schreiben. Ziel ist, dass eine komplett frische Claude-Session (oder du selbst morgen) in 30 Sekunden wieder voll im Bild ist: Was wurde gemacht, wo stehen wir, was kommt als Naechstes, was ist offen, welche Dateien sind wichtig.

Das ist primaer ein READ-ONLY plus EIN-FILE-WRITE Skill: Du liest Kontext und schreibst genau ein Handoff-Dokument. **Eine Ausnahme:** Wenn die Session ein Projekt betraf, das in der Task-Roadmap registriert ist, darfst du in dessen `TODO.md` erledigte Aufgaben abhaken — aber **nur die, die der User ausdruecklich bestaetigt hat** (siehe Schritt 3.5). Sonst veraenderst du nichts am Projekt, fasst nichts an, loeschst nichts.

## Grundprinzip

Ein Handoff ist kein Roman. Es ist eine Landekarte fuer die naechste Session. Schreib so, dass jemand der NICHTS von dieser Session weiss sofort weiterarbeiten kann. Konkret statt vage: nicht "Bug gefixt", sondern "Login-Bug in `auth/login.ts` Zeile 42 gefixt, Token wurde doppelt gesetzt".

## Ablauf

### 1. Kontext sammeln (READ-ONLY)

Bevor du schreibst, sammel was du brauchst. Nutz dazu was vorhanden ist:

- **Den Gespraechsverlauf dieser Session** ist deine Hauptquelle. Geh durch was tatsaechlich passiert ist: welche Aufgabe, welche Entscheidungen, welche Dateien, welche Sackgassen.
- **Glob/Read** fuer relevante Dateien, falls du Pfade oder den letzten Stand verifizieren willst. Nur lesen, nie raten. Wenn du einen Pfad nennst, soll er stimmen.
- Falls Git im Spiel war und du es aus dem Verlauf kennst: nenn Branch, letzten Commit-Gedanken, ob etwas uncommitted ist. Erfinde keine Hashes.

Wenn etwas unklar ist (z.B. was wirklich der naechste Schritt sein soll), frag den User kurz nach, statt zu raten. Eine gezielte Rueckfrage ist besser als ein falsches Handoff.

### 2. Session-Typ erkennen und Sektionen waehlen

Erzwing nicht jede Sektion. Waehl die die passen. Typische Typen:

- **Bug-Fix / Debug**: Was war der Bug, Root-Cause, Fix, was noch nicht getestet.
- **Feature-Build**: Was gebaut, was fehlt noch, wie testen.
- **Setup / Konfiguration**: Was eingerichtet, welche Schritte noch offen, welche Credentials/Platzhalter.
- **Planung / Research**: Erkenntnisse, Entscheidungen, offene Fragen, naechste Recherche.
- **Content / Schreiben**: Was produziert, Stand der Drafts, was noch fehlt.

Eine kurze 30-Minuten-Session braucht 5 Zeilen. Eine grosse braucht mehr. Pass die Laenge an die Realitaet an, nicht an ein Template.

### 3. Handoff schreiben

Schreib mit **Write** genau eine Datei. Sprache: die des Users (default Deutsch). Tech-Begriffe (Claude Code, MCP, Branch, Commit) englisch lassen. Umlaute korrekt, keine Em-Dashes.

**Speicherort** (in dieser Reihenfolge probieren, das erste was passt):
1. Wenn das Projekt einen `.planning/`-Ordner hat, dort hinein.
2. Sonst ein `handoffs/`-Ordner im Projekt-Root (lege ihn an, falls noetig).
3. Sonst ins aktuelle Arbeitsverzeichnis.

Wenn der User einen anderen Ort will (z.B. seinen Obsidian-Vault unter `<<VAULT_ROOT>>`), schreib dahin.

**Dateiname**: `HANDOFF-<YYYY-MM-DD>-<kurzes-thema>.md`, z.B. `HANDOFF-2026-06-07-login-bug.md`. Datum aus dem System-Datum, nicht raten. Bei mehreren Handoffs am selben Tag eine `-2` anhaengen statt eine bestehende Datei zu ueberschreiben.

### 3.5 Roadmap-Abgleich (nur bei registriertem Projekt)

Wenn die Session an einem Projekt gearbeitet hat, das in der **Task-Roadmap** registriert ist,
gleich die offenen Roadmap-Aufgaben gegen das ab, was tatsaechlich umgesetzt wurde. So bleibt die
Roadmap aktuell, ohne dass der User von Hand abhaken muss. Diesen Schritt KOMPLETT ueberspringen,
wenn kein registriertes Projekt erkannt wird.

1. **Projekt bestimmen (per Arbeitsverzeichnis).** Lies die Registry
   `<<VAULT_ROOT>>\projects.json` (Vault-Pfad des Users; falls du ihn kennst, nutze ihn
   direkt — hier im Vault liegt sie). Jeder Eintrag hat `name`, `emoji`, `todo` (absoluter Pfad zur
   Projekt-`TODO.md`). Ermittle das aktuelle Arbeitsverzeichnis der Session und finde den Eintrag,
   dessen Projekt-Ordner das cwd enthaelt. Kein eindeutiger Treffer -> Schritt ueberspringen.
2. **Offene Aufgaben lesen.** Oeffne die `TODO.md` dieses Projekts, sammel alle offenen Zeilen
   (`- [ ] ...`). Nur offene sind Kandidaten.
3. **Erledigtes beurteilen — konservativ.** Geh den Session-Verlauf durch (und, falls Git im Spiel
   war, die Commits dieser Session). Bestimme, welche der offenen Aufgaben in dieser Session
   **belegbar** umgesetzt wurden. Im Zweifel NICHT vorschlagen. Lieber eine zu wenig als eine
   falsch abgehakt.
4. **User fragen — nichts ohne OK.** Liste die Kandidaten auf:
   > "Folgende Roadmap-Aufgaben wirken nach dieser Session erledigt. Abhaken? (sag welche, oder 'alle' / 'keine')
   > - [ ] <Aufgabe A>
   > - [ ] <Aufgabe B>"
   Warte auf die Antwort. Uebernimm ausschliesslich, was der User bestaetigt.
5. **Abhaken (nur Bestaetigtes).** Setze in der `TODO.md` die bestaetigten Zeilen von `- [ ]` auf
   `- [x]` (per Edit, exakter Zeilen-Match am Aufgabentext). Aendere sonst nichts an der Datei.
6. **Roadmap aktualisieren.** Fuehr den Aggregator aus, damit das Dashboard die Aenderung zeigt:
   ```bash
   node "<<CLAUDE_DIR>>/skills/task-roadmap/aggregate.js"
   ```
   (Pfad an den echten User anpassen; Script ist fehlertolerant.)

Wenn nichts erledigt wurde oder der User nichts bestaetigt: keine Schreibaktion, weiter zu Schritt 4.

### 4. Bestaetigen

Sag dem User in 1-2 Saetzen wo die Datei liegt und nenn den absoluten Pfad. Falls du im
Roadmap-Abgleich Aufgaben abgehakt hast, nenn kurz welche. Fertig.

## Template

Nimm das als Geruest, lass weg was nicht passt:

```markdown
# Handoff: <Thema> - <YYYY-MM-DD>

## TL;DR
<2-3 Saetze: Worum ging es, wo stehen wir jetzt. Das Wichtigste zuerst.>

## Was gemacht wurde
- <konkrete Aenderung mit Datei/Ort, z.B. "X in `pfad/datei.ts` angepasst">
- <Entscheidung die getroffen wurde und warum>

## Aktueller Stand
<Funktioniert es? Getestet oder nicht? Deployed oder lokal? Branch sauber oder uncommitted?>

## Naechste Schritte
1. <konkret, umsetzbar, in Reihenfolge>
2. <...>

## Offene Punkte / Risiken
- <was blockiert, was unsicher ist, worauf man aufpassen muss>

## Wichtige Pfade & Befehle
- `pfad/zur/datei` - wofuer
- `befehl zum starten/testen` - was er tut

## Kontext-Notizen (optional)
<Sackgassen die wir schon ausgeschlossen haben, damit die naechste Session sie nicht nochmal probiert. Wichtige Annahmen.>
```

## Wichtige Regeln

- **Ehrlich ueber den Stand.** Wenn etwas nicht getestet ist, schreib "nicht getestet". Behaupte nie dass etwas funktioniert ohne Beleg. Ein falsches "laeuft" kostet die naechste Session Stunden.
- **Konkret statt vage.** Immer Datei, Ort, Zeile, Befehl nennen wo moeglich. Pfade absolut oder eindeutig relativ zum Projekt-Root.
- **Keine Geheimnisse ins Handoff.** Keine API-Keys, Tokens, Passwoerter, privaten Mail-Adressen im Klartext. Stattdessen Platzhalter wie `{{API_KEY in .env}}` oder den Hinweis wo es liegt.
- **Naechste Schritte muessen actionable sein.** "Weitermachen" ist kein Schritt. "In `auth/login.ts` den doppelten setToken-Call entfernen und Login-Flow durchtesten" ist einer.
- **Nicht raten.** Lieber eine Rueckfrage als erfundene Hashes, Pfade oder Stati.
- **Nur eine Datei schreiben, sonst nichts anfassen.** Dieser Skill veraendert das Projekt nicht.

_Teil des Agentic OS Skill-Bundles - frei anpassbar._
