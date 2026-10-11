import { ContributionCalendar } from "./ContributionCalendar"
import { Plot } from "./Plot"
import { contributionsPerWeek } from "@/lib/figures"
import { github } from "@/lib/live"

/** Figure 0: my contributions per day over the last year, as GitHub's calendar lays them out, and on
 *  /stats (`weekly`) per week since the first one, pluckable: the one live element
 *  (`.claude/docs/design.md`). */
export function Figure0({ weekly = false }: { weekly?: boolean }) {
  const series = weekly ? contributionsPerWeek() : null
  const days = github?.contributionsPerDay ?? []
  if (!series && days.length === 0) return null
  const both = series && days.length > 0
  return (
    <figure>
      {both && <p className="label num" aria-hidden>(a)</p>}
      {series && <Plot {...series} kind="line" pluck yLabel="Contributions" title="Line plot of my GitHub contributions per week, by year" />}
      {both && <p className="label num mt-4" aria-hidden>(b)</p>}
      {days.length > 0 && <ContributionCalendar days={days} title="Calendar of my GitHub contributions per day over the last year" />}
      <figcaption className="label mt-2">
        <span className="font-semibold text-ink">Figure 0.</span> My GitHub contributions: commits, pull requests,
        issues and reviews, private repos included.
        {both
          ? " (a) Per week, since my first one. (b) Per day over the last year, laid out like the calendar on my GitHub profile."
          : series
            ? " Per week, since my first one."
            : " Per day over the last year, laid out like the calendar on my GitHub profile."}
      </figcaption>
    </figure>
  )
}
