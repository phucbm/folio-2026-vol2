import type { ReactNode } from "react"
import { exhibit } from "@/lib/exhibits"

/** A table's caption, above the table as in a paper: "Table 2." in semibold ink, then its caption from
 *  lib/exhibits.ts (which the List of Tables shows too), then any sentences the page adds. Carries the
 *  table's anchor. */
export function TableCaption({ n, children }: { n: string; children?: ReactNode }) {
  const { id, caption } = exhibit("Table", n)
  return (
    <p id={id} className="label scroll-mt-6">
      <span className="font-semibold text-ink">Table {n}.</span> {caption}
      {children && <> {children}</>}
    </p>
  )
}

/** A figure's caption, below the figure: "Figure 2." then its caption from lib/exhibits.ts, then any
 *  sentences the page adds. The anchor goes on the `<figure>` (`exhibit("Figure", n).id`). */
export function FigureCaption({ n, children }: { n: string; children?: ReactNode }) {
  return (
    <figcaption className="label mt-2">
      <span className="font-semibold text-ink">Figure {n}.</span> {exhibit("Figure", n).caption}
      {children && <> {children}</>}
    </figcaption>
  )
}

/** A figure in a table: mono, right-aligned; a figure not measured yet is a blank cell. */
export function NumCell({ value, last }: { value: number | null | undefined; last?: boolean }) {
  return (
    <td className={`num py-1.5 text-right align-baseline ${last ? "" : "pr-4"}`}>
      {value == null ? <span className="sr-only">not measured</span> : value.toLocaleString("en-US")}
    </td>
  )
}

/** Where a page still waits on data or copy: visible on the preview, gone once the gap is filled. */
export function Pending({ children }: { children: ReactNode }) {
  return <p className="label my-4">[TODO: {children}]</p>
}
