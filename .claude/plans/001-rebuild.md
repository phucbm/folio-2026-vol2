# 001 — Rebuild phucbm.com (folio 2026 vol. 2)

Status: part 1 done (2026-10-11), preview at https://phucbm-com-2026-vol2.bmp.workers.dev. Written 2026-10-11.

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
| 2 | `/archived` | ViiVue work 2018–2024, about a dozen projects, as figures (plate, caption, year). **Linked from perxel.com** | `/archived/[slug]`: screenshot(s), 2–3 paragraphs, stack, year, what I learned. Not a full case study |
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
2. Content engine + lint + skills ported.
3. Home page (abstract, Table 1, contents) and the design system written down (`.claude/docs/design.md`).
4. `/archived` + entry pages, then the Perxel link to it.
5. `/notes` + the first few notes.
6. Data pipeline: Table 1, `/stats`, `/oss`, `/reading`, Figure 0.
7. Remaining pages (`/perxel`, `/references`, `/now`, `/uses`, `/colophon`, `/errata`) and migration + redirects.
8. Launch: point phucbm.com here, archive the old repos.
9. Later: MCP + Ask (deferred, see above).

## Next session

- Start part 2 (content engine + lint + skills, from perxel-web-2026: `/Users/bmp/PHUC-LOCAL/perxel/perxel-web-2026`).
- The preview is still the placeholder; the owner noticed it has no content yet. Ask at the start whether to move the existing content over (about, now, uses, colophon, the 2 phucbm-web posts, the four folio-2026 projects) right after part 2, ahead of parts 3–6, so the preview fills up sooner.
- Part 1 notes: `next/font` preloads every file in a family, so the sans italic is a separate family (`lib/fonts.ts`, the `em/i/cite` rule in `app/globals.css`). Deploy with `pnpm deploy`; wrangler is logged in as the owner's account.

## Decided (2026-10-11)

- English only (fonts still carry Vietnamese glyphs for project and place names).
- MCP + Ask deferred until after launch: content and layout first.
- No newsletter for now.
- Bookmarks: keep the Discord channel feed from `phucbm-web`.
- Analytics: GA4 (owner provides the measurement ID). Load it the way perxel-web-2026 does (on first input or after 15 s), and no cookie banner unless the GA4 setup needs one.

## Open questions

- Which repo serves phucbm.com today (`folio-2026` as the `phucbm-com-2026` Worker, or `phucbm-web`)? Decides the redirect list and the cutover.
- Archived on perxel.com: one link from `/works`, or per-project links? (Perxel copy, `copywriting` skill applies there.)
- The list of ViiVue projects and their screenshots (owner, before part 4).
- GitHub "private contributions" must be on in the profile for Table 1's commit count to include private repos.
