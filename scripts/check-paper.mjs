#!/usr/bin/env node
// The paper's conventions, checked against the built site (out/). Runs after `next build` (`pnpm build`)
// and fails it. What a script can see: numbering, labels, anchors and cross-references. What it cannot
// (is this caption one sentence, does a table belong here): the `paper` skill.
//
//   node scripts/check-paper.mjs        after a build
//
// Rules: .claude/docs/design.md ("The paper's parts"). Registry: lib/exhibits.ts. Pages: lib/routes.ts.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const OUT = process.env.PAPER_OUT ?? "out"
if (!existsSync(OUT)) {
  console.error("check-paper: no out/ (run `pnpm build` first)")
  process.exit(1)
}

// --- Sources, read as text (they are TypeScript; the shapes are simple and kept that way) -----------
const routes = [...readFileSync("lib/routes.ts", "utf8").matchAll(/\{ path: "([^"]+)"(?:, section: "([^"]+)")?(?:, appendix: "([^"]+)")?, title: "([^"]+)"/g)]
  .map(([, path, section, appendix, title]) => ({ path, label: section ?? appendix, kind: section ? "section" : appendix ? "appendix" : null, title }))
const exhibits = [...readFileSync("lib/exhibits.ts", "utf8").matchAll(/\{ kind: "(Table|Figure)", n: "([^"]+)", path: "([^"]+)", id: "([^"]+)", caption: "([^"]+)" \}/g)]
  .map(([, kind, n, path, id, caption]) => ({ kind, n, path, id, caption }))

const errors = []
const fail = (msg) => errors.push(msg)

// Built HTML as plain markup: React's `<!-- -->` text separators removed, entities that matter decoded.
const htmlOf = (file) => readFileSync(file, "utf8").replace(/<!-- -->/g, "").replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
const fileOf = (path) => join(OUT, path === "/" ? "index.html" : `${path.slice(1)}.html`)
const pages = []
;(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (name === "_next") continue
    if (statSync(full).isDirectory()) walk(full)
    else if (name.endsWith(".html") && !/^(404|_not-found)\.html$/.test(name)) pages.push(full)
  }
})(OUT)
// Visible text only: scripts (the RSC payload repeats every string) and tags dropped.
const textOf = (html) => html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")

// --- 1. Sections: numbered 1, 2, 3 and appendices A, B, C, in contents order, each page's title block agreeing
const sections = routes.filter((r) => r.kind === "section")
sections.forEach((r, i) => r.label !== `§${i + 1}` && fail(`lib/routes.ts: ${r.path} is ${r.label}, expected §${i + 1} (sections count 1, 2, 3 in contents order).`))
const appendices = routes.filter((r) => r.kind === "appendix")
appendices.forEach((r, i) => {
  const want = `§${String.fromCharCode(65 + i)}`
  if (r.label !== want) fail(`lib/routes.ts: ${r.path} is ${r.label}, expected ${want} (appendices letter A, B, C after the sections).`)
})
if (routes.findIndex((r) => r.kind === "appendix") < routes.findLastIndex((r) => r.kind === "section")) fail("lib/routes.ts: an appendix comes before a numbered section.")
for (const r of routes.filter((r) => r.label)) {
  const file = fileOf(r.path)
  if (!existsSync(file)) { fail(`${r.path}: in lib/routes.ts but not built.`); continue }
  const header = htmlOf(file).match(/<header class="mb-10">([\s\S]*?)<\/header>/)?.[1] ?? ""
  const shown = header.match(/<p class="label num">([^<]*)<\/p>/)?.[1]
  if (shown !== r.label) fail(`${r.path}: title block says ${shown ?? "nothing"}, lib/routes.ts says ${r.label}.`)
}

