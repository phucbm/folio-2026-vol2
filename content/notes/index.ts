import type { NoteMeta } from "@/content/notes/types"
import { loadCollectionMeta, metaOf, splitByStatus } from "@/lib/content/collections"

// Every note's filename. A new note is added here (no `fs` scan at runtime). Notes that share a date
// are numbered in this order (N-001 is the oldest; lib/aliases.ts): reorder the list to reorder them.
const noteFiles: string[] = ["how-i-built-my-blog.mdx", "rebuilding-as-a-research-paper.mdx", "dynamic-og-images.mdx"]

const all = await loadCollectionMeta<NoteMeta>(noteFiles, (file) => metaOf(`notes/${file}`))
const { buildable, listed } = splitByStatus(all)

const position = (slug: string) => noteFiles.indexOf(`${slug}.mdx`)

// `notes`: listings, feeds, the related pool. Newest first; a shared date puts the later file first.
// `notesAll`: generateStaticParams only (includes unlisted, drops drafts in production).
export const notes: NoteMeta[] = listed.sort((a, b) => b.date.localeCompare(a.date) || position(b.slug) - position(a.slug))
export const notesAll: NoteMeta[] = buildable
