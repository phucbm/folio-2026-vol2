// Every number from outside the repo, fetched in small jobs (plan 002). Shared by the Worker, which
// runs the jobs that are due after a visit (`worker/index.ts`), and `pnpm data`, which runs them all
// and writes the seed (`scripts/data/fetch.mjs`). Plain TypeScript with no imports, so Node runs it
// as is and the Worker bundles it without Next.
//
// A job fetches one part (the GitHub numbers, one repo's jsDelivr hits, one npm package) and keeps
// its last good result in the store with its own `fetchedAt`. Past years and past months never
// change, so a job that ran before makes one or two requests. A job that fails keeps its last value.

// --- The view the pages read (`lib/live.ts`) ---------------------------------------------------------

export interface Book {
  title: string
  author: string
  year?: number
  // The day I finished it, or shelved it when Goodreads has no read date.
  read?: string
  rating?: number
  review?: string
  url: string
}

export interface Reference {
  title: string
  url: string
  source: string
  saved: string
  tags: string[]
}

export interface NpmPackage {
  name: string
  description?: string
  // "owner/name" on GitHub, lowercased.
  repo?: string
  created: string
  downloadsLastMonth: number
  downloadsTotal: number
  jsdelivrHitsLastMonth: number | null
  // Calendar years with any hits. Null until jsDelivr has answered once.
  jsdelivrHitsByYear: Record<string, number> | null
}

export interface RepoStats {
  description?: string
  stars: number
  // Stars by the year they were given.
  starsByYear: Record<string, number>
  url: string
  // "YYYY-MM-DD".
  created: string
  // Commits on the default branch, and the day of the last one.
  commits?: number
  lastCommit?: string
}

export interface WordpressPlugin {
  slug: string
  name: string
  // "YYYY-MM-DD", the day WordPress.org listed it.
  added: string
  // Rounded down by WordPress.org: 1000 means "1,000+".
  activeInstalls: number
  downloads: number
  url: string
}

export interface Live {
  // The newest fetch of any job.
  fetchedAt?: string
  github?: {
    commitsByYear: Record<string, number>
    contributionsPerWeek: { week: string; count: number }[]
    // The last 53 weeks, Sunday first, as on a GitHub profile.
    contributionsPerDay: { date: string; count: number }[]
    repos: Record<string, RepoStats>
    // jsDelivr hits through the GitHub route, by repo ("owner/name") then calendar year.
    jsdelivrHitsByYear: Record<string, Record<string, number>>
  }
  npm?: {
    packages: NpmPackage[]
    // Totals per calendar month, the current (partial) one included; plots drop it.
    downloadsPerMonth: { month: string; downloads: number }[]
  }
  wordpress?: { plugins: WordpressPlugin[] }
  books?: Book[]
  references?: Reference[]
}

// --- The store (KV key `live`, and the seed `data/live.generated.json`) ------------------------------

export interface Store {
  version: 2
  // When each job last succeeded.
  fetchedAt: Record<string, string>
  // Each job's last good result, by job id.
  data: Record<string, unknown>
  // When a job last failed, so it waits an hour before the next try.
  failedAt?: Record<string, string>
}

export const emptyStore = (): Store => ({ version: 2, fetchedAt: {}, data: {}, failedAt: {} })

// Job by job, the newer fetch wins: KV against the seed a deploy brought.
export function mergeStores(a: Store | null | undefined, b: Store | null | undefined): Store {
  const out = emptyStore()
  for (const store of [a, b]) {
    if (store?.version !== 2) continue
    for (const [id, at] of Object.entries(store.fetchedAt)) {
      if (!(id in store.data) || (out.fetchedAt[id] ?? "") >= at) continue
      out.fetchedAt[id] = at
      out.data[id] = store.data[id]
    }
    for (const [id, at] of Object.entries(store.failedAt ?? {})) if ((out.failedAt![id] ?? "") < at) out.failedAt![id] = at
  }
  return out
}

