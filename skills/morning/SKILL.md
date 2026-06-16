---
name: morning
description: Tägliches Morning-Briefing: volle Email-Triage mit Drafts, AI/Claude-Code-News mit umsetzbarem Kontext, Task-Prioritäten und Account-Stats. Lauf das als Erstes morgens oder überlass es dem 10-Uhr-Cron.
---

# Morning Briefing

Deine tägliche Kommandozentrale. Spawnt 4 parallele Agents und kombiniert ihre Ergebnisse zu einem Briefing.

---

## Config

Lies das aus der `CLAUDE.md` des Projekts:

| Key | Wert |
|-----|-------|
| Timezone | YOUR_TIMEZONE |
| Brand Manager Email | YOUR_MANAGER_EMAIL |
| Brand Manager Name | YOUR_MANAGER_NAME |
| Dein Name | YOUR_NAME |
| Output | nur Terminal |
| Task Board | Airtable, siehe Task-Management-Config in CLAUDE.md |

---

## Ausführung

**Spawn ALLE 4 Agents in einer einzigen Nachricht, damit sie parallel laufen.** Lauf sie NICHT nacheinander. Nutz das Agent-Tool 4-mal in einer Antwort.

Nachdem alle 4 Agents zurückkommen, kombinier ihre Outputs ins finale Briefing-Format und frag dann, was als Nächstes ansteht.

---

## Agent 1: Email-Triage

Spawn einen `general-purpose` Agent mit diesem Prompt:

```
Du führst Modul 1 (Email-Triage) des Morning-Briefings aus. Mach die VOLLE Email-Triage, keinen Scan.

SCHRITTE:
1. Durchsuch Gmail nach ALLEN ungelesenen Inbox-E-Mails mit mehreren Queries:
   - "is:unread in:inbox" (alle ungelesenen, KEINE Kategorie-Filter) - maxResults: 50
   - "newer_than:2d subject:collab OR subject:partnership OR subject:sponsor OR subject:paid" (Brand-Deal-Keywords)

2. PAGINIER DURCH ALLE ERGEBNISSE. Die erste Suche gibt bis zu 50 E-Mails und ein nextPageToken zurück. Du MUSST erneut mit diesem pageToken aufrufen, um die nächsten 50 zu holen, und das wiederholen, bis entweder:
   - kein nextPageToken mehr zurückkommt (du das Ende erreicht hast), ODER
   - du weit genug zurück bist, dass E-Mails älter als 48 Stunden sind UND du bestätigt hast, dass keine Brand Deals oder Revenue-E-Mails mehr übrig sind
   - Typische Inbox: 100-200+ ungelesene E-Mails. NIEMALS bei Seite 1 aufhören. Hol immer mindestens 2-3 Seiten.

3. Dedupliziere Ergebnisse nach Message-ID über alle Seiten und beide Queries.

4. Lies den VOLLEN Inhalt jeder E-Mail, nicht nur Betreffzeilen. Für automatisierte Massen-Kategorien (Neukunden-Benachrichtigungen, Digest-Mails) kannst du aus Snippet/Betreff kategorisieren. Aber lies IMMER den vollen Body von: Brand-Deal-E-Mails, E-Mails von echten Menschen (nicht automatisiert), als WICHTIG markierten E-Mails und allem Mehrdeutigen.

5. Kategorisiere jede E-Mail in diese Buckets:
   - Brand Deals - Partnership-Angebote, bezahlte Collabs, Sponsorships
   - Revenue - Neukunden, eingegangene Zahlungen, Abo-Benachrichtigungen
   - Wichtig - gebuchte Calls, Antworten aus aktiven Threads, Team-E-Mails
   - Community - Community-Benachrichtigungen, Member-Fragen
   - Noise - Error-Alerts, Login-Benachrichtigungen, Digests, Marketing

6. Entwirf Antworten für ALLE Brand-Deal-E-Mails (Manager im CC). Nutz gmail_create_draft.

7. Sammel nach der Triage Message-IDs für den Inbox-Cleanup:
   - Alle Brand-Deal- + Wichtig- + Revenue-Message-IDs → fürs Markieren (Star)
   - ALLE behandelten Message-IDs (jede Kategorie) → fürs Als-gelesen-markieren

KRITISCHE REGELN:
- Nutz KEINE -category: Gmail-Filter. Die verstecken Zahlungs- und Benachrichtigungs-E-Mails.
- Lies wirklich jeden Nicht-Massen-E-Mail-Body.
- Entwirf wirklich Antworten für Brand Deals mit Manager im CC. Keine Ausnahmen.
- Revenue ist eine eigene Kategorie, du willst sehen, wenn Geld reinkommt.
- Paginier alle Ergebnisse (folg dem nextPageToken).

Gib deine Ergebnisse in genau diesem Format zurück:

## Email

### Brand Deals ([Anzahl]) - Drafts erstellt
- **[Brand]** ([Kontakt]) - [was sie wollen] - Draft ready

### Revenue ([Anzahl])
- **[Quelle]** - [wer gezahlt hat / was] - XX €

### Wichtig ([Anzahl])
- **[Von]** - [Betreff] - [Aktion nötig]

### Community ([Anzahl])
- [Zusammenfassung der Community-Aktivität]

### Noise ([Anzahl])
- [Errors, Login-Alerts, Digests - Einzeiler-Zusammenfassung]

### Inbox-Cleanup
- Star: [Anzahl] E-Mails (Brand Deals + Revenue + Wichtig)
- Als gelesen markieren: [Anzahl] E-Mails (alle Kategorien)
- Message-IDs zum Markieren: [kommagetrennte Liste]
- Message-IDs zum Als-gelesen-markieren: [kommagetrennte Liste]
```

