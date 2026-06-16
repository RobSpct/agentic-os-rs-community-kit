---
name: briefing-abarbeiten
description: "Arbeitet das taegliche Posteingang-Briefing (aus Briefings/) als Handlungsliste ab — nicht nur Mails beantworten, sondern To-Dos erkennen, Jira-/Issue-Mails auswerten (Ticket-ID, Status, Kommentare), Zusammenhaenge herstellen, priorisieren, UND verarbeitete Mails in den passenden Gmail-Ordner ablegen (lernt Absender->Ordner-Zuordnung, fragt nur bei Unbekanntem). Senden/Loeschen/Kommentieren bleibt Draft-only ohne OK. Trigger DE: 'briefing abarbeiten', 'briefing durchgehen', 'mein briefing', 'hiermit weiterarbeiten', 'handlungsschritte briefing', 'mails ablegen', 'inbox aufraeumen'. Trigger EN: 'work through briefing', 'process my briefing', 'file my mails'."
---

# Briefing abarbeiten

Du hilfst dem Nutzer, sein taegliches E-Mail-Briefing in
konkrete Handlungen zu verwandeln. Es geht **nicht nur ums Beantworten von Mails** —
viele Eintraege sind To-Dos, Jira-Ticket-Updates oder haengen zusammen. Knapp,
deutsch, ehrlich. Priorisieren statt blind Liste abarbeiten.

## Harte Sicherheits-Regel (nicht verhandelbar)

Dieser Skill darf GENAU EINE schreibende Gmail-Aktion ohne pro-Mail-Rueckfrage: **Mails
ablegen** (= Ziel-Label setzen + `INBOX`-Label entfernen, ggf. fehlenden Ordner via
`create_label` anlegen — Details Schritt 4c). Plus die zwei lokalen Schreibaktionen:
`Inbox-TODO.md` anhaengen (4b) und Briefing-Haekchen (5).

**Alles andere bleibt Draft-only / verboten ohne das ausdrueckliche, einzelne OK des Nutzers
pro Aktion:** senden, loeschen / in Trash, kommentieren, Tickets aendern, als gelesen
markieren. `UNREAD` fasst du nur im Rahmen des Ablege-Konsenses an, nicht separat.

**Trust beim Ablegen:** Mails mit bekanntem Ziel (Treffer in `inbox-ablage-regeln.md`)
oder reiner Noise legst du **ohne Rueckfrage** ab. Bei **unbekanntem** Ziel fragst du
einmal, lernst die Antwort als Regel und legst dann ab. Im Zweifel: nicht ablegen,
Mail im Posteingang lassen, ehrlich sagen.

## Schritt 0 — Briefing laden

Lies das neueste Briefing aus dem Vault-Ordner `Briefings/` (Datei `YYYY-MM-DD.md`,
hoechstes Datum). Das ist die vom Cloud-Agent erzeugte Posteingang-Triage. Falls
leer/nicht da: ehrlich sagen, nicht erfinden.

## Schritt 1 — Pro Eintrag den Typ erkennen

Geh jeden Briefing-Eintrag durch und ordne ihn EINEM Handlungstyp zu:

- **(a) Antwort noetig** — jemand erwartet eine Reply. → Antwort-Entwurf vorschlagen
  (in der Stimme des Nutzers: direkt, knapp, hoeflich, keine Floskeln). Erst nach OK senden.
- **(b) To-Do** — die Mail loest eine Aufgabe aus (kein Reply noetig). → als klares
  To-Do festhalten. Auf Wunsch in Vault/Task-Liste eintragen.
- **(c) Jira-/Issue-Benachrichtigung** — werte den **Mail-Inhalt selbst aus** (Gmail-
  Thread via MCP lesen, KEIN Jira-Connector noetig). Zieh raus:
  - **Ticket-ID** (z.B. PROJ-161, PROJ-XXX)
  - **Art der Aenderung**: Status-Wechsel / neuer Kommentar / Zuweisung / erstellt
  - bei **Kommentaren**: WER hat geschrieben + WAS genau
  - Fasse zusammen was passiert ist und ob/welche Reaktion noetig ist.
  - *Hinweis: aktuell kein direkter Jira-Connector. Sobald ein Jira-/Atlassian-Tool
    verbunden ist, darfst du Tickets direkt lesen/kommentieren (nach OK).*
