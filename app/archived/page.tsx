import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/content/PageHeader"
import { archived } from "@/content/archived/index"
import { figureLabel } from "@/lib/content/catalog"

export const metadata: Metadata = {
  title: "Archived",
  description: "ViiVue work, 2017 to 2025: one figure per project, with the year, the stack and what I learned.",
}

// Figures, not a list: the plate, then its caption below it, as in a paper (.claude/docs/design.md).
export default function ArchivedPage() {
  return (
    <article>
      <div className="max-w-measure">
        <PageHeader label="§2" title="Archived" />
        <p>
          Work I did at ViiVue from 2017 to 2025, first as a developer and later as the front-end lead. One figure
          per project: what it was, the stack, and what I learned. Not case studies.
        </p>
      </div>
      <ol className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2">
        {archived.map((project) => (
          <li key={project.slug}>
            <figure>
              <Link href={`/archived/${project.slug}`} className="block no-underline">
                {project.featureImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.featureImage}
                    alt=""
                    loading="lazy"
                    className="mb-3 block aspect-[16/10] w-full border border-rule object-cover object-top"
                  />
                )}
              </Link>
              <figcaption>
                <span className="num font-semibold">{figureLabel(project.figure)}.</span>{" "}
                <Link href={`/archived/${project.slug}`}>{project.title}</Link>
                {(project.year || project.role) && (
                  <span className="label mt-1 block">
                    {[
                      project.year && <span key="year" className="num">{project.year}</span>,
                      project.role,
                    ].filter(Boolean).reduce<ReactNode[]>((parts, part, i) => (i ? [...parts, " · ", part] : [part]), [])}
                  </span>
                )}
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>
    </article>
  )
}
