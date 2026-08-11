---
name: competitor-analysis
description: Sucht und bewertet Mitbewerber eines beliebigen Projekts (Seed-Liste + Web-Discovery), erstellt projekt-relative Threat-Scores (0-100) über 5 Achsen und schreibt das Ergebnis als JSON für den AgenticOS "COMPETITOR"-Tab. Projektweise installiert, merkt sich Projekt+Zweck via config.json. Manuell auslösen via /competitor-analysis. Trigger DE: 'competitor analyse', 'mitbewerber checken', 'wo stehen wir am markt', 'konkurrenz analyse'. Trigger EN: 'competitor analysis', 'scan competitors', 'where do we stand'.
---

# Competitor Analytik (generisch)

Bewertet Mitbewerber eines Projekts projekt-relativ und schreibt ein JSON-Cockpit-Modell
für den AgenticOS-Dashboard-Tab "COMPETITOR". Dieser Skill wird **projektweise**
installiert (Lager → installFromLib in den cwd des Projekts) und **merkt sich beim
Erst-Lauf das Projekt + dessen Zweck** in `config.json` im Skill-Ordner.

## 0. Projekt-Gedächtnis: config.json

Der Skill liegt im Projekt-cwd (`<cwd>/.claude/skills/competitor-analysis/`).
Pfad seiner config: `<skill-ordner>/config.json`.

**Erst-Lauf (config.json fehlt):**
1. Ermittle den Projekt-cwd (`git rev-parse --show-toplevel`, sonst aktueller cwd).
2. Lies Projekt-Profil aus dem Repo (README.md, CLAUDE.md, DESIGN.md — nur relevante
   Teile via ctx_execute_file extrahieren, NICHT ganze Files in den Kontext).
3. Leite Projektname + Zweck/Nische (1-2 Sätze) daraus ab. Bei Unklarheit den User
   knapp fragen.
4. Bilde `slug` (kebab-case aus Projektname; Dateiname der Analyse).
5. Schlage `seedCompetitors` + `searchQueries` passend zur Nische vor.
6. Schreibe `config.json` MIT dem nativen Write-Tool:
```json
{
  "projectName": "<Name>",
  "projectPurpose": "<Zweck/Nische in 1-2 Sätzen>",
  "projectRepoPath": "<cwd des Projekts>",
  "vaultPath": "<<VAULT_ROOT>>",
  "slug": "<kebab>",
  "seedCompetitors": ["..."],
  "searchQueries": ["..."]
}
```

**Folge-Läufe (config.json existiert):** config lesen → KEIN erneutes Fragen nach
Projekt/Zweck. Repo trotzdem für aktuellen Stand neu lesen (Features/USPs können sich
ändern). Nische/Seeds/Queries kommen aus config.

> `vaultPath` ist der AgenticOS-Vault-Root (`<<VAULT_ROOT>>`, z.B. `C:/Users/<dein-name>/AgenticOS`).
> Beim Setup auf deinen Vault-Pfad setzen.

## Parameter (Defaults)
- `maxCompetitors`: 7  (Token-Limit; hochdrehbar)
- `seedCompetitors`: aus config
- `searchQueries`: aus config
- Output: `<vault>/competitor-analyses/<slug>.json`
  + `<vault>/competitor-analyses/history/<slug>/<YYYY-MM-DD>.json`
- Manifest: `<vault>/competitor-analyses/index.json`

## Ablauf

### 1. Projekt-Profil lesen (Vergleichsbasis)
Lies aus `config.projectRepoPath` nur die profil-relevanten Teile (NICHT ganze Files —
ctx_execute_file zum Extrahieren):
- `README.md` — Produktbeschreibung, Features
- `CLAUDE.md` — Projekt-Kontext, Zielgruppe
- `DESIGN.md` — Produkt-Vision, USPs
Hole den aktuellen Commit-Hash: `git -C "<projectRepoPath>" rev-parse --short HEAD`.
Fallback bei fehlenden Abschnitten: knappes Profil aus dem Vorhandenen + `config.projectPurpose`.

