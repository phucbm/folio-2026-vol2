import type { BaseMeta } from "@/lib/content/schema"

export interface NoteMeta extends BaseMeta {
  // The lab-notebook number, shown as N-047. Authored, never derived, so a note keeps its number when
  // an older one is added later. Unique across notes (content:lint).
  number: number
  date: string
}