interface GithubData {
  commitsByYear: Record<string, number>
  contributionsPerWeek: { week: string; count: number }[]
  contributionsPerDay: { date: string; count: number }[]
  repos: Record<string, RepoStats>
  // My public repos, for jsDelivr's GitHub route.
  owned: { full: string; created?: string }[]
}
type CdnData = Record<string, number>
interface NpmList { packages: { name: string; description?: string; repo?: string }[] }
interface NpmData {
  created: string
  downloadsByMonth: Record<string, number>
  downloadsLastMonth: number
  jsdelivrHitsLastMonth: number | null
  jsdelivrHitsByYear: Record<string, number> | null
}
interface DiscordData { references: Reference[]; threadUrls: Record<string, string> }

const sum = (values: number[]) => values.reduce((n, v) => n + v, 0)

export function toLive(store: Store, ossRepos: string[]): Live {
  const d = store.data
  const gh = d.github as GithubData | undefined
  const list = d.npm as NpmList | undefined
  const live: Live = { fetchedAt: Object.values(store.fetchedAt).sort().at(-1) }

  if (gh) {
    const jsdelivrHitsByYear: Record<string, Record<string, number>> = {}
    for (const { full } of cdnRepos(gh, ossRepos)) {
      const hits = d[`cdn:${full}`] as CdnData | undefined
      if (hits) jsdelivrHitsByYear[full] = hits
    }
    live.github = {
      commitsByYear: gh.commitsByYear,
      contributionsPerWeek: gh.contributionsPerWeek,
      contributionsPerDay: gh.contributionsPerDay,
      repos: gh.repos,
      jsdelivrHitsByYear,
    }
  }

  if (list) {
    const packages: NpmPackage[] = []
    const monthly = new Map<string, number>()
    for (const p of list.packages) {
      const n = d[`npm:${p.name}`] as NpmData | undefined
      if (!n) continue
      for (const [month, downloads] of Object.entries(n.downloadsByMonth)) monthly.set(month, (monthly.get(month) ?? 0) + downloads)
      packages.push({
        ...p,
        created: n.created,
        downloadsLastMonth: n.downloadsLastMonth,
        downloadsTotal: sum(Object.values(n.downloadsByMonth)),
        jsdelivrHitsLastMonth: n.jsdelivrHitsLastMonth,
        jsdelivrHitsByYear: n.jsdelivrHitsByYear,
      })
    }
    live.npm = {
      packages: packages.sort((a, b) => b.downloadsLastMonth - a.downloadsLastMonth),
      downloadsPerMonth: [...monthly].sort(([a], [b]) => a.localeCompare(b)).map(([month, downloads]) => ({ month, downloads })),
    }
  }

  if (d.wordpress) live.wordpress = d.wordpress as { plugins: WordpressPlugin[] }
  if (d.goodreads) live.books = d.goodreads as Book[]
  if (d.discord) live.references = (d.discord as DiscordData).references
  return live
}

// --- Fetching ------------------------------------------------------------------------------------

export interface Env {
  GITHUB_TOKEN?: string
  DISCORD_BOT_TOKEN?: string
  DISCORD_CHANNEL_ID?: string
}

// Thrown when a job would pass the run's request budget: the job fails and keeps its last value.
export class BudgetSpent extends Error {}

interface Ctx {
  env: Env
  now: Date
  // Counted against the budget. `json` retries a rate limit (429).
  fetch: (url: string, init?: RequestInit) => Promise<Response>
  json: <T = any>(url: string, init?: RequestInit) => Promise<T>
  left: () => number
}

function makeCtx(env: Env, now: Date, budget: number, retries: number): Ctx & { used: () => number } {
  let used = 0
  const counted = (url: string, init?: RequestInit) => {
    if (used >= budget) throw new BudgetSpent(`request budget of ${budget} spent`)
    used++
    return fetch(url, init)
  }
  const json = async (url: string, init?: RequestInit) => {
    for (let attempt = 1; ; attempt++) {
      const res = await counted(url, init)
      if (res.ok) return res.json()
      await res.body?.cancel()
      if (res.status !== 429 || attempt >= retries) throw new Error(`${res.status} ${url}`)
      const wait = Number(res.headers.get("retry-after")) * 1000 || 2000 * 2 ** attempt
      await new Promise((r) => setTimeout(r, Math.min(wait, 30_000)))
    }
  }
  return { env, now, fetch: counted, json, left: () => budget - used, used: () => used }
}

