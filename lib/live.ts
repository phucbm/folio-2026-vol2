import { cache } from "react"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import seed from "@/data/live.generated.json"
import { mergeStores, toLive, type Book, type Live, type Reference, type Store } from "@/lib/live/jobs"
import { ossRepoPaths } from "@/data/oss"
import { aliasesByDate } from "@/lib/aliases"

export type { Book, NpmPackage, Reference, RepoStats, WordpressPlugin } from "@/lib/live/jobs"

// Every number from outside the repo (plan 002). On the site: KV (`LIVE`, key `live`), which the
// Worker refreshes after visits (`worker/index.ts`), merged job by job with the seed this build
// brought (`data/live.generated.json`, `pnpm data`). At build time and under `next dev` there is no
// KV, so the seed alone. A source never fetched is missing, and the pages leave its figures blank.
// The pages that call this set `revalidate`, so they render again with the new numbers.

export interface KV {
  get(key: string, type: "json"): Promise<unknown>
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
}

async function stored(): Promise<Store | null> {
  let kv: KV | undefined
  try {
    kv = (getCloudflareContext().env as { LIVE?: KV }).LIVE
  } catch {
    return null
  }
  return kv ? ((await kv.get("live", "json")) as Store | null) : null
}

export type LiveData = Omit<Live, "books" | "references"> & {
  books: (Book & { label: string })[]
  references: (Reference & { label: string })[]
}

// Newest first, each with its alias by date (lib/aliases.ts): B-001 is the first book I finished,
// R-001 the first link I saved. The source's URL is the ID.
const newestFirst = <T extends object>(prefix: string, items: T[], dateOf: (item: T) => string | undefined) => {
  const labels = aliasesByDate(prefix, items, dateOf)
  return items
    .map((item) => ({ ...item, label: labels.get(item)! }))
    .sort((a, b) => b.label.localeCompare(a.label, "en", { numeric: true }))
}

/** The numbers, once per render. */
export const getLive = cache(async (): Promise<LiveData> => {
  const live = toLive(mergeStores(seed as Store, await stored()), ossRepoPaths)
  return {
    ...live,
    books: newestFirst("B", live.books ?? [], (book) => book.read),
    references: newestFirst("R", live.references ?? [], (ref) => ref.saved),
  }
})

// Active installs as WordPress.org shows them: the floor of a bucket, so "<10", "10+", "1,000+".
export const formatInstalls = (n: number) => (n < 10 ? "<10" : `${n.toLocaleString("en-US")}+`)
