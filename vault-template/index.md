# Index

Katalog aller Wiki-Seiten. **Kein Lese-Einstieg** — Wissensfragen laufen über Glob+Grep auf
`wiki/` (der Volltext ist reicher als die Zusammenfassungsspalte hier).

Zweck ist `vault-export`: fremde AI-Tools ohne Vault-Zugriff bekommen nur diesen Katalog,
deshalb muss er vollständig bleiben. `node scripts/vault-index-sync.mjs --check` meldet
fehlende Seiten, ohne `--check` trägt es sie nach (ergänzt nur, überschreibt nie).

| Seite | Tags | Erstellt | Zusammenfassung |
|-------|------|----------|-----------------|
| [[wiki/beispiel-notiz]] | beispiel, cross-projekt | 2026-01-01 | Zeigt das Format einer Wiki-Seite: Frontmatter, Zusammenfassung, Querverweise. |
