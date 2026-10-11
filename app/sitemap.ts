import type { MetadataRoute } from "next"
import { site } from "@/lib/site"
import { staticRoutes } from "@/lib/routes"
import { catalog, catalogByKind } from "@/lib/content/site-catalog"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  const newestNote = catalogByKind("note").map((item) => item.dateModified).filter(Boolean).sort().at(-1)
  return [
    ...staticRoutes.map((route) => ({
      url: site.url + route.path,
      // A listing changes when its newest entry does; other pages carry no date rather than a guessed one.
      ...(route.path === "/notes" && newestNote ? { lastModified: newestNote } : {}),
    })),
    ...catalog.map((item) => ({
      url: site.url + item.url,
      ...(item.dateModified ? { lastModified: item.dateModified } : {}),
    })),
  ]
}
