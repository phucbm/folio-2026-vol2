import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { notesAll } from "@/content/notes/index"
import { noteLabel } from "@/lib/content/catalog"
import { displayDate } from "@/lib/content/collections"
import { PageHeader } from "@/components/content/PageHeader"
import { formatDate } from "@/lib/utils"

export const dynamicParams = false

export function generateStaticParams() {
  return notesAll.map((note) => ({ slug: note.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const note = notesAll.find((n) => n.slug === slug)
  if (!note) return {}
  return {
    title: note.seoTitle ?? note.title,
    description: note.excerpt,
    ...(note.status === "unlisted" ? { robots: { index: false } } : {}),
  }
}

// A first pass: part 5 designs the entry page (sidenotes, citations, related notes).
export default async function NotePage({ params }: Props) {
  const { slug } = await params
  const note = notesAll.find((n) => n.slug === slug)
  if (!note) notFound()
  const { default: Body } = await import(`@/content/notes/${slug}.mdx`)
  const date = displayDate(note)!
  return (
    <article className="max-w-measure">
      <PageHeader
        label={noteLabel(note.number)}
        title={note.title}
        meta={
          <>
            {note.updated ? "Updated " : ""}
            <span className="num">{formatDate(date)}</span>
            {note.tags.length > 0 && <> · {note.tags.join(", ")}</>}
          </>
        }
      />
      <Body />
    </article>
  )
}
