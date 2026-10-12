import { catalogByKind } from "@/lib/content/site-catalog"
import { projects } from "@/data/projects"
import { formatInstalls, type LiveData } from "@/lib/live"

// Table 1 on the home page: the numbers, this year and all time. Every figure is computed at build
// time, never typed: the content catalog, plus `lib/live.ts` for the outside sources. `null` is a
// figure not measured (a source never fetched, or one with no date to split by year).
export interface NumberRow {
  label: string
  thisYear: number | null
  allTime: number | null
  // The section that backs the row.
  href?: string
  // How a figure is shown, when not as a plain number.
  format?: (n: number) => string
  // A table note, for a row whose figure needs explaining: lettered a, b, … under the table.
  note?: string
}

const sum = (values: number[]) => values.reduce((n, v) => n + v, 0)

// `year`: the "this year" column (the current year by default; Ask's get_stats asks for others).
export function numbers({ books, github, npm, wordpress }: LiveData, year = new Date().getFullYear()): NumberRow[] {
  const notes = catalogByKind("note")
  const commits = github ? Object.entries(github.commitsByYear) : null
  const packages = npm?.packages
  const plugins = wordpress?.plugins
  const repos = github ? Object.values(github.repos) : null
  // jsDelivr hits by year through both routes (npm and GitHub), only once both are measured.
  const hits = packages?.every((p) => p.jsdelivrHitsByYear) && github?.jsdelivrHitsByYear
    ? [...packages.map((p) => p.jsdelivrHitsByYear!), ...Object.values(github.jsdelivrHitsByYear)]
    : null

  return [
    {
      label: "Commits",
      thisYear: commits ? (github!.commitsByYear[year] ?? 0) : null,
      allTime: commits ? sum(commits.map(([, n]) => n)) : null,
      href: "/stats",
    },
    {
      label: "Notes",
      thisYear: notes.filter((note) => note.year === year).length,
      allTime: notes.length,
      href: "/notes",
    },
    {
      label: "Books read",
      thisYear: books.length ? books.filter((b) => b.read?.startsWith(String(year))).length : null,
      allTime: books.length || null,
      href: "/reading",
    },
    {
      label: "Projects",
      // Counted by date only once every project has one; until then this year is not measured.
      thisYear: projects.every((p) => p.date) ? projects.filter((p) => p.date!.startsWith(String(year))).length : null,
      allTime: projects.length,
      href: "/projects",
    },
    {
      label: "npm packages",
      thisYear: packages ? packages.filter((p) => p.created.startsWith(String(year))).length : null,
      allTime: packages ? packages.length : null,
      href: "/oss",
    },
    {
      label: "npm downloads",
      thisYear: npm ? sum(npm.downloadsPerMonth.filter((m) => m.month.startsWith(String(year))).map((m) => m.downloads)) : null,
      allTime: packages ? sum(packages.map((p) => p.downloadsTotal)) : null,
      href: "/oss",
    },
    {
      label: "WordPress plugins",
      thisYear: plugins ? plugins.filter((p) => p.added.startsWith(String(year))).length : null,
      allTime: plugins ? plugins.length : null,
      href: "/stats",
    },
    {
      label: "WordPress installs",
      note: "Sites running my WordPress plugins today, rounded down as WordPress.org shows them. It keeps no history, so this year counts the plugins listed this year.",
      // Blank in a year with no new plugin, rather than a 0 that reads as lost installs.
      thisYear: plugins?.some((p) => p.added.startsWith(String(year))) ? sum(plugins.filter((p) => p.added.startsWith(String(year))).map((p) => p.activeInstalls)) : null,
      format: formatInstalls,
      allTime: plugins ? sum(plugins.map((p) => p.activeInstalls)) : null,
      href: "/stats",
    },
    {
      label: "jsDelivr hits",
      note: "Files served by jsDelivr from my npm packages and public GitHub repos, both ways it serves them. A hit is one file request, not one visitor.",
      thisYear: hits ? sum(hits.map((h) => h[year] ?? 0)) : null,
      allTime: hits ? sum(hits.map((h) => sum(Object.values(h)))) : null,
      href: "/oss",
    },
    {
      label: "GitHub stars",
      note: "Stars on the repos in §3 Open source.",
      thisYear: repos?.every((r) => r.starsByYear) ? sum(repos.map((r) => r.starsByYear![year] ?? 0)) : null,
      allTime: repos ? sum(repos.map((r) => r.stars)) : null,
      href: "/oss",
    },
  ]
}
