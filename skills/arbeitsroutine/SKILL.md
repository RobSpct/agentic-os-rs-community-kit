---
name: arbeitsroutine
description: MUSS verwendet werden, sobald der User eine Änderung an Code will — bauen, implementieren, entwickeln, Feature, erweitern, umbauen, refactoren, fixen, Bug, Fehler, reparieren, Migration, Endpoint, Komponente, Schema. Trigger EN - build, implement, add feature, refactor, fix, bug, broken, change this, extend. Legt VOR dem ersten Code-Tool fest, welcher Superpowers-Process-Skill läuft, welcher Review-Agent danach kommt und ob GSD getragen wird. NICHT für reine Wissensfragen, Erklärungen oder Recherche.
tags:
  - cross-projekt
  - tooling
  - workflow
---

# Arbeitsroutine

Reihenfolge für jede Code-Arbeit. Zweck: die starken Werkzeuge feuern, ohne dass der User sie einzeln anfordern muss.

## 1. Absicht → Process-Skill (VOR dem ersten Write/Edit)

| Absicht | Skill |
|---|---|
| Neues Feature, neue Datei, Neubau | `superpowers:brainstorming` |
| Bug, Fehlverhalten, "geht nicht" | `superpowers:systematic-debugging` |
| Mehrstufige Arbeit mit Spec | `superpowers:writing-plans` |
| Vor jedem "fertig"-Claim | `superpowers:verification-before-completion` |

Ohne diesen Schritt blockt `skill-gate.js` den ersten größeren Write. Das Gate ist die Absicherung, nicht der Auslöser — der Skill kommt hier, freiwillig, vorher.

## 2. Bauen

Ponytail-Leiter (existiert das Problem überhaupt → stdlib → native → vorhandene Dep → eine Zeile → minimaler Code). Chirurgisch bleiben: nur anfassen was nötig ist.

## 3. Nach dem Code → Review-Agent

| Berührt | Agent | Pflicht? |
|---|---|---|
| auth, clerk, sentry, `/api/`, `.env`, token, session, webhook | `security-reviewer` | **ja** — `review-gate.js` blockt sonst das Turn-Ende |
| `.ts`/`.tsx` nicht-trivial | `typescript-reviewer` | empfohlen |
| React-Komponenten, Hooks | `react-reviewer` | empfohlen |
| `.prisma`, `.sql`, Migration | `database-reviewer` | empfohlen |
| Fehlerbehandlung, catch-Blöcke, Fallbacks | `silent-failure-hunter` | empfohlen |
| Bundle, Query-Last, Render-Pfad | `performance-optimizer` | empfohlen |
| Build rot | `build-error-resolver` / `react-build-resolver` | ja |

Mehrere Agents parallel spawnen, wenn mehrere Dimensionen betroffen sind.

## 4. GSD — vorschlagen, nie automatisch

Trägt die Aufgabe mehrere Phasen oder einen ganzen Milestone (neues Teilsystem, Release-Umbau, mehrwöchige Strecke)? Dann `/gsd:new-project` bzw. `/gsd:plan-phase` **vorschlagen** und den User entscheiden lassen. Nie selbst zünden — GSD bleibt explizit (Regel aus der globalen CLAUDE.md).

Einzelnes Feature oder Bugfix → Superpowers reicht, kein GSD.

## 5. Wissen sichern

Nicht-triviales Ergebnis (Root Cause gefunden, Architektur-Entscheidung, wiederverwendbare Erkenntnis)? Testfrage: *"Würde ich das in 3 Monaten in einem anderen Projekt nochmal nachschlagen wollen?"* → ja: Wiki (`vault-notiz`). Nein, reiner Status-Fakt: Auto-Memory. Nie beides.
