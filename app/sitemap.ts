import type { MetadataRoute } from "next"
import { site } from "@/lib/site"
import { staticRoutes } from "@/lib/routes"
import { catalog } from "@/lib/content/site-catalog"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticRoutes.map((route) => ({ url: site.url + route.path })),
    ...catalog.map((item) => ({
      url: site.url + item.url,
      ...(item.dateModified ? { lastModified: item.dateModified } : {}),
    })),
  ]
}
