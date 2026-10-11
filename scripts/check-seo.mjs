#!/usr/bin/env node
// Search metadata, checked against the prerendered pages (`.next/server/app`). Runs after `next build` (`pnpm build`) and
// fails it. Metadata comes from lib/seo.ts (pages read `staticRoutes`, notes their frontmatter).
//
//   node scripts/check-seo.mjs        after a build
//
// Every page: one <title>, a meta description, a canonical URL to itself, Open Graph and Twitter
// tags with a share card that was built. Titles unique. The sitemap lists exactly the indexable pages.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const OUT = process.env.PAPER_OUT ?? ".next/server/app"
const ORIGIN = "https://phucbm.com"
if (!existsSync(OUT)) {
  console.error(`check-seo: no ${OUT} (run \`pnpm build\` first)`)
  process.exit(1)
}

const errors = []
// A route handler's output (sitemap, share cards) is written as `<path>.body`.
const built = (path) => [path, `${path}.body`].find((file) => existsSync(file) && statSync(file).isFile())
const fail = (msg) => errors.push(msg)
const decode = (s) => s.replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">")

const pages = []
;(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (name === "_next") continue
    if (statSync(full).isDirectory()) walk(full)
    else if (name.endsWith(".html") && !/^(404|_not-found|_global-error)\.html$/.test(name)) pages.push(full)
  }
})(OUT)

const pathOf = (file) => "/" + relative(OUT, file).replace(/\.html$/, "").replace(/(^|\/)index$/, "")
const urlOf = (path) => (path === "/" ? ORIGIN : ORIGIN + path)
// Next writes the metadata into <head>; attribute order is its own, so match each tag loosely.
const meta = (head, attr, key) => {
  const tag = [...head.matchAll(/<meta\b[^>]*>/g)].map(([t]) => t).find((t) => t.includes(`${attr}="${key}"`))
  return tag ? decode(tag.match(/\bcontent="([^"]*)"/)?.[1] ?? "") : undefined
}

const titles = new Map()
const indexable = new Set()
for (const file of pages) {
  const path = pathOf(file)
  const head = readFileSync(file, "utf8").match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? ""
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(head)
  if (!noindex) indexable.add(urlOf(path))

  const titleTags = head.match(/<title>[^<]*<\/title>/g) ?? []
  const title = decode(titleTags[0]?.replace(/<\/?title>/g, "") ?? "")
  if (titleTags.length !== 1 || !title) fail(`${path}: needs exactly one <title> (has ${titleTags.length}).`)
  else if (!noindex) titles.set(title, [...(titles.get(title) ?? []), path])

  const description = meta(head, "name", "description")
  if (!description) fail(`${path}: no meta description (lib/routes.ts for pages, \`excerpt\` for notes).`)

  const canonical = head.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
  if (canonical !== urlOf(path)) fail(`${path}: canonical is ${canonical ?? "missing"}, expected ${urlOf(path)} (pageMetadata or alternates() in lib/seo.ts).`)

  for (const key of ["og:title", "og:description", "og:url", "og:image", "og:type"]) {
    if (!meta(head, "property", key)) fail(`${path}: no ${key} (shareMetadata in lib/og.tsx).`)
  }
  if (!meta(head, "name", "twitter:card")) fail(`${path}: no twitter:card.`)
  const image = meta(head, "property", "og:image")
  if (image?.startsWith(ORIGIN) && !built(join(OUT, new URL(image).pathname))) fail(`${path}: share card ${image} was not built.`)
}

for (const [title, paths] of titles) if (paths.length > 1) fail(`Title "${title}" is on ${paths.join(", ")}: titles must be unique.`)

// The sitemap: every indexable page, and nothing else.
const sitemapFile = built(join(OUT, "sitemap.xml"))
if (!sitemapFile) fail("sitemap.xml was not built.")
else {
  const listed = new Set([...readFileSync(sitemapFile, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, u]) => u.replace(/\/$/, "")))
  for (const url of indexable) if (!listed.has(url)) fail(`${url}: built and indexable but not in sitemap.xml (staticRoutes in lib/routes.ts).`)
  for (const url of listed) if (!indexable.has(url)) fail(`${url}: in sitemap.xml but not an indexable page.`)
}
for (const file of ["robots.txt", "llms.txt", "feed.xml"]) if (!built(join(OUT, file))) fail(`${file} was not built.`)

if (errors.length) {
  console.error(`check-seo: ${errors.length} problem${errors.length > 1 ? "s" : ""}\n` + [...new Set(errors)].map((e) => `  ${e}`).join("\n"))
  process.exit(1)
}
console.log(`check-seo: ${pages.length} pages, ${indexable.size} in the sitemap, no issues.`)
