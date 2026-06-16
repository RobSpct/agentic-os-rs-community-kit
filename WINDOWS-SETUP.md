# Windows — was im Bundle steckt & Troubleshooting

Das ausgelieferte `plugin/agentic-os/main.js` ist **bereits Windows-tauglich gepatcht**.
Du musst **nichts** an der Datei ändern. Dieses Dokument erklärt, *was* unter Windows
das Problem war und wie es gelöst ist — damit du bei einem Fehler weißt, wo du suchst.

> Verbreiteter Irrtum: „Das Plugin ist nur für Mac gebaut, es fehlen die Windows-Binaries."
> Das stimmt meist **nicht**. node-pty 1.1.0 nutzt **N-API** (ABI-stabil) und lädt unter
> Obsidians Electron problemlos. `native/win32-x64/` mit den Prebuilds (`conpty.node`,
> `pty.node`, `conpty_console_list.node`, `winpty.dll`) liegt in diesem Repo bei. Die echten
> Blocker waren **drei JavaScript-Bugs** — alle bereits gefixt.

---

## Die drei Fixes (bereits im Bundle)

### Fix 1 — Worker-Crash im Terminal
**Symptom (DevTools-Console):**
```
Failed to construct 'Worker': The V8 platform used by this instance of Node
does not support creating Workers
```
**Ursache:** node-pty draint die ConPTY-Ausgabe unter Windows per
`worker_threads.Worker`. Obsidians **Electron-Renderer** kann keine Worker-Threads
erzeugen → `spawnSession` stürzt ab → Terminal tot.

**Lösung:** Der Worker ist durch **Inline-Socket-Piping im Hauptthread** ersetzt, in
`native/win32-x64/lib/windowsConoutConnection.js`. Diese Datei liegt fertig im Bundle.

### Fix 2 — Terminal-Spawn `error code: 193`
**Symptom:** `Cannot create process, error code: 193` (`ERROR_BAD_EXE_FORMAT`).
**Ursache:** `claude.cmd` wird direkt über ConPTY gestartet. Ein `.cmd` ist kein
ausführbares PE-Programm.
**Lösung:** Auf Windows spawnt das Bundle `cmd.exe /c claude.cmd <args>`.

### Fix 3 — Token-Bar bleibt leer
**Symptom:** Token-Leiste leer; `ENOENT` oder `Der Befehl "C:\Program" … wurde nicht gefunden`.
**Ursache:** `npx`-Spawn ohne korrektes Shell-Handling findet `npx.cmd` nicht
zuverlässig; mit `shell:true` zerbricht der Pfad am Leerzeichen (`C:\Program Files\…`).
**Lösung:** Der ccusage-Aufruf läuft auf Windows über `cmd.exe /c npx …`, Args als Array
(Node quotet den Leerzeichen-Pfad korrekt).

---

## Troubleshooting

**Terminal-Tab öffnet leer, kein Prompt.**
→ Läuft `claude` in PowerShell/Terminal? Claude Code muss auf dem **PATH** sein. Das ist
die häufigste Ursache und kein Plugin-Fehler. Test: `claude --version`.

**`Worker`- oder `193`-Fehler trotzdem in der Console.**
→ Du hast vermutlich ein **älteres, ungepatchtes** `main.js` installiert. Stelle sicher,
dass die Datei aus `plugin/agentic-os/` dieses Repos kopiert wurde. Prüfe in DevTools
(`Strg+Shift+I`) die Console-Meldung `[agentic-os] node-pty geladen aus native/win32-x64`.

**`native/win32-x64/` fehlt nach dem Kopieren.**
→ Der `native/`-Ordner muss **komplett** mitkopiert werden (nicht nur `main.js`). Notfalls
`node-pty@1.1.0` auf einem Windows-Rechner installieren (`npm i node-pty@1.1.0`) und den
Inhalt im selben Layout unter `<plugin>/native/win32-x64/` ablegen
(`lib/`, `package.json`, `prebuilds/win32-x64/*.node`). Die `lib/`-JS ist plattform-identisch.

**Token-Bar bleibt leer, kein Fehler.**
→ `ccusage` braucht beim ersten Lauf einen Moment (`npx -y ccusage@latest`). Internet
nötig. Die Reset-Zeit ist eine ccusage-Schätzung (stunden-gerastert) und kann von
Claude.ai abweichen — das ist erwartetes Verhalten, kein Bug.

**Task-Roadmap / Board bleibt leer.**
→ Lief `node aggregate.js` (erzeugt `task-roadmap.json` im Vault)? Liegt `projects.json`
im Vault-Root mit gültigen TODO.md-Pfaden? Bei abweichendem Vault-Pfad die ENV
`AGENTICOS_VAULT` setzen (siehe `INSTALL.md` Schritt 6).

---

## Sicherheit / Rückbau

- `data.json` im Plugin-Ordner ist **User-Settings** — nie überschreiben.
- Willst du am Bundle selbst etwas ändern: vorher Backup (`main.js.bak`), Patches als
  eindeutige String-Replaces (genau 1 Treffer), Schreiben als **UTF-8 ohne BOM**, danach
  `node --check main.js`. Details in `CLAUDE.md`.
