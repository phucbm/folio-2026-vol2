"use client"

import { useState } from "react"

// The copy action in a code block's header (CodeBlock.tsx). Says what happened in words, no icon.
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="cursor-pointer text-ink-muted transition-colors hover:text-ink"
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  )
}
