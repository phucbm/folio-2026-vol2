// Axis maths for the plots, matplotlib's way: "nice" tick steps (1, 2, 2.5, 5 × 10ⁿ) and a 5% margin
// inside the axes on both ends (`axes.xmargin`, `axes.ymargin`).

export function niceTicks(max: number, target = 5): number[] {
  if (max <= 0) return [0]
  const raw = max / target
  const pow = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? 10 * pow
  const ticks: number[] = []
  for (let v = 0; v <= max + step * 1e-9; v += step) ticks.push(Number(v.toPrecision(12)))
  return ticks
}

export const MARGIN = 0.05

/** Maps `[d0, d1]` onto `[r0, r1]`, leaving matplotlib's margin inside the range. */
export function linear(d0: number, d1: number, r0: number, r1: number, margin = MARGIN) {
  const pad = (d1 - d0 || 1) * margin
  const a = d0 - pad
  const b = d1 + pad
  return (v: number) => r0 + ((v - a) / (b - a)) * (r1 - r0)
}

/** 1200 → "1,200"; 12500 → "12.5k" on tick labels only, where room is short. */
export function tickLabel(v: number): string {
  return v >= 10000 ? `${(v / 1000).toLocaleString("en-US")}k` : v.toLocaleString("en-US")
}
