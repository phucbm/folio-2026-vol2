import type { Metadata } from "next"
import { shareMetadata } from "@/lib/og"
import { PageHeader } from "@/components/content/PageHeader"
import { projects } from "@/data/projects"
import { A } from "@/components/content/A"

const title = "Projects"
const description = "Every project, one line each, newest first: Perxel, freelance and ViiVue."

export const metadata: Metadata = { title, description, ...shareMetadata("/projects", { title, description }) }

// One list by date, like /notes: alias, title and line, then where I did it. The date orders the
// list and numbers it; it is not shown.
export default function ProjectsPage() {
  return (
    <article className="max-w-measure">
      <PageHeader label="§2" title="Projects" />
      <ol className="border-t border-rule">
        {projects.map((project) => (
          <li key={project.slug} className="grid grid-cols-[4.5rem_1fr] gap-x-4 border-b border-rule py-3 sm:grid-cols-[4.5rem_1fr_auto]">
            <span className="num pt-0.5 text-ink-muted">{project.label}</span>
            <div>
              {project.href ? <A href={project.href}>{project.title}</A> : project.title}
              {project.role && <span className="label ml-2">{project.role}</span>}
              {project.line && <p className="mt-0.5 text-ink-muted">{project.line}</p>}
            </div>
            <p className="label col-start-2 pt-0.5 sm:col-start-auto sm:text-right">
              {project.at}
            </p>
          </li>
        ))}
      </ol>
    </article>
  )
}
