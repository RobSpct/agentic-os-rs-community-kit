---
name: manage-email
description: Scanne Gmail, kategorisiere E-Mails (Brand Deals, Wichtig, Noise), entwirf Partnership-Antworten mit Manager im CC und verwalte deine Inbox. Nutze diesen Skill, wann immer du E-Mails checken oder triagieren willst.
---

# Manage Email

Inbox-Triage: scanne aktuelle E-Mails, hol Brand-Deal-Anfragen nach oben, entwirf Template-Antworten, die deinen Brand-Manager mit einbeziehen, hebe Wichtiges hervor und markiere Noise.

---

## Config

Lies das aus der `CLAUDE.md` des Projekts:

| Key | Wert |
|-----|-------|
| Brand Manager Email | YOUR_MANAGER_EMAIL |
| Brand Manager Name | YOUR_MANAGER_NAME |
| Dein Name | YOUR_NAME |
| Scan-Fenster | 24-48 Stunden |

---

## Prozess

### Schritt 1: Aktuelle E-Mails scannen

Durchsuch Gmail nach allen E-Mails der letzten 48 Stunden mit mehreren parallelen Queries:

**Query 1: Brand-Deal-Keywords:**
```
newer_than:2d (collaboration OR partnership OR sponsorship OR sponsor OR "brand deal" OR "paid promotion" OR influencer OR campaign OR UGC OR "creator program" OR "paid collab" OR "paid partnership" OR "would love to work" OR "interested in working")
```

**Query 2: Alle aktuellen Inbox-E-Mails:**
```
newer_than:2d in:inbox
```

Nutze die GWS CLI, um Gmail per Bash zu durchsuchen:
```bash
gws gmail users messages list --params '{"userId": "me", "q": "newer_than:2d (collaboration OR partnership OR sponsorship ...)", "maxResults": 50}'
```
Bei Bedarf paginieren (nutze `pageToken` aus der Response).

### Schritt 2: Lesen und kategorisieren

Lies den vollen Inhalt jeder E-Mail über die GWS CLI:
```bash
gws gmail users messages get --params '{"userId": "me", "id": "MESSAGE_ID", "format": "full"}'
```
Kategorisiere jede E-Mail in einen von drei Buckets:

#### Brand Deal / Partnership-Anfrage
E-Mails von Brands, Agenturen oder Creatorn, die bezahlte Kollaborationen, Sponsorships, UGC-Deals oder Influencer-Kampagnen vorschlagen. Match auf:
- Keyword-Treffer aus der Brand-Deal-Suche
- Kontext-Hinweise: Erwähnung von "rate card", "deliverables", "compensation", Produkt-Pitches mit Partnership-Absicht
- Absender-Domain ist eine Firma/Agentur (kein privater Gmail-Account, außer es ist klar ein Brand-Vertreter)

#### Wichtig (Aktion nötig)
Nicht-Brand-E-Mails, die trotzdem Aufmerksamkeit brauchen:
- Kunden-Kommunikation
- Team-Nachrichten
- Finanzen/Rechtliches (Rechnungen, Verträge, Bank)
- Plattform-Benachrichtigungen, die Aktion erfordern (Account-Probleme, Policy-Änderungen)
- Persönliche E-Mails von bekannten Kontakten

#### Noise (überspringen/archivieren)
- Marketing-Newsletter, die du nicht abonniert hast
- Automatisierte Werbe-E-Mails
- Generische SaaS-Upsells
- Social-Media-Digest-Benachrichtigungen
- Spam, der durch die Filter gerutscht ist

### Schritt 3: Zusammenfassung präsentieren

Gib einen strukturierten Report aus:

```
## Email-Report - [Datum]

### Brand-Deal-Anfragen ([Anzahl])
Für jede:
- **Von:** [Name] <[email]> - [Firma/Brand]
- **Betreff:** [Betreffzeile]
- **Zusammenfassung:** [1-2 Sätze, was sie wollen]
- **Antwort-Entwurf:** Ready / braucht Review

### Wichtig ([Anzahl])
Für jede:
- **Von:** [Name] - [Betreff]
- **Warum es zählt:** [1 Satz]
- **Aktion nötig:** [was zu tun ist]

### Noise ([Anzahl])
- [Absender - Betreff] (x[Anzahl], falls mehrere vom selben Absender)

### Stats
- E-Mails gescannt gesamt: X
- Brand Deals: X | Wichtig: X | Noise: X
```