- **(d) Security / Frist** — neues Geraet-Login, Passwort-/Zahlungsdaten-Aenderung,
  Rechnung mit Deadline. → hervorheben, fragen ob legitim / was zu tun ist.
- **(e) reine Info** — kein Handeln noetig. → kurz abhaken, nicht aufblaehen.

## Schritt 2 — Zusammenhaenge herstellen

Verknuepfe, was zusammengehoert: welche Mail bezieht sich auf welches Ticket, welches
To-Do haengt an welcher Konversation. Mehrere Mails zum selben Thema buendeln statt
einzeln abarbeiten.

## Schritt 3 — Priorisieren

Sortiere die Handlungspunkte nach Prioritaet (Security/Frist zuerst, dann Antworten
mit Wartenden, dann To-Dos, Info zuletzt). Zeig die priorisierte Liste KURZ, dann
fragst du: womit anfangen?

## Schritt 4 — Punkt fuer Punkt durchgehen

Pro Punkt: Vorschlag machen (Entwurf / To-Do-Text / Ticket-Reaktion), das OK des
Nutzers abwarten, dann erst handeln. Einer nach dem anderen, nicht alles auf einmal.

## Schritt 4b — Action-Items in die Inbox-Task-Liste schreiben

Damit Briefing-To-Dos im **Board-Tab** auftauchen (und nicht nur in der Briefing-
Datei verschwinden), schreibst du die echten Handlungspunkte in die registrierte
Inbox-Task-Liste: `{{VAULT_ROOT}}/Inbox-TODO.md`.

Regeln:

- **Nur nach OK des Nutzers**, dass die Punkte in die Liste sollen (eine Sammel-Bestaetigung
  fuer die priorisierte Liste reicht — nicht pro Zeile fragen).
- **Anhaengen, nie ueberschreiben.** Lies die Datei, fueg neue `- [ ]`-Zeilen unter die
  passende Ampel-Sektion (`## 🔴 Kritisch` / `## 🟡 Wichtig` / `## 🟢 Nice-to-have`)
  ein. Security/Frist → 🔴, normale To-Dos → 🟡, reine Info **nicht** eintragen.
- **Nur echte Handlungspunkte** (Typ b/c/d aus Schritt 1). Typ (e) reine Info wird NICHT
  zur Aufgabe.
- **Eine Umbrella-Erinnerung pro Briefing** ganz am Anfang anlegen, damit der Nutzer nie
  vergisst ein neues Briefing durchzugehen — Format exakt:
  `- [ ] Briefing YYYY-MM-DD abarbeiten @epic:Inbox @story:YYYY-MM-DD`
  (Datum = das Briefing-Datum aus Schritt 0). Setzt du sie auf `- [x]`, sobald das
  Briefing komplett durch ist.
- **Dedup ist automatisch:** der Aggregator bildet die Task-ID aus Projekt+Text. Schreib
  denselben Punkt nicht doppelt rein — vor dem Anhaengen pruefen, ob die Zeile (gleicher
  Text) schon in `Inbox-TODO.md` steht.
- Tags `@epic:` / `@story:` / `@status:` darfst du an einzelne Zeilen haengen, wenn es
  Sinn ergibt (z.B. `@status:in-progress`). Pflicht sind sie nur bei der Umbrella-Zeile.

Diese Schreibaktion gehoert — zusammen mit den Briefing-Haekchen (Schritt 5) und der
Mail-Ablage (Schritt 4c) — zu den erlaubten Schreibaktionen. Die Draft-only-Regel fuer
Senden/Kommentieren/Loeschen bleibt unberuehrt.

## Schritt 4c — Mails ablegen (Posteingang leeren)

Nachdem die To-Dos in `Inbox-TODO.md` stehen, raeumst du den Posteingang auf: jede
verarbeitete Mail wandert in ihren Gmail-Ordner ("verschieben" = Ziel-Label setzen +
`INBOX` entfernen). So muellt der Posteingang nicht zu.

