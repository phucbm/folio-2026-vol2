import type { Metadata } from "next"
import { Fragment } from "react"
import { PageHeader } from "@/components/content/PageHeader"
import { NumCell, Pending, TableCaption } from "@/components/content/Table"
import { ossGroups, ossStats, repoPath } from "@/data/oss"

export const metadata: Metadata = {
  title: "Open source",
  description: "Packages and repos I've built and open-sourced, with stars and downloads.",
}

const measured = Object.keys(ossStats).length > 0

export default function OssPage() {
  return (
    <article className="max-w-measure">
      <PageHeader label="§4" title="Open source" />
      <p>
        Tools, templates and experiments I've built and open-sourced. The UI components have their own registry
        at <a href="https://ui.phucbm.com">ui.phucbm.com</a>.
      </p>
      {!measured && <Pending>stars, downloads and descriptions come from GitHub and npm in part 6</Pending>}

      <section aria-labelledby="table-2" className="my-6">
        <TableCaption id="table-2" n={2}>The repos, by group, with GitHub stars and npm downloads per month.</TableCaption>
        <table className="mt-2 w-full border-collapse border-y border-ink text-[0.9375rem]">
          <thead className="border-b border-rule">
            <tr className="label text-left">
              <th scope="col" className="py-1.5 pr-4 font-normal">Repo</th>
              <th scope="col" className="py-1.5 pr-4 text-right font-normal">Stars</th>
              <th scope="col" className="py-1.5 text-right font-normal">Downloads/mo</th>
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
                  const stats = ossStats[repo]
                  return (
                    <tr key={repo} className="border-t border-rule">
                      <th scope="row" className="py-1.5 pr-4 text-left align-baseline font-normal">
                        <a href={`https://github.com/${repoPath(repo)}`}>{repo}</a>
                        {stats?.description && <span className="block text-ink-muted">{stats.description}</span>}
                      </th>
                      <NumCell value={stats?.stars} />
                      <NumCell value={stats?.downloadsPerMonth} last />
                    </tr>
                  )
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </section>
    </article>
  )
}
