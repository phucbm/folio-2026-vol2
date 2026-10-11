import { defineCloudflareConfig } from "@opennextjs/cloudflare"
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache"
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue"

// Every page is prerendered; the five with outside numbers set `revalidate` and render again at most
// hourly, on a visit (plan 002). KV holds the cache (R2 would need the account's R2 turned on); the
// memory queue is enough for one site's traffic. No tag cache: nothing calls `revalidatePath`.
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  queue: memoryQueue,
  // Answer cached pages before loading the Next server, which is what makes a cold start slow.
  enableCacheInterception: true,
})
