import type { NoteMeta } from "@/content/notes/types"
import { loadCollectionMeta, metaOf, splitByStatus } from "@/lib/content/collections"

// Every note's filename. A new note is added here (no `fs` scan at runtime).
const noteFiles: string[] = ["how-i-built-my-blog.mdx"]

const all = await loadCollectionMeta<NoteMeta>(noteFiles, (file) => metaOf(`notes/${file}`))
const { buildable, listed } = splitByStatus(all)

// `notes`: listings, feeds, the related pool. Newest first.
// `notesAll`: generateStaticParams only (includes unlisted, drops drafts in production).
export const notes: NoteMeta[] = listed.sort((a, b) => b.date.localeCompare(a.date))
export const notesAll: NoteMeta[] = buildable
