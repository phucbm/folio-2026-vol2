// The data pipeline (plan 001, part 6): fetches every number the site shows from its source and
// writes `data/live.generated.json`. Each source is fetched on its own; one that fails keeps its last
// good value from the existing file, so a flaky API never breaks a build or blanks a figure.
// The file is committed, so a build without tokens (CI, a fresh clone) still has numbers.
//
//   pnpm data            all sources
//   pnpm data github npm only those
//
// Tokens: GITHUB_TOKEN (falls back to `gh auth token`), DISCORD_BOT_TOKEN + DISCORD_CHANNEL_ID
// (in .env.local). Goodreads, npm and jsDelivr need none.
import { execSync } from "node:child_process"
import { readFileSync, writeFileSync, existsSync } from "node:fs"

const OUT = "data/live.generated.json"
const GITHUB_USER = "phucbm"
const GITHUB_SINCE = 2017
// The npm account is phucbui96; the packages are scoped @phucbm or unscoped.
const NPM_MAINTAINER = "phucbui96"
const GOODREADS_USER = "91506536"

const live = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {}
live.fetchedAt ??= {}

// Retries a rate limit (429) with backoff, honouring Retry-After when the API sends it.
async function json(url, init, tries = 5) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, init)
    if (res.ok) return res.json()
    if (res.status !== 429 || attempt >= tries) throw new Error(`${res.status} ${url}`)
    const wait = Number(res.headers.get("retry-after")) * 1000 || 2000 * 2 ** attempt
    await new Promise((r) => setTimeout(r, wait))
  }
}

// Small worker pool, so a few dozen package lookups don't open a few dozen sockets at once.
async function pool(items, size, fn) {
  const out = new Array(items.length)
  let next = 0
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < items.length) {
      const i = next++
      out[i] = await fn(items[i])
    }
  }))
  return out
}

function githubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN
  try {
    return execSync("gh auth token", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()
  } catch {
    return null
  }
}

// The repos `/oss` lists, read from data/oss.ts so the list lives in one place.
function ossRepos() {
  const src = readFileSync("data/oss.ts", "utf8")
  return [...src.matchAll(/repo: "([^"]+)"/g)].map((m) => (m[1].includes("/") ? m[1] : `${GITHUB_USER}/${m[1]}`))
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", reg: "®", copy: "©", trade: "™", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", hellip: "…" }
const decode = (s) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&(\w+);/g, (m, name) => ENTITIES[name] ?? m)

// A bot wall or an error page is not the page's title.
const badTitle = (title) => /attention required|just a moment|access denied|forbidden|not found|^\d{3}\b|ssl handshake/i.test(title)