// --- 2. Tables and figures: the registry numbers each kind 1, 2, 3 with no gaps, in contents order ------
const order = (path) => routes.findIndex((r) => r.path === path)
for (const kind of ["Table", "Figure"]) {
  const list = exhibits.filter((e) => e.kind === kind)
  list.forEach((e, i) => {
    if (e.n !== String(i + 1)) fail(`lib/exhibits.ts: ${kind} ${e.n} should be ${kind} ${i + 1} (plain numbers from 1, no gaps, no letters).`)
    if (e.id !== `${kind.toLowerCase()}-${e.n.toLowerCase()}`) fail(`lib/exhibits.ts: ${kind} ${e.n} has id "${e.id}", expected "${kind.toLowerCase()}-${e.n.toLowerCase()}".`)
    if (order(e.path) < 0) fail(`lib/exhibits.ts: ${kind} ${e.n} is on ${e.path}, which is not in lib/routes.ts.`)
    if (i > 0 && order(e.path) < order(list[i - 1].path)) fail(`lib/exhibits.ts: ${kind} ${e.n} (${e.path}) comes before ${kind} ${list[i - 1].n} (${list[i - 1].path}) in the contents; number them in reading order.`)
  })
}

// --- 3. Every registered table or figure is on its page, with its anchor and its caption ------------
for (const e of exhibits) {
  const file = fileOf(e.path)
  if (!existsSync(file)) continue
  const html = htmlOf(file)
  if (!html.includes(`id="${e.id}"`)) fail(`${e.path}: ${e.kind} ${e.n} is in lib/exhibits.ts but #${e.id} is not on the page (removed, or its data missing at build time).`)
  if (!html.includes(`${e.kind} ${e.n}.</span> ${e.caption}`)) fail(`${e.path}: ${e.kind} ${e.n}'s caption is not the one in lib/exhibits.ts (use TableCaption / FigureCaption).`)
}

// --- 4. Every numbered caption on the site is registered (none typed by hand) ---------------------
for (const file of pages) {
  const html = htmlOf(file)
  for (const [, kind, n] of html.matchAll(/<span class="font-semibold text-ink">(Table|Figure) ([^.<]+)\.<\/span>/g)) {
    const e = exhibits.find((x) => x.kind === kind && x.n === n)
    const page = "/" + relative(OUT, file).replace(/\.html$/, "").replace(/^index$/, "")
    if (!e) fail(`${page}: caption "${kind} ${n}." is not in lib/exhibits.ts (lists would miss it).`)
    else if (e.path !== page && !(kind === "Figure" && e.n === "1" && page === "/stats")) fail(`${page}: ${kind} ${n} is captioned here, but lib/exhibits.ts puts it on ${e.path}.`)
  }
}

// --- 5. Cross-references in visible text point at something that exists ---------------------------
const sectionLabels = new Set(routes.map((r) => r.label).filter(Boolean))
for (const file of pages) {
  const text = textOf(htmlOf(file))
  const page = "/" + relative(OUT, file).replace(/\.html$/, "").replace(/^index$/, "")
  for (const [ref, kind, n] of text.matchAll(/\b(Table|Figure) ([0-9]+[a-z]?|S\d+)\b/g)) {
    const base = n.replace(/[a-z]$/, "")
    if (!exhibits.some((e) => e.kind === kind && e.n === base)) fail(`${page}: mentions "${ref}", which does not exist (lib/exhibits.ts).`)
  }
  for (const [ref] of text.matchAll(/§[0-9A-Z]+(?:\.\d+)?/g)) {
    if (!sectionLabels.has(ref.replace(/\.\d+$/, ""))) fail(`${page}: mentions "${ref}", which is not a section in lib/routes.ts.`)
  }
}

// --- 6. Outside links open in a new tab (the A component, components/content/A.tsx) -----------------
for (const file of pages) {
  const page = "/" + relative(OUT, file).replace(/\.html$/, "").replace(/^index$/, "")
  const body = htmlOf(file).replace(/<script[\s\S]*?<\/script>/g, " ")
  for (const [tag, href] of body.matchAll(/<a\b[^>]*\bhref="(https?:\/\/[^"]+)"[^>]*>/g)) {
    if (!href.startsWith("https://phucbm.com") && !/\btarget="_blank"/.test(tag)) fail(`${page}: ${href} does not open in a new tab (use A from components/content/A.tsx).`)
  }
}

if (errors.length) {
  console.error(`check-paper: ${errors.length} problem${errors.length > 1 ? "s" : ""}\n` + [...new Set(errors)].map((e) => `  ${e}`).join("\n"))
  console.error("Rules: .claude/docs/design.md (The paper's parts) · the `paper` skill")
  process.exit(1)
}
console.log(`check-paper: ${routes.filter((r) => r.label).length} sections, ${exhibits.length} tables and figures, ${pages.length} pages, no issues.`)
