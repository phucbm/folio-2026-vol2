# Content

Ported from perxel-web-2026 (2026-10-11, plan 001 part 2), trimmed to one locale and two collections.

## Collections

| Collection | Files | Route | Number |
|---|---|---|---|
| Notes (§1) | `content/notes/*.mdx` | `/notes/<slug>` | `number` → `N-047` |
| Archived (§2) | `content/archived/*.mdx` | `/archived/<slug>` | `figure` → `Figure 3` |

- Each has `types.ts` (extends `BaseMeta` in `lib/content/schema.ts`) and `index.ts`, which lists the filenames by hand (no `fs` at runtime) and exports the **listed** set (`notes`, `archived`: listings, feeds, related pool) and the **buildable** set (`notesAll`, `archivedAll`: `generateStaticParams` only).
- `status`: `draft` (dev only), `published`, `unlisted` (built and linkable, never listed, noindex). `splitByStatus()` in `lib/content/collections.ts`.
- Numbers and figures are authored, not derived, so they never shift when an older entry is added. `content:lint` and `buildCatalog()` both reject a missing or repeated one.
- Frontmatter fields and writing rules: the `copywriting` skill, section 5.
- The collection list for the scripts is `scripts/content-collections.mjs`. A new collection: add it there, give it `types.ts` and `index.ts`, add a kind to `lib/content/catalog.ts`.

## Pages and data

- Single pages with prose (`/now`, `/uses`, `/colophon`, the abstract on the home page) are `content/pages/<name>.mdx`, imported statically by their route (`import Body, {meta} from "@/content/pages/now.mdx"`). Frontmatter: `title`, `description`, optional `updated`. Not a collection: no catalog entry, not linted, so check the `copywriting` skill by hand.
- `/perxel` reads `data/perxel.ts` (one line per case study, linking to perxel.com/en/works). Contact links: `contactLinks` in `lib/site.ts`.
- Every page is listed in `staticRoutes` (`lib/routes.ts`), which feeds the sitemap, llms.txt and the home page's contents.

## Reading frontmatter without importing MDX

`scripts/content-meta.mjs` writes every collection file's frontmatter to `content/meta.generated.json`, and `scripts/content-body.mjs` its plain text to `content/body.generated.json` (both gitignored). `pnpm dev`, `pnpm build` and `pnpm typecheck` run it first; `next dev` re-runs it on any `.mdx` change (`next.config.ts`). Collections read `metaOf("<collection>/<file>")`. Only the `[slug]` entry routes import the `.mdx` itself (`await import(\`@/content/notes/${slug}.mdx\`)`), so a listing page never ships the components a post uses. Only `app/content.json/route.ts` imports the body file.

An entry route can only exist once its collection has at least one `.mdx`: with none, Turbopack fails on the dynamic import (nothing matches), and an export build needs at least one static param anyway.

## Catalog

`lib/content/catalog.ts` is pure (no MDX, no fs; `pnpm test` covers it): `buildCatalog()` gives one `CatalogItem` per listed entry, with its URL, label (`N-047`, `Figure 3`), year, `projects` resolved against the archived slugs and the reverse `citedBy`. `lib/content/site-catalog.ts` wires the real data in; it is the one module app code imports for cross-collection lists.

Built from it, all static and rebuilt on deploy: `/content.json` (full text, for the MCP later), `/sitemap.xml` (plus `staticRoutes` in `lib/routes.ts`), `/llms.txt`, `/feed.xml` (notes, RSS 2.0), `/robots.txt`. A new section page goes in `staticRoutes`.

## MDX

`@next/mdx` with `remark-gfm` (tables, footnotes), `remark-frontmatter` and `remark-mdx-frontmatter` (frontmatter as `meta`), named by package in `next.config.ts` (Turbopack). Prose styling: `mdx-components.tsx` (a first pass; part 3 refines it). Types: `mdx.d.ts`.

## Lint

`pnpm content:lint [files]`: `scripts/lint-content.mjs` with the rules in `content/lint/rules.mjs` (prose, structure, frontmatter, and file rules that read the rest of the collection). `.claude/hooks/content-lint.mjs` runs it after every `.mdx` write under a collection (errors block the turn) and, before writing any copy file, reminds the model to load the `copywriting` skill.

## Visuals

`pnpm visuals` (`scripts/visuals/`, `lib/visuals/`, templates in `components/visuals/`, the dev-only route `app/(visuals)/visuals/[template]/page.dev.tsx`). Workflow: the `visuals` skill. `next.config.ts` adds `dev.tsx` to `pageExtensions` and drops `output: "export"` only under `next dev`, so the route never reaches the build.

## Outside data

`scripts/data/fetch.mjs` (`pnpm data`) writes `data/live.generated.json`; `lib/live.ts` types and exports it, `lib/figures.ts` turns it into plot series, `lib/numbers.ts` into Table 1. Sources: GitHub GraphQL (contributions per week and, for the last 53 weeks, per day (Figure 0, the calendar), both on GitHub's Sunday-first weeks; commits per year; token from `GITHUB_TOKEN` or `gh auth token`, and it must be the owner's own so private contributions count), the repos listed in `data/oss.ts` (stars, descriptions), npm (every package of the `phucbui96` account, `NPM_MAINTAINER`: full download history, jsDelivr hits), Goodreads (the public RSS of the read shelf), Discord (bookmark threads; `DISCORD_BOT_TOKEN`, `DISCORD_CHANNEL_ID` in `.env.local`). The file is committed so a build without tokens still has numbers. `.github/workflows/rebuild.yml` redeploys daily once its secrets are set.

Plots: `components/plots/Plot.tsx` (matplotlib defaults, server SVG at two sizes), `ContributionCalendar.tsx` (GitHub's calendar, Figure 0 on the home page), `PluckLine.tsx` (the spring of Figure 0's weekly line on `/stats`, behind `FINE_POINTER` and off under reduced motion). On `/stats` the figures are numbered S1, S2 (supplementary), never plain numbers: those belong to archived projects.