### Schritt 4: Brand-Deal-Antworten entwerfen

Für JEDE Brand-Deal-E-Mail einen Thread-Antwort-Entwurf über die GWS CLI erstellen:

```bash
gws gmail users drafts create --params '{"userId": "me"}' --json '{
  "message": {
    "threadId": "THREAD_ID",
    "raw": "BASE64_ENCODED_EMAIL"
  }
}'
```

Um die Raw-E-Mail zu bauen, das hier mit `base64` kodieren:
```
From: YOUR_EMAIL
To: SENDER_EMAIL
Cc: MANAGER_EMAIL
Subject: Re: ORIGINAL_SUBJECT
In-Reply-To: ORIGINAL_MESSAGE_ID
References: ORIGINAL_MESSAGE_ID
Content-Type: text/plain; charset="UTF-8"

Hey [Vorname],

danke für deine Nachricht, freut mich, dass Interesse an einer Zusammenarbeit besteht.

Ich setze meinen Manager [MANAGER_NAME] ([MANAGER_EMAIL]) ins CC, er kümmert sich um alle meine Partnerships und übernimmt ab hier.

Hoffentlich arbeiten wir bald zusammen!

Grüße,
[YOUR_NAME]
```

**Kodieren mit:** `echo -n "RAW_EMAIL" | base64 | tr -d '\n' | tr '+/' '-_'`

Die `threadId` kommt aus dem Lesen der Original-E-Mail: jedes E-Mail-Ergebnis enthält ein `threadId`-Feld. So entsteht ein sauber verthreadeter Entwurf (das konnte die alte Gmail MCP nicht).

Präsentiere jeden Entwurf zur Review, bevor du ihn erstellst. Wenn der User zustimmt, erstell alle Entwürfe.

### Schritt 5: Inbox-Cleanup und Organisation (via n8n Webhooks)

Nachdem der User die Zusammenfassung geprüft hat, führ diese Aktionen mit User-Bestätigung aus.

**n8n Webhook-URLs (mit deiner n8n-Instanz aktualisieren):**
- **Nachrichten markieren (Star):** `POST https://YOUR_N8N_INSTANCE/webhook/gmail-star`
- **Als gelesen markieren:** `POST https://YOUR_N8N_INSTANCE/webhook/gmail-mark-read`

**Payload-Format (beide Endpoints):**
```json
{"messageIds": ["id1", "id2", "id3"]}
```

**Mit Bash und curl:**
```bash
curl -s -X POST "https://YOUR_N8N_INSTANCE/webhook/gmail-star" \
  -H "Content-Type: application/json" \
  -d '{"messageIds": ["id1", "id2"]}'
```

**Aktionen:**
1. Alle Brand-Deal- + Wichtig-Message-IDs sammeln → POST an `/webhook/gmail-star`
2. ALLE behandelten Message-IDs (Brand Deal + Wichtig + Noise) sammeln → POST an `/webhook/gmail-mark-read`

**Regel: Jede im Report gezeigte E-Mail wird als gelesen markiert.** Wenn wir sie hochgeholt und behandelt haben, ist sie erledigt: als gelesen markieren.

Zeig die Anzahl vor dem Ausführen: "Ready, X E-Mails zu markieren und Y als gelesen zu setzen. Weiter?"

---

## Edge Cases

- **Bestehende Brand-Deal-Threads** - als "Active Deal Update" markieren statt als neue Anfrage. Schick die Template-Antwort NICHT in laufende Konversationen.
- **Mehrdeutige E-Mails** - falls unklar, ob Brand Deal oder Spam, in die Zusammenfassung mit "?"-Flag aufnehmen und den User entscheiden lassen.
- **Keine Brand Deals gefunden** - trotzdem die Aufteilung Wichtig vs. Noise präsentieren.
- **Doppelte Threads** - nach Thread gruppieren, nicht jede Antwort einzeln auflisten.

---

## Notizen

- Dieser Skill nutzt die **GWS CLI** (`gws gmail ...`) für alle Gmail-Operationen, kein MCP Server nötig
- **Antwort-Entwürfe** werden direkt über `gws gmail users drafts create` mit korrektem Threading erstellt (threadId + In-Reply-To Header)
- Star und Als-gelesen-markieren laufen über n8n-Webhook-Workflows (die GWS CLI kann das auch via `gws gmail users messages modify`, falls n8n-Webhooks nicht verfügbar sind)
- Brand-Manager-Email und Template lassen sich in der Config-Tabelle oben anpassen
