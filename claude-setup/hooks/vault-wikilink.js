#!/usr/bin/env node
// Vault wikilink auto-linker — PostToolUse hook
// Silently exits 0 on ANY error. Never blocks session.

const fs = require("fs");
const path = require("path");

// Vault-Pfad kommt aus der Umgebung (settings.json -> env.AGENTICOS_VAULT).
// Ohne gesetzte Variable ist der Hook inert statt kaputt.
const VAULT = (process.env.AGENTICOS_VAULT || "").replace(/\\/g, "/");
if (VAULT.length === 0) process.exit(0);
const WIKI = path.join(VAULT, "wiki");

async function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    if (process.stdin.isTTY) return resolve("");
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
    setTimeout(() => resolve(data), 2000); // safety timeout
  });
}

async function run() {
  const input = await readStdin();

  let filePath = "";
  try {
    const payload = JSON.parse(input || "{}");
    filePath =
      payload?.tool_input?.file_path ||
      payload?.tool_response?.filePath ||
      "";
  } catch (_) {
    return;
  }

  if (!filePath || !filePath.endsWith(".md")) return;

  const normalized = filePath.replace(/\\/g, "/");
  if (!normalized.startsWith(VAULT.replace(/\\/g, "/"))) return;

  let wikiPages = [];
  try {
    wikiPages = fs
      .readdirSync(WIKI)
      .filter((f) => f.endsWith(".md"))
      .map((f) => path.basename(f, ".md"));
  } catch (_) {
    return;
  }

  if (wikiPages.length === 0) return;

  let content = "";
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch (_) {
    return;
  }

  const selfSlug = path.basename(filePath, ".md");
  let result = content;
  let changed = false;

  for (const slug of wikiPages) {
    if (slug === selfSlug) continue;

    // Skip if already linked
    const alreadyLinked = new RegExp(
      `\\[\\[(?:[^\\]]*\\/)?${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\|[^\\]]*)?\\]\\]`,
      "i"
    ).test(result);
    if (alreadyLinked) continue;

    const lines = result.split("\n");
    let inFrontmatter = false;
    let inCode = false;
    let replaced = false;

    const newLines = lines.map((line, idx) => {
      if (replaced) return line;
      if (idx === 0 && line.trim() === "---") { inFrontmatter = true; return line; }
      if (inFrontmatter && line.trim() === "---") { inFrontmatter = false; return line; }
      if (inFrontmatter) return line;
      if (line.startsWith("```")) { inCode = !inCode; return line; }
      if (inCode) return line;

      const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const mentionRegex = new RegExp(`\\b(${escapedSlug})\\b`, "i");
      const m = mentionRegex.exec(line);
      if (!m) return line;
      const matchStart = m.index;
      const matchEnd = matchStart + m[0].length;
      // Don't touch text inside inline code spans (`...`)
      const backtickBefore = (line.slice(0, matchStart).match(/`/g) || []).length;
      if (backtickBefore % 2 === 1) return line;
      // Don't re-link if already inside [[...]] or immediately preceded by wiki/ or memory/
      const context = line.slice(Math.max(0, matchStart - 8), matchEnd + 4);
      if (/\[\[[^\]]*$/.test(line.slice(0, matchStart))) return line;
      if (/\]\]/.test(context)) return line;
      if (/(wiki|memory)\/$/.test(line.slice(0, matchStart))) return line;
      replaced = true;
      changed = true;
      return line.slice(0, matchStart) + `[[wiki/${slug}|${m[0]}]]` + line.slice(matchEnd);
    });

    if (replaced) result = newLines.join("\n");
  }

  if (changed) {
    try {
      fs.writeFileSync(filePath, result, "utf8");
    } catch (_) {
      // silent
    }
  }
}

run().catch(() => {}).finally(() => process.exit(0));