**Lern-Regel-Datei:** `{{VAULT_ROOT}}/inbox-ablage-regeln.md`. Sie merkt
sich Absender/Thema -> Ordner, damit du nicht jedes Mal neu fragst. Format (Markdown,
eine Regel pro Zeile, `#` = Kommentar, **erste passende Regel gewinnt**):

```
# Inbox-Ablage-Regeln — Absender/Thema -> Gmail-Ordner
# Gelernt vom briefing-abarbeiten-Skill. Von Hand editierbar. Erste passende Regel gewinnt.
anthropic.com        -> Firma/Rechnungen
noreply@github.com   -> Dev/GitHub
keyword:jira         -> Dev/Jira
```

Matcher: Domain (`anthropic.com`), volle Adresse (`noreply@github.com`) oder
`keyword:<wort>` (Substring in Absender ODER Betreff).

**Noise-Sonderlogik (keine Regel-Zeile noetig):**
- **Echter Newsletter** (abonnierter Content-Verteiler) -> `Newsletter/<Absender>`,
  Unterordner pro Absender. `<Absender>` = sprechender Name aus der Absenderadresse
  (z.B. example.com -> `Newsletter/Example`). Verschachtelung hier **gewollt**.
- **Sonstiger Noise** (Marketing, Automatik, Transaktions-/Shop-Spam wie Klarna,
  Deezer, Twitch, MMOGA, Beatport) -> fester **flacher** Ordner `Archiv/Noise`,
  NICHT pro Absender verschachteln.
Im Zweifel (Newsletter oder anderer Noise?) -> `Archiv/Noise`.

### Ablauf

1. **Regeln laden.** Datei lesen. Existiert sie nicht -> leer starten (du legst sie beim
   ersten gelernten Eintrag an, mit dem Kommentar-Header oben).
2. **Pro Briefing-Mail Ziel bestimmen:**
   - Regel-Treffer (Domain/Adresse/keyword, erste gewinnt) -> Ziel steht = **bekannt**.
   - Noise (Typ e) ohne Regel -> Ziel per Noise-Sonderlogik oben (Newsletter ->
     `Newsletter/<Absender>`, sonst `Archiv/Noise`) = **bekannt**.
   - Sonst -> **unbekannt** (in die Wohin-Frage).
3. **Plan zeigen.** Kompakte Liste `Mail -> Zielordner` fuer alle bekannten. Die
   unbekannten **gebuendelt** in EINE Frage: "Wohin gehoeren diese? (Ordner nennen)".
   Bekannte legst du ohne weitere Rueckfrage ab (Trust-Regel) — kein pro-Mail-OK noetig.
4. **Antwort lernen.** Den genannten Ordner als neue Regel an `inbox-ablage-regeln.md`
   **anhaengen** (nie ueberschreiben). Default-Matcher = Domain aus der Absenderadresse;
   nennt der Nutzer was anderes (z.B. ganzer Absender oder keyword), nimm das. **Dedup:**
   gleiche Matcher-Zeile nicht doppelt — vor dem Anhaengen pruefen.
5. **Verschieben (ausfuehren).** Bekannte + gerade-gelernte im selben Lauf ablegen.
   Pro Mail/Thread:
   - `list_labels` -> Ziel-Label-ID holen. Ordner fehlt -> `create_label` (nested via
     `/`, Parent wird auto erzeugt), dann ID nutzen.
   - `label_thread(threadId, [zielLabelId])`  — Ordner dran.
   - `unlabel_thread(threadId, ['INBOX'])`    — raus aus Posteingang.
   Thread-Ebene (ganze Konversation), nicht einzelne Message.
6. **Reihenfolge.** Loest die Mail ein To-Do aus (Typ b/c/d): Schritt 4b (Zeile in
   `Inbox-TODO.md`) MUSS **vor** dem Ablegen passieren — sonst geht der Handlungspunkt
   mit der Mail aus dem Blick. Erst To-Do, dann verschieben.
