import type { BaseMeta } from "@/lib/content/schema"

export interface ArchivedMeta extends BaseMeta {
  // "Figure 3". Authored and unique across archived projects (content:lint).
  figure: number
  // The year it shipped.
  year: number
  client?: string
  // What I did on it, in a few words ("front-end, animation").
  role?: string
  // Plain names, in the order they matter ("WordPress", "GSAP").
  stack?: string[]
  // The live site, if it still exists.
  url?: string
}
