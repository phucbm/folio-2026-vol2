import type { ReactNode } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { archivedAll } from "@/content/archived/index"
import { figureLabel } from "@/lib/content/catalog"
import { PageHeader } from "@/components/content/PageHeader"

export const dynamicParams = false

export function generateStaticParams() {
  return archivedAll.map((project) => ({ slug: project.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = archivedAll.find((p) => p.slug === slug)
  if (!project) return {}
  return {
    title: project.seoTitle ?? project.title,
    description: project.excerpt,
    ...(project.status === "unlisted" ? { robots: { index: false } } : {}),
  }
}

// A figure's page: the plate, a small table of facts, then 2 or 3 paragraphs. Not a case study.
export default async function ArchivedProjectPage({ params }: Props) {
  const { slug } = await params
  const project = archivedAll.find((p) => p.slug === slug)
  if (!project) notFound()
  const { default: Body } = await import(`@/content/archived/${slug}.mdx`)
  const facts: [string, ReactNode][] = [
    ...(project.year ? [["Year", <span key="year" className="num">{project.year}</span>] as [string, ReactNode]] : []),
    ...(project.client ? [["Client", project.client] as [string, string]] : []),
    ...(project.role ? [["Role", project.role] as [string, string]] : []),
    ...(project.stack?.length ? [["Stack", project.stack.join(", ")] as [string, string]] : []),
    ...(project.url ? [["Site", <a key="url" href={project.url}>{new URL(project.url).hostname.replace(/^www\./, "")}</a>] as [string, ReactNode]] : []),
  ]
  return (
    <article>
      <div className="max-w-measure">
        <PageHeader label={figureLabel(project.figure)} title={project.title} meta={project.excerpt} />
      </div>
      {project.featureImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.featureImage} alt={`${project.title}, the home page`} className="mb-10 block w-full border border-rule" />
      )}
      <div className="max-w-measure">
        {facts.length > 0 && <table className="w-full border-collapse border-y border-ink text-[0.9375rem]">
          <tbody>
            {facts.map(([name, value]) => (
              <tr key={name} className="border-b border-rule last:border-b-0">
                <th scope="row" className="label w-24 py-1.5 pr-4 text-left align-baseline font-normal">{name}</th>
                <td className="py-1.5 align-baseline">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>}
        <div className="mt-10">
          <Body />
        </div>
      </div>
    </article>
  )
}
