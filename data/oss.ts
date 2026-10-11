// §3 Open source: the repos to show (from phucbm-web's /shipped). Only the list is authored; the
// rest comes from the data pipeline (`lib/live.ts`), which reads this list too
// (`scripts/data/fetch.mjs`). The order here does not matter: /oss sorts by the day each repo started.
import { github } from "@/lib/live"

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

// Newest first by the day the repo was created; a repo not fetched yet goes last.
export const ossRepos: string[] = [...list].sort((a, b) =>
  (github?.repos[repoPath(b)]?.created ?? "").localeCompare(github?.repos[repoPath(a)]?.created ?? ""),
)
