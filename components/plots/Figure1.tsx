import { ContributionCalendar } from "./ContributionCalendar"
import { Plot } from "./Plot"
import { contributionsPerWeek } from "@/lib/figures"
import type { LiveData } from "@/lib/live"
import { exhibit } from "@/lib/exhibits"
import { FigureCaption } from "@/components/content/Table"

/** Figure 1: my contributions per day over the last year, as GitHub's calendar lays them out, and on
 *  /stats (`weekly`) per week since the first one, pluckable: the one live element
 *  (`.claude/docs/design.md`). */
export function Figure1({ live, weekly = false }: { live: LiveData; weekly?: boolean }) {
  const series = weekly ? contributionsPerWeek(live) : null
  const days = live.github?.contributionsPerDay ?? []
  if (!series && days.length === 0) return null
  const both = series && days.length > 0
  return (
    <figure id={weekly ? undefined : exhibit("Figure", "1").id} className="scroll-mt-6">
      {both && <p className="label num" aria-hidden>(a)</p>}
      {series && <Plot {...series} kind="line" pluck yLabel="Contributions" title="Line plot of my GitHub contributions per week, by year" />}
      {both && <p className="label num mt-4" aria-hidden>(b)</p>}
      {days.length > 0 && <ContributionCalendar days={days} title="Calendar of my GitHub contributions per day over the last year" />}
      <FigureCaption n="1">
        {both
          ? " (a) Per week, since my first one. (b) Per day over the last year, laid out like the calendar on my GitHub profile."
          : series
            ? " Per week, since my first one."
            : " Per day over the last year, laid out like the calendar on my GitHub profile."}
      </FigureCaption>
    </figure>
  )
}
