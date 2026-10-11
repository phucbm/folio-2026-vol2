import live from "@/data/live.generated.json"
import { aliasesByDate } from "@/lib/aliases"

// Every number from outside the repo, as `scripts/data/fetch.mjs` last fetched it (`pnpm data`;
// `pnpm run deploy` runs it first). A source that has never been fetched is missing, and the pages
// leave its figures blank.

export interface Book {
  title: string
  author: string
  year?: number
  // The day I finished it, or shelved it when Goodreads has no read date.
  read?: string
  rating?: number
  review?: string
  url: string
}

export interface Reference {
  title: string
  url: string
  source: string
  saved: string
  tags: string[]
}

export interface NpmPackage {
  name: string
  description?: string
  // "owner/name" on GitHub, lowercased.
  repo?: string
  created: string
  downloadsLastMonth: number
  downloadsTotal: number
  jsdelivrHitsLastMonth: number | null
  // Calendar years with any hits. Null when jsDelivr failed; missing in data fetched before it existed.
  jsdelivrHitsByYear?: Record<string, number> | null
}

export interface RepoStats {
  description?: string
  stars: number
  // Stars by the year they were given. Missing in data fetched before it existed.
  starsByYear?: Record<string, number>
  url: string
  // "YYYY-MM-DD". Missing in data fetched before they existed.
  created?: string
  // Commits on the default branch, and the day of the last one.
  commits?: number
  lastCommit?: string
}

export interface WordpressPlugin {
  slug: string
  name: string
  // "YYYY-MM-DD", the day WordPress.org listed it.
  added: string
  // Rounded down by WordPress.org: 1000 means "1,000+".
  activeInstalls: number
  downloads: number
  url: string
}

interface Live {
  fetchedAt: Record<string, string>
  github?: {
    commitsByYear: Record<string, number>
    contributionsPerWeek: { week: string; count: number }[]
    // The last 53 weeks, Sunday first, as on a GitHub profile. Missing in data fetched before it existed.
    contributionsPerDay?: { date: string; count: number }[]
    repos: Record<string, RepoStats>
    // jsDelivr hits through the GitHub route, by repo ("owner/name") then calendar year. Missing in
    // data fetched before it existed.
    jsdelivrHitsByYear?: Record<string, Record<string, number>>
  }
  npm?: {
    packages: NpmPackage[]
    downloadsPerMonth: { month: string; downloads: number }[]
  }
  wordpress?: { plugins: WordpressPlugin[] }
  books?: Book[]
  references?: Reference[]
}

const data = live as Live

export const fetchedAt = data.fetchedAt
export const github = data.github
export const npm = data.npm
export const wordpress = data.wordpress

// Newest first, each with its alias by date (lib/aliases.ts): B-001 is the first book I finished,
// R-001 the first link I saved. The source's URL is the ID.
const newestFirst = <T extends object>(prefix: string, items: T[], dateOf: (item: T) => string | undefined) => {
  const labels = aliasesByDate(prefix, items, dateOf)
  return items
    .map((item) => ({ ...item, label: labels.get(item)! }))
    .sort((a, b) => b.label.localeCompare(a.label, "en", { numeric: true }))
}

export const books: (Book & { label: string })[] = newestFirst("B", data.books ?? [], (book) => book.read)
export const references: (Reference & { label: string })[] = newestFirst("R", data.references ?? [], (ref) => ref.saved)
