import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import Link from "next/link"
import { PageHeader } from "@/components/content/PageHeader"
import { catalogByKind } from "@/lib/content/site-catalog"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = pageMetadata("/notes")

export default function NotesPage() {
  const notes = catalogByKind("note")
  return (
    <article className="max-w-measure">
      <PageHeader label="§1" title="Notes" />
      <ol className="border-t border-rule">
        {notes.map((note) => (
          <li key={note.slug} className="grid grid-cols-[4.5rem_1fr] gap-x-4 border-b border-rule py-3 sm:grid-cols-[4.5rem_1fr_auto]">
            <span className="num pt-0.5 text-ink-muted">{note.label}</span>
            <Link href={note.url}>{note.title}</Link>
            {note.date && <span className="num col-start-2 pt-0.5 text-ink-muted sm:col-start-auto">{formatDate(note.date)}</span>}
          </li>
        ))}
      </ol>
    </article>
  )
}
