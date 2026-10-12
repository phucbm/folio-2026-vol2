# phucbm.com

**Abstract.** This is the source of [phucbm.com](https://phucbm.com), my personal site, set like a research paper: numbered sections, an abstract, results as tables, plots in matplotlib's colours. I built it with Claude Code in two days, from the first plan to launch. This README is the methods section.

> My last two sites looked like a template and a terminal. This one looks like something you'd cite.

## §1 The stack

| Part | What | Why |
|---|---|---|
| Framework | Next.js 16, App Router, TypeScript, Tailwind 4 | Same stack as [perxel.com](https://perxel.com), so I could copy its content engine instead of porting it |
| Content | MDX in `content/`, frontmatter linted | Writing is a file and a commit, no CMS |
| Hosting | Cloudflare Workers through [OpenNext](https://opennext.js.org/cloudflare), free plan | Every page is prerendered; five of them render again hourly |
| Data | GitHub, npm, jsDelivr, WordPress.org, Goodreads, Discord | The numbers are fetched, never typed |
| Storage | Two KV namespaces | OpenNext's page cache, and the fetched numbers |
| Type | Source Serif 4, Source Sans 3, IBM Plex Mono | One job each: titles, reading, numbers |

## §2 Decisions worth stealing

- **Numbers refresh when someone visits.** After a page is served, the Worker runs the data jobs older than a day (`worker/index.ts`), within the free plan's request budget, behind a KV lock. No cron, no daily deploy. A job that fails keeps its last value.
- **A committed seed.** `data/live.generated.json` holds the same data as KV, so `pnpm dev` and the build work with no tokens at all.
- **The build checks the paper.** `scripts/check-paper.mjs` fails the build on a table numbered out of order or an outside link that doesn't open a new tab. `scripts/check-seo.mjs` fails it on a page without a unique title, description or share card.
- **No `fs` at runtime.** A Worker has no disk, so collections list their files by hand and frontmatter is read from a generated JSON.
- **Fonts cut down by hand.** Three self-hosted faces, subset to latin and Vietnamese. The commands are in `.claude/docs/performance.md`.
- **Still by default.** One thing moves: the weekly line on `/stats`, which you can pluck with a mouse.

## §3 How I build with AI

Every commit here was written with Claude Code. The trick isn't the model, it's what the repo tells it.

- **Plans first.** `.claude/plans/` holds one file per big change: why, the shape, numbered steps, what's left. Claude works through the steps and crosses them off; I read the plan, not the diff.
- **Docs as the rulebook.** `CLAUDE.md` points to `.claude/docs/` (content model, design tokens, performance). These are the docs a new teammate would need, so the model gets the same ones.
- **Skills for repeat work.** `copywriting` (my voice, banned words, what goes on this site vs. Perxel's), `paper` (sections, tables, figures, labels), `visuals` (images from re-runnable recipes).
- **Hooks that say no.** `.claude/hooks/content-lint.mjs` lints every `.mdx` the model writes and blocks the turn on an error, so no em dashes, buzzwords or made-up note numbers get through.
- **Checks over trust.** The model can't ship a broken table or a page without metadata, because the build fails first.
- **I keep the words.** Claude drafts copy; I approve it. Facts it doesn't have become a visible `[TODO: ...]`, not a guess.

## §4 Make your own

```sh
pnpm install
pnpm dev          # runs on the committed seed, no tokens needed
pnpm build        # next build, then the paper and SEO checks
```

To put your own version online:

1. Swap in your names: `lib/site.ts` (you, your links), the user names at the top of the jobs in `lib/live/jobs.ts`, `data/oss.ts` and `data/projects.ts`.
2. Delete my notes in `content/notes/` and list yours in `content/notes/index.ts`.
3. Create two KV namespaces (`pnpm exec wrangler kv namespace create LIVE`, same for `NEXT_INC_CACHE_KV`) and put their ids in `wrangler.toml`.
4. Add `GITHUB_TOKEN` (and the Discord ones, if you bookmark there) with `pnpm exec wrangler secret put`, and in `.env.local` for `pnpm data`.
5. `pnpm run deploy`, or push to `main` with `CLOUDFLARE_API_TOKEN` set in GitHub Actions (`.github/workflows/deploy.yml`).

The code is [MIT](LICENSE): take it. The writing and the data in `content/` and `data/` are mine, so bring your own.

## §A Commands

| Command | Does |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm typecheck` | The usual |
| `pnpm test` | Vitest, the content catalog only |
| `pnpm content:lint [files]` | Prose and frontmatter rules for notes |
| `pnpm data [job…]` | Run the data jobs into the seed |
| `pnpm visuals <inventory\|status\|build>` | Images for notes |
| `pnpm preview` | The OpenNext build in `wrangler dev` |
| `pnpm run deploy` | Build and deploy the Worker (`pnpm deploy` alone is pnpm's own command) |
