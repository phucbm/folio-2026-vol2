// Every numbered table and figure on the site, in one place: the List of Tables and the List of
// Figures on the home page read it, and each caption on a page starts with its `caption` (a page may
// add sentences after it). A new table or figure is added here first. Numbers are fixed labels of a
// part of a page (unlike list aliases, lib/aliases.ts), counted 1, 2, 3 in the order they appear
// in the contents.
export type ExhibitKind = "Table" | "Figure"

export interface Exhibit {
  kind: ExhibitKind
  n: string
  // The page it is on, and its anchor there.
  path: string
  id: string
  // The caption's first sentence; also the line in the list.
  caption: string
}

export const exhibits: Exhibit[] = [
  { kind: "Table", n: "1", path: "/", id: "table-1", caption: "The numbers, this year and all time, rebuilt on every deploy." },
  { kind: "Table", n: "2", path: "/oss", id: "table-2", caption: "The repos, newest first, with GitHub stars, commits and the day of the last one." },
  { kind: "Table", n: "3", path: "/oss", id: "table-3", caption: "Every package I publish on npm, by downloads in the last 30 days." },
  { kind: "Table", n: "4", path: "/stats", id: "table-4", caption: "Commits per year on GitHub, private repos included." },
  { kind: "Figure", n: "1", path: "/", id: "figure-1", caption: "My GitHub contributions: commits, pull requests, issues and reviews, private repos included." },
  { kind: "Figure", n: "2", path: "/stats", id: "figure-2", caption: "Books I finished per year, from Goodreads." },
  { kind: "Figure", n: "3", path: "/stats", id: "figure-3", caption: "npm downloads per month, all my packages together, full months only." },
]

export function exhibit(kind: ExhibitKind, n: string): Exhibit {
  const found = exhibits.find((e) => e.kind === kind && e.n === n)
  if (!found) throw new Error(`exhibits: no ${kind} ${n} in lib/exhibits.ts`)
  return found
}
