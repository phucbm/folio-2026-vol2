// Pure catalog builder: one normalized view over the listed entries of every collection (notes, for
// now). It imports no MDX and no fs, so Vitest runs it with plain fixtures. The real data is
// wired in lib/content/site-catalog.ts.

import { aliasesByDate } from "@/lib/aliases"
import { skillRef, type SkillRef } from "@/lib/skills"

export type CatalogKind = "note"

export interface CatalogItem {
  kind: CatalogKind
  slug: string
  title: string
  excerpt: string | null
  tags: string[]
  date: string | null
  updated: string | null
  // updated ?? date, same rule as displayDate()
  dateModified: string | null
  // Canonical path (no origin).
  url: string
  // "N-047": its position by date (lib/aliases.ts), not an ID.
  label: string
  year: number | null
  related: string[]
  // The note's agent skill (lib/skills.ts), or null.
  skill: SkillRef | null
}

// Loose input shapes: just the fields the catalog reads.
export interface CatalogSourceMeta {
  slug: string
  title: string
  excerpt?: string
  tags: string[]
  date?: string
  updated?: string
  related?: string[]
  skill?: string
}

export interface CatalogInputs {
  notes: CatalogSourceMeta[]
}

const ROUTE_BASE: Record<CatalogKind, string> = {
  note: "/notes",
}

export function catalogPath(kind: CatalogKind, slug: string): string {
  return `${ROUTE_BASE[kind]}/${slug}`
}

// "Oldest first" breaks ties by the order of `notes`, which content/notes/index.ts keeps in its
// filename order: reorder that list to reorder notes that share a date.
export function buildCatalog(inputs: CatalogInputs): CatalogItem[] {
  const labels = aliasesByDate("N", [...inputs.notes].reverse(), (meta) => meta.date)
  return inputs.notes.map((meta) => ({
    kind: "note" as const,
    slug: meta.slug,
    title: meta.title,
    excerpt: meta.excerpt || null,
    tags: meta.tags,
    date: meta.date ?? null,
    updated: meta.updated ?? null,
    dateModified: meta.updated ?? meta.date ?? null,
    url: catalogPath("note", meta.slug),
    label: labels.get(meta)!,
    year: yearOf(meta.date),
    related: meta.related ?? [],
    skill: meta.skill ? skillRef(meta.skill) : null,
  }))
}

function yearOf(date?: string): number | null {
  if (!date) return null
  const year = Number(date.slice(0, 4))
  return Number.isNaN(year) ? null : year
}

export interface SiteInfo {
  name: string
  url: string
  description: string
}

export interface ContentFeedInput {
  catalog: CatalogItem[]
  site: SiteInfo
  generatedAt: string
  // Plain text per MDX file, keyed like content/body.generated.json ("notes/x.mdx").
  bodies?: Record<string, string>
}

// Longest body per item in the feed.
export const FEED_BODY_MAX = 20_000

const BODY_DIR: Record<CatalogKind, string> = {
  note: "notes",
}

export function bodyKey(item: Pick<CatalogItem, "kind" | "slug">): string {
  return `${BODY_DIR[item.kind]}/${item.slug}.mdx`
}

/** `/content.json`: the machine-readable copy of the site (the MCP reads it later; plan 001). */
export function buildContentFeed({ catalog, site, generatedAt, bodies }: ContentFeedInput) {
  const withBody = (item: CatalogItem): Omit<CatalogItem, "url"> & { url: string; body?: string } => {
    const body = bodies?.[bodyKey(item)]
    return { ...item, url: site.url + item.url, ...(body ? { body: body.slice(0, FEED_BODY_MAX) } : {}) }
  }
  const group = (kind: CatalogKind) => catalog.filter((i) => i.kind === kind).map(withBody)
  return {
    schemaVersion: 1 as const,
    generatedAt,
    site,
    notes: group("note"),
  }
}
