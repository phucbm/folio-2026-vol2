import { site } from "@/lib/site"
import { staticRoutes } from "@/lib/routes"
import { catalogByKind } from "@/lib/content/site-catalog"
import type { CatalogItem } from "@/lib/content/catalog"
import { projects } from "@/data/projects"

export const dynamic = "force-static"

const entry = (item: CatalogItem) => `- [${item.label}: ${item.title}](${site.url}${item.url})${item.excerpt ? `: ${item.excerpt}` : ""}`

function section(heading: string, lines: string[]): string {
  return lines.length ? `## ${heading}\n\n${lines.join("\n")}` : ""
}

// https://llmstxt.org: what the site is, then every page with one line each. Full text: /content.json.
export function GET() {
  const body = [
    `# ${site.name}`,
    `> ${site.description}`,
    `Full text of every entry, as JSON: ${site.url}/content.json`,
    section("Pages", staticRoutes.map((r) => `- [${r.title}](${site.url}${r.path}): ${r.description}`)),
    section("Notes", catalogByKind("note").map(entry)),
    section("Projects", projects.map((p) => `- ${p.href ? `[${p.label}: ${p.title}](${p.href})` : `${p.label}: ${p.title}`}${p.line ? `: ${p.line}` : ""}`)),
  ].filter(Boolean)
  return new Response(body.join("\n\n") + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
