import type { Metadata } from "next"
import Body, { meta as rawMeta } from "@/content/pages/colophon.mdx"
import { PageHeader } from "@/components/content/PageHeader"
import { formatDate } from "@/lib/utils"

const meta = rawMeta as { title: string; description: string; updated?: string }

export const metadata: Metadata = { title: meta.title, description: meta.description }

export default function Page() {
  return (
    <article className="max-w-measure">
      <PageHeader
        label={undefined}
        title={meta.title}
        meta={meta.updated ? <>Updated <span className="num">{formatDate(meta.updated)}</span></> : undefined}
      />
      <Body />
    </article>
  )
}
