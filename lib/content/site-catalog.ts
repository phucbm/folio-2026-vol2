import { notes } from "@/content/notes/index"
import { archived } from "@/content/archived/index"
import { buildCatalog, type CatalogItem, type CatalogKind } from "./catalog"

// The one module app code imports for cross-collection lists (sitemap, feeds, llms.txt, content.json,
// Table 1's counts). Built from the listed sets only, so drafts and unlisted entries never leak.
export const catalog: CatalogItem[] = buildCatalog({ notes, archived })

export function catalogByKind(kind: CatalogKind): CatalogItem[] {
  return catalog.filter((item) => item.kind === kind)
}