Fülle daraus `project`: { purpose, features[], usps[], sourceCommit }.

### 2. Competitor-Set bilden
- Starte mit `config.seedCompetitors`.
- WebSearch-Discovery mit `config.searchQueries` (2-3 gezielte Queries).
- Neue, plausible Namen ins Set mergen. Auf `maxCompetitors` kürzen
  (Priorität: Nischen-Nähe zum Projekt zuerst).

### 3. Pro Competitor: EIN gezielter Fetch-Batch (token-sparend)
- Pro Competitor 1-2 beste URLs wählen (Feature/Pricing-Seite + Review-Quelle:
  App Store / Google Play / G2 / Trustpilot).
- ctx_fetch_and_index auf diese URLs (Roh-HTML bleibt im Sandbox).
- ctx_search auf den Index für: Features, Pricing, Rating (Wert+Anzahl+Quelle),
  User-Base/Etabliertheit, Sentiment-Tenor.
- NIEMALS ganze Seiten in den Kontext lesen.

### 4. Scoring (projekt-relativ) — siehe references/scoring-rubrics.md
Pro Competitor 5 Achsen 0-100 nach den Rubrics:
nische, feature, sentiment, etabliert, mehrwert.
- threatScore = gewichtetes Mittel (Gewichte aus rubrics).
- relativeToProject je Achse: "ahead" | "parity" | "behind" (Projekt-Sicht).
- verdict: 1-2 Sätze, max ~240 Zeichen.
- gaps: kurze Stichpunkte, wo das Projekt punkten kann.
- evidence: 1-3 Quell-Links mit label.

### 5. Markt-Aggregat + Schreiben
- Sortiere Competitors nach threatScore absteigend.
- market: projectPosition (Rang des Projekts bei Einordnung der eigenen Stärke
  relativ zu den Scores), totalPlayers (= competitors.length + 1 fürs Projekt),
  avgThreat (Mittel der threatScores, gerundet), featureParityPct (Projekt-feature vs
  Markt-Median), topThreat (Name mit höchstem Score).
- summary: headline + max 3 bullets, knapp.
- Validiere gegen references/schema.json (alle Pflichtfelder, axisScores enthält alle
  5 Achsen, Scores 0-100, schemaVersion=2).
- Schreibe MIT dem nativen Write-Tool (NICHT ctx_execute):
  - `<vault>/competitor-analyses/<slug>.json` (überschreiben)
  - `<vault>/competitor-analyses/history/<slug>/<heute>.json` (Snapshot, gleiches Schema)
  Lege fehlende Ordner an.

### 6. Manifest aktualisieren (transient-robust)
`<vault>/competitor-analyses/index.json` upserten — bestehenden index LESEN,
eigenen Eintrag nach `slug` mergen, **nie wipen** (vgl. aggregate.js stale-Pattern):
```json
{ "analyses": [
  { "slug": "<slug>", "projectName": "<Name>", "purpose": "<Zweck>",
    "file": "<slug>.json", "generatedAt": "<iso>", "repoPath": "<projectRepoPath>" }
] }
```
Wenn index.json fehlt/leer/kaputt: mit nur dem eigenen Eintrag neu anlegen.

## Ausgabe an den User
Knapp (Caveman-tauglich): Projektname, Position, Top-Threat, 1-Satz-Headline, Pfad der
JSON, Hinweis "Tab 'COMPETITOR' im AgenticOS-UI zeigt das Cockpit (Dropdown wählt Projekt)".

## Später: Auto-Agent (NICHT jetzt bauen)
Parameter-getrieben, seiteneffekt-frei außer JSON-Write. Für tägliche Automatisierung:
Subagent/Cron ruft `/competitor-analysis` je Projekt-cwd → history-Snapshots → Tab kann
später Trends zeigen. Kein Code-Umbau nötig, nur Trigger.
