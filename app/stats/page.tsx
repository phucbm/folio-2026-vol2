import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import Link from "next/link"
import { A } from "@/components/content/A"
import { PageHeader } from "@/components/content/PageHeader"
import { FigureCaption, NumCell, Pending, TableCaption } from "@/components/content/Table"
import { exhibit } from "@/lib/exhibits"
import { Figure1 } from "@/components/plots/Figure1"
import { Plot } from "@/components/plots/Plot"
import { booksPerYear, commitsPerYear, downloadsPerMonth } from "@/lib/figures"
import { formatInstalls, getLive } from "@/lib/live"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = pageMetadata("/stats")

// Outside numbers (lib/live.ts): rendered again at most hourly, on a visit, after the Worker refreshes them (plan 002).
export const revalidate = 3600

// The data behind Table 1. Its tables and figures are numbered with the rest of the site (lib/exhibits.ts).
export default async function StatsPage() {
  const live = await getLive()
  const { github, wordpress } = live
  const books = booksPerYear(live)
  const downloads = downloadsPerMonth(live)
  const commits = commitsPerYear(live)
  const updated = live.fetchedAt
  return (
    <article className="max-w-measure">
      <PageHeader
        label="§A"
        title="Stats"
        meta={updated ? <>Fetched <span className="num">{formatDate(updated.slice(0, 10))}</span></> : undefined}
      />
      <p>The data behind Table 1 on the home page, fetched again from GitHub, npm, WordPress.org and Goodreads about once a day.</p>

      <section aria-labelledby="contributions" className="mt-14">
        <h2 id="contributions" className="text-2xl">Contributions</h2>
        <div className="my-6">
          {github ? <Figure1 live={live} weekly /> : <Pending>run <code>pnpm data</code> for GitHub</Pending>}
        </div>
        {commits && (
          <figure id={exhibit("Figure", "2").id} className="my-6 scroll-mt-6">
            <Plot {...commits} kind="bar" labels partialLast={commits.xTicks.at(-1)?.label === String(new Date().getFullYear())} yLabel="Commits" title={`Bar chart of commits per year: ${commits.xTicks.map((t) => `${t.label}, ${commits.values[t.at].toLocaleString("en-US")}`).join("; ")}`} />
            <FigureCaption n="2">The outlined bar is this year so far.</FigureCaption>
          </figure>
        )}
      </section>

      <section aria-labelledby="books" className="mt-14">
        <h2 id="books" className="text-2xl">Books</h2>
        {books ? (
          <figure id={exhibit("Figure", "3").id} className="my-6 scroll-mt-6">
            <Plot {...books} kind="bar" partialLast={books.xTicks.at(-1)?.label === String(new Date().getFullYear())} yLabel="Books" title="Bar chart of books I finished per year" />
            <FigureCaption n="3">A book with no read date counts in the year I shelved it; the outlined bar is this year so far.</FigureCaption>
          </figure>
        ) : (
          <Pending>run <code>pnpm data</code> for Goodreads</Pending>
        )}
      </section>

      <section aria-labelledby="downloads" className="mt-14">
        <h2 id="downloads" className="text-2xl">Downloads</h2>
        {downloads ? (
          <figure id={exhibit("Figure", "4").id} className="my-6 scroll-mt-6">
            <Plot {...downloads} kind="line" yLabel="Downloads" title="Line plot of npm downloads per month, all my packages together" />
            <FigureCaption n="4">
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
            <TableCaption n="4">Installs are rounded down, as WordPress.org shows them.</TableCaption>
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
                    <NumCell value={p.activeInstalls} format={formatInstalls} />
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
