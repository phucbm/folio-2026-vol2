import type { Metadata } from "next"
import { PageHeader } from "@/components/content/PageHeader"
import { projects } from "@/data/projects"
import { formatMonth } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Projects",
  description: "Every project, one line each, newest first: Perxel, freelance and ViiVue.",
}

// One list by date, like /notes: alias, title and line, then the month and where I did it.
export default function ProjectsPage() {
  return (
    <article className="max-w-measure">
      <PageHeader label="§2" title="Projects" />
      <ol className="border-t border-rule">
        {projects.map((project) => (
          <li key={project.slug} className="grid grid-cols-[4.5rem_1fr] gap-x-4 border-b border-rule py-3 sm:grid-cols-[4.5rem_1fr_auto]">
            <span className="num pt-0.5 text-ink-muted">{project.label}</span>
            <div>
              {project.href ? <a href={project.href}>{project.title}</a> : project.title}
              {project.role && <span className="label ml-2">{project.role}</span>}
              {project.line && <p className="mt-0.5 text-ink-muted">{project.line}</p>}
            </div>
            <p className="label col-start-2 pt-0.5 sm:col-start-auto sm:text-right">
              {project.date && <span className="num">{formatMonth(project.date)}</span>}
              {project.date && " · "}
              {project.at}
            </p>
          </li>
        ))}
      </ol>
    </article>
  )
}
