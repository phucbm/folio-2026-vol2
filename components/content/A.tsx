import type { ComponentProps } from "react"
import { site } from "@/lib/site"

/** An outside http(s) URL (not this site): opens in a new tab. mailto:, #anchors and paths stay put. */
export const isExternal = (href?: string) => !!href && /^https?:\/\//.test(href) && !href.startsWith(site.url)

// The site's one <a>: every link on a page and in MDX goes through it, so outside links open in a new
// tab without anyone remembering to. scripts/check-paper.mjs fails the build on one that does not.
export function A({ href, ...props }: ComponentProps<"a">) {
  return isExternal(href) ? <a href={href} target="_blank" rel="noopener" {...props} /> : <a href={href} {...props} />
}
