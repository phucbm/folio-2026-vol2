// §3 Open source: the repos to show (from phucbm-web's /shipped). Only the list is authored; the
// rest comes from the data jobs (`lib/live/jobs.ts`), which read this list too. The order here does
// not matter: /oss sorts by the day each repo started. No imports: `pnpm data` loads this file in Node.

// "owner/name" on GitHub; a bare name means phucbm.
const list: string[] = [
  "claude-usage-monitor",
  "claudify",
  "clyrics",
  "hieu-chu-han",
  "react-hanzi-input",
  "food-tour-sg",
  "nextra-docs-starter",
  "nextra-blog-starter",
  "lipsum-generator",
  "perxel/whack-a-mole",
  "normalized-mouse-position",
  "magnetic-button",
  "cursor-effects",
  "jquery-scroll-direction-plugin",
  "viivue/easy-select",
  "viivue/easy-popup",
  "viivue/easy-tab-accordion",
  "viivue/overlapping-slider",
]

export const repoPath = (repo: string) => (repo.includes("/") ? repo : `phucbm/${repo}`)

// "owner/name" of every repo, for the data jobs.
export const ossRepoPaths: string[] = list.map(repoPath)

// Newest first by the day the repo was created; a repo not fetched yet goes last.
export const ossRepos = (repos: Record<string, { created?: string }> | undefined): string[] =>
  [...list].sort((a, b) => (repos?.[repoPath(b)]?.created ?? "").localeCompare(repos?.[repoPath(a)]?.created ?? ""))
