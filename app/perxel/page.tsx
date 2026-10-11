import type { Metadata } from "next"
import { PageHeader } from "@/components/content/PageHeader"
import { perxelWorks } from "@/data/perxel"

export const metadata: Metadata = {
  title: "Perxel",
  description: "Client work at Perxel, my web studio. One line each; the case studies are on perxel.com.",
}

export default function PerxelPage() {
  return (
    <article className="max-w-measure">
      <PageHeader label="§3" title="Perxel" />
      <p>
        Client work at <a href="https://perxel.com/en">Perxel</a>, my web studio. One line each here; the full case
        studies are on perxel.com.
      </p>
      <ul className="mt-8 border-t border-rule">
        {perxelWorks.map((work) => (
          <li key={work.slug} className="border-b border-rule py-4">
            <a href={work.href} className="font-medium">{work.title}</a>
            <p className="mt-1 text-ink-muted">{work.line}</p>
          </li>
        ))}
      </ul>
    </article>
  )
}
