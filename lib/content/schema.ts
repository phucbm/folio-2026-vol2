// Shared shape for the MDX collections (notes, for now). Each collection's `types.ts` extends it
// with only what is specific to it.

// "draft": not built, not listed (visible in `next dev` only).
// "published": built and listed.
// "unlisted": built (directly linkable) but left out of listings, feeds and the sitemap, with noindex.
export type ContentStatus = "draft" | "published" | "unlisted"

export interface BaseMeta {
  title: string
  // Optional <title> / share title for the entry page. `title` stays the short name used in
  // listings and headings. Falls back to `title`.
  seoTitle?: string
  // Derived from the filename, never authored (content:lint rejects a `slug` field).
  slug: string
  // One or two sentences: the listing line, the meta description, the feed summary.
  excerpt: string
  // Free-form, lowercase. The first one is primary (used for the related-entries fallback).
  tags: string[]
  // "YYYY-MM-DD", quoted. Required on notes.
  date?: string
  // Set by hand after a change readers should know about. Shown instead of `date`, and feeds
  // dateModified and the sitemap. `date` stays the publish date. See displayDate().
  updated?: string
  status: ContentStatus
  // Slugs in the same collection, in display order. Filled up from the primary tag by resolveRelated().
  related?: string[]
  // Banner on the entry page and listing thumbnail where a collection shows one.
  featureImage?: string
  // Custom share image; otherwise the site default.
  ogImage?: string
}