---

## Agent 2: AI News Brief

Spawn einen `general-purpose` Agent mit diesem Prompt:

```
Du führst Modul 2 (AI News Brief) des Morning-Briefings aus. Gib ein gründliches Briefing darüber, was gerade in AI passiert, die letzten 24-48 Stunden.

Das ist KEINE Content-Ideen-Liste. Das ist ein News Brief, damit du informiert bleibst. Du entscheidest separat, ob etwas filmwürdig ist.

ZU CHECKENDE QUELLEN (nutz WebSearch + WebFetch):
1. WebSearch: "AI news today [aktueller Monat Jahr]" - die neuesten Headlines holen
2. WebSearch: "Claude Code update OR release OR changelog [Jahr]" - Claude-spezifisch
3. WebSearch: "OpenAI announcement OR launch OR update [aktueller Monat Jahr]"
4. WebSearch: "Gemini OR Google AI update [aktueller Monat Jahr]"
5. WebSearch: "n8n update OR release [Jahr]"
6. WebSearch: "AI tools launch OR release this week"
7. WebFetch: https://github.com/trending - die heute trendenden Repos (nach AI-Bezug scannen)
8. WebSearch: "site:reddit.com AI tool OR Claude OR ChatGPT" - Community-Buzz

Für JEDE News geh in die TIEFE. Sag nicht nur "X hat Y gelauncht." Erklär:
- Was es im Klartext tatsächlich tut
- Warum es zählt (oder nicht)
- Wie es mit Tools zusammenhängt, die du eh nutzt (Claude Code, n8n, Supabase, MCP Server usw.)

REGELN:
- Nur wirklich Neues (letzte 48 Stunden). Nicht mit alten News auffüllen.
- Falls nichts Großes passiert ist, sag das ehrlich.
- Lieber tief bei wenigen Items als oberflächlich bei vielen.
- Nach Kategorie gruppieren: Major Releases, Tool Updates, Industry News, GitHub Trending, Community Buzz
- IMMER eine Source-URL für jedes Item.

Gib es in diesem Format zurück:

## AI News Brief

### Major Releases
**[Name]** - [Was es ist in 1 Satz]
[Source](url)
[2-3 Sätze in die Tiefe: was es tut, wie es funktioniert, warum es zählt.]

### Tool Updates
**[Tool] [Version]** - [Was sich geändert hat]
[Source](url)
[Kontext, warum dieses Update zählt]

### Industry News
**[Headline]** - [Was passiert ist und warum es jemanden interessieren sollte]
[Source](url)

### GitHub Trending (AI)
- **[Repo-Name]** ([Stars heute]) - [was es tut, 1 Satz] - [GitHub](url)

### Community Buzz
- [Worüber Leute auf Reddit/X in AI reden - 2-3 Bullet Points mit Links]

Falls eine Kategorie nichts Neues hat, lass sie komplett weg.
```

---

## Agent 3: Prioritäten für heute

Spawn einen `general-purpose` Agent mit diesem Prompt:

