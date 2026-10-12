import { jsonSchema, tool, type ToolSet } from "ai"
import { ossRepos, repoPath } from "@/data/oss"
import { getLive } from "@/lib/live"
import { numbers } from "@/lib/numbers"

// Ask's tools over the live numbers (`lib/live.ts`, the same figures /stats, /oss and Table 1 show):
// they are not in any page's text, so the model reads them here. Small structured results, no prose.

export function liveTools(): ToolSet {
  return {
    get_stats: tool({
      description:
        "Phuc's numbers for one calendar year and all time: commits, notes, books read, projects, npm packages and downloads, " +
        "WordPress plugins and installs, jsDelivr hits, GitHub stars. The same figures as Table 1 on phucbm.com. A null figure is not measured.",
      inputSchema: jsonSchema<{ year?: number }>({
        type: "object",
        properties: { year: { type: "integer", description: "Calendar year (default: this year)", minimum: 2010, maximum: 2100 } },
      }),
      execute: async ({ year }) => {
        const y = year ?? new Date().getFullYear()
        const rows = numbers(await getLive(), y)
        return {
          year: y,
          rows: rows.map((r) => ({ label: r.label, [String(y)]: r.thisYear, allTime: r.allTime, ...(r.note ? { note: r.note } : {}) })),
          source: "https://phucbm.com/stats",
        }
      },
    }),
    get_repos: tool({
      description:
        "The open-source repos on phucbm.com's Open source page (phucbm, viivue and perxel), with stars, commits, description, " +
        "the day each started and its npm downloads when it is a package. Only these repos, not every repo in the orgs.",
      inputSchema: jsonSchema<{ sort?: "stars" | "newest" }>({
        type: "object",
        properties: { sort: { type: "string", enum: ["stars", "newest"], description: "Order (default: stars)" } },
      }),
      execute: async ({ sort }) => {
        const live = await getLive()
        const repos = live.github?.repos ?? {}
        const packages = live.npm?.packages ?? []
        const list = ossRepos(repos).map((name) => {
          const path = repoPath(name)
          const r = repos[path]
          const pkg = packages.find((p) => p.repo === path.toLowerCase())
          return {
            repo: path,
            url: r?.url ?? `https://github.com/${path}`,
            ...(r?.description ? { description: r.description } : {}),
            stars: r?.stars ?? null,
            commits: r?.commits ?? null,
            started: r?.created ?? null,
            ...(pkg ? { npm: pkg.name, npmDownloadsTotal: pkg.downloadsTotal, npmDownloadsLastMonth: pkg.downloadsLastMonth } : {}),
          }
        })
        if (sort !== "newest") list.sort((a, b) => (b.stars ?? -1) - (a.stars ?? -1))
        return { repos: list, source: "https://phucbm.com/oss" }
      },
    }),
  }
}
