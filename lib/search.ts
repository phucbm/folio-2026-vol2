import type { SearchDoc } from "@perxel/spotlight"
import { projects } from "@/data/projects"
import { catalogByKind } from "@/lib/content/site-catalog"
import { staticRoutes } from "@/lib/routes"

// What the search box finds (perxel-web plan 018, `@perxel/spotlight`): the sections, the notes and
// the projects, one document each. Served as `/search.json` (prerendered) and read by the Ask route
// as its pages. Full text never goes in: the Ask route adds it on the server.

/** Result kinds, in display order. */
export const SEARCH_KINDS = ["page", "note", "project"]

export function searchDocs(): SearchDoc[] {
  const pages: SearchDoc[] = staticRoutes.map((route) => ({
    id: `page:${route.path}`,
    kind: "page",
    title: route.title,
    ...((route.section ?? route.appendix) ? { subtitle: route.section ?? route.appendix } : {}),
    url: route.path,
    snippets: [route.description],
  }))
  const notes: SearchDoc[] = catalogByKind("note").map((note) => ({
    id: `note:${note.slug}`,
    kind: "note",
    title: note.title,
    subtitle: note.label,
    url: note.url,
    ...(note.tags.length ? { keywords: note.tags } : {}),
    ...(note.excerpt ? { snippets: [note.excerpt] } : {}),
  }))
  const work: SearchDoc[] = projects.map((project) => ({
    id: `project:${project.slug}`,
    kind: "project",
    title: project.title,
    subtitle: `${project.label} · ${project.at}`,
    // No page of its own: the live site or the case study, else the list.
    url: project.href ?? "/projects",
    keywords: [project.at, project.role ?? ""].filter(Boolean),
    ...(project.line ? { snippets: [project.line] } : {}),
  }))
  return [...pages, ...notes, ...work]
}
