import type { BaseMeta } from "@/lib/content/schema"

export interface NoteMeta extends BaseMeta {
  date: string
  // The note's recipe as an agent skill: its folder in phucbm/skills ("nextjs/og-images", lib/skills.ts).
  // The note page shows the install line under the title.
  skill?: string
}
