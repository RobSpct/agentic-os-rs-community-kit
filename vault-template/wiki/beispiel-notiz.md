---
title: Beispiel-Notiz
tags: [beispiel, cross-projekt]
created: 2026-01-01
sources:
  - raw/beispiel-quelle-2026-01-01.md
---

Diese Seite zeigt das Format einer Wiki-Seite. Oben zwei bis drei Sätze Zusammenfassung — das
ist, was jemand liest, der die Seite in einer Trefferliste sieht. Danach die Abschnitte.

Die Datei darf gelöscht werden, sobald die erste echte Notiz steht.

## Frontmatter

Pflichtfelder: `title`, `tags`, `created`. `sources` überall dort, wo die Notiz auf eine Quelle
zurückgeht — Antworten aus dem Vault zitieren dieses Feld.

Bei `tags` gilt die Projekt-Tag-Pflicht: mindestens ein Projekt-Kürzel oder explizit
`cross-projekt`. Der Hook `memory-tags-guard` blockt Writes ohne befülltes `tags:`.

## Querverweise

Verwandte Seiten mit `[[wikilinks]]` verknüpfen. Der Auto-Wikilink-Hook verlinkt Klartext-
Erwähnungen existierender Slugs automatisch — Pfadangaben, die *kein* Link werden sollen,
gehören deshalb in Backticks.

## Was nicht hierher gehört

Rohe Quellen kommen nach `raw/` (immutable). Kurzlebige Status-Fakten gehören nach `memory/`.
Faustregel: Würde ich das in drei Monaten in einem anderen Projekt nochmal nachschlagen wollen?
Ja → `wiki/`. Nein → `memory/`.
