import { describe, it, expect } from "vitest"
import { buildCatalog, buildContentFeed, FEED_BODY_MAX } from "./catalog"
import { alias, aliasesByDate } from "@/lib/aliases"
import type { CatalogInputs } from "./catalog"

function inputs(overrides: Partial<CatalogInputs> = {}): CatalogInputs {
  return { notes: [], ...overrides }
}

describe("urls and labels", () => {
  it("maps a note to its route, and numbers notes oldest first", () => {
    // Newest first, as content/notes/index.ts passes them; the shared date keeps that order reversed.
    const items = buildCatalog(inputs({
      notes: [
        { slug: "c", title: "C", tags: [], date: "2026-10-11" },
        { slug: "b", title: "B", tags: [], date: "2026-10-11" },
        { slug: "a", title: "A", tags: [], date: "2025-01-01" },
      ],
    }))
    expect(items.map((i) => i.label)).toEqual(["N-003", "N-002", "N-001"])
    expect(items[0]).toMatchObject({ url: "/notes/c", year: 2026 })
  })
})

describe("aliases", () => {
  it("pads to three digits and leaves longer ones alone", () => {
    expect(alias("P", 47)).toBe("P-047")
    expect(alias("N", 1234)).toBe("N-1234")
  })

  it("counts an undated item as the oldest and keeps the given order on ties", () => {
    const items = [{ d: "2024-05" }, { d: undefined }, { d: "2023-01" }, { d: "2024-05" }]
    const labels = aliasesByDate("P", items, (i) => i.d)
    expect(items.map((i) => labels.get(i))).toEqual(["P-003", "P-001", "P-002", "P-004"])
  })
})

describe("dates", () => {
  it("dateModified is updated ?? date", () => {
    const [a, b] = buildCatalog(inputs({
      notes: [
        { slug: "a", title: "A", tags: [], date: "2026-01-01", updated: "2026-02-01" },
        { slug: "b", title: "B", tags: [], date: "2026-01-01" },
      ],
    }))
    expect(a.dateModified).toBe("2026-02-01")
    expect(b.dateModified).toBe("2026-01-01")
  })
})

describe("content feed", () => {
  it("absolutizes urls, groups by kind and caps bodies", () => {
    const catalog = buildCatalog(inputs({ notes: [{ slug: "n", title: "N", tags: [] }] }))
    const feed = buildContentFeed({
      catalog,
      site: { name: "S", url: "https://example.com", description: "" },
      generatedAt: "2026-10-11T00:00:00.000Z",
      bodies: { "notes/n.mdx": "x".repeat(FEED_BODY_MAX + 10) },
    })
    expect(feed.notes[0].url).toBe("https://example.com/notes/n")
    expect(feed.notes[0].body).toHaveLength(FEED_BODY_MAX)
  })
})
