import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import type { Metadata } from "next"
import { site } from "@/lib/site"
import { letters } from "@/components/layout/Logo"

// Share cards (Open Graph), drawn at build time by `app/og/[...path]/route.tsx`, one PNG per page and
// note. The layout of perxel-web's `lib/og.tsx`, set like this site: a page of the paper with the
// running head, the title block of `PageHeader`, and the rules of a table.

export const OG_SIZE = { width: 1200, height: 630 }

const paper = "#f7f5f0"
const ink = "#1c1b19"
const muted = "#625e57"
const rule = "#d8d2c6"

// Satori reads neither woff2 nor variable fonts: static TTF instances of the site's own cuts, read
// from disk at build time. Read on the first card, not when the module loads: pages import this file
// for `shareMetadata`, and the Worker has no disk (the built cards are static files there,
// `scripts/cf-assets.mjs`). Rebuild: .claude/docs/performance.md.
const fontDir = join(process.cwd(), "lib/fonts/og")
let fonts: Promise<Buffer[]> | undefined
const loadFonts = () => (fonts ??= Promise.all([
  readFile(join(fontDir, "source-serif-4-500.ttf")),
  readFile(join(fontDir, "source-sans-3-400.ttf")),
  readFile(join(fontDir, "ibm-plex-mono-400.ttf")),
]))

// The mark, as in `app/icon.svg` with the `rule` hairline of `Logo`.
const mark = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="0.5" y="0.5" width="31" height="31" rx="7" fill="${paper}" stroke="${rule}"/><path fill="${ink}" d="${letters}"/></svg>`,
).toString("base64")}`

export interface OgCard {
  /** `§1`, `N-003`: set in mono above the title, as in `PageHeader`. */
  label?: string
  title: string
  description?: string
  /** The meta line under the bottom rule (a note's date). */
  meta?: string
}

export async function createOgImage({ label, title, description, meta }: OgCard) {
  const [serif, sans, mono] = await loadFonts()
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: paper,
          padding: "64px 80px",
          fontFamily: "Sans",
          color: ink,
        }}
      >
        {/* Running head */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "24px", borderBottom: `1px solid ${rule}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mark} width={48} height={48} alt="" />
            <div style={{ fontFamily: "Serif", fontSize: "30px" }}>{site.name}</div>
          </div>
          <div style={{ fontFamily: "Mono", fontSize: "22px", color: muted }}>{new URL(site.url).host}</div>
        </div>

        {/* Title block */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: "960px" }}>
          {label && <div style={{ fontFamily: "Mono", fontSize: "26px", color: muted }}>{label}</div>}
          <div style={{ fontFamily: "Serif", fontSize: title.length > 48 ? "60px" : "72px", lineHeight: 1.12, letterSpacing: "-0.5px", marginTop: label ? "12px" : 0 }}>
            {title}
          </div>
          {description && (
            <div style={{ fontSize: "30px", lineHeight: 1.4, color: muted, marginTop: "24px", lineClamp: 2, display: "block" }}>
              {description}
            </div>
          )}
        </div>

        {/* Foot: the heavy rule of a table, then the meta line */}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "20px", borderTop: `2px solid ${ink}`, fontFamily: "Mono", fontSize: "22px", color: muted }}>
          <div>{meta ?? ""}</div>
          <div>{`v${site.version}`}</div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Serif", data: serif, weight: 500, style: "normal" },
        { name: "Sans", data: sans, weight: 400, style: "normal" },
        { name: "Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  )
}

/** The card of a page path: `/` → `/og/index.png`, `/notes/x` → `/og/notes/x.png`. */
export function ogImagePath(path: string) {
  return `/og/${path === "/" ? "index" : path.slice(1)}.png`
}

/** `openGraph` and `twitter` for a page. Spread into its metadata: Next replaces the layout's
 *  `openGraph` wholesale when a page sets one, so every page needs the whole object. */
export function shareMetadata(path: string, { title, description }: { title: string; description: string }): Metadata {
  const image = { url: ogImagePath(path), ...OG_SIZE, alt: title }
  return {
    openGraph: { type: "website", siteName: site.name, url: path, title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  }
}
