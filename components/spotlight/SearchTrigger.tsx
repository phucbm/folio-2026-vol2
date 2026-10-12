"use client"

import { shortcutLabel, Trigger } from "@perxel/spotlight/react"
import { useEffect, useState } from "react"

/** The running head's way in: "Search", then the shortcut in mono. In the server HTML (`always`), so the head never shifts. */
export function SearchTrigger() {
  const [key, setKey] = useState("⌘K")
  useEffect(() => setKey(shortcutLabel() ?? ""), [])
  return (
    <Trigger always aria-keyshortcuts="Meta+K Control+K" className="label cursor-pointer text-ink-muted hover:text-ink">
      Search <kbd className="num">{key}</kbd>
    </Trigger>
  )
}
