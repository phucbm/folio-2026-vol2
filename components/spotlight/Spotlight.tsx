"use client"

import type { AskConfig, Navigate, SearchConfig, SearchDoc, SpotlightCopy } from "@perxel/spotlight"
import { SpotlightProvider, turnstileWidget } from "@perxel/spotlight/react"
import { useRouter } from "next/navigation"
import { useCallback, useMemo } from "react"

// Search and Ask on phucbm.com (perxel-web plan 018): `@perxel/spotlight`'s headless parts in the
// paper's style (`Gate.tsx`, `Panel.tsx`, both lazy chunks: a page's first load holds this provider
// and the trigger only). ⌘K opens the box; typing searches the site in the browser; Enter asks.

const DEV = process.env.NODE_ENV === "development"
// "phucbm.com Ask" (Turnstile, managed); `next dev` uses Cloudflare's always-pass test key.
const SITE_KEY = DEV ? "1x00000000000000000000AA" : "0x4AAAAAAFUwylA9NiF0vugk"

const loadGate = () => import("./Gate")
const loadPanel = () => import("./Panel")

const copy: Partial<SpotlightCopy> = {
  gateTitle: "Search or ask",
  placeholder: "Search the site or ask a question",
  panelTitle: "Ask",
  kinds: { page: "Section", note: "Note", project: "Project" },
}

export function Spotlight({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const bot = useMemo(() => (typeof window === "undefined" ? null : turnstileWidget({ siteKey: SITE_KEY, language: "en" })), [])

  const search = useMemo<SearchConfig>(
    () => ({ load: () => fetch("/search.json").then((r) => r.json() as Promise<SearchDoc[]>), kindOrder: ["page", "note", "project"] }),
    [],
  )
  const ask = useMemo<AskConfig>(
    () => ({
      endpoint: "/api/ask",
      prepare: () => {
        bot?.prepare()
        void fetch("/api/ask", { cache: "no-store" }).catch(() => undefined)
      },
      body: async () => ({ turnstileToken: await bot?.token() }),
    }),
    [bot],
  )
  // Pages on this site through the router; anything else in a new tab (the site's rule for outside links).
  const navigate = useCallback<Navigate>(
    (url, { newTab }) => {
      const u = new URL(url, location.href)
      if (newTab || u.origin !== location.origin) return void window.open(u.href, "_blank", "noopener")
      router.push(u.pathname + u.search + u.hash)
    },
    [router],
  )

  return (
    <SpotlightProvider search={search} ask={ask} gate={loadGate} panel={loadPanel} copy={copy} navigate={navigate}>
      {children}
    </SpotlightProvider>
  )
}
