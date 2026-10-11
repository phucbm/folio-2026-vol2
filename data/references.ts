// §6 References: bookmarks, from the Discord forum channel I bookmark into (as phucbm-web did).
// Filled by the data pipeline (plan 001, part 6); empty until then.
export interface Reference {
  title: string
  url: string
  // The site or author, for the citation.
  source: string
  // The day I saved it ("2026-03-14").
  saved: string
  tags: string[]
}

export const references: Reference[] = []
