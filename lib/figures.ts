import type { LiveData } from "@/lib/live"

// The series behind the plots, built from `lib/live.ts`: values plus the x ticks to label them.
export interface Series {
  values: number[]
  xTicks: { at: number; label: string }[]
}

// One tick per year, on the first entry of that year; `key` gives each entry's date ("2026-03-02").
function yearTicks(keys: string[]): Series["xTicks"] {
  const ticks: Series["xTicks"] = []
  keys.forEach((key, i) => {
    const year = key.slice(0, 4)
    if (i === 0 || keys[i - 1].slice(0, 4) !== year) ticks.push({ at: i, label: year })
  })
  return ticks
}

/** Figure 1: contributions per week, from my first contribution on GitHub to this week. */
export function contributionsPerWeek({ github }: LiveData): Series | null {
  const weeks = github?.contributionsPerWeek ?? []
  const first = weeks.findIndex((w) => w.count > 0)
  if (first < 0) return null
  const shown = weeks.slice(first)
  // The first tick lands mid-year when the data starts mid-year: label from the next January.
  return { values: shown.map((w) => w.count), xTicks: yearTicks(shown.map((w) => w.week)).filter((t) => t.at > 0) }
}

/** Commits per year, from the first year with one to this year (empty years between kept). */
export function commitsPerYear({ github }: LiveData): Series | null {
  const years = Object.entries(github?.commitsByYear ?? {}).sort(([a], [b]) => a.localeCompare(b))
  const first = years.findIndex(([, n]) => n > 0)
  if (first < 0) return null
  const shown = years.slice(first)
  return { values: shown.map(([, n]) => n), xTicks: shown.map(([y], i) => ({ at: i, label: y })) }
}

/** npm downloads per month, every package together, full months only. */
export function downloadsPerMonth({ npm }: LiveData): Series | null {
  const thisMonth = new Date().toISOString().slice(0, 7)
  const months = (npm?.downloadsPerMonth ?? []).filter((m) => m.month < thisMonth)
  if (months.length === 0) return null
  return { values: months.map((m) => m.downloads), xTicks: yearTicks(months.map((m) => m.month)).filter((t) => t.at > 0) }
}

/** Books finished per year, from the first year with one to this year (empty years kept). */
export function booksPerYear({ books }: LiveData): Series | null {
  const years = books.map((b) => Number(b.read?.slice(0, 4))).filter(Boolean)
  if (years.length === 0) return null
  const from = Math.min(...years)
  const to = new Date().getFullYear()
  const all = Array.from({ length: to - from + 1 }, (_, i) => from + i)
  return {
    values: all.map((y) => years.filter((v) => v === y).length),
    xTicks: all.map((y, i) => ({ at: i, label: String(y) })),
  }
}
