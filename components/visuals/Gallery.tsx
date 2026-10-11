"use client"

import type { TemplateSize } from "./templates"

export interface GalleryProps extends TemplateSize {
  /** Screenshots (URLs, or `@<id>` of captures in the recipe), shown whole, side by side. */
  images: string[]
  /** One line under each, set like a sub-figure label ("(a) 2019"). */
  labels?: string[]
  columns?: number
}

/** Several screenshots in a row on paper, e.g. an archived project on desktop and phone. */
export default function Gallery({ width, height, images, labels = [], columns }: GalleryProps) {
  if (!Array.isArray(images) || !images.length) return <p data-visual-error="">images[] required</p>
  const cols = columns ?? images.length
  const pad = width * 0.04
  const text = Math.max(14, height * 0.028)
  return (
    <div className="absolute inset-0 grid items-center bg-paper" style={{ padding: pad, gap: pad * 0.6, gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {images.map((src, i) => (
        <figure key={i} className="m-0 flex flex-col items-center" style={{ gap: text * 0.7 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="block w-full border border-rule bg-white" />
          {labels[i] && <figcaption className="num text-ink-muted" style={{ fontSize: text }}>{labels[i]}</figcaption>}
        </figure>
      ))}
    </div>
  )
}