```
Du führst Modul 3 (Prioritäten für heute) des Morning-Briefings aus. Heute ist [HEUTIGES DATUM UND WOCHENTAG EINFÜGEN].

Zieh aus DREI Quellen:

1. Airtable Central Task Board - alle nicht-erledigten Tasks ziehen.
   - Nutz die Airtable MCP Tools
   - Lies Base-ID und Table-ID aus der CLAUDE.md des Projekts (Task-Management-Abschnitt)
   - Felder ziehen: Task, Due Date, Status, Priority, Project, Notes
   - Filter: Status != "Done", sortiert nach Priority, dann Due Date
   - Kategorisieren: Dringend (heute fällig oder überfällig), Diese Woche (innerhalb 7 Tagen fällig), Backlog (alles andere)

2. Google Calendar - den heutigen Kalender auf Calls, Meetings, Deadlines prüfen.

3. Community Pipeline (Friday Drop) - Datensätze aus der Community-Pipeline-Tabelle ziehen.
   - Lies Base-ID und Table-ID aus der CLAUDE.md
   - Zieh ALLE Datensätze, bei denen Status = "Planned" oder Status = "In-Progress"
   - Zeig, was für den Freitags-Drop ansteht und was gerade bearbeitet wird

Gib deine Ergebnisse in genau diesem Format zurück:

## Plan für heute

**Dringend (heute fällig / überfällig):**
- [ ] [Task aus Airtable - Priorität, Due Date]

**Diese Woche:**
- [ ] [Task] - fällig [Datum] - [Projekt]

**Calls:**
- [Uhrzeit] - [Wer] - [Was] - [Vorbereitungs-Notizen]

**Community Friday Drop:**
🔨 In-Progress:
- [Titel] - [Content-Typ] - [Notizen-Zusammenfassung]

📋 On Deck (Planned):
- [Titel] - [Content-Typ]

**Backlog:**
- [Task] - [Projekt]
```

---

## Agent 4: Account-Stats + Funnel-Metriken

Spawn einen `general-purpose` Agent mit diesem Prompt:

```
Du führst Modul 4 (Account-Stats + Funnel-Metriken) des Morning-Briefings aus. Zieh Account-Metriken und DM-Funnel-Stats aus Supabase.

Nutz die Supabase MCP Tools mit deiner Project-ID aus der CLAUDE.md.

Query 1 - Aktuelle Follower-Zahlen mit Tag-zu-Tag-Delta:
SELECT platform, follower_count, snapshot_date
FROM account_snapshots
WHERE platform IN ('instagram', 'tiktok', 'youtube')
  AND snapshot_date >= CURRENT_DATE - INTERVAL '3 days'
ORDER BY platform, snapshot_date DESC;

Query 2 - DM-Funnel-Stats (all-time pro Flow):
SELECT * FROM crm.funnel_stats;

Query 3 - DM-Funnel-Tages-Stats (letzte 7 Tage):
SELECT * FROM crm.funnel_stats_daily
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;

Query 4 - Letzter Funnel-Snapshot (fürs Trending):
SELECT * FROM crm.funnel_snapshots
ORDER BY snapshot_date DESC
LIMIT 2;

WICHTIG: Für CRM-Schema-Queries liegen die Tabellen im crm-Schema. Referenzier crm.funnel_stats, crm.funnel_stats_daily und crm.funnel_snapshots.

Gib deine Ergebnisse in genau diesem Format zurück:

## Account
- IG: XX.XXX (+/- XX seit gestern)
- TikTok: XX.XXX (+/- XX)
- YouTube: XXX (+/- XX)

## DM Funnel
- DMs gesendet: XXX (all-time)
- E-Mails erfasst: XXX (XX% Capture-Rate)
- Notion-Klicks: XXX
- Skool-Klicks: XXX (DM: XX, Notion: XX)
- 7-Tage-Trend: [hoch/runter/flach] - [kurze Notiz, was sich geändert hat]

Falls CRM-Queries leere Ergebnisse liefern, notier "Funnel-Daten noch nicht befüllt" und mach weiter.
```

---

## Nachdem alle Agents zurück sind

Sobald alle 4 Agents ihre Ergebnisse geliefert haben:

### 1. Ins Briefing kombinieren

