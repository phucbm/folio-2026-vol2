# folio-2026-vol2

Source for phucbm.com (rebuild in progress). Plan: `.claude/plans/001-rebuild.md`.

- `pnpm dev` — local dev server
- `pnpm build` — static export to `out/`
- `pnpm test` — catalog tests; `pnpm content:lint` — content rules; `pnpm visuals` — entry images

Content model: `.claude/docs/content.md`. Writing rules: the `copywriting` skill.
- `pnpm run deploy` — build and deploy to Cloudflare (`pnpm deploy` alone is pnpm's built-in workspace command) (preview: https://phucbm-com-2026-vol2.bmp.workers.dev)
