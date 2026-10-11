"use client"

import { useEffect, useRef } from "react"
import { FINE_POINTER, REDUCED_MOTION } from "@/lib/media"

// Figure 1's line, pluckable like a string (Perxel's `WaveLine`, the same 1D spring): the cursor
// crossing the line sends a wave along it, which settles back onto the data. The spring runs on its
// own grid of columns across the axes, so the wave travels at the same speed whatever the number of
// points; each point is pushed by the columns either side of it. Still under reduced motion and on
// touch: the server-drawn path is all there is.

/** Distance between spring columns (viewBox px). */
const SPACING = 6
/** How far the line may bend (viewBox px). */
const MAX_BEND = 22
const STEP_MS = 1000 / 60

type Box = { x0: number; x1: number; y0: number; y1: number }

export function PluckLine({ points, box }: { points: [number, number][]; box: Box }) {
  const ref = useRef<SVGPathElement>(null)

  useEffect(() => {
    const path = ref.current
    const svg = path?.ownerSVGElement
    if (!path || !svg) return
    if (window.matchMedia(REDUCED_MOTION).matches || !window.matchMedia(FINE_POINTER).matches) return

    const cols = Math.ceil((box.x1 - box.x0) / SPACING) + 1
    const height = new Float32Array(cols)
    const vel = new Float32Array(cols)
    const push = new Float32Array(cols)
    let awake = false

    const offsetAt = (px: number) => {
      const c = (px - box.x0) / SPACING
      const j = Math.max(0, Math.min(cols - 2, Math.floor(c)))
      const t = Math.max(0, Math.min(1, c - j))
      return height[j] * (1 - t) + height[j + 1] * t
    }

    // The line's resting y at `px`, between its two nearest points.
    const restAt = (px: number) => {
      let lo = 0
      let hi = points.length - 1
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1
        if (points[mid][0] <= px) lo = mid
        else hi = mid
      }
      const [ax, ay] = points[lo]
      const [bx, by] = points[hi]
      return bx === ax ? ay : ay + ((px - ax) / (bx - ax)) * (by - ay)
    }

    const draw = () => {
      let d = ""
      for (let i = 0; i < points.length; i++) {
        const [px, py] = points[i]
        const yy = Math.max(box.y0, Math.min(box.y1, py - offsetAt(px)))
        d += `${i ? "L" : "M"}${px.toFixed(1)},${yy.toFixed(1)}`
      }
      path.setAttribute("d", d)
    }

    const poke = (px: number, impulse: number) => {
      const c = Math.round((px - box.x0) / SPACING)
      for (let k = -5; k <= 5; k++) {
        const j = c + k
        if (j > 0 && j < cols - 1) vel[j] += impulse * Math.exp(-(k * k) / 8)
      }
      awake = true
    }

    const step = () => {
      let energy = 0
      for (let j = 0; j < cols; j++) {
        vel[j] += -0.02 * height[j] - 0.022 * vel[j]
        height[j] = Math.max(-MAX_BEND, Math.min(MAX_BEND, height[j] + vel[j]))
        energy = Math.max(energy, Math.abs(vel[j]), Math.abs(height[j]) * 0.1)
      }
      for (let pass = 0; pass < 3; pass++) {
        push.fill(0)
        for (let j = 0; j < cols; j++) {
          if (j > 0) push[j - 1] += 0.22 * (height[j] - height[j - 1])
          if (j < cols - 1) push[j + 1] += 0.22 * (height[j] - height[j + 1])
        }
        for (let j = 0; j < cols; j++) vel[j] += push[j]
      }
      // Pinned at the spines, like a string.
      height[0] = height[cols - 1] = 0
      vel[0] = vel[cols - 1] = 0
      if (energy < 0.02) {
        height.fill(0)
        vel.fill(0)
        return false
      }
      return true
    }

    // Pointer in viewBox units; a crossing of the line (the sign of cursor minus line flips) plucks it.
    let last: { x: number; side: number; y: number } | null = null
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      const rect = svg.getBoundingClientRect()
      if (rect.width === 0) return
      const k = svg.viewBox.baseVal.width / rect.width
      const px = (e.clientX - rect.left) * k
      const py = (e.clientY - rect.top) * k
      if (px < box.x0 || px > box.x1 || py < box.y0 - 20 || py > box.y1 + 20) {
        last = null
        return
      }
      const lineY = restAt(px) - offsetAt(px)
      const side = Math.sign(py - lineY)
      if (last && side !== 0 && last.side !== 0 && side !== last.side) {
        const speed = Math.hypot(px - last.x, py - last.y)
        // Up the screen is a positive offset (the SVG's y points down).
        poke(px, -side * Math.min(5, 1.4 + speed * 0.25))
      }
      last = { x: px, side, y: py }
    }

    let raf = 0
    let acc = 0
    let prev = 0
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!awake) {
        prev = now
        return
      }
      acc += Math.min(100, now - prev)
      prev = now
      while (acc >= STEP_MS && awake) {
        awake = step()
        acc -= STEP_MS
      }
      draw()
    }
    const start = () => {
      if (raf) return
      prev = performance.now()
      raf = requestAnimationFrame(tick)
      window.addEventListener("pointermove", onMove, { passive: true })
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
      last = null
      window.removeEventListener("pointermove", onMove)
    }
    // Only while the plot is on screen.
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()))
    io.observe(svg)
    return () => {
      stop()
      io.disconnect()
    }
  }, [points, box])

  const d = points.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join("")
  return <path ref={ref} d={d} className="stroke-plot" fill="none" strokeWidth={1.5} strokeLinejoin="round" />
}
