# 001 — Rebuild phucbm.com (folio 2026 vol. 2)

Status: **closed 2026-10-11.** The site is built (parts 1 to 7), drafts and placeholders included, on the preview at https://phucbm-com-2026-vol2.bmp.workers.dev. Launch and MCP are out of this plan (owner, 2026-10-11); what is left is under "Carried over". Written 2026-10-11.

## Why

- `folio-2026` (Astro 6 + TinaCMS, the "Maria" starter theme) still reads as a template: Maria titles and storage keys, Tina's demo post, a cookie banner with no analytics behind it, everything in JetBrains Mono, case studies that are one sentence each.
- `phucbm-web` (folio 2025, Nextra, "industrial brutalism, tactical monospace") has the sections worth keeping (bookmarks, Goodreads, now, uses, stats, shipped, the component registry), but it is the second mono/brutalist take in a row.
- Writing on perxel-web-2026 is fast because of its content engine and skills (`copywriting`, `visuals`, `content:lint`). Those are built around Next.js, so the new site uses the same stack and copies them, instead of porting them to Astro.
- New repo rather than a rewrite of `folio-2026`: no code there is worth keeping. Build on `main` here; "merging" is pointing phucbm.com at this site once everything is confirmed. `folio-2026` and `phucbm-web` stay as content sources until migration is done, then get archived.

## Direction

**A research paper, not a portfolio.** Minimal, researcher, data nerd. The paper's conventions organise the site; its costume (Computer Modern everywhere, small caps, footnote markers on every line) is left out, so it stays calm to read.

- **Conventions used:** numbered sections (§1…), a short abstract as the intro, results as tables, archived projects as numbered *figures* with captions, notes as numbered lab-notebook entries (`N-047`), books as a *bibliography* and bookmarks as *references*, both in real citation format, a version number instead of "last updated", the changelog as *errata*. Sidenotes only where an entry actually cites something (another note, a figure, a reference).
- **Type:** one modern serif for the name and section titles, a clean sans for reading, mono only for numbers, dates and IDs. Old-style figures in text, tabular figures in tables. Self-hosted, subset (Perxel's font rules in `performance.md`).
- **Colour:** warm off-white and ink, one accent for links. Dark mode only if it is designed properly; otherwise none.
- **Motion:** one live element, *Figure 1* (Figure 0 until 2026-10-11), a real plot from my own data (commits per week), drawn like a matplotlib chart, pluckable like Perxel's `WaveLine`. Everything else still. Pointer effects behind `FINE_POINTER`, off under reduced motion (Perxel's rules).

### Home page

No lists of latest items. The home page is the paper's front matter:

1. Name, one line, the abstract (who I am, what this is; playful, the voice carries the warmth).
2. **Table 1**, the numbers: this year and all time, for commits, notes, books, projects (archived / Perxel), packages (and downloads per month). Each row links to the section that backs it.
3. Figure 1.
4. **Contents**: the sections with their counts (`§1 Notes ......... 47`), each a link to its own listing page.
5. Ask (chat) trigger, contact, colophon.

### Sections (each its own listing page)

| § | Route | What | Entry page |
|---|---|---|---|
| 1 | `/notes` | Lab notebook: short notes, TILs, small findings. `N-###`, dated, tagged | `/notes/[slug]` |
| 2 | `/archived` | ViiVue work 2017-2025, 19 projects, as figures (plate, caption, year). **Linked from perxel.com** | `/archived/[slug]`: screenshot(s), 2–3 paragraphs, stack, year, what I learned. Not a full case study |
| 3 | `/perxel` | Current client work: one line each, linking out to the Perxel case study. Nothing written twice | none |
| 4 | `/oss` | Open source hub: packages and repos, stars, npm/jsDelivr downloads, links to the component registry (ui.phucbm.com) | maybe `/oss/[slug]` for the main ones |
| 5 | `/reading` | Bibliography from Goodreads, with short reviews | none at first |
| 6 | `/references` | Bookmarks, in citation format | none |
| 7 | `/now` | What I'm on, dated like an erratum | — |
| — | `/stats` | The charts behind Table 1: commits per week, reading per year, downloads | — |
| — | `/uses`, `/colophon`, `/errata` | From phucbm-web | — |

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind 4, pnpm), **static export** (`output: "export"`) on Cloudflare static assets. No OpenNext and no front Worker: every page is static, and anything dynamic (Ask, forms) lives on the MCP Worker. *Superseded 2026-10-12 by plan 002: OpenNext on Workers, the data pages render again hourly, numbers refreshed on visit.*
- Copied from perxel-web-2026, trimmed for one locale and a personal site:
  - Content engine: `lib/content/` (schema, collections, catalog), `scripts/content-meta.mjs`, `meta.generated.json`, no `fs` at runtime.
  - `content:lint` and its PostToolUse hook.
  - `visuals` pipeline (`scripts/visuals/`, templates, the dev-only route).
  - Breakpoints (`lib/media.ts` + CSS block), `WaveLine`, the reduced-motion nets.
  - Feeds (`/feed.xml`), sitemap, `llms.txt`, `/content.json`.
