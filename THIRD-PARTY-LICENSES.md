# Third-Party-Lizenzen

Dieses Paket enthält Code Dritter. Alle unten genannten Komponenten stehen unter der
MIT-Lizenz; deren Volltext steht am Ende dieser Datei und gilt für jede der aufgeführten
Copyright-Zeilen.

Das Agentic-OS-Plugin selbst steht unter MIT (siehe `LICENSE`).

## Gebündelt in `plugin/agentic-os/main.js`

Der Bundler (esbuild) hängt die Lizenzhinweise dieser Pakete an das Bundle an; sie sind dort
im Klartext erhalten. Übersicht:

| Paket | Copyright | Lizenz |
|-------|-----------|--------|
| `react`, `react-dom`, `scheduler`, `react/jsx-runtime` | Copyright (c) Facebook, Inc. and its affiliates. | MIT |
| `@xterm/xterm` | Copyright (c) 2014-2024 The xterm.js authors. All rights reserved. | MIT |
| `@xterm/addon-fit` | Copyright (c) 2014-2024 The xterm.js authors. All rights reserved. | MIT |
| xterm.js-Vorläufer (in xterm.js enthalten) | Copyright (c) 2012-2013, Christopher Jeffrey | MIT |
| jslinux-vt100 (Ursprung des Terminal-Parsers) | Copyright (c) 2011 Fabrice Bellard | MIT |

## Binär mitgeliefert in `plugin/agentic-os/native/`

| Paket | Version | Copyright | Lizenz |
|-------|---------|-----------|--------|
| `node-pty` | 1.1.0 | Copyright (c) 2017, Daniel Imms (MIT)<br>Copyright (c) 2018, Microsoft Corporation (MIT) | MIT |
| `node-addon-api` | ^7.1.0 (in den Prebuilds einkompiliert) | Copyright (c) 2017 Node.js API collaborators | MIT |

Quelle node-pty: https://github.com/microsoft/node-pty

`native/win32-x64/lib/windowsConoutConnection.js` ist gegenüber dem Original **modifiziert**
(Worker-Threads durch Inline-Socket-Piping ersetzt, weil der Obsidian-Renderer
`worker_threads` verbietet). Die Modifikation steht unter derselben MIT-Lizenz; Details in
`WINDOWS-SETUP.md`.

## Zur Laufzeit nachgeladen (nicht mitgeliefert)

Diese Programme werden nicht ausgeliefert, sondern bei Bedarf vom Nutzer-System bzw. über
`npx` bezogen. Ihre Lizenzen gelten dort, wo sie installiert werden.

| Programm | Bezug | Lizenz | Wofür |
|----------|-------|--------|-------|
| `ccusage` | `npx ccusage@<pin>` | MIT | Token-Bar (optional, degradiert still) |
| Claude Code CLI | vom Nutzer installiert | Anthropic-Lizenzbedingungen | Terminal-Sitzungen |
| Obsidian-API | Peer-Dependency der Host-App | proprietär (Obsidian) | Plugin-Host |

Die im Repo unter `skills/` liegenden Skills, die aus fremden Quellen stammen, sind in
`product/SKILLS-PROVENANCE.md` einzeln aufgeführt.

## MIT-Lizenz (Volltext)

Gilt für alle oben mit „MIT" gekennzeichneten Komponenten, jeweils mit der dort genannten
Copyright-Zeile.

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
