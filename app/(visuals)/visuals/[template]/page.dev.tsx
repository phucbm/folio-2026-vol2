import type { Metadata } from "next"
import { templates } from "@/components/visuals/templates"

// One composed visual at its output size: /visuals/<template>?w=1600&h=900&p=<base64url JSON props>.
// `.dev.tsx`: only `next dev` builds it (`pageExtensions` in next.config.ts), never production.
// The runner (scripts/visuals/cli.mjs) screenshots the viewport once nothing is `[data-visual-pending]`;
// `[data-visual-error]` stops it with the message. The root is fixed over the site's running head
// and colophon, which the root layout still renders underneath.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function VisualPage({ params, searchParams }: {
  params: Promise<{ template: string }>
  searchParams: Promise<{ w?: string; h?: string; p?: string }>
}) {
  const { template } = await params
  const { w, h, p } = await searchParams
  const Template = templates[template]
  if (!Template) return <p data-visual-error="">Unknown template &quot;{template}&quot;. Known: {Object.keys(templates).join(", ")}</p>

  let props: Record<string, unknown>
  try {
    props = p ? JSON.parse(Buffer.from(p, "base64url").toString("utf8")) : {}
  } catch {
    return <p data-visual-error="">Props are not base64url JSON</p>
  }
  const width = Number(w ?? 1600), height = Number(h ?? 900)

  return (
    <div data-visual-root="" className="fixed left-0 top-0 z-[9999] overflow-hidden bg-paper" style={{ width, height }}>
      <Template {...props} width={width} height={height} />
      {/* The dev-tools badge would land in the screenshot. */}
      <style>{"nextjs-portal{display:none}"}</style>
    </div>
  )
}
