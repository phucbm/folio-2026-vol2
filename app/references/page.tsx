import type { Metadata } from "next"
import { PageHeader } from "@/components/content/PageHeader"
import { Pending } from "@/components/content/Table"
import { references } from "@/lib/live"
import { contactLinks } from "@/lib/site"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "References",
  description: "Links I've saved: articles, tools and demos, as a list of references.",
}

const discord = contactLinks.find((link) => link.label === "Discord")

// References in citation format: number, title, source, the day I saved it and its tags. Newest first.
export default function ReferencesPage() {
  return (
    <article className="max-w-measure">
      <PageHeader label="§6" title="References" />
      <p>
        Links I've saved: articles, tools and demos I keep coming back to. I bookmark them into a channel on my
        Discord server, and this list comes from there.
        {discord && <> <a href={discord.href}>Join the server</a> to see new ones as I add them.</>}
      </p>
      {references.length === 0 ? (
        <Pending>run <code>pnpm data</code> for the links</Pending>
      ) : (
        <ol className="mt-8 border-t border-rule">
          {references.map((ref, i) => (
            <li key={ref.url} className="grid grid-cols-[2.75rem_1fr] gap-x-3 border-b border-rule py-3">
              <span className="num pt-0.5 text-ink-muted">[{references.length - i}]</span>
              <div>
                <p>
                  <a href={ref.url}>{ref.title}</a>. {ref.source}.
                </p>
                <p className="label mt-1">
                  Saved <span className="num">{formatDate(ref.saved)}</span>
                  {ref.tags.length > 0 && <> · {ref.tags.join(", ")}</>}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </article>
  )
}
