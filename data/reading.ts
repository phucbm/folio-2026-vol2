// §5 Reading: the bibliography, from Goodreads (https://www.goodreads.com/phucbm). Filled by the data
// pipeline (plan 001, part 6) from the Goodreads RSS; empty until then.
export interface Book {
  title: string
  author: string
  // The year the book came out, for the citation.
  year?: number
  // The date I finished it ("2026-03-14").
  read?: string
  rating?: number
  review?: string
  url: string
}

export const books: Book[] = []
