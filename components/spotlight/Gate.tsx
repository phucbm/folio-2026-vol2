"use client"

import type { GateProps } from "@perxel/spotlight"
import { Gate, useGateContext } from "@perxel/spotlight/gate"

// The search box, set like the paper: a block between two heavy ink rules on the page's own paper,
// results as a list divided by hairlines (the site's lists of entries), the highlighted row in the
// selection tint. No glass, no shadow, no rounded box (`.claude/docs/design.md`, "Don't").

const MARK = "[&_mark]:bg-[color-mix(in_srgb,var(--plot)_22%,transparent)] [&_mark]:text-inherit"

export default function PaperGate({ open, onOpenChange }: GateProps) {
  return (
    <Gate.Root
      open={open}
      onOpenChange={onOpenChange}
      overlayProps={{ className: "fixed inset-0 z-50 bg-paper/85" }}
      className="fixed inset-x-4 top-16 z-50 mx-auto flex max-h-[calc(100dvh-8rem)] max-w-measure flex-col border-y border-ink bg-paper text-ink outline-none md:top-[14vh]"
    >
      <Body />
    </Gate.Root>
  )
}

function Body() {
  const g = useGateContext()
  return (
    <>
      <div className="flex items-baseline gap-3 border-b border-rule py-3">
        <span aria-hidden className="label shrink-0 font-semibold tracking-[0.08em] text-ink uppercase">{g.askable ? "Search or ask" : "Search"}</span>
        <Gate.Input className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-muted" />
        <Gate.Hint className="label invisible shrink-0 whitespace-nowrap data-[on]:visible">
          <kbd className="num">↵</kbd> {g.hint}
        </Gate.Hint>
        <Gate.Close className="label shrink-0 cursor-pointer hover:text-ink">Close</Gate.Close>
      </div>
      <div className="min-h-0 overflow-y-auto overscroll-contain">
        <Gate.Results className={`divide-y divide-rule ${MARK}`}>
          {({ index, ...result }) => (
            <Gate.Item
              key={result.doc.id}
              result={result}
              index={index}
              className="flex w-full items-baseline justify-between gap-4 px-1 py-2 text-left text-ink no-underline data-[highlighted]:bg-[color-mix(in_srgb,var(--plot)_12%,transparent)]"
            >
              <span className="flex min-w-0 flex-col">
                <span><Gate.Marked text={result.doc.title} marks={result.titleMarks} /></span>
                {result.snippet ? (
                  <span className="label truncate"><Gate.Marked {...result.snippet} /></span>
                ) : null}
              </span>
              <span className="label shrink-0">
                {result.doc.subtitle ? <span className="num">{result.doc.subtitle}</span> : g.kindLabel(result.doc.kind)}
              </span>
            </Gate.Item>
          )}
        </Gate.Results>
      </div>
    </>
  )
}
