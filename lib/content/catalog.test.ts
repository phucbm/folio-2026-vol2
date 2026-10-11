import { describe, it, expect } from "vitest"
import { buildCatalog, buildContentFeed, FEED_BODY_MAX, noteLabel } from "./catalog"
import type { CatalogInputs } from "./catalog"

function inputs(overrides: Partial<CatalogInputs> = {}): CatalogInputs {
  return { notes: [], archived: [], ...overrides }
}

describe("urls and labels", () => {
  it("maps each kind to its route and label", () => {
    const items = buildCatalog(inputs({
      notes: [{ slug: "n", title: "N", tags: [], number: 7, date: "2026-10-11" }],
      archived: [{ slug: "a", title: "A", tags: [], figure: 3, year: 2019 }],
    }))
    const bySlug = new Map(items.map((i) => [i.slug, i]))
    expect(bySlug.get("n")).toMatchObject({ url: "/notes/n", label: "N-007", year: 2026 })
    expect(bySlug.get("a")).toMatchObject({ url: "/archived/a", label: "Figure 3", year: 2019 })
  })

  it("pads note numbers to three digits and leaves longer ones alone", () => {
    expect(noteLabel(47)).toBe("N-047")
    expect(noteLabel(1234)).toBe("N-1234")
  })

  it("throws on a missing or repeated number", () => {
    expect(() => buildCatalog(inputs({ notes: [{ slug: "n", title: "N", tags: [] }] }))).toThrow(/no `number`/)
    expect(() => buildCatalog(inputs({
      notes: [
        { slug: "a", title: "A", tags: [], number: 1 },
        { slug: "b", title: "B", tags: [], number: 1 },
      ],
    }))).toThrow(/N-001 is used by both/)
  })
})

describe("dates", () => {
  it("dateModified is updated ?? date", () => {
    const [a, b] = buildCatalog(inputs({
      notes: [
        { slug: "a", title: "A", tags: [], number: 1, date: "2026-01-01", updated: "2026-02-01" },
        { slug: "b", title: "B", tags: [], number: 2, date: "2026-01-01" },
      ],
    }))
    expect(a.dateModified).toBe("2026-02-01")
    expect(b.dateModified).toBe("2026-01-01")
  })
})

describe("projects", () => {
  it("resolves project slugs and records the reverse lookup once", () => {
    const items = buildCatalog(inputs({
      notes: [{ slug: "n", title: "N", tags: [], number: 1, projects: ["a", "a"] }],
      archived: [{ slug: "a", title: "A", tags: [], figure: 1, year: 2020 }],
    }))
    const note = items.find((i) => i.slug === "n")!
    const project = items.find((i) => i.slug === "a")!
    expect(note.projects).toEqual(["a"])
    expect(project.citedBy).toEqual([{ kind: "note", slug: "n" }])
  })

  it("throws on an unknown project slug", () => {
    expect(() => buildCatalog(inputs({
      notes: [{ slug: "n", title: "N", tags: [], number: 1, projects: ["nope"] }],
    }))).toThrow(/unknown project "nope"/)
  })
})

describe("content feed", () => {
  it("absolutizes urls, groups by kind and caps bodies", () => {
    const catalog = buildCatalog(inputs({ notes: [{ slug: "n", title: "N", tags: [], number: 1 }] }))
    const feed = buildContentFeed({
      catalog,
      site: { name: "S", url: "https://example.com", description: "" },
      generatedAt: "2026-10-11T00:00:00.000Z",
      bodies: { "notes/n.mdx": "x".repeat(FEED_BODY_MAX + 10) },
    })
    expect(feed.notes[0].url).toBe("https://example.com/notes/n")
    expect(feed.notes[0].body).toHaveLength(FEED_BODY_MAX)
    expect(feed.archived).toEqual([])
  })
})
