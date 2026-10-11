import { catalogByKind } from "@/lib/content/site-catalog"
import { perxelWorks } from "@/data/perxel"

// Table 1 on the home page: the numbers, this year and all time. Every figure is computed at build
// time, never typed. `null` is a figure not measured yet: commits, books and packages come from the
// data pipeline (plan 001, part 6), which fills them in here.
export interface NumberRow {
  label: string
  thisYear: number | null
  allTime: number | null
  // The section that backs the row, once that section is built.
  href?: string
}

const year = new Date().getFullYear()
const notes = catalogByKind("note")
const archived = catalogByKind("archived")

export const numbers: NumberRow[] = [
  { label: "Commits", thisYear: null, allTime: null },
  {
    label: "Notes",
    thisYear: notes.filter((note) => note.year === year).length,
    allTime: notes.length,
    href: "/notes",
  },
  { label: "Books read", thisYear: null, allTime: null },
  { label: "Projects, archived", thisYear: archived.filter((item) => item.year === year).length, allTime: archived.length },
  // Perxel entries carry no date, so only the all-time count.
  { label: "Projects, Perxel", thisYear: null, allTime: perxelWorks.length, href: "/perxel" },
  { label: "Packages", thisYear: null, allTime: null },
  { label: "Downloads per month", thisYear: null, allTime: null },
]
