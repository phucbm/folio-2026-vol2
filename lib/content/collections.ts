import contentMeta from "@/content/meta.generated.json"
import type { ContentStatus } from "./schema"

interface RelatableMeta {
  slug: string
  tags: string[]
  date?: string
  related?: string[]
}

// Filenames are listed in each collection's `index.ts` rather than read from disk: nothing at
// runtime touches `fs`. The slug is the filename, so the two cannot drift apart.
export async function loadCollectionMeta<Meta extends { slug: string }>(
  files: string[],
  importFile: (file: string) => Promise<{ meta: Omit<Meta, "slug"> }>,
): Promise<Meta[]> {
  const modules = await Promise.all(files.map((file) => importFile(file)))
  return modules.map((mod, i) => ({ ...mod.meta, slug: files[i].replace(/\.mdx$/, "") }) as Meta)
}

// `SHOW_DRAFTS=1` (`SHOW_DRAFTS=1 pnpm run deploy`, for a preview) builds drafts too, so the preview shows
// the whole site while entries are still placeholders.
function isDev() {
  return process.env.NODE_ENV !== "production" || process.env.SHOW_DRAFTS === "1"
}

// `buildable`: gets a static page. `listed`: appears in listings, feeds and related pools.
// Drafts are in both under `next dev` (and `SHOW_DRAFTS=1`) and in neither in production; unlisted items are buildable only.
export function splitByStatus<Meta extends { status: ContentStatus }>(
  items: Meta[],
): { buildable: Meta[]; listed: Meta[] } {
  const buildable = items.filter((item) => item.status !== "draft" || isDev())
  const listed = items.filter((item) => item.status === "published" || (item.status === "draft" && isDev()))
  return { buildable, listed }
}

// Manual `related` picks first (in authored order), then entries sharing the primary tag, newest
// first, up to `limit`. Draws only from `pool` (pass the listed set).
export function resolveRelated<Meta extends RelatableMeta>(item: Meta, pool: Meta[], limit = 3): Meta[] {
  const bySlug = new Map(pool.map((entry) => [entry.slug, entry]))
  const manual = (item.related ?? [])
    .map((slug) => bySlug.get(slug))
    .filter((entry): entry is Meta => !!entry && entry.slug !== item.slug)
    .slice(0, limit)
  if (manual.length >= limit) return manual

  const primary = item.tags[0]
  const used = new Set([item.slug, ...manual.map((entry) => entry.slug)])
  const fallback = pool
    .filter((entry) => !used.has(entry.slug) && primary && entry.tags.includes(primary))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
  return [...manual, ...fallback.slice(0, limit - manual.length)]
}

// The date readers see: the last manual update if there is one, else the publish date.
export function displayDate(item: { date?: string; updated?: string }): string | undefined {
  return item.updated ?? item.date
}

// Frontmatter of `content/<collection>/<file>`, from the JSON `scripts/content-meta.mjs` writes.
// Collections never `import()` the MDX for its `meta`: that would put every component a post uses
// into every page that lists posts. Only the `[slug]` entry routes import the MDX.
export function metaOf<Meta>(key: string): Promise<{ meta: Omit<Meta, "slug"> }> {
  const meta = (contentMeta as Record<string, unknown>)[key]
  if (!meta) throw new Error(`content meta missing for ${key}: run scripts/content-meta.mjs`)
  return Promise.resolve({ meta: meta as Omit<Meta, "slug"> })
}