// Small worker pool, so a few dozen lookups don't open a few dozen sockets at once.
async function pool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length)
  let next = 0
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const i = next++
      out[i] = await fn(items[i])
    }
  }))
  return out
}

const GITHUB_USER = "phucbm"
const GITHUB_SINCE = 2017
// The npm account is phucbui96; the packages are scoped @phucbm or unscoped.
const NPM_MAINTAINER = "phucbui96"
const GOODREADS_USER = "91506536"
const WORDPRESS_USER = "phucbm"

const day = (d: Date) => d.toISOString().slice(0, 10)

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", reg: "®", copy: "©", trade: "™", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", hellip: "…" }
const decode = (s: string) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&(\w+);/g, (m, name) => ENTITIES[name] ?? m)

// A bot wall or an error page is not the page's title.
const badTitle = (title: string) => /attention required|just a moment|access denied|forbidden|not found|^\d{3}\b|ssl handshake/i.test(title)

// The repos jsDelivr's GitHub route is counted for: every public repo I own, plus the /oss repos
// under other owners.
function cdnRepos(gh: GithubData, ossRepos: string[]) {
  const owned = new Set(gh.owned.map((r) => r.full))
  return [...gh.owned, ...ossRepos.filter((full) => !owned.has(full)).map((full) => ({ full, created: gh.repos[full]?.created }))]
}

// jsDelivr hits per calendar year since `created`, for a path such as "npm/<name>" or
// "gh/<owner>/<repo>", plus the last 30 days. A period may not end in the future, so this year is
// the rolling last year (`period=year`, daily) cut at January 1. Years without hits are left out.
// A year that ended before the last fetch is kept from it; the year of the last fetch, if it has
// ended since, is fetched once more as a whole.
async function jsdelivr(ctx: Ctx, path: string, created: string | undefined, known: Record<string, number> | null | undefined, knownAt: string | undefined) {
  const thisYear = ctx.now.getUTCFullYear()
  const byYear: Record<string, number> = {}
  let from = Math.max(Number((created ?? `${GITHUB_SINCE}`).slice(0, 4)), GITHUB_SINCE)
  if (known && knownAt) {
    from = Number(knownAt.slice(0, 4))
    for (const [year, hits] of Object.entries(known)) if (Number(year) < from) byYear[year] = hits
  }
  for (let year = from; year < thisYear; year++) {
    const r = await ctx.json(`https://data.jsdelivr.com/v1/stats/packages/${path}?period=${year}`)
    if (r.hits.total) byYear[year] = r.hits.total
  }
  const r = await ctx.json(`https://data.jsdelivr.com/v1/stats/packages/${path}?period=year`)
  const days = Object.entries(r.hits.dates as Record<string, number>).sort(([a], [b]) => a.localeCompare(b))
  const hits = sum(days.filter(([d]) => d.startsWith(String(thisYear))).map(([, v]) => v))
  if (hits) byYear[thisYear] = hits
  return { byYear, lastMonth: sum(days.slice(-30).map(([, v]) => v)) }
}

interface Job {
  id: string
  // Requests it makes, at most, when it ran before; a first run may make more.
  cost: number
  needs?: (keyof Env)[]
  // `prev` is the job's last good result, `prevAt` when it was fetched.
  run: (ctx: Ctx, prev: any, prevAt: string | undefined) => Promise<unknown>
}

