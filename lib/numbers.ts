import { catalogByKind } from "@/lib/content/site-catalog"
import { projects } from "@/data/projects"
import { books, github, npm } from "@/lib/live"

// Table 1 on the home page: the numbers, this year and all time. Every figure is computed at build
// time, never typed: the content catalog, plus `lib/live.ts` for the outside sources. `null` is a
// figure not measured (a source never fetched, or one with no date to split by year).
export interface NumberRow {
  label: string
  thisYear: number | null
  allTime: number | null
  // The section that backs the row.
  href?: string
}

const year = new Date().getFullYear()
const notes = catalogByKind("note")
const sum = (values: number[]) => values.reduce((n, v) => n + v, 0)

const commits = github ? Object.entries(github.commitsByYear) : null
const packages = npm?.packages

export const numbers: NumberRow[] = [
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
]
