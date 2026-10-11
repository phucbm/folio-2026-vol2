# 002: Live data, refreshed on visit

Status: **live on phucbm.com 2026-10-12.** Waiting on the owner's `GITHUB_TOKEN` (below). The rest of what is open: plan 001, "Carried over". Owner asked (2026-10-12): no daily deploy; the numbers refresh when someone visits, on Cloudflare's free plan.

## Why

Plan 001 made every page static (`output: "export"`) and redeployed daily from GitHub Actions (`.github/workflows/rebuild.yml`) to keep the outside numbers fresh. That was a default, not an owner decision. The owner finds the daily deploy annoying.

## Shape

- **OpenNext** (`@opennextjs/cloudflare`, as perxel-web-2026). Every page is still prerendered at build. The five pages that read outside numbers (`/`, `/stats`, `/oss`, `/reading`, `/references`) set `revalidate = 3600`: served from the cache, rendered again at most once an hour, on a visit (stale-while-revalidate). Incremental cache: KV (`NEXT_INC_CACHE_KV`); queue: OpenNext's memory queue (`WORKER_SELF_REFERENCE`). No tag cache: nothing calls `revalidatePath`.
- **The data lives in KV** (`LIVE`, key `live`), in the same format as the committed seed `data/live.generated.json`: one entry per *job*, each with its own `fetchedAt`. `getLive()` (`lib/live.ts`) merges the two, job by job, the newer wins, so a deploy with a fresher seed still counts and an empty KV falls back to the seed.
- **Refresh on visit** (`worker/index.ts`, wrapping OpenNext's worker): a GET that reaches the Worker starts, after the response (`ctx.waitUntil`), one batch: the jobs older than a day, oldest first, up to 45 outside requests (the free plan allows 50 per request). A KV lock stops two visits running the same batch. A job that fails keeps its last value.
- **Jobs** (`lib/live/jobs.ts`, shared by the Worker and `pnpm data`, no Node or Next imports): `github` (one GraphQL call: contributions per year, the `/oss` repos, the public repos), `cdn:<owner/repo>` (jsDelivr, GitHub route), `npm` (the package list), `npm:<name>` (downloads since the start of last month, merged into its monthly history; jsDelivr), `wordpress`, `goodreads`, `discord`. Past years and past months are kept, so a daily job is one or two requests.
- **`pnpm data`** runs every job with no budget and writes the seed. Optional now: the seed is the fallback and the dev data.
- **Checks**: `check-paper` and `check-seo` read the prerendered HTML in `.next/server/app` instead of `out/`.
- Share cards are copied into the static assets after the build (`scripts/cf-assets.mjs`): `lib/og.tsx` reads fonts from disk, which a Worker has none of.

## Steps

1. ~~Plan.~~
2. ~~Jobs module, store format, migration of the committed seed; `pnpm data` on it.~~ Same numbers as the old file, every row.
3. ~~`getLive()` and the pages (async, `revalidate`).~~
4. ~~OpenNext config, `wrangler.toml`, Worker wrapper, KV namespaces, scripts, checks.~~
5. ~~Build, preview, deploy.~~ Locally (`wrangler dev`, `revalidate = 60` for the test): a visit refreshed KV, the next render after a minute showed it. On the preview Worker: a batch is 43 jobs and 43 requests, 69 ms CPU, outcome ok; pages 7 to 30 ms CPU, the 404 about 280 ms; bundle 2.0 MB gzipped (free plan limit 3 MB).
6. ~~Delete `.github/workflows/rebuild.yml`; docs; plan 001's stack line.~~
7. ~~Copy that said "every deploy"~~ (Table 1's caption, `/stats`, `/colophon`): rewritten, owner approved.
8. ~~Launch~~ (owner, 2026-10-12, without a browser check): see plan 001, "At launch".

## Owner

- `GITHUB_TOKEN` Worker secret (`pnpm exec wrangler secret put GITHUB_TOKEN`): a fine-grained read-only token of the owner's, so private contributions count. Until then the `github` job keeps the seed's numbers. The Discord secrets are set (2026-10-12).
- The GitHub Actions secrets of the old workflow can go.

## Risks

- Free plan: 10 ms CPU per request. Rendering a page again and parsing the data cost more than that in the worst case; Cloudflare has been lenient with perxel-web's runtime work. Watch `wrangler tail` for `exceededCpu`; the fallback is the $5 plan, no code change.
- Cold start: the OpenNext Worker is large; a visit that wakes it can take a second or two (perxel-web measured 0.5 to 2.8 s). `enableCacheInterception` answers cached pages without loading Next.
