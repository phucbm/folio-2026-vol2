import type { Metadata } from "next"
import { PageHeader } from "@/components/content/PageHeader"
import { Pending } from "@/components/content/Table"
import { books } from "@/data/reading"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Reading",
  description: "The books I've read, from Goodreads, as a bibliography with short reviews.",
}

// A bibliography: author, year, title in italics, then the date I finished it and a short review.
export default function ReadingPage() {
  return (
    <article className="max-w-measure">
      <PageHeader label="§5" title="Reading" />
      <p>
        I track my reading on <a href="https://www.goodreads.com/phucbm">Goodreads</a>, and this list comes from
        there. Lately it's mostly history and memoirs: real people's lives fascinate me. For films I lean towards
        sci-fi.
      </p>
      {books.length === 0 ? (
        <Pending>the books come from the Goodreads feed in part 6</Pending>
      ) : (
        <ol className="mt-8 border-t border-rule">
          {books.map((book) => (
            <li key={book.url} className="border-b border-rule py-3">
              <p>
                {book.author}
                {book.year && <> (<span className="num">{book.year}</span>)</>}. <a href={book.url}><cite>{book.title}</cite></a>.
              </p>
              {book.read && <p className="label mt-1">Read <span className="num">{formatDate(book.read)}</span></p>}
              {book.review && <p className="mt-2">{book.review}</p>}
            </li>
          ))}
        </ol>
      )}
    </article>
  )
}
