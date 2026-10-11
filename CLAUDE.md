# phucbm.com (folio 2026 vol. 2)

Plan and status: `.claude/plans/001-rebuild.md`.

## Commands
- `pnpm dev`, `pnpm build` (static export to `out/`, then `scripts/check-paper.mjs`: fails on broken paper rules), `pnpm typecheck`
- `pnpm test`: Vitest, the content catalog only (`lib/content/catalog.ts`). Not a general test suite.
- `pnpm content:lint [files]`: prose and frontmatter rules for `content/notes/*.mdx`; runs on every `.mdx` write through the hook in `.claude/settings.json`.
- `pnpm visuals <inventory|status|build>`: images for entries (the `visuals` skill).
- `pnpm data [github npm goodreads discord]`: fetch the outside numbers into `data/live.generated.json` (committed; a failed source keeps its last value).
- `pnpm run deploy`: `pnpm data`, build, deploy to Cloudflare (`pnpm deploy` alone is pnpm's own command).

## Rules
- pnpm only. Never edit `out/` or the `*.generated.json` files.
- Every page is static (`output: "export"`). Nothing dynamic on this site; Ask and forms live on the MCP Worker later.
- **All copy: load the `copywriting` skill before writing, revising or reviewing.** It is the only place writing rules live.
- **Structure (pages, sections, tables, figures, lists, labels): load the `paper` skill.** `.claude/hooks/content-lint.mjs` reminds you of both.
- No code lint (ESLint/Prettier); don't add one.

@.claude/docs/content.md
@.claude/docs/performance.md
@.claude/docs/design.md
