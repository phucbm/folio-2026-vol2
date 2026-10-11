import type { ArchivedMeta } from "@/content/archived/types"
import { loadCollectionMeta, metaOf, splitByStatus } from "@/lib/content/collections"

// Every archived project's filename. A new one is added here (no `fs` scan at runtime).
const archivedFiles: string[] = ["bach-suites-saigon.mdx", "sky-international-preschool-vietnam.mdx", "jones-payne.mdx", "techvico.mdx", "long-an-international-port.mdx", "huynchi.mdx", "source-of-asia.mdx", "tuan-loc-commodities.mdx", "rmit-experience-day-2023.mdx", "ree-corporation.mdx", "gilimex.mdx", "koru-education.mdx", "mia-saigon.mdx", "sakura-vietnam.mdx", "food-source-international.mdx", "rmit-vietnam.mdx", "bong-bach-tuyet.mdx", "little-einstein-academy.mdx", "duc-khang-hospital.mdx", "canh-dieu.mdx"]

const all = await loadCollectionMeta<ArchivedMeta>(archivedFiles, (file) => metaOf(`archived/${file}`))
const { buildable, listed } = splitByStatus(all)

// `archived`: listings, feeds, the related pool, in figure order.
// `archivedAll`: generateStaticParams only (includes unlisted, drops drafts in production).
export const archived: ArchivedMeta[] = listed.sort((a, b) => a.figure - b.figure)
export const archivedAll: ArchivedMeta[] = buildable
