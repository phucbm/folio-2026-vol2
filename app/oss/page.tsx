import type { Metadata } from "next"
import { Fragment } from "react"
import { PageHeader } from "@/components/content/PageHeader"
import { NumCell, Pending, TableCaption } from "@/components/content/Table"
import { ossGroups, repoPath } from "@/data/oss"
import { github, npm } from "@/lib/live"

export const metadata: Metadata = {
  title: "Open source",
  description: "Packages and repos I've built and open-sourced, with stars and downloads.",
}

const head = "py-1.5 font-normal"

export default function OssPage() {
  const packages = npm?.packages ?? []
  const npmByRepo = new Map(packages.filter((p) => p.repo).map((p) => [p.repo!, p]))
  return (
    <article className="max-w-measure">
      <PageHeader label="§4" title="Open source" />
      <p>
        Tools, templates and experiments I've built and open-sourced. The UI components have their own registry
        at <a href="https://ui.phucbm.com">ui.phucbm.com</a>.
      </p>
      {!github && <Pending>run <code>pnpm data</code> for stars and descriptions</Pending>}

      <section aria-labelledby="table-2" className="my-6">
        <TableCaption id="table-2" n={2}>The repos, by group, with GitHub stars and npm downloads in the last 30 days.</TableCaption>
        <table className="mt-2 w-full border-collapse border-y border-ink text-[0.9375rem]">
          <thead className="border-b border-rule">
            <tr className="label text-left">
              <th scope="col" className={`${head} pr-4`}>Repo</th>
              <th scope="col" className={`${head} pr-4 text-right`}>Stars</th>
              <th scope="col" className={`${head} text-right`}>Downloads</th>
            </tr>
          </thead>
          <tbody>
            {ossGroups.map((group) => (
              <Fragment key={group.title}>
                <tr>
                  <th scope="rowgroup" colSpan={3} className="label pt-4 pb-1 text-left font-semibold text-ink">
                    {group.title}
                  </th>
                </tr>
                {group.repos.map(({ repo }) => {
                  const full = repoPath(repo)
                  const stats = github?.repos[full]
                  return (
                    <tr key={repo} className="border-t border-rule">
                      <th scope="row" className="py-1.5 pr-4 text-left align-baseline font-normal">
                        <a href={stats?.url ?? `https://github.com/${full}`}>{repo}</a>
                        {stats?.description && <span className="block text-ink-muted">{stats.description}</span>}
                      </th>
                      <NumCell value={stats?.stars} />
                      <NumCell value={npmByRepo.get(full.toLowerCase())?.downloadsLastMonth} last />
                    </tr>
                  )
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </section>

      {packages.length > 0 && (
        <section aria-labelledby="table-3" className="my-6">
          <TableCaption id="table-3" n={3}>
            Every package I publish on npm, by downloads in the last 30 days. jsDelivr is the CDN, which serves
            the same packages to browsers.
          </TableCaption>
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
