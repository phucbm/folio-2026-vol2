import type { Metadata } from "next"
import { PageHeader } from "@/components/content/PageHeader"
import { NumCell, Pending, TableCaption } from "@/components/content/Table"
import { ossRepos, repoPath } from "@/data/oss"
import { github, npm } from "@/lib/live"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Open source",
  description: "Packages and repos I've built and open-sourced, with stars and downloads.",
}

const head = "py-1.5 font-normal"

// A date in a figures column: mono, right-aligned, blank until fetched (as NumCell).
function DateCell({ value, last }: { value: string | undefined; last?: boolean }) {
  return (
    <td className={`num py-1.5 text-right align-baseline whitespace-nowrap ${last ? "" : "pr-4"}`}>
      {value ?? <span className="sr-only">Not fetched yet</span>}
    </td>
  )
}

export default function OssPage() {
  const packages = npm?.packages ?? []
  return (
    <article className="max-w-measure">
      <PageHeader label="§3" title="Open source" />
      <p>
        Tools, templates and experiments I've built and open-sourced.
      </p>
      {!github && <Pending>run <code>pnpm data</code> for stars and descriptions</Pending>}

      <section aria-labelledby="table-2" className="my-6">
        <TableCaption n="2" />
        <table className="mt-2 w-full border-collapse border-y border-ink text-[0.9375rem]">
          <thead className="border-b border-rule">
            <tr className="label text-left">
              <th scope="col" className={`${head} pr-4`}>Repo</th>
              <th scope="col" className={`${head} pr-4 text-right`}>Stars</th>
              <th scope="col" className={`${head} pr-4 text-right`}>Commits</th>
              <th scope="col" className={`${head} text-right`}>Last commit</th>
            </tr>
          </thead>
          <tbody>
            {ossRepos.map((repo) => {
              const full = repoPath(repo)
              const stats = github?.repos[full]
              return (
                <tr key={repo} className="border-t border-rule first:border-t-0">
                  <th scope="row" className="py-1.5 pr-4 text-left align-baseline font-normal">
                    <a href={stats?.url ?? `https://github.com/${full}`} className="break-all">{repo}</a>
                  </th>
                  <NumCell value={stats?.stars} />
                  <NumCell value={stats?.commits} />
                  <DateCell value={stats?.lastCommit && formatDate(stats.lastCommit)} last />
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      {packages.length > 0 && (
        <section aria-labelledby="table-3" className="my-6">
          <TableCaption n="3">jsDelivr is the CDN, which serves the same packages to browsers.</TableCaption>
          <table className="mt-2 w-full border-collapse border-y border-ink text-[0.9375rem]">
            <thead className="border-b border-rule">
              <tr className="label text-left">
                <th scope="col" className={`${head} pr-4`}>Package</th>
                <th scope="col" className={`${head} pr-4 text-right`}>30 days</th>
                <th scope="col" className={`${head} pr-4 text-right`}>All time</th>
                <th scope="col" className={`${head} text-right`}>jsDelivr</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((p) => (
                <tr key={p.name} className="border-t border-rule first:border-t-0">
                  <th scope="row" className="py-1.5 pr-4 text-left align-baseline font-normal">
                    <a href={`https://www.npmjs.com/package/${p.name}`} className="break-all">{p.name}</a>
                  </th>
                  <NumCell value={p.downloadsLastMonth} />
                  <NumCell value={p.downloadsTotal} />
                  <NumCell value={p.jsdelivrHitsLastMonth} last />
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </article>
  )
}