// Contributions per week (Figure 1a), per day for the last year (Figure 1b) and commits per year
// (Table 1, Figure 2); the /oss repos (Table 2); my public repos (for jsDelivr). One GraphQL call:
// `contributionsCollection` spans at most a year, so one alias per year. Private work counts only if
// the profile shares it and the token is mine.
const githubJob = (ossRepos: string[]): Job => ({
  id: "github",
  cost: 3,
  needs: ["GITHUB_TOKEN"],
  async run(ctx, prev: GithubData | undefined) {
    const gql = async (query: string) => {
      const r = await ctx.json("https://api.github.com/graphql", {
        method: "POST",
        headers: { Authorization: `bearer ${ctx.env.GITHUB_TOKEN}`, "Content-Type": "application/json", "User-Agent": "phucbm.com" },
        body: JSON.stringify({ query }),
      })
      if (!r.data) throw new Error(r.errors?.[0]?.message ?? "no data")
      return r.data
    }
    const now = ctx.now
    const thisYear = now.getUTCFullYear()
    const years = Array.from({ length: thisYear - GITHUB_SINCE + 1 }, (_, i) => GITHUB_SINCE + i)
    const repoFields = (after?: string) => `description url stargazerCount createdAt
      defaultBranchRef { target { ... on Commit { committedDate history { totalCount } } } }
      stargazers(first: 100${after ? `, after: "${after}"` : ""}) { edges { starredAt } pageInfo { hasNextPage endCursor } }`
    const ownedFields = (after?: string) => `repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false${after ? `, after: "${after}"` : ""}) {
      nodes { nameWithOwner createdAt } pageInfo { hasNextPage endCursor } }`
    const data = await gql(`{
      user(login: "${GITHUB_USER}") {
        ${years.map((year) => `y${year}: contributionsCollection(from: "${year}-01-01T00:00:00Z", to: "${year === thisYear ? now.toISOString() : `${year}-12-31T23:59:59Z`}") {
          totalCommitContributions
          contributionCalendar { weeks { contributionDays { date contributionCount } } }
        }`).join("\n")}
        ${ownedFields()}
      }
      ${ossRepos.map((full, i) => `r${i}: repository(owner: "${full.split("/")[0]}", name: "${full.split("/")[1]}") { ${repoFields()} }`).join("\n")}
    }`)

    // Restricted (private) contributions are not split by kind; GitHub only gives the total.
    const commitsByYear: Record<string, number> = {}
    const days: { date: string; contributionCount: number }[] = []
    for (const year of years) {
      const c = data.user[`y${year}`]
      commitsByYear[year] = c.totalCommitContributions
      for (const week of c.contributionCalendar.weeks) for (const d of week.contributionDays) if (d.date.startsWith(String(year))) days.push(d)
    }
    // Weeks start on Sunday, as the columns of GitHub's calendar do, keyed by that Sunday's date.
    const sundayOf = (iso: string) => {
      const date = new Date(`${iso}T00:00:00Z`)
      date.setUTCDate(date.getUTCDate() - date.getUTCDay())
      return day(date)
    }
    const weeks = new Map<string, number>()
    for (const d of days) weeks.set(sundayOf(d.date), (weeks.get(sundayOf(d.date)) ?? 0) + d.contributionCount)
    // The calendar on a GitHub profile: this week and the 52 before it, day by day.
    const today = day(now)
    const start = new Date(`${sundayOf(today)}T00:00:00Z`)
    start.setUTCDate(start.getUTCDate() - 52 * 7)
    const calendarFrom = day(start)

    const owned: GithubData["owned"] = []
    for (let page = data.user.repositories; ; ) {
      owned.push(...page.nodes.map((r: any) => ({ full: r.nameWithOwner, created: r.createdAt.slice(0, 10) })))
      if (!page.pageInfo.hasNextPage) break
      page = (await gql(`{ user(login: "${GITHUB_USER}") { ${ownedFields(page.pageInfo.endCursor)} } }`)).user.repositories
    }

    // A repo GitHub does not return (renamed, private) keeps its last stats.
    const repos: Record<string, RepoStats> = {}
    for (const [i, full] of ossRepos.entries()) {
      const r = data[`r${i}`]
      if (!r) {
        if (prev?.repos[full]) repos[full] = prev.repos[full]
        continue
      }
      const starsByYear: Record<string, number> = {}
      for (let page = r.stargazers; ; ) {
        for (const { starredAt } of page.edges) starsByYear[starredAt.slice(0, 4)] = (starsByYear[starredAt.slice(0, 4)] ?? 0) + 1
        if (!page.pageInfo.hasNextPage) break
        const [owner, name] = full.split("/")
        page = (await gql(`{ repository(owner: "${owner}", name: "${name}") { ${repoFields(page.pageInfo.endCursor)} } }`)).repository.stargazers
      }
      const head = r.defaultBranchRef?.target
      repos[full] = {
        description: r.description ?? undefined,
        stars: r.stargazerCount,
        starsByYear,
        url: r.url,
        created: r.createdAt.slice(0, 10),
        commits: head?.history.totalCount,
        lastCommit: head?.committedDate.slice(0, 10),
      }
    }

    return {
      commitsByYear,
      contributionsPerWeek: [...weeks].sort(([a], [b]) => a.localeCompare(b)).map(([week, count]) => ({ week, count })),
      contributionsPerDay: days
        .filter((d) => d.date >= calendarFrom && d.date <= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((d) => ({ date: d.date, count: d.contributionCount })),
      repos,
      owned,
    } satisfies GithubData
  },
})

// jsDelivr hits through its GitHub route (cdn.jsdelivr.net/gh/<owner>/<repo>), which most sites use
// rather than the npm one. Every repo is kept, an empty one too, so the next run knows its past years.
const cdnJob = (full: string, created: string | undefined): Job => ({
  id: `cdn:${full}`,
  cost: 1,
  async run(ctx, prev: CdnData | undefined, prevAt) {
    return (await jsdelivr(ctx, `gh/${full}`, created, prev, prevAt)).byYear satisfies CdnData
  },
})

// Every package I maintain on npm, from the registry's search.
const npmListJob: Job = {
  id: "npm",
  cost: 1,
  async run(ctx) {
    const search = await ctx.json(`https://registry.npmjs.org/-/v1/search?text=maintainer:${NPM_MAINTAINER}&size=250`)
    return {
      packages: search.objects.map((o: any) => ({
        name: o.package.name,
        description: o.package.description || undefined,
        repo: /github\.com\/([^/]+\/[^/#.]+)/.exec(o.package.links?.repository ?? "")?.[1].toLowerCase(),
      })),
    } satisfies NpmList
  },
}

// One package: downloads per month since it was created, the last 30 days, and jsDelivr hits for the
// same package (the CDN serves npm packages too). The first run reads its whole history, in windows
// (the range API serves at most 18 months per call); later runs only last month and this one.
const npmJob = (name: string): Job => ({
  id: `npm:${name}`,
  cost: 2,
  async run(ctx, prev: NpmData | undefined, prevAt) {
    const path = encodeURIComponent(name).replace("%40", "@")
    const created = prev?.created ?? (await ctx.json(`https://registry.npmjs.org/${path}`)).time?.created?.slice(0, 10) ?? `${GITHUB_SINCE}-01-01`
    const end = ctx.now
    let from = new Date(`${created}T00:00:00Z`)
    if (prev) {
      const lastMonth = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 1, 1))
      if (lastMonth > from) from = lastMonth
    }
    const days: { day: string; downloads: number }[] = []
    while (from <= end) {
      const to = new Date(from)
      to.setUTCDate(to.getUTCDate() + 500)
      const r = await ctx.json(`https://api.npmjs.org/downloads/range/${day(from)}:${day(to < end ? to : end)}/${path}`)
      days.push(...r.downloads)
      from = new Date(to)
      from.setUTCDate(from.getUTCDate() + 1)
    }
    // The months fetched replace the ones kept; the first is whole (fetched from its first day).
    const fetched: Record<string, number> = {}
    for (const d of days) fetched[d.day.slice(0, 7)] = (fetched[d.day.slice(0, 7)] ?? 0) + d.downloads
    // jsDelivr failing keeps its last numbers rather than blanking the package's.
    const cdn = await jsdelivr(ctx, `npm/${name}`, created, prev?.jsdelivrHitsByYear, prevAt).catch((err) => {
      if (err instanceof BudgetSpent) throw err
      return null
    })
    return {
      created,
      downloadsByMonth: { ...prev?.downloadsByMonth, ...fetched },
      downloadsLastMonth: sum(days.slice(-30).map((d) => d.downloads)),
      jsdelivrHitsLastMonth: cdn?.lastMonth ?? prev?.jsdelivrHitsLastMonth ?? null,
      jsdelivrHitsByYear: cdn?.byYear ?? prev?.jsdelivrHitsByYear ?? null,
    } satisfies NpmData
  },
})

// My plugins on WordPress.org. Active installs come rounded down by WordPress (1,000+ reads 1000);
// downloads are the all-time total. WordPress keeps no install history, so there is no "by year".
const wordpressJob: Job = {
  id: "wordpress",
  cost: 1,
  async run(ctx) {
    const r = await ctx.json(`https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[author]=${WORDPRESS_USER}&request[per_page]=100`)
    if (!r.plugins?.length) throw new Error("no plugins")
    return {
      plugins: r.plugins
        .map((p: any): WordpressPlugin => ({
          slug: p.slug,
          name: decode(p.name),
          added: p.added,
          activeInstalls: p.active_installs,
          downloads: p.downloaded,
          url: `https://wordpress.org/plugins/${p.slug}/`,
        }))
        .sort((a: WordpressPlugin, b: WordpressPlugin) => b.activeInstalls - a.activeInstalls || b.downloads - a.downloads),
    }
  },
}

// The "read" shelf, from the public RSS feed (no API key; Goodreads closed its API in 2020).
const goodreadsJob: Job = {
  id: "goodreads",
  cost: 1,
  async run(ctx) {
    // Goodreads turns away a request with no User-Agent (a Worker's fetch sends none).
    const res = await ctx.fetch(`https://www.goodreads.com/review/list_rss/${GOODREADS_USER}?shelf=read&per_page=200`, { headers: { "User-Agent": "Mozilla/5.0 (phucbm.com reading)" } })
    if (!res.ok) throw new Error(`${res.status} goodreads`)
    const xml = await res.text()
    const field = (item: string, tag: string) => {
      const m = new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`).exec(item)
      return m ? m[1].trim() : ""
    }
    const date = (s: string) => (s ? day(new Date(s)) : undefined)
    const books = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]): Book => {
      const review = field(item, "user_review").replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "").trim()
      return {
        title: field(item, "title"),
        author: field(item, "author_name"),
        year: Number(field(item, "book_published")) || undefined,
        // Not every book has a read date; the date it was shelved stands in.
        read: date(field(item, "user_read_at")) ?? date(field(item, "user_date_added")),
        rating: Number(field(item, "user_rating")) || undefined,
        review: review || undefined,
        url: `https://www.goodreads.com/book/show/${field(item, "book_id")}`,
      }
    })
    if (books.length === 0) throw new Error("empty feed")
    return books.sort((a, b) => (b.read ?? "").localeCompare(a.read ?? ""))
  },
}

