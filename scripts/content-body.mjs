// Writes the plain text body of every content MDX file to content/body.generated.json,
// keyed like content/meta.generated.json ("<dir>/<file>.mdx"). Runs next to
// scripts/content-meta.mjs (same package.json step and dev watcher). The JSON is gitignored.
//
// Only app/content.json/route.ts may read it: importing it elsewhere pulls the full
// text into page JS.
import fs from "node:fs"
import path from "node:path"
import {fileURLToPath} from "node:url"
import {COLLECTIONS} from "./content-collections.mjs"

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)))
const OUT = path.join(root, "content/body.generated.json")

function dropImportExport(text) {
  const out = []
  const lines = text.split("\n")
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*(import|export)\b/.test(line)) {
      let depth = 0
      for (const ch of line) {
        if (ch === "{" || ch === "(" || ch === "[") depth++
        if (ch === "}" || ch === ")" || ch === "]") depth--
      }
      // Multi-line blocks such as `export const x = { ... }` end when braces balance.
      while (depth > 0 && i + 1 < lines.length) {
        i++
        for (const ch of lines[i]) {
          if (ch === "{" || ch === "(" || ch === "[") depth++
          if (ch === "}" || ch === ")" || ch === "]") depth--
        }
      }
      continue
    }
    out.push(line)
  }
  return out.join("\n")
}

export function mdxToText(src) {
  let text = String(src)
  // YAML frontmatter.
  text = text.replace(/^---\r?\n[\s\S]*?\r?\n---\s*/, "")
  // Fenced code blocks: protected while the rest is stripped, kept as plain text (no fences).
  const codes = []
  text = text.replace(/^ *```[^\n]*\n([\s\S]*?)\n *```/gm, (_m, inner) => {
    codes.push(inner)
    return `\n@@CODEBLOCK${codes.length - 1}@@\n`
  })
  // HTML comments and {/* */} MDX comments.
  text = text.replace(/<!--[\s\S]*?-->/g, "")
  text = text.replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
  // import/export lines, including multi-line export blocks.
  text = dropImportExport(text)
  // JSX: self-closing tags (or tags with no text children) dropped entirely ...
  text = text.replace(/<[A-Za-z][A-Za-z0-9.]*(?:[^<>/"']|"[^"]*"|'[^']*')*\/>/g, "")
  // ... paired tags unwrapped so text children survive (innermost first, loop for nesting).
  const pair = /<([A-Za-z][A-Za-z0-9.]*)(?:[^<>/"']|"[^"]*"|'[^']*')*>((?:(?!<\1[\s>]).)*?)<\/\1\s*>/gs
  let prev
  do {
    prev = text
    text = text.replace(pair, "$2")
  } while (text !== prev)
  // Leftover lone tags: multi-line opening tags, wrappers, closing tags.
  text = text.replace(/<\/?[A-Za-z][A-Za-z0-9.]*(?:[^<>/"']|"[^"]*"|'[^']*')*>/g, "")
  // Restore the code blocks verbatim.
  text = text.replace(/@@CODEBLOCK(\d+)@@/g, (_m, n) => codes[Number(n)] ?? "")
  // Images dropped; links keep their text plus the url.
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
  text = text.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (_m, label, url) => `${label} (${url})`)
  // Headings keep their text without the # marks; tables become one "a | b" line per row.
  text = text
    .split("\n")
    .map((line) => {
      if (/^\s*\|.*\|\s*$/.test(line)) {
        if (/^[\s|:\-]+$/.test(line)) return ""
        return line
          .split("|")
          .map((c) => c.trim())
          .filter(Boolean)
          .join(" | ")
      }
      return line.replace(/^(\s{0,3})#{1,6}\s+/, "$1")
    })
    .join("\n")
  // Emphasis markers.
  text = text.replace(/\*\*/g, "").replace(/__/g, "").replace(/`/g, "")
  text = text.replace(/\*([^*]+)\*/g, "$1")
  text = text.replace(/(?<!\w)_([^_\n]+)_(?!\w)/g, "$1")
  // Collapse runs of spaces, collapse 3+ newlines to one blank line, trim.
  text = text
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .join("\n")
  text = text.replace(/\n{3,}/g, "\n\n")
  return text.trim()
}

export function writeContentBody() {
  const out = {}
  for (const dir of COLLECTIONS) {
    const abs = path.join(root, "content", dir)
    if (!fs.existsSync(abs)) continue
    for (const file of fs.readdirSync(abs).filter((f) => f.endsWith(".mdx")).sort()) {
      const src = fs.readFileSync(path.join(abs, file), "utf8")
      out[`${dir}/${file}`] = mdxToText(src)
    }
  }
  const json = JSON.stringify(out, null, 1) + "\n"
  // Only write on a change, so a dev rebuild is not triggered for nothing.
  if (!fs.existsSync(OUT) || fs.readFileSync(OUT, "utf8") !== json) fs.writeFileSync(OUT, json)
  return Object.keys(out).length
}
