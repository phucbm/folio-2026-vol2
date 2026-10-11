import type { ReactNode } from "react"

/** A table's caption, above the table as in a paper: "Table 2." in semibold ink, then one sentence. */
export function TableCaption({ id, n, children }: { id?: string; n: number | string; children: ReactNode }) {
  return (
    <p id={id} className="label">
      <span className="font-semibold text-ink">Table {n}.</span> {children}
    </p>
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
