import { linear, niceTicks, tickLabel } from "./scale"
import { PluckLine } from "./PluckLine"

// A plot drawn the way matplotlib draws one with its defaults: a box of four 0.8px spines, ticks
// pointing out, a C0 line or bars, no grid, the figures in mono. Rendered on the server as SVG, at
// two sizes (phone and up) so the tick labels stay readable; CSS shows one. `pluck` hands the line
// to `PluckLine`, which lets the cursor pluck it (Figure 1). Bars can carry their value on top
// (`labels`), and `partialLast` draws the last bar as an outline: a period not over yet.

export interface PlotProps {
  values: number[]
  kind?: "line" | "bar"
  // Ticks on the x axis, by index into `values`.
  xTicks: { at: number; label: string }[]
  yLabel?: string
  pluck?: boolean
  labels?: boolean
  partialLast?: boolean
  // What the plot shows, for screen readers (the caption says it again below the figure).
  title: string
}

const SIZES = [
  { w: 360, h: 230, className: "sm:hidden", every: 2 },
  { w: 640, h: 300, className: "max-sm:hidden", every: 1 },
]

export function Plot(props: PlotProps) {
  return (
    <div role="img" aria-label={props.title}>
      {SIZES.map((size) => (
        <PlotSvg key={size.w} {...props} {...size} />
      ))}
    </div>
  )
}

function PlotSvg({ values, kind = "line", xTicks, yLabel, pluck, labels, partialLast, w, h, className, every }: PlotProps & { w: number; h: number; className: string; every: number }) {
  // Room for the tick labels: left for the y axis (and its label), bottom for the x axis.
  const left = yLabel ? 52 : 40
  const box = { x0: left, x1: w - 8, y0: 8, y1: h - 24 }
  const max = Math.max(...values, 0)
  const yTicks = niceTicks(max, 4)
  const yTop = Math.max(max, yTicks.at(-1) ?? 0)
  const n = values.length

  // Bars stand on the axis (matplotlib's sticky edges); a line gets the margin at both ends.
  const x = kind === "bar" ? linear(-0.5, n - 0.5, box.x0, box.x1, 0) : linear(0, n - 1, box.x0, box.x1)
  const y = kind === "bar" ? linear(0, yTop * (labels ? 1.12 : 1.05), box.y1, box.y0, 0) : linear(0, max, box.y1, box.y0)
  const points = values.map((v, i) => [x(i), y(v)] as [number, number])
  const barW = ((box.x1 - box.x0) / n) * 0.8

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`block w-full overflow-visible ${className}`} aria-hidden>
      <g className="fill-ink font-mono" fontSize={10}>
        {yTicks.filter((t) => y(t) >= box.y0 - 0.5).map((t) => (
          <g key={t}>
            <line x1={box.x0 - 3.5} x2={box.x0} y1={y(t)} y2={y(t)} className="stroke-ink" strokeWidth={0.8} />
            <text x={box.x0 - 6} y={y(t)} textAnchor="end" dominantBaseline="middle">{tickLabel(t)}</text>
          </g>
        ))}
        {xTicks.filter((_, i) => i % every === 0).map((t) => (
          <g key={t.at}>
            <line x1={x(t.at)} x2={x(t.at)} y1={box.y1} y2={box.y1 + 3.5} className="stroke-ink" strokeWidth={0.8} />
            <text x={x(t.at)} y={box.y1 + 15} textAnchor="middle">{t.label}</text>
          </g>
        ))}
        {yLabel && (
          <text transform={`translate(12 ${(box.y0 + box.y1) / 2}) rotate(-90)`} textAnchor="middle" className="font-sans" fontSize={11}>
            {yLabel}
          </text>
        )}
      </g>

      {kind === "bar"
        ? points.map(([px, py], i) => {
            const partial = partialLast && i === n - 1
            return (
              <g key={i}>
                {partial
                  ? <rect x={px - barW / 2 + 0.6} y={py + 0.6} width={barW - 1.2} height={Math.max(box.y1 - py - 0.6, 0)} fill="none" className="stroke-plot" strokeWidth={1.2} />
                  : <rect x={px - barW / 2} y={py} width={barW} height={box.y1 - py} className="fill-plot" />}
                {labels && (
                  <text x={px} y={py - 4} textAnchor="middle" className="fill-ink font-mono" fontSize={10}>
                    {values[i].toLocaleString("en-US")}
                  </text>
                )}
              </g>
            )
          })
        : pluck
          ? <PluckLine points={points} box={box} />
          : <path d={toPath(points)} className="stroke-plot" fill="none" strokeWidth={1.5} strokeLinejoin="round" />}

      <rect x={box.x0} y={box.y0} width={box.x1 - box.x0} height={box.y1 - box.y0} fill="none" className="stroke-ink" strokeWidth={0.8} />
    </svg>
  )
}

export function toPath(points: [number, number][]): string {
  return points.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join("")
}
