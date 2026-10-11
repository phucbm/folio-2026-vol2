import type { Metadata } from "next"
import { shareMetadata } from "@/lib/og"
import { PageHeader } from "@/components/content/PageHeader"
import { errata } from "@/data/errata"
import { formatDate } from "@/lib/utils"

const title = "Errata"
const description = "What changed on this site, version by version."

export const metadata: Metadata = { title, description, ...shareMetadata("/errata", { title, description }) }

// The changelog, as a paper's errata: version, date, what changed. Newest first.
export default function ErrataPage() {
  return (
    <article className="max-w-measure">
      <PageHeader label="§C" title="Errata" />
      <p>What changed on this site, version by version. The version is in the running head.</p>
      <ol className="mt-8 border-t border-rule">
        {errata.map((entry) => (
          <li key={entry.version} className="grid grid-cols-[4.5rem_1fr] gap-x-4 border-b border-rule py-3">
            <span className="num pt-0.5">v{entry.version}</span>
            <div>
              <p className="label num">{formatDate(entry.date)}</p>
              <ul className="mt-1">
                {entry.changes.map((change) => <li key={change}>{change}</li>)}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </article>
  )
}
