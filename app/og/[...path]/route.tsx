import { createOgImage } from "@/lib/og"
import { staticRoutes } from "@/lib/routes"
import { notesAll } from "@/content/notes/index"
import { catalogByKind } from "@/lib/content/site-catalog"
import { displayDate } from "@/lib/content/collections"
import { formatDate } from "@/lib/utils"
import { site } from "@/lib/site"

// One share card per page and note, drawn at build time and served as a static file (`lib/og.tsx`, `scripts/cf-assets.mjs`).
// A plain route rather than `opengraph-image.tsx`: the export writes those without an extension.
export const dynamic = "force-static"
export const dynamicParams = false

const pagePath = (path: string) => (path === "/" ? "index" : path.slice(1))

export function generateStaticParams() {
  return [
    ...staticRoutes.map((route) => ({ path: `${pagePath(route.path)}.png`.split("/") })),
    ...notesAll.map((note) => ({ path: ["notes", `${note.slug}.png`] })),
  ]
}

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/").replace(/\.png$/, "")

  if (path.startsWith("notes/")) {
    const slug = path.slice("notes/".length)
    const note = notesAll.find((n) => n.slug === slug)!
    const label = catalogByKind("note").find((item) => item.slug === slug)?.label
    return createOgImage({ label, title: note.title, description: note.excerpt, meta: formatDate(displayDate(note)!) })
  }

  const route = staticRoutes.find((r) => pagePath(r.path) === path)!
  if (route.path === "/") return createOgImage({ title: site.name, description: site.description })
  return createOgImage({ label: route.section ?? route.appendix, title: route.title, description: route.description })
}
