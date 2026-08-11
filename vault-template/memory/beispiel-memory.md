---
name: beispiel-memory
description: Zeigt das Frontmatter-Schema eines Memory-Eintrags — Vorlage, darf gelöscht werden.
metadata:
  type: reference
tags:
  - cross-projekt
---

Ein Memory-Eintrag hält **einen** Fakt. Mehrere Fakten = mehrere Dateien.

Dateiname-Konvention: `<typ>_<slug>.md`, wobei der Typ dem `metadata.type` entspricht
(`user`, `feedback`, `project`, `reference`).

Bei `feedback`- und `project`-Einträgen folgen auf den Fakt zwei Zeilen:

**Why:** Warum das so ist — ohne den Grund wird eine Regel beim nächsten Mal wegargumentiert.

**How to apply:** Was konkret zu tun ist, wenn die Situation wieder auftritt.

Verwandtes mit [[wikilinks]] verknüpfen. Eine Zeile in `MEMORY.md` nicht vergessen — nur was
dort steht, wird in die Session geladen.
