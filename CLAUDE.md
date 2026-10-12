# phucbm.com (folio 2026 vol. 2)

Plan and status: `.claude/plans/001-rebuild.md`, then `.claude/plans/002-live-data.md` (OpenNext, numbers refreshed on visit).

## Commands
- `pnpm dev`, `pnpm build` (`next build`, then `scripts/check-paper.mjs` and `scripts/check-seo.mjs` on the prerendered pages in `.next/server/app`: fail on broken paper rules or missing search metadata), `pnpm typecheck`
- `pnpm cf:build` (OpenNext: `pnpm build`, then `.open-next/`), `pnpm preview` (that, in `wrangler dev`)
- `pnpm test`: Vitest, the content catalog only (`lib/content/catalog.ts`). Not a general test suite.
- `pnpm content:lint [files]`: prose and frontmatter rules for `content/notes/*.mdx`; runs on every `.mdx` write through the hook in `.claude/settings.json`.
- `pnpm visuals <inventory|status|build>`: images for entries (the `visuals` skill).
- `pnpm data [github npm wordpress goodreads discord]`: run every data job into the seed, `data/live.generated.json` (committed; a failed job keeps its last value). The live site refreshes on its own; this is only the fallback and the dev data.
- `pnpm run deploy`: `pnpm cf:build`, then deploy the Worker (`pnpm deploy` alone is pnpm's own command). Only when the code or content changes: no scheduled deploy. A push to `main` runs it in `.github/workflows/deploy.yml` (secret `CLOUDFLARE_API_TOKEN`).

## Search and Ask
- `@perxel/spotlight` (perxel-web plan 018; until 0.1.0 a pnpm `injected` copy of `../../perxel/perxel-spotlight`: after changing the package run its `scripts/sync.sh`). Search documents: `lib/search.ts`, served as `/search.json`. Ask: `app/api/ask/route.ts` (the pages through `contentSource`, the live numbers through `lib/ask/tools.ts`), stateless, nothing stored. Secrets `OPENROUTER_API_KEY`, `TURNSTILE_SECRET` (Worker secrets in production; `.dev.vars` for `pnpm preview`; `next dev` reads `process.env`, so put them in `.env.local` to try Ask there).

## Rules
- pnpm only. Never edit `.next/`, `.open-next/` or the `*.generated.json` files.
- OpenNext on Cloudflare Workers (plan 002). Every page is prerendered; the five with outside numbers (`/`, `/stats`, `/oss`, `/reading`, `/references`) set `revalidate = 3600`. No `fs` at runtime: a Worker has no disk.
- **All copy: load the `copywriting` skill before writing, revising or reviewing.** It is the only place writing rules live.
- **Structure (pages, sections, tables, figures, lists, labels): load the `paper` skill.** `.claude/hooks/content-lint.mjs` reminds you of both.
- No code lint (ESLint/Prettier); don't add one.

@.claude/docs/content.md
@.claude/docs/performance.md
@.claude/docs/design.md
