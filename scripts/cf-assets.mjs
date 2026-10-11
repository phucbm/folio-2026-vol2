#!/usr/bin/env node
// After `opennextjs-cloudflare build` (`pnpm cf:build`): copies what the build wrote for each route
// handler (`<path>.body`: share cards, icons, sitemap, robots, feed, llms.txt, content.json) into the
// static assets, so Cloudflare serves them as files before the Worker runs. They never change between
// deploys, and the share card route (`app/og/[...path]/route.tsx`) reads its fonts from disk, which a
// Worker has none of.
import { cpSync, existsSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const FROM = ".next/server/app"
const TO = ".open-next/assets"
if (!existsSync(FROM) || !existsSync(TO)) {
  console.error("cf-assets: run `opennextjs-cloudflare build` first")
  process.exit(1)
}

let n = 0
;(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full)
    else if (name.endsWith(".body")) {
      cpSync(full, join(TO, relative(FROM, full).replace(/\.body$/, "")))
      n++
    }
  }
})(FROM)
console.log(`cf-assets: ${n} route outputs copied to ${TO}`)
