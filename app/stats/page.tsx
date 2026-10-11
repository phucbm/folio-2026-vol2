import type { Metadata } from "next"
import Link from "next/link"
import { PageHeader } from "@/components/content/PageHeader"
import { NumCell, Pending, TableCaption } from "@/components/content/Table"
import { Figure0 } from "@/components/plots/Figure0"
import { Plot } from "@/components/plots/Plot"
import { booksPerYear, downloadsPerMonth } from "@/lib/figures"
import { fetchedAt, github } from "@/lib/live"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Stats",
  description: "The charts behind Table 1: contributions per week, commits per year, books per year, npm downloads.",
}

// The supplementary material behind Table 1, numbered the way a paper numbers it (Figure S1, Table S1)
// so it never collides with the archived projects' figures.
export default function StatsPage() {
  const books = booksPerYear()
  const downloads = downloadsPerMonth()
  const commits = github ? Object.entries(github.commitsByYear).filter(([, n]) => n > 0).reverse() : []
  const updated = Object.values(fetchedAt).sort().at(-1)
  return (
    <article className="max-w-measure">
      <PageHeader
        title="Stats"
        meta={updated ? <>Fetched <span className="num">{formatDate(updated.slice(0, 10))}</span></> : undefined}
      />
      <p>The data behind Table 1 on the home page, fetched again from GitHub, npm and Goodreads on every deploy.</p>

      <section aria-labelledby="contributions" className="mt-14">
        <h2 id="contributions" className="text-2xl">Contributions</h2>
        <div className="my-6">
          {github ? <Figure0 /> : <Pending>run <code>pnpm data</code> for GitHub</Pending>}
        </div>
        {commits.length > 0 && (
          <div className="my-6">
            <TableCaption id="table-s1" n="S1">Commits per year on GitHub, private repos included.</TableCaption>
            <table className="mt-2 w-full border-collapse border-y border-ink text-[0.9375rem]">
              <thead className="border-b border-rule">
                <tr className="label text-left">
                  <th scope="col" className="py-1.5 pr-4 font-normal">Year</th>
                  <th scope="col" className="py-1.5 text-right font-normal">Commits</th>
                </tr>
              </thead>
              <tbody>
                {commits.map(([year, n]) => (
                  <tr key={year}>
                    <th scope="row" className="num py-1.5 pr-4 text-left font-normal">{year}</th>
                    <NumCell value={n} last />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="books" className="mt-14">
        <h2 id="books" className="text-2xl">Books</h2>
        {books ? (
          <figure className="my-6">
            <Plot {...books} kind="bar" yLabel="Books" title="Bar chart of books I finished per year" />
            <figcaption className="label mt-2">
              <span className="font-semibold text-ink">Figure S1.</span> Books I finished per year, from Goodreads. A
              book with no read date counts in the year I shelved it.
            </figcaption>
          </figure>
        ) : (
          <Pending>run <code>pnpm data</code> for Goodreads</Pending>
        )}
      </section>

      <section aria-labelledby="downloads" className="mt-14">
        <h2 id="downloads" className="text-2xl">Downloads</h2>
        {downloads ? (
          <figure className="my-6">
            <Plot {...downloads} kind="line" yLabel="Downloads" title="Line plot of npm downloads per month, all my packages together" />
            <figcaption className="label mt-2">
              <span className="font-semibold text-ink">Figure S2.</span> npm downloads per month, all my packages
              together, full months only. The packages one by one are in <Link href="/oss">§4</Link>.
            </figcaption>
          </figure>
        ) : (
          <Pending>run <code>pnpm data</code> for npm</Pending>
        )}
      </section>
    </article>
  )
}
