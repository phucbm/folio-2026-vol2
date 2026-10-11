// Every listing's alias (N-001 notes, P-001 projects, B-001 books, R-001 references): the item's position by date, oldest first, worked out at build time. It is not an ID
// and shifts when an older item is added; the ID is the slug (or the source's URL). Copy names an
// item, never its alias (content:lint).

export function alias(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(3, "0")}`
}

/**
 * Item → alias, numbered oldest first by `dateOf` (any sortable string: "2026-10-11", "2023-05").
 * An item with no date counts as the oldest; ties keep the order of `items`.
 */
export function aliasesByDate<T>(prefix: string, items: readonly T[], dateOf: (item: T) => string | undefined | null): Map<T, string> {
  const ordered = items.map((item, i) => ({ item, i, date: dateOf(item) ?? "" }))
  ordered.sort((a, b) => a.date.localeCompare(b.date) || a.i - b.i)
  return new Map(ordered.map(({ item }, n) => [item, alias(prefix, n + 1)]))
}
