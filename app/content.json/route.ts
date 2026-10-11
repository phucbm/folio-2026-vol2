import { site } from "@/lib/site"
import { buildContentFeed } from "@/lib/content/catalog"
import { catalog } from "@/lib/content/site-catalog"
// Full text of every entry. Only this route may import it, so it stays out of every page's JS.
import bodies from "@/content/body.generated.json"

export const dynamic = "force-static"

// Machine-readable copy of the site, with full text. Rebuilt on every deploy.
export function GET() {
  return Response.json(
    buildContentFeed({
      catalog,
      bodies: bodies as Record<string, string>,
      site: { name: site.name, url: site.url, description: site.description },
      generatedAt: new Date().toISOString(),
    }),
  )
}
