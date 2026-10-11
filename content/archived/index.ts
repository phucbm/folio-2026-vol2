import type { ArchivedMeta } from "@/content/archived/types"
import { loadCollectionMeta, metaOf, splitByStatus } from "@/lib/content/collections"

// Every archived project's filename. A new one is added here (no `fs` scan at runtime).
const archivedFiles: string[] = []

const all = await loadCollectionMeta<ArchivedMeta>(archivedFiles, (file) => metaOf(`archived/${file}`))
const { buildable, listed } = splitByStatus(all)

// `archived`: listings, feeds, the related pool, in figure order.
// `archivedAll`: generateStaticParams only (includes unlisted, drops drafts in production).
export const archived: ArchivedMeta[] = listed.sort((a, b) => a.figure - b.figure)
export const archivedAll: ArchivedMeta[] = buildable
