import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { notesAll } from "@/content/notes/index"
import { catalogByKind } from "@/lib/content/site-catalog"
import { displayDate } from "@/lib/content/collections"
import { PageHeader } from "@/components/content/PageHeader"
import { formatDate } from "@/lib/utils"
import { site } from "@/lib/site"
import { shareMetadata } from "@/lib/og"
import { alternates, noteJsonLd } from "@/lib/seo"
import { JsonLd } from "@/components/content/JsonLd"
import { NoteSkill } from "@/components/content/NoteSkill"
import { skillRef } from "@/lib/skills"

export const dynamicParams = false

export function generateStaticParams() {
  return notesAll.map((note) => ({ slug: note.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const note = notesAll.find((n) => n.slug === slug)
  if (!note) return {}
  const title = note.seoTitle ?? note.title
  const path = `/notes/${slug}`
  const share = shareMetadata(path, { title, description: note.excerpt })
  return {
    title,
    description: note.excerpt,
    alternates: alternates(path),
    ...share,
    openGraph: {
      ...share.openGraph,
      type: "article",
      publishedTime: note.date,
      ...(note.updated ? { modifiedTime: note.updated } : {}),
      authors: [site.url],
      tags: note.tags,
    },
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
  // Only listed notes are numbered: a draft or unlisted note has no place in the order.
  const label = catalogByKind("note").find((item) => item.slug === slug)?.label
  return (
    <article className="max-w-measure">
      <PageHeader
        label={label}
        title={note.title}
        meta={
          <>
            {note.updated ? "Updated " : ""}
            <span className="num">{formatDate(date)}</span>
            {note.tags.length > 0 && <> · {note.tags.join(", ")}</>}
          </>
        }
      />
      {note.skill && <NoteSkill skill={skillRef(note.skill)} />}
      <Body />
      <JsonLd
        data={noteJsonLd({ url: `/notes/${slug}`, title: note.title, excerpt: note.excerpt, date: note.date, dateModified: note.updated ?? note.date, tags: note.tags })}
      />
    </article>
  )
}
