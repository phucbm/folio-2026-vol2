// Runs every data job (`lib/live/jobs.ts`, plan 002) with no request budget and writes the seed,
// `data/live.generated.json`. The live site keeps its numbers in KV and refreshes them on visits
// (`worker/index.ts`); the seed is what a fresh deploy, `pnpm dev` and an empty KV start from. Per
// job, the newer of the seed and KV wins, so a fresher seed still counts after a deploy.
//
//   pnpm data              every job
//   pnpm data github npm   only those ("github" includes jsDelivr's GitHub route, "npm" each package)
//
// Tokens: GITHUB_TOKEN (falls back to `gh auth token`), DISCORD_BOT_TOKEN + DISCORD_CHANNEL_ID
// (in .env.local). A job without its token is skipped and keeps its last value.
import { execSync } from "node:child_process"
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { emptyStore, mergeStores, refresh } from "../../lib/live/jobs.ts"
import { ossRepoPaths } from "../../data/oss.ts"

const OUT = "data/live.generated.json"

function githubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN
  try {
    return execSync("gh auth token", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()
  } catch {
    return undefined
  }
}

const env = {
  GITHUB_TOKEN: githubToken(),
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID,
}
for (const [key, value] of Object.entries(env)) if (!value) console.warn(`data: no ${key}, its jobs keep their last value`)

const seed = existsSync(OUT) ? mergeStores(JSON.parse(readFileSync(OUT, "utf8")), null) : emptyStore()
const only = process.argv.slice(2)
const { store, ran, failed, requests } = await refresh(seed, {
  env,
  ossRepos: ossRepoPaths,
  staleMs: 0,
  only: only.length ? only : undefined,
  log: (message) => console.warn(`data: ${message}`),
})
writeFileSync(OUT, JSON.stringify(store, null, 2) + "\n")
console.log(`data: ${ran.length} jobs ran, ${failed.length} failed, ${requests} requests; wrote ${OUT}`)