7. **Bestaetigen.** Kurze Liste "abgelegt: <Mail> -> <Ordner>". Klappt eine Aktion nicht
   (Label nicht erstellbar, Thread-ID fehlt): ehrlich melden, die Mail **im Posteingang
   lassen**, nicht so tun als ob.

Verfuegbare Gmail-Tools dafuer: siehe "Verfuegbare Tools" unten.

## Schritt 5 — Fortschritt in der Datei persistieren

Sobald der Nutzer einen Punkt als **erledigt** bestaetigt, hak ihn in der Briefing-Datei
ab, damit der Dashboard-Tab den Fortschritt zeigt:

- Oeffne die geladene `Briefings/<date>.md` (die aus Schritt 0).
- Setze die zugehoerige Zeile von `- [ ] ...` auf `- [x] ...` (Edit-Tool, exakte
  Zeile, Rest des Textes unveraendert lassen).
- Ist der Punkt noch ein normaler Bullet (`- ...` ohne Checkbox) — z.B. aus einem
  aelteren Briefing — wandle ihn in `- [x] ...` um (bzw. `- [ ] ...` wenn noch offen
  aber abhakbar gemacht werden soll).
- **Nur nach OK des Nutzers pro Punkt.** Die Datei-Haekchen spiegeln ausschliesslich den
  bestaetigten Stand des Nutzers. Erlaubte Schreibaktionen dieses Skills sind ausschliesslich:
  diese Briefing-Haekchen, das Anhaengen an `Inbox-TODO.md` (4b) **und** die Mail-Ablage
  (4c: `label_thread` / `unlabel_thread` / `create_label` / Regel-Datei). Die
  Draft-only-Regel fuer Senden/Kommentieren/Loeschen bleibt unangetastet — nichts senden,
  kommentieren, loeschen ohne separates OK.

Hinweis: Die Haekchen erscheinen im BRIEFING-Tab, sobald man dort auf
**"↻ aktualisieren"** klickt (liest die Datei neu).

## Verfuegbare Tools

Nutze was da ist: **Gmail-MCP** (`mcp__claude_ai_Gmail__*`), **Vault** (Briefings/,
Task-Listen, Regel-Datei, Notizen), Jira/Issue-Tracker **falls verbunden**. Fehlt ein
Tool: aus dem Mail-Inhalt arbeiten, nicht blockieren.

Gmail-Tools via ToolSearch laden:
`select:mcp__claude_ai_Gmail__search_threads,mcp__claude_ai_Gmail__get_thread,mcp__claude_ai_Gmail__create_draft,mcp__claude_ai_Gmail__list_labels,mcp__claude_ai_Gmail__create_label,mcp__claude_ai_Gmail__label_thread,mcp__claude_ai_Gmail__unlabel_thread`

- `search_threads` / `get_thread` — Threads finden + Inhalt lesen (Jira-Mails auswerten).
- `create_draft` — Antwort-Entwurf (nur nach OK, Draft-only).
- `list_labels` — Ordner/Label + IDs. System-IDs: `INBOX`, `UNREAD`, `IMPORTANT`, `TRASH`.
- `create_label` — fehlenden Ordner anlegen, nested via `/` (z.B. `Firma/Rechnungen`),
  Parent auto.
- `label_thread` / `unlabel_thread` — Ablage (4c): Ziel-Label dran, `INBOX` weg.
  NIE `label_*`/`unlabel_*` zum Senden/Loeschen missbrauchen; nur Ablage + Trash-Verbot.

## Stil
- Deutsch, kurze klare Saetze. Tech englisch (Ticket, Draft, Thread, Status).
- Umlaute korrekt, keine Em-Dashes, keine Floskeln.
- Nichts erfinden. Was nicht im Briefing/in der Mail steht, behauptest du nicht.
- Ablage (4c) laeuft auf Trust (bekannt -> auto, unbekannt -> einmal fragen+lernen).
  Senden/Kommentieren/Loeschen bleibt Draft-only — nur nach ausdruecklichem OK.

_Teil des Agentic OS Skill-Bundles. Verwandt: [[posteingang]]
(erzeugt die Triage), Briefing-Tab im Dashboard._
