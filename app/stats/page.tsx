import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import Link from "next/link"
import { A } from "@/components/content/A"
import { PageHeader } from "@/components/content/PageHeader"
import { FigureCaption, NumCell, Pending, TableCaption } from "@/components/content/Table"
import { exhibit } from "@/lib/exhibits"
import { Figure1 } from "@/components/plots/Figure1"
import { Plot } from "@/components/plots/Plot"
import { booksPerYear, downloadsPerMonth } from "@/lib/figures"
import { fetchedAt, github, wordpress } from "@/lib/live"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = pageMetadata("/stats")

// The data behind Table 1. Its tables and figures are numbered with the rest of the site (lib/exhibits.ts).
export default function StatsPage() {
  const books = booksPerYear()
  const downloads = downloadsPerMonth()
  const commits = github ? Object.entries(github.commitsByYear).filter(([, n]) => n > 0).reverse() : []
  const updated = Object.values(fetchedAt).sort().at(-1)
  return (
    <article className="max-w-measure">
      <PageHeader
        label="§A"
        title="Stats"
        meta={updated ? <>Fetched <span className="num">{formatDate(updated.slice(0, 10))}</span></> : undefined}
      />
      <p>The data behind Table 1 on the home page, fetched again from GitHub, npm, WordPress.org and Goodreads on every deploy.</p>

      <section aria-labelledby="contributions" className="mt-14">
        <h2 id="contributions" className="text-2xl">Contributions</h2>
        <div className="my-6">
          {github ? <Figure1 weekly /> : <Pending>run <code>pnpm data</code> for GitHub</Pending>}
        </div>
        {commits.length > 0 && (
          <div className="my-6">
            <TableCaption n="4" />
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
          <figure id={exhibit("Figure", "2").id} className="my-6 scroll-mt-6">
            <Plot {...books} kind="bar" yLabel="Books" title="Bar chart of books I finished per year" />
            <FigureCaption n="2">A book with no read date counts in the year I shelved it.</FigureCaption>
          </figure>
        ) : (
          <Pending>run <code>pnpm data</code> for Goodreads</Pending>
        )}
      </section>

      <section aria-labelledby="downloads" className="mt-14">
        <h2 id="downloads" className="text-2xl">Downloads</h2>
        {downloads ? (
          <figure id={exhibit("Figure", "3").id} className="my-6 scroll-mt-6">
            <Plot {...downloads} kind="line" yLabel="Downloads" title="Line plot of npm downloads per month, all my packages together" />
            <FigureCaption n="3">
              The packages one by one are in <Link href="/oss">§3</Link>.
            </FigureCaption>
          </figure>
        ) : (
          <Pending>run <code>pnpm data</code> for npm</Pending>
        )}
      </section>

      <section aria-labelledby="plugins" className="mt-14">
        <h2 id="plugins" className="text-2xl">WordPress plugins</h2>
        {wordpress ? (
          <div className="my-6">
            <TableCaption n="5">WordPress.org rounds installs down: 1,000 means 1,000 or more, and under 10 shows as 0.</TableCaption>
            <table className="mt-2 w-full border-collapse border-y border-ink text-[0.9375rem]">
              <thead className="border-b border-rule">
                <tr className="label text-left">
                  <th scope="col" className="py-1.5 pr-4 font-normal">Plugin</th>
                  <th scope="col" className="py-1.5 pr-4 text-right font-normal">Active installs</th>
                  <th scope="col" className="py-1.5 text-right font-normal">Downloads</th>
                </tr>
              </thead>
              <tbody>
                {wordpress.plugins.map((p) => (
                  <tr key={p.slug}>
                    <th scope="row" className="py-1.5 pr-4 text-left font-normal"><A href={p.url}>{p.name}</A></th>
                    <NumCell value={p.activeInstalls} />
                    <NumCell value={p.downloads} last />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Pending>run <code>pnpm data</code> for WordPress.org</Pending>
        )}
      </section>
    </article>
  )
}
