import { getCloudflareContext } from "@opennextjs/cloudflare"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { contentSource, createAskHandler, toolSource, turnstile, type AskContext } from "@perxel/spotlight/server"
import { site } from "@/lib/site"
import { searchDocs } from "@/lib/search"
import { askInstructions } from "@/lib/ask/prompt"
import { liveTools } from "@/lib/ask/tools"
// Full text of every note: only server routes may import it (here and content.json).
import bodies from "@/content/body.generated.json"

// Ask (perxel-web plan 018, phucbm.com side): no MCP, no storage. The model reads the site's own
// pages (`contentSource`: the search documents plus the notes' full text) and its live numbers
// (`liveTools`). Stateless: the visitor's browser sends the conversation, nothing is kept or logged
// here. Turnstile on every question and a per-IP limit, since every answer spends the OpenRouter key.

interface AskEnv {
  OPENROUTER_API_KEY?: string
  TURNSTILE_SECRET?: string
  ASK_RATE_LIMITER?: { limit: (o: { key: string }) => Promise<{ success: boolean }> }
}

function env(): AskEnv {
  try {
    return getCloudflareContext().env as unknown as AskEnv
  } catch {
    return process.env as unknown as AskEnv
  }
}

const docs = searchDocs().map((doc) => (doc.kind === "note" ? { ...doc, body: (bodies as Record<string, string>)[`notes/${doc.id.slice(5)}.mdx`] } : doc))

const handler = createAskHandler({
  model: () => createOpenRouter({ apiKey: env().OPENROUTER_API_KEY })("anthropic/claude-haiku-5.5", { usage: { include: true }, provider: { data_collection: "deny" } }),
  system: askInstructions,
  sources: [contentSource({ docs, baseUrl: site.url, about: "phucbm.com (my notes, projects and pages)" }), toolSource(liveTools())],
  verify: (ctx: AskContext) => turnstile({ secret: env().TURNSTILE_SECRET })(ctx),
  rateLimit: async (ctx) => {
    const limiter = env().ASK_RATE_LIMITER
    const ip = ctx.request.headers.get("cf-connecting-ip")
    return !limiter || !ip || (await limiter.limit({ key: ip })).success
  },
  // Dev only: the numbers per turn (tokens, time), for comparing with perxel.com's. Never the text.
  ...(process.env.NODE_ENV === "development"
    ? { onFinish: (t) => console.log(`[ask] ${t.tools.map((x) => x.name).join(",") || "no tools"} in=${t.usage.inputTokens} out=${t.usage.outputTokens} ${t.timing.totalMs}ms`) }
    : {}),
})

export const POST = handler

/** A wake-up call: the box sends one when it opens, so the Worker is warm when Enter is pressed. */
export function GET() {
  return new Response(null, { status: 204, headers: { "cache-control": "no-store" } })
}
