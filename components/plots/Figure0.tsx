import { Plot } from "./Plot"
import { contributionsPerWeek } from "@/lib/figures"

/** Figure 0, the one live element (`.claude/docs/design.md`): my contributions per week, pluckable. */
export function Figure0() {
  const series = contributionsPerWeek()
  if (!series) return null
  return (
    <figure>
      <Plot {...series} kind="line" pluck yLabel="Contributions" title="Line plot of my GitHub contributions per week, by year" />
      <figcaption className="label mt-2">
        <span className="font-semibold text-ink">Figure 0.</span> My GitHub contributions per week: commits, pull
        requests, issues and reviews, private repos included.
      </figcaption>
    </figure>
  )
}
