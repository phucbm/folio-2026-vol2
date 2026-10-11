import { CalendarHover } from "./CalendarHover"
import { formatDate } from "@/lib/utils"

// The calendar on a GitHub profile, drawn the paper's way: a column per week (Sunday on top), a
// square per day, four shades of C0 for how much happened that day and a pale square for nothing.
// Square corners, no boxes. Rendered on the server as SVG at two sizes, like `Plot`. On the larger one
// (the one a mouse sees) each day is its own square carrying its date and count, for `CalendarHover`;
// the phone size draws one path per shade.

export interface CalendarDay {
  date: string
  count: number
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
// Level 0 is the rule colour, levels 1 to 4 shades of C0.
const FILL = ["fill-rule/60", "fill-plot/30", "fill-plot/50", "fill-plot/75", "fill-plot"]

const SIZES = [
  { w: 360, cell: 5.2, gap: 1, className: "sm:hidden", every: 2, squares: false },
  { w: 640, cell: 9.6, gap: 2, className: "max-sm:hidden", every: 1, squares: true },
]

// GitHub's levels: zero, then the non-zero days split in quarters by count.
function leveller(days: CalendarDay[]): (count: number) => number {
  const counts = days.map((d) => d.count).filter((c) => c > 0).sort((a, b) => a - b)
  const q = [0.25, 0.5, 0.75].map((p) => counts[Math.floor(p * (counts.length - 1))] ?? 0)
  return (count) => (count <= 0 ? 0 : count <= q[0] ? 1 : count <= q[1] ? 2 : count <= q[2] ? 3 : 4)
}

export function ContributionCalendar({ days, title }: { days: CalendarDay[]; title: string }) {
  if (days.length === 0) return null
  const total = days.reduce((n, d) => n + d.count, 0)
  return (
    <div role="img" aria-label={title}>
      <CalendarHover total={total}>
        {SIZES.map((size) => (
          <CalendarSvg key={size.w} days={days} {...size} />
        ))}
      </CalendarHover>
    </div>
  )
}

function CalendarSvg({ days, w, cell, gap, className, every, squares }: { days: CalendarDay[]; w: number; cell: number; gap: number; className: string; every: number; squares: boolean }) {
  const level = leveller(days)
  const step = cell + gap
  const left = 26
  const top = 14
  // The first day sits in its weekday's row; the columns follow from there.
  const offset = new Date(`${days[0].date}T00:00:00Z`).getUTCDay()
  const weeks = Math.ceil((offset + days.length) / 7)
  const h = top + 7 * step + 22

  // A month's label goes over the first column whose Sunday falls in it.
  const months: { x: number; label: string }[] = []
  days.forEach((d, i) => {
    if ((offset + i) % 7 !== 0 && i !== 0) return
    const month = Number(d.date.slice(5, 7)) - 1
    const prev = months.at(-1)
    if (prev?.label === MONTHS[month]) return
    months.push({ x: left + Math.floor((offset + i) / 7) * step, label: MONTHS[month] })
  })
  // The first label is dropped when the next one comes too close for both to fit.
  if (months.length > 1 && months[1].x - months[0].x < 3 * step) months.shift()

  // The legend sits under the last columns, "More" ending where the grid ends.
  const xOf = (i: number) => +(left + Math.floor((offset + i) / 7) * step).toFixed(1)
  const yOf = (i: number) => +(top + ((offset + i) % 7) * step).toFixed(1)
  const right = left + weeks * step - gap
  const legendX = right - 30 - 5 * step + gap

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`block w-full ${className}`} aria-hidden>
      <g className="fill-ink font-mono" fontSize={10}>
        {months.filter((_, i) => i % every === 0).map((m) => (
          <text key={m.x} x={m.x} y={top - 4}>{m.label}</text>
        ))}
        {[1, 3, 5].map((row) => (
          <text key={row} x={left - 4} y={top + row * step + cell / 2} textAnchor="end" dominantBaseline="middle">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][row]}
          </text>
        ))}
      </g>

      {squares
        ? days.map((d, i) => (
            <rect key={d.date} x={xOf(i)} y={yOf(i)} width={cell} height={cell} className={FILL[level(d.count)]} strokeWidth={1} data-d={formatDate(d.date)} data-c={d.count} />
          ))
        : // Without a hover to serve, one path per shade keeps the page light.
          FILL.map((fill, n) => (
            <path
              key={fill}
              className={fill}
              d={days.flatMap((d, i) => (level(d.count) === n ? [`M${xOf(i)} ${yOf(i)}h${cell}v${cell}h-${cell}z`] : [])).join("")}
            />
          ))}

      <g className="fill-ink font-sans" fontSize={10}>
        <text x={legendX - 4} y={top + 7 * step + 12} textAnchor="end" dominantBaseline="middle">Less</text>
        {[0, 1, 2, 3, 4].map((n) => (
          <rect
            key={n}
            x={legendX + n * step}
            y={top + 7 * step + 12 - cell / 2}
            width={cell}
            height={cell}
            className={FILL[n]}
          />
        ))}
        <text x={right} y={top + 7 * step + 12} textAnchor="end" dominantBaseline="middle">More</text>
      </g>
    </svg>
  )
}
