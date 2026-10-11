// Pure catalog builder: one normalized, cross-collection view over the listed notes and archived
// projects. It imports no MDX and no fs, so Vitest runs it with plain fixtures. The real data is
// wired in lib/content/site-catalog.ts.

export type CatalogKind = "note" | "archived"

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
  // "N-047" for notes, "Figure 3" for archived projects.
  label: string
  year: number | null
  related: string[]
  projects: string[]
  // Entries whose `projects` name this one (archived projects only).
  citedBy: { kind: CatalogKind; slug: string }[]
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
  projects?: string[]
  number?: number
  figure?: number
  year?: number
}

export interface CatalogInputs {
  notes: CatalogSourceMeta[]
  archived: CatalogSourceMeta[]
}

const ROUTE_BASE: Record<CatalogKind, string> = {
  note: "/notes",
  archived: "/archived",
}

export function catalogPath(kind: CatalogKind, slug: string): string {
  return `${ROUTE_BASE[kind]}/${slug}`
}

/** N-047: the notebook number, zero-padded to three digits. */
export function noteLabel(number: number): string {
  return `N-${String(number).padStart(3, "0")}`
}

export function figureLabel(figure: number): string {
  return `Figure ${figure}`
}

function yearOf(date?: string): number | null {
  if (!date) return null
  const year = Number(date.slice(0, 4))
  return Number.isNaN(year) ? null : year
}

export function buildCatalog(inputs: CatalogInputs): CatalogItem[] {
  const fromMeta = (kind: CatalogKind, meta: CatalogSourceMeta): CatalogItem => {
    const number = kind === "note" ? meta.number : meta.figure
    if (number === undefined) {
      throw new Error(`Catalog: ${kind} "${meta.slug}" has no \`${kind === "note" ? "number" : "figure"}\``)
    }
    return {
      kind,
      slug: meta.slug,
      title: meta.title,
      excerpt: meta.excerpt || null,
      tags: meta.tags,
      date: meta.date ?? null,
      updated: meta.updated ?? null,
      dateModified: meta.updated ?? meta.date ?? null,
      url: catalogPath(kind, meta.slug),
      label: kind === "note" ? noteLabel(number) : figureLabel(number),
      year: meta.year ?? yearOf(meta.date),
      related: meta.related ?? [],
      projects: [],
      citedBy: [],
    }
  }

  const metaByItem = new Map<CatalogItem, CatalogSourceMeta>()
  const items: CatalogItem[] = []
  const add = (kind: CatalogKind, list: CatalogSourceMeta[]) => {
    const seen = new Map<number, string>()
    for (const meta of list) {
      const item = fromMeta(kind, meta)
      const number = (kind === "note" ? meta.number : meta.figure)!
      const clash = seen.get(number)
      if (clash) throw new Error(`Catalog: ${item.label} is used by both "${clash}" and "${meta.slug}"`)
      seen.set(number, meta.slug)
      metaByItem.set(item, meta)
      items.push(item)
    }
  }
  add("note", inputs.notes)
  add("archived", inputs.archived)

  // Resolve `projects` slugs and the reverse lookup.
  const projectTargets = new Map(items.filter((i) => i.kind === "archived").map((i) => [i.slug, i]))
  for (const item of items) {
    const resolved: string[] = []
    for (const slug of metaByItem.get(item)?.projects ?? []) {
      const target = projectTargets.get(slug)
      if (!target) throw new Error(`Catalog: unknown project "${slug}" in \`projects\` of ${item.kind} "${item.slug}"`)
      if (target === item || resolved.includes(slug)) continue
      resolved.push(slug)
      target.citedBy.push({ kind: item.kind, slug: item.slug })
    }
    item.projects = resolved
  }

  return items
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
  archived: "archived",
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
    archived: group("archived"),
  }
}
