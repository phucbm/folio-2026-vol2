// The site's Worker (plan 002): OpenNext's, plus the refresh on visit. A GET that reaches the Worker
// (any page; static files never do) answers first, then, if a data job is due, runs one batch of due
// jobs (`lib/live/jobs.ts`) and saves the numbers to KV. The pages that show them render again within
// the hour (`revalidate`) and read them from there (`lib/live.ts`).
// @ts-ignore: written by `opennextjs-cloudflare build`.
import handler from "../.open-next/worker.js"
import seed from "../data/live.generated.json"
import { mergeStores, nextDue, refresh, type Env as JobsEnv, type Store } from "../lib/live/jobs"
import { ossRepoPaths } from "../data/oss"
import type { KV } from "../lib/live"

interface Env extends JobsEnv {
  LIVE: KV
}
interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void
}

// The free plan allows 50 outside requests per invocation; a few stay free for the page itself.
const BUDGET = 45
// One batch at a time: two visits close together would fetch the same jobs.
const LOCK_TTL = 120
// When the next job falls due, so a visit before then costs no KV read. Per isolate.
let due = 0
// The due time is kept per deploy: a new seed or a repo added to /oss can make a job due sooner.
const dueKey = `live:due:${hash(JSON.stringify((seed as Store).fetchedAt) + ossRepoPaths.join())}`

function hash(s: string) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = Math.imul(h, 33) ^ s.charCodeAt(i)
  return (h >>> 0).toString(36)
}

async function refreshLive(env: Env) {
  if (Date.now() < due) return
  // The due time lives in its own small key, read before the whole store.
  const savedDue = Number(await env.LIVE.get(dueKey))
  if (Date.now() < savedDue) {
    due = savedDue
    return
  }
  if (await env.LIVE.get("live:lock")) return
  await env.LIVE.put("live:lock", "1", { expirationTtl: LOCK_TTL })

  const stored = mergeStores(seed as Store, (await env.LIVE.get("live", "json")) as Store | null)
  const { store, ran, failed, requests } = await refresh(stored, {
    env,
    ossRepos: ossRepoPaths,
    budget: BUDGET,
    retries: 2,
    log: (message) => console.warn(`live: ${message}`),
  })
  if (ran.length || failed.length) await env.LIVE.put("live", JSON.stringify(store))
  due = nextDue(store, ossRepoPaths, env)
  await env.LIVE.put(dueKey, String(due), { expirationTtl: 2 * 24 * 60 * 60 })
  console.log(`live: ${ran.length} jobs ran, ${failed.length} failed, ${requests} requests`)
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (request.method === "GET" && env.LIVE) ctx.waitUntil(refreshLive(env).catch((err) => console.error("live:", err)))
    return handler.fetch(request, env, ctx)
  },
}
