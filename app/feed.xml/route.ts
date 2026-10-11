import { site } from "@/lib/site"
import { catalogByKind } from "@/lib/content/site-catalog"

export const dynamic = "force-static"

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

// RSS 2.0 of the notes, newest first (the catalog keeps the collection's order).
export function GET() {
  const items = catalogByKind("note").map((note) => {
    const url = site.url + note.url
    return [
      "<item>",
      `<title>${escape(`${note.label}: ${note.title}`)}</title>`,
      `<link>${url}</link>`,
      `<guid isPermaLink="true">${url}</guid>`,
      note.date ? `<pubDate>${new Date(`${note.date}T00:00:00Z`).toUTCString()}</pubDate>` : "",
      note.excerpt ? `<description>${escape(note.excerpt)}</description>` : "",
      ...note.tags.map((tag) => `<category>${escape(tag)}</category>`),
      "</item>",
    ].filter(Boolean).join("")
  })
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>',
    `<title>${escape(`${site.name}: notes`)}</title>`,
    `<link>${site.url}/notes</link>`,
    `<atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml"/>`,
    `<description>${escape(site.description)}</description>`,
    "<language>en</language>",
    ...items,
    "</channel></rss>",
  ].join("\n")
  return new Response(xml + "\n", { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } })
}