// Bookmarks: one forum thread per link in my Discord channel (as phucbm-web read them).
const discordJob: Job = {
  id: "discord",
  cost: 6,
  needs: ["DISCORD_BOT_TOKEN", "DISCORD_CHANNEL_ID"],
  async run(ctx, prev: DiscordData | undefined) {
    const { DISCORD_BOT_TOKEN: token, DISCORD_CHANNEL_ID: channel } = ctx.env
    const api = (path: string) => ctx.json(`https://discord.com/api/v10${path}`, { headers: { Authorization: `Bot ${token}` } })

    const info = await api(`/channels/${channel}`)
    const tagName = new Map<string, string>((info.available_tags ?? []).map((t: any) => [t.id, t.name]))
    const threads: any[] = []
    for (let before: string | undefined; ; ) {
      const page = await api(`/channels/${channel}/threads/archived/public?limit=100${before ? `&before=${before}` : ""}`)
      threads.push(...page.threads)
      if (!page.has_more || page.threads.length === 0) break
      before = page.threads.at(-1).thread_metadata.archive_timestamp
    }
    const active = await api(`/guilds/${info.guild_id}/threads/active`)
    threads.push(...active.threads.filter((t: any) => t.parent_id === channel))

    // A thread named only by its URL gets the page's <title>, looked up once and kept. Lookups wait
    // for a later run once the budget runs low; the host stands in until then.
    const knownTitle = new Map((prev?.references ?? []).filter((r) => r.title !== r.source && !r.title.startsWith("www.") && !badTitle(r.title)).map((r) => [r.url, decode(r.title)]))
    const pageTitle = async (url: string) => {
      if (knownTitle.has(url)) return knownTitle.get(url)
      if (ctx.left() < 4) return undefined
      try {
        const res = await ctx.fetch(url, { signal: AbortSignal.timeout(8000), headers: { "User-Agent": "Mozilla/5.0 (phucbm.com references)" } })
        const html = (await res.text()).slice(0, 200000)
        const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)
        const title = m ? decode(m[1]).replace(/\s+/g, " ").trim() : ""
        return title && !badTitle(title) ? title : undefined
      } catch {
        return undefined
      }
    }
    const urlRe = /https?:\/\/[^\s<>)]+/
    const threadUrls: Record<string, string> = {}
    const refs = await pool(threads, 6, async (thread): Promise<Reference | null> => {
      // A thread without a URL in its name has it in its first message, looked up once and kept.
      let url = urlRe.exec(thread.name)?.[0] ?? prev?.threadUrls?.[thread.id]
      if (!url) {
        const [first] = await api(`/channels/${thread.id}/messages?after=0&limit=1`).catch((err) => {
          if (err instanceof BudgetSpent) throw err
          return []
        })
        url = first && urlRe.exec(first.content)?.[0]
      }
      if (!url) return null
      if (!urlRe.test(thread.name)) threadUrls[thread.id] = url
      const source = new URL(url).hostname.replace(/^www\./, "")
      // A thread named after the site's host ("www.w3.org") has no real title either.
      const named = thread.name.replace(urlRe, "").trim()
      const title = (named && named.replace(/^www\./, "") !== source ? named : await pageTitle(url)) || source
      return {
        title,
        url,
        source,
        saved: (thread.thread_metadata?.create_timestamp ?? new Date(Number((BigInt(thread.id) >> BigInt(22)) + BigInt(1420070400000))).toISOString()).slice(0, 10),
        tags: (thread.applied_tags ?? []).map((id: string) => tagName.get(id)).filter(Boolean),
      }
    })
    const unique = new Map<string, Reference>()
    for (const r of refs) if (r && !unique.has(r.url)) unique.set(r.url, r)
    if (unique.size === 0) throw new Error("no threads")
    return { references: [...unique.values()].sort((a, b) => b.saved.localeCompare(a.saved)), threadUrls } satisfies DiscordData
  },
}

