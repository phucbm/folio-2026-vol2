// Writes the YAML frontmatter of every content MDX file to content/meta.generated.json, so the
// collections (`content/*/index.ts`) read `meta` without importing the MDX modules (which would put
// every component a post uses into every page that lists posts).
//
// Runs before `next build` and `next dev` (package.json), and `next dev` re-runs it when a file
// under content/ changes (next.config.ts). The JSON is gitignored.
import fs from "node:fs"
import path from "node:path"
import {fileURLToPath} from "node:url"
import {parse} from "yaml"
import {writeContentBody} from "./content-body.mjs"
import {COLLECTIONS} from "./content-collections.mjs"

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)))
const OUT = path.join(root, "content/meta.generated.json")

export function writeContentMeta() {
  const out = {}
  for (const dir of COLLECTIONS) {
    const abs = path.join(root, "content", dir)
    if (!fs.existsSync(abs)) continue
    for (const file of fs.readdirSync(abs).filter((f) => f.endsWith(".mdx")).sort()) {
      const src = fs.readFileSync(path.join(abs, file), "utf8")
      const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)
      out[`${dir}/${file}`] = fm ? (parse(fm[1]) ?? {}) : {}
    }
  }
  const json = JSON.stringify(out, null, 1) + "\n"
  // Only write on a change, so a dev rebuild is not triggered for nothing.
  if (!fs.existsSync(OUT) || fs.readFileSync(OUT, "utf8") !== json) fs.writeFileSync(OUT, json)
  return Object.keys(out).length
}

// Dev only: regenerate when an .mdx file in a collection changes.
export function watchContentMeta() {
  let timer
  for (const dir of COLLECTIONS) {
    fs.watch(path.join(root, "content", dir), {recursive: true}, (_event, file) => {
      if (!file?.endsWith(".mdx")) return
      clearTimeout(timer)
      timer = setTimeout(() => {
        try {
          writeContentMeta()
          writeContentBody()
        } catch (err) {
          console.error(`content-meta: ${err.message}`)
        }
      }, 100)
    })
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`content-meta: ${writeContentMeta()} files, content-body: ${writeContentBody()} files`)
}
