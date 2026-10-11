import type { Metadata } from "next"
import { site, contactLinks } from "@/lib/site"
import { staticRoutes } from "@/lib/routes"
import { shareMetadata, ogImagePath } from "@/lib/og"
import type { CatalogItem } from "@/lib/content/catalog"

// Search metadata. A page's title and description live once, in `staticRoutes` (lib/routes.ts), so
// <title>, the meta description, the share card, the sitemap and llms.txt never disagree.
// `scripts/check-seo.mjs` checks the built pages.

// Next replaces the layout's `alternates` wholesale when a page sets one: the feed goes with every canonical.
const feed = { "application/rss+xml": "/feed.xml" }

export function alternates(path: string): Metadata["alternates"] {
  return { canonical: path, types: feed }
}

/** The whole metadata of a page in `staticRoutes`. */
export function pageMetadata(path: string): Metadata {
  const route = staticRoutes.find((r) => r.path === path)
  if (!route) throw new Error(`pageMetadata: ${path} is not in lib/routes.ts`)
  // The home page is the site: its title is the name alone, its description the site's.
  const home = path === "/"
  const title = home ? site.name : route.title
  const description = home ? site.description : route.description
  return {
    title: home ? { absolute: title } : title,
    description,
    alternates: alternates(path),
    ...shareMetadata(path, { title, description }),
  }
}

// --- Structured data (schema.org JSON-LD) -----------------------------------------------------------

const personId = `${site.url}/#person`

export const person = {
  "@type": "Person",
  "@id": personId,
  name: site.name,
  url: site.url,
  email: `mailto:${site.email}`,
  jobTitle: "Frontend engineer",
  sameAs: contactLinks.map((link) => link.href).filter((href) => href.startsWith("https://")),
}

/** The home page: the site and its author. */
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: site.name, description: site.description, inLanguage: "en", author: { "@id": personId } },
      person,
    ],
  }
}

/** A note's page. */
export function noteJsonLd(item: Pick<CatalogItem, "url" | "title" | "excerpt" | "date" | "dateModified" | "tags">) {
  const url = site.url + item.url
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: item.title,
    ...(item.excerpt ? { description: item.excerpt } : {}),
    ...(item.date ? { datePublished: item.date } : {}),
    ...(item.dateModified ? { dateModified: item.dateModified } : {}),
    ...(item.tags.length ? { keywords: item.tags.join(", ") } : {}),
    image: site.url + ogImagePath(item.url),
    inLanguage: "en",
    author: person,
  }
}
