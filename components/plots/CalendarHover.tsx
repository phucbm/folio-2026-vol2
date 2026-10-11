"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { FINE_POINTER } from "@/lib/media"

// The calendar's hover (`ContributionCalendar`): the day under the cursor gets an ink outline and the
// readout line below says its count and date; leaving the grid puts the readout back to the total.
// One listener for the whole grid, reading each square's `data-d` (date label) and `data-c` (count),
// and the squares are touched in the DOM, not re-rendered. Behind `FINE_POINTER`; touch gets the total.

const plural = (n: number) => (n === 1 ? "contribution" : "contributions")

export function CalendarHover({ total, children }: { total: number; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const words = useRef<HTMLSpanElement>(null)
  const date = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = root.current
    const [c, w, d] = [count.current, words.current, date.current]
    if (!el || !c || !w || !d || !window.matchMedia(FINE_POINTER).matches) return
    const say = (n: number, rest: string, day: string) => {
      c.textContent = n.toLocaleString("en-US")
      w.textContent = ` ${plural(n)} ${rest}`
      d.textContent = day
    }
    let current: SVGRectElement | null = null

    const show = (rect: SVGRectElement | null) => {
      if (rect === current) return
      current?.classList.remove("stroke-ink")
      current = rect
      if (!rect) return say(total, "in the last year", "")
      rect.classList.add("stroke-ink")
      say(Number(rect.dataset.c), "on ", rect.dataset.d ?? "")
    }
    // The gaps between squares keep the last day, so the readout doesn't flicker on the way across.
    const over = (e: PointerEvent) => {
      const rect = (e.target as Element).closest<SVGRectElement>("rect[data-d]")
      if (rect) show(rect)
    }
    const leave = () => show(null)

    el.addEventListener("pointerover", over)
    el.addEventListener("pointerleave", leave)
    return () => {
      el.removeEventListener("pointerover", over)
      el.removeEventListener("pointerleave", leave)
    }
  }, [total])

  return (
    <div>
      <div ref={root}>{children}</div>
      <p className="label mt-1" aria-hidden>
        <span ref={count} className="num">{total.toLocaleString("en-US")}</span>
        <span ref={words}> {plural(total)} in the last year</span>
        <span ref={date} className="num" />
      </p>
    </div>
  )
}
