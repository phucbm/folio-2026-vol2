import type { Metadata } from "next"
import { PageHeader } from "@/components/content/PageHeader"
import { Pending } from "@/components/content/Table"

export const metadata: Metadata = {
  title: "Stats",
  description: "The charts behind Table 1: commits per week, books per year, package downloads.",
}

// The charts behind Table 1 on the home page. All of them come with the data pipeline (part 6).
export default function StatsPage() {
  return (
    <article className="max-w-measure">
      <PageHeader title="Stats" />
      <p>The charts behind Table 1 on the home page, rebuilt from the sources on every deploy.</p>
      <section aria-labelledby="commits" className="mt-14">
        <h2 id="commits" className="text-2xl">Commits</h2>
        <Pending>commits per week, from GitHub, in part 6 (also Figure 0 on the home page)</Pending>
      </section>
      <section aria-labelledby="books" className="mt-14">
        <h2 id="books" className="text-2xl">Books</h2>
        <Pending>books per year, from Goodreads, in part 6</Pending>
      </section>
      <section aria-labelledby="downloads" className="mt-14">
        <h2 id="downloads" className="text-2xl">Downloads</h2>
        <Pending>npm and jsDelivr downloads per month, in part 6</Pending>
      </section>
    </article>
  )
}
