import type { MetadataRoute } from "next"
import { site } from "@/lib/site"

export const dynamic = "force-static"

export default function robots(): MetadataRoute.Robots {
  // A build with drafts in it is the preview: keep it out of search engines.
  const preview = process.env.SHOW_DRAFTS === "1"
  return {
    rules: { userAgent: "*", ...(preview ? { disallow: "/" } : { allow: "/" }) },
    sitemap: `${site.url}/sitemap.xml`,
  }
}
