import type { ReactNode } from "react"

/** Title block of a page or entry: an optional label above (§3, N-001), the title, a line of meta below. */
export function PageHeader({ label, title, meta }: { label?: ReactNode; title: string; meta?: ReactNode }) {
  return (
    <header className="mb-10">
      {label && <p className="label num">{label}</p>}
      <h1 className="mt-1 text-3xl md:text-4xl">{title}</h1>
      {meta && <p className="label mt-3">{meta}</p>}
    </header>
  )
}
