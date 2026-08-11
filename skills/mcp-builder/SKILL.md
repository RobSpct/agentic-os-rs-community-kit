---
name: mcp-builder
description: Baue MCP (Model Context Protocol) Server, die es LLMs ermöglichen, mit externen Services zu interagieren. Nutze diesen Skill beim Erstellen neuer MCP-Integrationen, beim Bauen von Tool-Servern oder beim Wrappen von APIs für Claude. Unterstützt sowohl Python (FastMCP) als auch TypeScript.
---

# MCP Server Development Guide

Baue hochwertige MCP Server, die es LLMs ermöglichen, mit externen Services und APIs zu interagieren.

---

## Entwicklungs-Prozess

Folg diesem 4-Phasen-Ansatz:

### Phase 1: Tiefe Recherche und Planung

Bevor du Code schreibst:

1. **Studier die API gründlich**
   - Lies die komplette API-Doku. Falls sie online liegt, hol sie dir per WebFetch/WebSearch
   - Identifiziere die Auth-Methoden
   - Erfasse Rate-Limits und Einschränkungen
   - Teste Endpoints zuerst manuell (z.B. mit curl über Bash)

2. **Workflow-fokussierte Tools designen**
   - Bau durchdachte, wirkungsvolle Workflow-Tools
   - NICHT bloß API-Endpoint-Wrapper
   - Denk: "Welche Aufgaben muss das LLM erledigen?"

3. **Für LLM-Kontext-Limits planen**
   - Liefer High-Signal-Infos, keine Daten-Dumps
   - Plan Pagination von Anfang an ein
   - Setz Zeichen-Limits (Default 25.000)

4. **Eval-Szenarien früh erstellen**
   - Schreib 10 realistische Test-Fragen
   - Iterier auf Basis der Agent-Performance

### Phase 2: Implementierung

Wähl deinen Stack:

- **Python**: nutze FastMCP (Paket `mcp`, FastMCP-API)
- **TypeScript**: nutze das MCP SDK (`@modelcontextprotocol/sdk`)

Falls dir Details zur konkreten SDK-API fehlen, hol dir die aktuelle Doku per WebFetch von der offiziellen MCP-Dokumentation (modelcontextprotocol.io) bzw. den jeweiligen SDK-Repos und schreib den Server-Code dann direkt mit Write.

Reihenfolge der Implementierung:
1. Projekt-Struktur aufsetzen
2. Kern-Infrastruktur implementieren (API-Helper, Error-Handling)
3. Tools systematisch mit sauberen Schemas bauen
4. Validierung anwenden (Pydantic für Python, Zod für TypeScript)

### Phase 3: Review und Verfeinerung

Code-Quality-Checkliste:
- [ ] DRY - kein doppelter Code
- [ ] Composable - wiederverwendbare Utilities
- [ ] Konsistent - durchgängig gleiche Patterns
- [ ] Error-Handling - saubere Fehler mit Hinweisen
- [ ] Type-Safety - volle Typ-Abdeckung
- [ ] Dokumentation - klare Beschreibungen und Beispiele

### Phase 4: Evaluation

Erstell Evals:
- 10 komplexe, realistische, read-only Fragen
- Erfordern mehrere Tool-Calls zur Beantwortung
- Verifiziere, dass LLMs deinen Server effektiv nutzen können

---

## Quick Reference

### Naming-Konventionen

| Sprache | Server-Name | Tool-Namen |
|----------|-------------|------------|
| Python | `{service}_mcp` | `slack_send_message` |
| TypeScript | `{service}-mcp-server` | `slack_send_message` |

### Tool-Annotations (Pflicht)

```
readOnlyHint: true/false     # Verändert KEINEN State
destructiveHint: true/false  # Löscht oder überschreibt Daten
idempotentHint: true/false   # Sicher wiederholbar
openWorldHint: true/false    # Interagiert mit der externen Welt
```

### Response-Formate

Beide unterstützen:
- **JSON**: maschinenlesbar für programmatische Nutzung
- **Markdown**: menschenlesbar mit sauberer Formatierung

### Zeichen-Limits

```python
CHARACTER_LIMIT = 25000

if len(response) > CHARACTER_LIMIT:
    return f"{response[:CHARACTER_LIMIT]}\n\n[Truncated - use filters to narrow results]"
```

### Pagination-Pattern

Gib immer zurück:
```json
{
  "items": [...],
  "has_more": true,
  "next_offset": 50,
  "total_count": 1234
}
```

---

## Best Practices (Zusammenfassung)

**DO:**
- Tools rund um Workflows designen, nicht um API-Endpoints
- Umsetzbare Fehlermeldungen liefern, die zur richtigen Nutzung führen
- Pagination-Metadaten bei allen List-Operationen mitgeben
- Alle Inputs gegen Schemas validieren
- Markdown- und JSON-Output unterstützen

**DON'T:**
- Vollständige Daten-Dumps zurückgeben
- Interne Fehler-Details offenlegen
- Input-Validierung überspringen
- Rate-Limits ignorieren
- Übermäßig komplexe Multi-Step-Tools bauen

---

## Transport-Optionen

| Transport | Use Case |
|-----------|----------|
| **stdio** | Lokale Integrationen, Desktop-Apps |
| **HTTP** | Remote-Services, Multi-Client |
| **SSE** | Echtzeit-Updates, Streaming |

---

## Security-Checkliste

- [ ] Input-Validierung gegen JSON-Schemas
- [ ] Alle User-Inputs sanitizen
- [ ] OAuth 2.1 oder sicheres API-Key-Management
- [ ] Command-Injection verhindern
- [ ] Directory-Traversal verhindern
- [ ] Keine internen Fehler-Details offenlegen
- [ ] Security-relevante Events loggen