```
# Morning Briefing - [Datum] ([Wochentag])

## Email
[Agent-1-Output - volle Triage mit allen Kategorien]

## AI News Brief
[Agent-2-Output - detailliert mit Content-Angles]

## Plan für heute
[Agent-3-Output - Tasks, Kalender, Community-Pipeline]
**Aus E-Mails:**
- [ ] [Dringende Items aus Agent-1-Ergebnissen - Brand-Deal-Deadlines, Zahlungen mit Handlungsbedarf usw.]

## Stats
[Agent-4-Output - Account-Stats + DM-Funnel]
```

### 2. Beratungs-Call-Prospects automatisch recherchieren

Prüf Agent 3s Kalender-Output auf Beratungs-Calls heute (such nach "Consultation", "Consulting", "AI Consultation" in Event-Titeln, oder Booking-Events mit Nicht-Team-Teilnehmern).

Für jeden gefundenen Beratungs-Call:
1. Name und E-Mail des Prospects aus der Kalender-Event-Beschreibung extrahieren
2. Prüfen, ob für diesen Prospect schon ein Research-Brief existiert
3. Falls KEIN Brief existiert → `/prospect-researcher` mit Name, E-Mail und Booking-Notizen ausführen
4. Falls schon ein Brief existiert → überspringen, nur "Brief ready für [Name]" erwähnen

Präsentier es so:

```
## Beratungs-Call-Prep
- [Uhrzeit] - [Name] ([Firma]) - recherchiere gerade...
```

### 3. Inbox-Cleanup

Nach dem Präsentieren des Briefings die Message-IDs von Agent 1 nutzen, um die Inbox aufzuräumen.

Falls du in deiner CLAUDE.md n8n-Webhooks für Inbox-Cleanup konfiguriert hast, nutz sie:

```bash
# Wichtige E-Mails markieren (Star)
curl -s -X POST "YOUR_N8N_WEBHOOK_URL/gmail-star" \
  -H "Content-Type: application/json" \
  -d '{"messageIds": ["id1", "id2"]}'

# Alle behandelten E-Mails als gelesen markieren
curl -s -X POST "YOUR_N8N_WEBHOOK_URL/gmail-mark-read" \
  -H "Content-Type: application/json" \
  -d '{"messageIds": ["id1", "id2"]}'
```

Zeig die Anzahl: "Ready, X E-Mails zu markieren und Y als gelesen zu setzen. Weiter?"

Falls keine Webhook-URLs konfiguriert sind, überspring diesen Schritt.

### 4. Fragen, was als Nächstes ansteht

```
---
Was willst du zuerst angehen?
- /manage-email - Email-Triage neu laufen oder neue E-Mails behandeln
- /daily-content-researcher - die heutigen Content-Themen finden
```

---

## KRITISCHE REGELN

1. **Alle 4 Agents MÜSSEN parallel starten.** Eine Nachricht, 4 Agent-Tool-Calls. Das ist der ganze Sinn: Geschwindigkeit.
2. **PAGINIER ALLE UNGELESENEN E-MAILS.** Agent 1 muss dem nextPageToken über ALLE Seiten folgen. Nie bei Seite 1 aufhören.
3. **Nie `-category:` Gmail-Filter nutzen.** Die verstecken Zahlungs- und Benachrichtigungs-E-Mails.
4. **Antworten für ALLE Brand-Deal-E-Mails automatisch entwerfen.** Manager im CC. Keine Ausnahmen.
5. **Revenue ist eine eigene Kategorie.** Neukunden, Zahlungen, Abos.
6. **AI News braucht Tiefe, nicht Breite.** Agent 2 ist ein News Brief, KEINE Content-Ideen-Liste. Geh tief bei wenigen Items.
7. **Falls ein Agent fehlschlägt, nimm den Fehler auf und mach weiter.** Blockier nicht das ganze Briefing.
8. **Nach dem Kombinieren E-Mails mit Tasks abgleichen.** Hol dringende E-Mail-Items in den Abschnitt "Plan für heute".
9. **Inbox-Cleanup nach dem Präsentieren.** Webhooks nutzen, falls konfiguriert.
10. **Alles im Terminal präsentieren.** Kein File-Schreiben nötig.
11. **Zum Schluss fragen, was als Nächstes ansteht.** Immer das Aktions-Menü geben.
12. **Der volle Flow ist: 4 Agents spawnen → Ergebnisse kombinieren → Briefing präsentieren → Beratungs-Call-Prep → Inbox-Cleanup → fragen, was als Nächstes ansteht.**