// Every job, from what the store knows: the lists (GitHub, npm) decide the per-repo and per-package jobs.
function planJobs(store: Store, ossRepos: string[]): Job[] {
  const gh = store.data.github as GithubData | undefined
  const list = store.data.npm as NpmList | undefined
  return [
    githubJob(ossRepos),
    npmListJob,
    wordpressJob,
    goodreadsJob,
    discordJob,
    ...(gh ? cdnRepos(gh, ossRepos).map((r) => cdnJob(r.full, r.created)) : []),
    ...(list?.packages ?? []).map((p) => npmJob(p.name)),
  ]
}

export interface RefreshOptions {
  env: Env
  // "owner/name" of every repo on /oss (`data/oss.ts`).
  ossRepos: string[]
  // Outside requests this run may make (the Workers free plan allows 50 per request).
  budget?: number
  // A job is due once its last fetch is this old; 0 runs every job.
  staleMs?: number
  // Only these jobs: "npm" also runs every "npm:…", "github" every "cdn:…" (jsDelivr's GitHub route).
  only?: string[]
  retries?: number
  concurrency?: number
  log?: (message: string) => void
  now?: Date
}

export const DAY_MS = 24 * 60 * 60 * 1000
const RETRY_MS = 60 * 60 * 1000

// When a job falls due (ms since the epoch; 0 for one that never ran): a day after it last ran, and
// an hour after it last failed.
const dueAt = (store: Store, id: string, staleMs: number) =>
  Math.max(store.fetchedAt[id] ? Date.parse(store.fetchedAt[id]) + staleMs : 0, store.failedAt?.[id] ? Date.parse(store.failedAt[id]) + Math.min(RETRY_MS, staleMs) : 0)