- Skills, rewritten for this site (not copied verbatim): `copywriting` in first person, English, a personal voice, plus a rule for what goes where (engineering notes and opinions here, client-facing posts on Perxel, cross-linked); `visuals` with this site's paths and templates.

## Data (Table 1, `/stats`, `/oss`, `/reading`)

All numbers computed at build time, never typed by hand. Cached in a generated JSON so a failed API call keeps the last good value instead of breaking the build.

- Commits: GitHub GraphQL `contributionsCollection` (needs a token; includes private contributions only if enabled on the profile).
- Packages: npm downloads API, jsDelivr stats API, GitHub stars (`phucbm-web`'s `/stats` page already does all three; reuse its logic).
- Books: Goodreads RSS (as `phucbm-web` does).
- Notes, projects: from the content catalog.
- Rebuilt on every deploy; a scheduled rebuild (GitHub Actions cron, e.g. daily) keeps the numbers fresh between posts. *Superseded by plan 002: refreshed on visit, no scheduled rebuild.*

## MCP and Ask (deferred)

*Superseded 2026-10-12 for Ask by perxel-web-2026 plan 018 (`@perxel/spotlight`): this site's Ask runs on its own Worker from its pages (`contentSource`) and live data (`toolSource`), no MCP. An MCP for the site (below) stays possible later, from the kit, if other agents should reach its data.*

Deferred 2026-10-11: content and layout first; picked up after launch. Same infra as Perxel: the perxel-mcp kit (`kit/core`, `kit/ask`), deployed a second time.

- `phucbm-mcp` Worker at `mcp.phucbm.com`, its own `mcp.config.ts` (`slug`, tools, `ask` with `allowedOrigins: ["https://phucbm.com"]`, a personal system prompt, handoff to email and socials).
- Tools: search notes, get an item, list packages, get stats; reads this site's `/content.json`.
- Site side: Ask launcher and panel copied from perxel-web-2026, restyled to this site.
- To decide: copy the kit into a new repo (the kit's own update path, `kit/update`) or make perxel-mcp serve two sites. Default: a new repo, since the kit is built for one deployment per config.

## Migration

- From `phucbm-web`: posts (2), bookmarks, Goodreads, now, uses, colophon, stats logic, shipped list, component pages (link to ui.phucbm.com instead of copying).
- From `folio-2026`: about text, project images (`src/assets/images`), the four project entries (they become Perxel or Archived entries).
- Archived projects: a dozen ViiVue projects, written fresh (owner supplies the list and screenshots).
- Redirects from old URLs (phucbm-web's posts and component pages, folio-2026's `/work/*`) so nothing indexed 404s.

## Parts

1. ~~Scaffold: Next 16 static, fonts, tokens, layout shell, deploy to a preview URL.~~ Done 2026-10-11: Next 16.3.8 static export, Cloudflare static assets (`wrangler.toml`, worker `phucbm-com-2026-vol2`), Source Serif 4 / Source Sans 3 / IBM Plex Mono self-hosted (`.claude/docs/performance.md`), tokens in `app/globals.css`, running head + colophon, placeholder home and 404.
2. ~~Content engine + lint + skills ported.~~ Done 2026-10-11: collections `notes` and `archived` (MDX, frontmatter via `content/meta.generated.json`), pure catalog with tests, `content:lint` + hook, `copywriting` and `visuals` skills rewritten for this site, visuals runner with `gallery` and `code` templates, `/content.json`, `/sitemap.xml`, `/llms.txt`, `/feed.xml`, `/robots.txt`. Details: `.claude/docs/content.md`.
2b. ~~Move the existing content over.~~ Done 2026-10-11: N-001 (How I Built My Blog, grammar revised with the owner's approval), `/notes` + entry route, `/now` (rewritten: Perxel, OpenWallet, OpenRace, open to new opportunities), `/uses`, `/colophon` (rewritten for this stack; the old design-inspirations list dropped, the design is the owner's own idea), `/perxel` (the four folio-2026 projects are all Perxel case studies: one line each in `data/perxel.ts`), the about text on the home page, contact links. Skipped: the WordPress-stacks post (an outline only, and client-facing: Perxel), Tina's demo post.
3. ~~Home page (abstract, Table 1, contents) and the design system written down (`.claude/docs/design.md`).~~ Done 2026-10-11: abstract drafted (`content/pages/abstract.mdx`, replaces the old about text, awaiting the owner's approval), Table 1 from `lib/numbers.ts` (notes and projects counted; commits, books, packages blank until part 6), contents with dot leaders and counts, `.claude/docs/design.md`. Figure 0 waits for part 6.
4. ~~`/archived` + entry pages.~~ Built 2026-10-11: listing (figures in a two-column grid, caption below the plate), entry page (plate, facts table, body), 20 `draft` placeholders. The text waits on the owner (carried over); the Perxel link to it is carried over too.
5. ~~`/notes` + the first few notes.~~ Drafted 2026-10-11, all `draft` (preview only) until the owner reads them: N-002 rebuilding as a research paper, N-003 Figure 0's pluck, N-004 the font cut. Facts from the plan, the code and `performance.md` only. `/colophon` links N-003: publish it before launch or drop the link.
6. ~~Data pipeline: Table 1, `/stats`, `/oss`, `/reading`, Figure 0.~~ Done 2026-10-11: `pnpm data` (`scripts/data/fetch.mjs` → `data/live.generated.json`, committed), Table 1 all measured (Perxel's this-year cell blank: no dates), Figure 0 (contributions per week, pluckable, `components/plots/`), `/stats` (Figure 0, Table S1 commits per year, Figure S1 books per year, Figure S2 npm downloads per month), `/oss` Table 2 + Table 3 (every npm package), `/reading` and `/references` filled, section nav in the running head, daily rebuild workflow (`.github/workflows/rebuild.yml`, idle until its secrets are set). Details: `.claude/docs/content.md`, "Outside data".
7. ~~Remaining pages and migration + redirects.~~ Done 2026-10-11 (ahead of 5 and 6, owner: see the full site first): `/oss` (§4, Table 2, repo list from phucbm-web's /shipped in `data/oss.ts`), `/reading` (§5), `/references` (§6), `/stats`, `/errata` (`data/errata.ts`), all in `staticRoutes`; Table 1 rows link to them. Filled by part 6 (`lib/live.ts`); a source never fetched shows a visible `[TODO: ...]` (`Pending` in `components/content/Table.tsx`). Redirects in `public/_redirects` (folio-2026 and phucbm-web URLs), checked on the preview. Intro lines on the new pages are drafts awaiting the owner's approval.
Not in this plan: launch (point phucbm.com here, archive the old repos) and MCP + Ask. Both go to later plans.

## Carried over

Launched on phucbm.com 2026-10-12 (plan 002). What is left, for the next plan. Nothing here blocks a deploy.

**Waiting on the owner**
- Archived text: `intake/archived.md` (gitignored), one block per project. Then draft the 20 entries, renumber figures by year (oldest first; `year` is optional until then), and redo the plates (`public/images/archived/<slug>-plate.webp`, quick hand crops of Perxel's captures) as `visuals` recipes. RMIT Experience Day 2023 has no capture (maybe `rmit-2024.jpg`). All 20 are in Perxel's `perxel-web-2026/data/portfolio/projects.ts` (minus Growtrics, Perxel's).
- Copy to read: the abstract (the "tables more than hero banners" line), the intro lines on `/archived`, `/oss`, `/reading`, `/references`, notes N-002 to N-004 (drafts), the Data section on `/colophon` (links N-003: publish it or drop the link).
- ~~Daily rebuild~~: deleted 2026-10-12 (plan 002, refresh on visit).
- GA4 measurement ID (load it as perxel-web-2026 does: first input or after 15 s).
- Not checked in a browser yet, even after launch: the whole site, and Figure 1's pluck (needs a mouse on an `lg` screen). Ask the owner before driving Chrome.
- One of the two notes is a draft, so the live site lists one note.
- Old projects not cleaned up yet (owner to decide): the `phucbm/phucbm.com` repo (last commit 2026-05-07), folio-2026's TinaCMS Cloud project if there is one, and the old workflow's GitHub Actions secrets.

**At launch**
- ~~Confirm which Worker serves phucbm.com~~: it was `phucbm-com-2026` (folio-2026). Launched 2026-10-12: the custom domain moved to `phucbm-com-2026-vol2` (`routes` in `wrangler.toml`); the old Worker and its `phucbm-com-2026-session` KV deleted.
- ~~Drop `SHOW_DRAFTS=1` from the `deploy` script~~: done 2026-10-12; only `published` entries build and `robots.txt` allows crawling. `SHOW_DRAFTS=1 pnpm run deploy` would put drafts on the live site: don't.
- ~~`scripts/visuals/cli.mjs` `ORIGIN`~~: https://phucbm.com (2026-10-12).
- The archived link on perxel.com: one link from `/works`, or one per project (Perxel copy, its own `copywriting` skill).
- ~~Archive `folio-2026` and `phucbm-web`~~: archived on GitHub 2026-10-12.

**Notes worth keeping**
- Cloudflare `_redirects`: a specific path loses to a splat on the same prefix (`/posts/x` went to `/posts/*`'s target), so old URLs are listed one by one where it matters.
- npm account is `phucbui96`; Goodreads user id `91506536` (both in `scripts/data/fetch.mjs`).
- ViiVue dates (LinkedIn, checked 2026-10-11): Sep 2017 to Jul 2025. Intern Sep-Nov 2017, part-time Dec 2017-May 2018, full-stack developer Jun 2018-Dec 2021, lead front-end developer Dec 2021-Jul 2025. Perxel freelance from Apr 2022 (overlapping), full-time from Mar 2026.
- The repo will be open source: no secrets, private data or local paths in commits.
- An entry route can only exist with its first `.mdx` (`.claude/docs/content.md`); every page goes in `staticRoutes` (`lib/routes.ts`).
- Deploy with `pnpm run deploy` (`pnpm deploy` is pnpm's built-in); wrangler is logged in as the owner's account. It deploys to phucbm.com since launch.

## Decided (2026-10-11)

- English only (fonts still carry Vietnamese glyphs for project and place names).
- `/archived` and `/perxel` merged into `/projects` (§2): one flat list by date (where it was done is a label on the row); title, month, role, one line, link. No entry pages or images. The archived MDX placeholders and plates are gone; intake/archived.md now only feeds `data/projects.ts`.
- ui.phucbm.com is offline (2026-10-11): not mentioned anywhere, `/components` redirects to `/oss` until it is back.
- Every listing's number is an alias derived from the date at build time (`N-`, `P-`, `B-`, `R-`; `lib/aliases.ts`); the slug is the ID. Notes lost their authored `number`. Rule in `.claude/docs/content.md`.
- MCP + Ask deferred until after launch: content and layout first.
- No newsletter for now.
- Bookmarks: keep the Discord channel feed from `phucbm-web`.
- Analytics: GA4 (owner provides the measurement ID). Load it the way perxel-web-2026 does (on first input or after 15 s), and no cookie banner unless the GA4 setup needs one.

## Open questions

Moved to "Carried over" (at launch).
