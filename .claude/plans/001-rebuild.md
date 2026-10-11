# 001 — Rebuild phucbm.com (folio 2026 vol. 2)

Status: parts 1, 2, 2b and 3 done, part 4 layout in, entries waiting on the owner's intake (2026-10-11), preview at https://phucbm-com-2026-vol2.bmp.workers.dev. Written 2026-10-11.

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
- **Motion:** one live element, *Figure 0*, a real plot from my own data (commits per week), drawn like a matplotlib chart, pluckable like Perxel's `WaveLine`. Everything else still. Pointer effects behind `FINE_POINTER`, off under reduced motion (Perxel's rules).

### Home page

No lists of latest items. The home page is the paper's front matter:

1. Name, one line, the abstract (who I am, what this is; playful, the voice carries the warmth).
2. **Table 1**, the numbers: this year and all time, for commits, notes, books, projects (archived / Perxel), packages (and downloads per month). Each row links to the section that backs it.
3. Figure 0.
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

- Next.js 16 (App Router, TypeScript, Tailwind 4, pnpm), **static export** (`output: "export"`) on Cloudflare static assets. No OpenNext and no front Worker: every page is static, and anything dynamic (Ask, forms) lives on the MCP Worker.
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
- Rebuilt on every deploy; a scheduled rebuild (GitHub Actions cron, e.g. daily) keeps the numbers fresh between posts.

## MCP and Ask (deferred)

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

## Parts (one per turn, each confirmed before the next)

1. ~~Scaffold: Next 16 static, fonts, tokens, layout shell, deploy to a preview URL.~~ Done 2026-10-11: Next 16.3.8 static export, Cloudflare static assets (`wrangler.toml`, worker `phucbm-com-2026-vol2`), Source Serif 4 / Source Sans 3 / IBM Plex Mono self-hosted (`.claude/docs/performance.md`), tokens in `app/globals.css`, running head + colophon, placeholder home and 404.
2. ~~Content engine + lint + skills ported.~~ Done 2026-10-11: collections `notes` and `archived` (MDX, frontmatter via `content/meta.generated.json`), pure catalog with tests, `content:lint` + hook, `copywriting` and `visuals` skills rewritten for this site, visuals runner with `gallery` and `code` templates, `/content.json`, `/sitemap.xml`, `/llms.txt`, `/feed.xml`, `/robots.txt`. Details: `.claude/docs/content.md`.
2b. ~~Move the existing content over.~~ Done 2026-10-11: N-001 (How I Built My Blog, grammar revised with the owner's approval), `/notes` + entry route, `/now` (rewritten: Perxel, OpenWallet, OpenRace, open to new opportunities), `/uses`, `/colophon` (rewritten for this stack; the old design-inspirations list dropped, the design is the owner's own idea), `/perxel` (the four folio-2026 projects are all Perxel case studies: one line each in `data/perxel.ts`), the about text on the home page, contact links. Skipped: the WordPress-stacks post (an outline only, and client-facing: Perxel), Tina's demo post.
3. ~~Home page (abstract, Table 1, contents) and the design system written down (`.claude/docs/design.md`).~~ Done 2026-10-11: abstract drafted (`content/pages/abstract.mdx`, replaces the old about text, awaiting the owner's approval), Table 1 from `lib/numbers.ts` (notes and projects counted; commits, books, packages blank until part 6), contents with dot leaders and counts, `.claude/docs/design.md`. Figure 0 waits for part 6.
4. `/archived` + entry pages, then the Perxel link to it. In progress: layout and 20 placeholder drafts done, text waits on `intake/archived.md`.
5. `/notes` + the first few notes.
6. Data pipeline: Table 1, `/stats`, `/oss`, `/reading`, Figure 0.
7. Remaining pages (`/perxel`, `/references`, `/now`, `/uses`, `/colophon`, `/errata`) and migration + redirects.
8. Launch: point phucbm.com here, archive the old repos.
9. Later: MCP + Ask (deferred, see above).

## Next session

- Part 4 in progress (committed 2026-10-11): `app/archived/page.tsx` (figures in a two-column grid, caption below the plate), `app/archived/[slug]/page.tsx` (plate, a facts table, the body), `/archived` in `staticRoutes` as §2. The intro line on `/archived` is a draft awaiting the owner's approval. Not deployed: the build fails while every entry is a draft (below).
- Projects: all 20 in Perxel's `perxel-web-2026/data/portfolio/projects.ts` with `role: "Lead Frontend Developer"`, minus Growtrics (it is Perxel's). Figures numbered by year, oldest first. Plates from Perxel's captures (`public/projects/` there: full-page desktop and mobile JPGs, some MP4s), through `visuals` recipes; RMIT Experience Day 2023 has none (maybe `rmit-2024.jpg`).
- The 20 entries exist as `draft` placeholders (`[TODO]` bodies, figures in Perxel's list order, renumber by year once known; `year` is optional now). Their plates (`public/images/archived/<slug>-plate.webp`) are quick top crops of Perxel's captures, made by hand for the layout check: redo them as `visuals` recipes. `pnpm build` fails until at least one entry is `published` (an export needs one static param).
- Waiting on the owner: `intake/archived.md` (gitignored), one block per project (year, url, role, team, stack, what, notes, show). Draft the entries from it, show them, then make the plates.
- ViiVue dates (LinkedIn, checked 2026-10-11): Sep 2017 to Jul 2025. Intern Sep-Nov 2017, part-time Dec 2017-May 2018, full-stack developer Jun 2018-Dec 2021, lead front-end developer Dec 2021-Jul 2025. Perxel freelance from Apr 2022 (overlapping), full-time from Mar 2026.
- Part 3 is committed but not deployed: `pnpm run deploy` to see it on the preview, and look at the home page in a browser (not checked visually yet).
- Abstract draft to confirm: the "tables more than hero banners" line.
- Done after part 3 (owner's go-ahead): `/uses` grammar, yt-dlp link now points to yt-dlp, "300+" dropped with the old about text.
- The repo will be open source: no secrets, private data or local paths in commits.
- `/archived/[slug]` can only be added together with its first `.mdx` (see `.claude/docs/content.md`). Add each new page to `staticRoutes` in `lib/routes.ts`.
- `scripts/visuals/cli.mjs` captures the preview by default (`ORIGIN`); switch it to https://phucbm.com at launch (part 8).
- Part 1 notes: `next/font` preloads every file in a family, so the sans italic is a separate family (`lib/fonts.ts`, the `em/i/cite` rule in `app/globals.css`). Deploy with `pnpm run deploy` (`pnpm deploy` is pnpm's built-in); wrangler is logged in as the owner's account.

## Decided (2026-10-11)

- English only (fonts still carry Vietnamese glyphs for project and place names).
- MCP + Ask deferred until after launch: content and layout first.
- No newsletter for now.
- Bookmarks: keep the Discord channel feed from `phucbm-web`.
- Analytics: GA4 (owner provides the measurement ID). Load it the way perxel-web-2026 does (on first input or after 15 s), and no cookie banner unless the GA4 setup needs one.

## Open questions

- Which repo serves phucbm.com today (`folio-2026` as the `phucbm-com-2026` Worker, or `phucbm-web`)? Decides the redirect list and the cutover.
- Archived on perxel.com: one link from `/works`, or per-project links? (Perxel copy, `copywriting` skill applies there.)
- GitHub "private contributions" must be on in the profile for Table 1's commit count to include private repos.