/** When the next job falls due. */
export function nextDue(store: Store, ossRepos: string[], env: Env, staleMs = DAY_MS): number {
  const jobs = planJobs(store, ossRepos).filter((job) => (job.needs ?? []).every((key) => env[key]))
  return Math.min(...jobs.map((job) => dueAt(store, job.id, staleMs)))
}

/** Runs the due jobs, oldest first, within the budget, and returns the store with their results. */
export async function refresh(store: Store, opts: RefreshOptions) {
  const { env, ossRepos, budget = Infinity, staleMs = DAY_MS, only, retries = 5, concurrency = 4, log = () => {} } = opts
  const now = opts.now ?? new Date()
  const ctx = makeCtx(env, now, budget, retries)
  const next = mergeStores(store, null)
  const attempted = new Set<string>()
  const ran: string[] = []
  const failed: string[] = []

  // Twice: a list job (GitHub, npm) that ran can add jobs for new repos or packages.
  for (let round = 0; round < 2; round++) {
    const due = planJobs(next, ossRepos)
      .filter((job) => !attempted.has(job.id))
      .filter((job) => !only || only.some((o) => job.id === o || job.id.startsWith(`${o}:`) || (o === "github" && job.id.startsWith("cdn:"))))
      .filter((job) => (job.needs ?? []).every((key) => env[key]))
      .filter((job) => dueAt(next, job.id, staleMs) <= now.getTime())
      .sort((a, b) => (next.fetchedAt[a.id] ?? "").localeCompare(next.fetchedAt[b.id] ?? ""))
    const batch: Job[] = []
    let planned = 0
    for (const job of due) {
      // A job that never ran may make more requests than its cost, and a rate limit costs a retry:
      // room for both.
      const cost = next.fetchedAt[job.id] ? job.cost : job.cost * 3
      if (planned + cost > ctx.left() * 0.85) continue
      planned += cost
      batch.push(job)
    }
    if (batch.length === 0) break
    await pool(batch, concurrency, async (job) => {
      attempted.add(job.id)
      try {
        next.data[job.id] = await job.run(ctx, next.data[job.id], next.fetchedAt[job.id])
        next.fetchedAt[job.id] = now.toISOString()
        delete next.failedAt![job.id]
        ran.push(job.id)
      } catch (err) {
        // Out of budget is not a failure: the job stays due for the next batch.
        if (!(err instanceof BudgetSpent)) next.failedAt![job.id] = now.toISOString()
        failed.push(job.id)
        log(`${job.id} failed, keeping the last value (${next.fetchedAt[job.id] ?? "none"}): ${(err as Error).message}`)
      }
    })
  }

  // A repo or package no longer listed takes its numbers with it.
  const ids = new Set(planJobs(next, ossRepos).map((job) => job.id))
  for (const id of Object.keys(next.data)) {
    if (!ids.has(id)) {
      delete next.data[id]
      delete next.fetchedAt[id]
      delete next.failedAt![id]
    }
  }
  return { store: next, ran, failed, requests: ctx.used() }
}
