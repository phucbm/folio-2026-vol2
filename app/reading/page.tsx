import type { Metadata } from "next"
import { shareMetadata } from "@/lib/og"
import { PageHeader } from "@/components/content/PageHeader"
import { Pending } from "@/components/content/Table"
import { books } from "@/lib/live"
import { formatDate } from "@/lib/utils"

const title = "Reading"
const description = "The books I've read, from Goodreads, as a bibliography with short reviews."

export const metadata: Metadata = { title, description, ...shareMetadata("/reading", { title, description }) }

// Vietnamese letters that English never uses: a review written in Vietnamese gets `lang="vi"`.
const VIETNAMESE = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i

// A bibliography: alias, author, year, title in italics, then the date I finished it, my rating and review.
export default function ReadingPage() {
  return (
    <article className="max-w-measure">
      <PageHeader label="§4" title="Reading" />
      <p>
        I track my reading on <a href="https://www.goodreads.com/phucbm">Goodreads</a>, and this list comes from
        there. Lately it's mostly history and memoirs: real people's lives fascinate me.
      </p>
      {books.length === 0 ? (
        <Pending>run <code>pnpm data</code> for the books</Pending>
      ) : (
        <ol className="mt-8 border-t border-rule">
          {books.map((book) => (
            <li key={book.url} className="grid grid-cols-[4.5rem_1fr] gap-x-4 border-b border-rule py-3">
              <span className="num pt-0.5 text-ink-muted">{book.label}</span>
              <div>
                <p lang={VIETNAMESE.test(book.title) ? "vi" : undefined}>
                  {book.author}
                  {book.year && <> (<span className="num">{book.year}</span>)</>}. <a href={book.url}><cite>{book.title}</cite></a>.
                </p>
                <p className="label mt-1">
                  {book.read && <>Read <span className="num">{formatDate(book.read)}</span></>}
                  {book.read && book.rating && " · "}
                  {book.rating && <>Rated <span className="num">{book.rating}/5</span></>}
                </p>
                {book.review && (
                  <p className="mt-2 whitespace-pre-line" lang={VIETNAMESE.test(book.review) ? "vi" : undefined}>{book.review}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </article>
  )
}