const sources = {
  // Contributions per week (Figure 0a), per day for the last year (Figure 0b) and commits per year (Table 1), one GraphQL call per year:
  // `contributionsCollection` spans at most a year. Private work counts only if the profile shares it.
  async github() {
    const token = githubToken()
    if (!token) throw new Error("no GITHUB_TOKEN and no gh login")
    const gql = (query) => json("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }).then((r) => {
      if (r.errors) throw new Error(r.errors[0].message)
      return r.data
    })

    const now = new Date()
    const commitsByYear = {}
    const days = []
    for (let year = GITHUB_SINCE; year <= now.getUTCFullYear(); year++) {
      const to = year === now.getUTCFullYear() ? now.toISOString() : `${year}-12-31T23:59:59Z`
      const data = await gql(`{ user(login: "${GITHUB_USER}") { contributionsCollection(from: "${year}-01-01T00:00:00Z", to: "${to}") {
        totalCommitContributions restrictedContributionsCount
        contributionCalendar { weeks { contributionDays { date contributionCount } } }
      } } }`)
      const c = data.user.contributionsCollection
      // Restricted (private) contributions are not split by kind; GitHub only gives the total.
      commitsByYear[year] = c.totalCommitContributions
      for (const week of c.contributionCalendar.weeks) for (const d of week.contributionDays) {
        if (d.date.startsWith(String(year))) days.push(d)
      }
    }

    // Weeks start on Sunday, as the columns of GitHub's calendar do, keyed by that Sunday's date.
    const sundayOf = (iso) => {
      const date = new Date(`${iso}T00:00:00Z`)
      date.setUTCDate(date.getUTCDate() - date.getUTCDay())
      return date.toISOString().slice(0, 10)
    }
    const weeks = new Map()
    for (const d of days) {
      const key = sundayOf(d.date)
      weeks.set(key, (weeks.get(key) ?? 0) + d.contributionCount)
    }
    // The calendar on a GitHub profile: this week and the 52 before it, day by day.
    const today = now.toISOString().slice(0, 10)
    const start = new Date(`${sundayOf(today)}T00:00:00Z`)
    start.setUTCDate(start.getUTCDate() - 52 * 7)
    const calendarFrom = start.toISOString().slice(0, 10)

    // Stars and descriptions for the repos on /oss.
    const repos = {}
    await pool(ossRepos(), 6, async (full) => {
      try {
        const r = await json(`https://api.github.com/repos/${full}`, { headers: { Authorization: `bearer ${token}` } })
        repos[full] = { description: r.description ?? undefined, stars: r.stargazers_count, url: r.html_url }
      } catch (err) {
        console.warn(`  github: ${full}: ${err.message}`)
      }
    })

    live.github = {
      commitsByYear,
      contributionsPerWeek: [...weeks].sort(([a], [b]) => a.localeCompare(b)).map(([week, count]) => ({ week, count })),
      contributionsPerDay: days
        .filter((d) => d.date >= calendarFrom && d.date <= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((d) => ({ date: d.date, count: d.contributionCount })),
      repos,
    }
  },

  // Every package I maintain on npm: downloads last month and in total, monthly totals, and
  // jsDelivr hits for the same package (the CDN serves npm packages too).
  async npm() {
    const search = await json(`https://registry.npmjs.org/-/v1/search?text=maintainer:${NPM_MAINTAINER}&size=250`)
    const names = search.objects.map((o) => o.package.name)
    const repoOf = Object.fromEntries(search.objects.map((o) => {
      const m = /github\.com\/([^/]+\/[^/#.]+)/.exec(o.package.links?.repository ?? "")
      return [o.package.name, m ? m[1].toLowerCase() : undefined]
    }))
    const descriptionOf = Object.fromEntries(search.objects.map((o) => [o.package.name, o.package.description]))

    // Daily downloads since the package was created, in windows: the range API serves at most
    // 18 months per call.
    const day = (d) => d.toISOString().slice(0, 10)
    async function history(path, created) {
      const days = []
      const end = new Date()
      for (let from = new Date(created); from < end; ) {
        const to = new Date(from)
        to.setUTCDate(to.getUTCDate() + 500)
        const r = await json(`https://api.npmjs.org/downloads/range/${day(from)}:${day(to < end ? to : end)}/${path}`)
        days.push(...r.downloads)
        from = new Date(to)
        from.setUTCDate(from.getUTCDate() + 1)
      }
      return days
    }

    const monthly = new Map()
    const packages = await pool(names, 2, async (name) => {
      const path = encodeURIComponent(name).replace("%40", "@")
      const [doc, cdn] = await Promise.all([
        json(`https://registry.npmjs.org/${path}`),
        json(`https://data.jsdelivr.com/v1/stats/packages/npm/${name}?period=month`).catch(() => null),
      ])
      const created = doc.time?.created ?? "2017-01-01"
      const days = await history(path, created)
      for (const d of days) {
        const month = d.day.slice(0, 7)
        monthly.set(month, (monthly.get(month) ?? 0) + d.downloads)
      }
      return {
        name,
        description: descriptionOf[name],
        repo: repoOf[name],
        created: created.slice(0, 10),
        downloadsLastMonth: days.slice(-30).reduce((n, d) => n + d.downloads, 0),
        downloadsTotal: days.reduce((n, d) => n + d.downloads, 0),
        jsdelivrHitsLastMonth: cdn?.hits?.total ?? null,
      }
    })

    live.npm = {
      packages: packages.sort((a, b) => b.downloadsLastMonth - a.downloadsLastMonth),
      // Totals per calendar month, the current (partial) one included; plots drop it.
      downloadsPerMonth: [...monthly].sort(([a], [b]) => a.localeCompare(b)).map(([month, downloads]) => ({ month, downloads })),
    }
  },

  // The "read" shelf, from the public RSS feed (no API key; Goodreads closed its API in 2020).
  async goodreads() {
    const res = await fetch(`https://www.goodreads.com/review/list_rss/${GOODREADS_USER}?shelf=read&per_page=200`)
    if (!res.ok) throw new Error(`${res.status} goodreads`)
    const xml = await res.text()
    const field = (item, tag) => {
      const m = new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`).exec(item)
      return m ? m[1].trim() : ""
    }
    const date = (s) => (s ? new Date(s).toISOString().slice(0, 10) : undefined)
    const books = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => {
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
    live.books = books.sort((a, b) => (b.read ?? "").localeCompare(a.read ?? ""))
  },

  // Bookmarks: one forum thread per link in my Discord channel (as phucbm-web read them).
  async discord() {
    const { DISCORD_BOT_TOKEN: token, DISCORD_CHANNEL_ID: channel } = process.env
    if (!token || !channel) throw new Error("no DISCORD_BOT_TOKEN / DISCORD_CHANNEL_ID")
    const api = (path) => json(`https://discord.com/api/v10${path}`, { headers: { Authorization: `Bot ${token}` } })

    const info = await api(`/channels/${channel}`)
    const tagName = new Map((info.available_tags ?? []).map((t) => [t.id, t.name]))
    const threads = []
    let before
    for (;;) {
      const page = await api(`/channels/${channel}/threads/archived/public?limit=100${before ? `&before=${before}` : ""}`)
      threads.push(...page.threads)
      if (!page.has_more || page.threads.length === 0) break
      before = page.threads.at(-1).thread_metadata.archive_timestamp
    }
    const active = await api(`/guilds/${info.guild_id}/threads/active`)
    threads.push(...active.threads.filter((t) => t.parent_id === channel))

    // A thread named only by its URL gets the page's <title>, looked up once and kept in the file.
    const knownTitle = new Map((live.references ?? []).filter((r) => r.title !== r.source && !r.title.startsWith("www.") && !badTitle(r.title)).map((r) => [r.url, decode(r.title)]))
    const pageTitle = async (url) => {
      if (knownTitle.has(url)) return knownTitle.get(url)
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { "User-Agent": "Mozilla/5.0 (phucbm.com references)" } })
        const html = (await res.text()).slice(0, 200000)
        const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)
        const title = m ? decode(m[1]).replace(/\s+/g, " ").trim() : ""
        return title && !badTitle(title) ? title : undefined
      } catch {
        return undefined
      }
    }
    const urlRe = /https?:\/\/[^\s<>)]+/
    const refs = await pool(threads, 6, async (thread) => {
      let url = urlRe.exec(thread.name)?.[0]
      if (!url) {
        const [first] = await api(`/channels/${thread.id}/messages?after=0&limit=1`).catch(() => [])
        url = first && urlRe.exec(first.content)?.[0]
      }
      if (!url) return null
      const source = new URL(url).hostname.replace(/^www\./, "")
      // A thread named after the site's host ("www.w3.org") has no real title either.
      const named = thread.name.replace(urlRe, "").trim()
      const title = (named && named.replace(/^www\./, "") !== source ? named : await pageTitle(url)) || source
      return {
        title,
        url,
        source,
        saved: (thread.thread_metadata?.create_timestamp ?? new Date(Number((BigInt(thread.id) >> 22n) + 1420070400000n)).toISOString()).slice(0, 10),
        tags: (thread.applied_tags ?? []).map((id) => tagName.get(id)).filter(Boolean),
      }
    })
    const unique = new Map()
    for (const r of refs) if (r && !unique.has(r.url)) unique.set(r.url, r)
    if (unique.size === 0) throw new Error("no threads")
    live.references = [...unique.values()].sort((a, b) => b.saved.localeCompare(a.saved))
  },
}

const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(sources)
let failed = 0
for (const name of wanted) {
  if (!sources[name]) {
    console.error(`unknown source: ${name} (${Object.keys(sources).join(", ")})`)
    process.exit(1)
  }
  try {
    await sources[name]()
    live.fetchedAt[name] = new Date().toISOString()
    console.log(`data: ${name} ok`)
  } catch (err) {
    failed++
    console.warn(`data: ${name} failed, keeping the last value (${live.fetchedAt[name] ?? "none"}): ${err.message}`)
  }
}
writeFileSync(OUT, JSON.stringify(live, null, 2) + "\n")
console.log(`data: wrote ${OUT}${failed ? `, ${failed} source(s) kept their last value` : ""}`)
