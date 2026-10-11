# Content

Ported from perxel-web-2026 (2026-10-11, plan 001 part 2), trimmed to one locale. One collection (notes); projects are a data file (2026-10-11).

## Collections

| Collection | Files | Route | Alias |
|---|---|---|---|
| Notes (§1) | `content/notes/*.mdx` | `/notes/<slug>` | `N-047`, by `date` |

- Each has `types.ts` (extends `BaseMeta` in `lib/content/schema.ts`) and `index.ts`, which lists the filenames by hand (no `fs` at runtime) and exports the **listed** set (`notes`: listings, feeds, related pool) and the **buildable** set (`notesAll`: `generateStaticParams` only).
- `status`: `draft` (dev only), `published`, `unlisted` (built and linkable, never listed, noindex). `splitByStatus()` in `lib/content/collections.ts`.
- **Aliases** (2026-10-11). The slug (or a source's URL) is the ID. Every listing numbers its items by date, oldest first, at build time (`lib/aliases.ts`): `N-001` notes (`date`), `P-001` projects (`date`), `B-001` books (date read), `R-001` references (date saved). An alias is a position, not an ID: adding an older item shifts the ones after it. Ties, and items with no date (counted as oldest), follow the authored order (`noteFiles` in `content/notes/index.ts`, the list in `data/projects.ts`). Only listed notes get a number. Copy names an item and links it, never its alias (`alias-in-prose` in `content:lint`). When the owner says "P023" in chat, it means whatever is at that position in the current build. Table and figure numbers (`Table 1`, `Figure 1`) stay fixed: they label parts of a page, not items in a list.
- Frontmatter fields and writing rules: the `copywriting` skill, section 5.
- The collection list for the scripts is `scripts/content-collections.mjs`. A new collection: add it there, give it `types.ts` and `index.ts`, add a kind to `lib/content/catalog.ts`.

## Pages and data

- Single pages with prose (`/colophon`, the abstract on the home page) are `content/pages/<name>.mdx`, imported statically by their route (`import Body, {meta} from "@/content/pages/colophon.mdx"`). Frontmatter: `title`, `description`, optional `updated`. Not a collection: no catalog entry, not linted, so check the `copywriting` skill by hand.
- `/projects` (§2) reads `data/projects.ts`: one flat list by date, one line per project (slug, title, where: Perxel, Freelance or ViiVue, `YYYY-MM` date, role, line, link). No entry pages and no images; a project with a perxel.com case study links there. Contact links: `contactLinks` in `lib/site.ts`.
- Every page is listed in `staticRoutes` (`lib/routes.ts`), which feeds the sitemap, llms.txt and the home page's contents.

## Reading frontmatter without importing MDX

`scripts/content-meta.mjs` writes every collection file's frontmatter to `content/meta.generated.json`, and `scripts/content-body.mjs` its plain text to `content/body.generated.json` (both gitignored). `pnpm dev`, `pnpm build` and `pnpm typecheck` run it first; `next dev` re-runs it on any `.mdx` change (`next.config.ts`). Collections read `metaOf("<collection>/<file>")`. Only the `[slug]` entry routes import the `.mdx` itself (`await import(\`@/content/notes/${slug}.mdx\`)`), so a listing page never ships the components a post uses. Only `app/content.json/route.ts` imports the body file.

An entry route can only exist once its collection has at least one `.mdx`: with none, Turbopack fails on the dynamic import (nothing matches), and an export build needs at least one static param anyway.

## Catalog

`lib/content/catalog.ts` is pure (no MDX, no fs; `pnpm test` covers it): `buildCatalog()` gives one `CatalogItem` per listed entry, with its URL, label (`N-047`), year. `lib/content/site-catalog.ts` wires the real data in; it is the one module app code imports for cross-collection lists.

Built from it, all static and rebuilt on deploy (served as files, `scripts/cf-assets.mjs`): `/content.json` (full text, for the MCP later), `/sitemap.xml` (plus `staticRoutes` in `lib/routes.ts`), `/llms.txt`, `/feed.xml` (notes, RSS 2.0), `/robots.txt`. A new section page goes in `staticRoutes`.

**Share cards** (2026-10-11, after perxel-web's `lib/og.tsx`): `app/og/[...path]/route.tsx` draws one 1200×630 PNG per `staticRoutes` page and per note (`notesAll`) at build time, served as static files from `/og/<path>.png` (`/` → `/og/index.png`; `scripts/cf-assets.mjs` copies every route handler's output into the static assets), with `next/og` and the layout in `lib/og.tsx` (running head, label, serif title, description, ink rule, date and version). The layout's card is the home page's (the 404 falls back to it).

**Search metadata** (`lib/seo.ts`): a page's title and description live once, in `staticRoutes`; the page exports `metadata = pageMetadata("/path")`, which gives the `<title>`, description, canonical URL, feed link and `shareMetadata` (Open Graph, Twitter). A note's `generateMetadata` builds the same from its frontmatter (`seoTitle ?? title`, `excerpt`) with `og:type` article. JSON-LD (`components/content/JsonLd.tsx`): `WebSite` and `Person` on the home page, `BlogPosting` on each note. `scripts/check-seo.mjs` runs after `check-paper` in `pnpm build` and fails it on a page without a single unique title, description, canonical to itself, Open Graph and Twitter tags or a built card, or a sitemap that is not exactly the indexable pages. A new page needs its route in `staticRoutes` and the `pageMetadata` call, nothing else.

## MDX

`@next/mdx` with `remark-gfm` (tables, footnotes), `remark-frontmatter` and `remark-mdx-frontmatter` (frontmatter as `meta`), named by package in `next.config.ts` (Turbopack). Prose styling: `mdx-components.tsx` (a first pass; part 3 refines it). Types: `mdx.d.ts`.

## Lint

`pnpm content:lint [files]`: `scripts/lint-content.mjs` with the rules in `content/lint/rules.mjs` (prose, structure, frontmatter, and file rules that read the rest of the collection). `.claude/hooks/content-lint.mjs` runs it after every `.mdx` write under a collection (errors block the turn) and, before writing any copy file, reminds the model to load the `copywriting` skill.

## Visuals

`pnpm visuals` (`scripts/visuals/`, `lib/visuals/`, templates in `components/visuals/`, the dev-only route `app/(visuals)/visuals/[template]/page.dev.tsx`). Workflow: the `visuals` skill. `next.config.ts` adds `dev.tsx` to `pageExtensions` only under `next dev`, so the route never reaches the build.

## Outside data

The numbers come from small jobs (`lib/live/jobs.ts`, plan 002, no imports so Node and the Worker share it): `github` (one GraphQL call: contributions per year, per week and, for the last 53 weeks, per day (Figure 1, the calendar), on GitHub's Sunday-first weeks; commits per year; the repos in `data/oss.ts`: stars by year, commits, descriptions; my public repos), `cdn:<owner/repo>` (jsDelivr through its GitHub route, which most sites use: every public repo of mine plus the `/oss` ones), `npm` (the packages of the `phucbui96` account) and `npm:<name>` (downloads per month and the last 30 days, jsDelivr hits per year and last month), `wordpress`, `goodreads` (the public RSS of the read shelf), `discord` (bookmark threads). Each keeps its own `fetchedAt`; past years and months are kept, so a job that ran before makes one or two requests. Tokens: `GITHUB_TOKEN` (must be the owner's own so private contributions count), `DISCORD_BOT_TOKEN`, `DISCORD_CHANNEL_ID`: Worker secrets on the site, `.env.local` (and `gh auth token`) for `pnpm data`. A job without its token is skipped and keeps its value.

- **On the site**: KV `LIVE`, key `live`. `worker/index.ts` wraps OpenNext's worker: after a GET it runs one batch of the jobs older than a day (a failed one waits an hour), oldest first, within 45 outside requests (the free plan allows 50), under a two-minute KV lock, and saves the result. The five data pages set `revalidate = 3600`, so they render again within the hour and read it.
- **The seed**, `data/live.generated.json`: the same format, written by `pnpm data` (every job, no budget) and committed. `getLive()` (`lib/live.ts`) merges it with KV job by job, the newer wins: the build and `next dev` see the seed, a fresh deploy with a newer seed still counts.
- `lib/live.ts` gives the pages the numbers (`getLive()`, once per render), `lib/figures.ts` the plot series, `lib/numbers.ts` Table 1.

Plots: `components/plots/Plot.tsx` (matplotlib defaults, server SVG at two sizes), `ContributionCalendar.tsx` (GitHub's calendar, Figure 1 on the home page), `PluckLine.tsx` (the spring of Figure 1's weekly line on `/stats`, behind `FINE_POINTER` and off under reduced motion).
