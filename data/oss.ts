// §4 Open source: the repos to show, in groups (from phucbm-web's /shipped). Only the list is
// authored; description, stars and downloads come from the data pipeline (plan 001, part 6), which
// fills `ossStats`. Until then every figure is blank.
export interface OssRepo {
  // "owner/name" on GitHub; a bare name means phucbm.
  repo: string
  // The npm package, when there is one, for downloads.
  npm?: string
}

export interface OssGroup {
  title: string
  repos: OssRepo[]
}

export const ossGroups: OssGroup[] = [
  {
    title: "Side quests",
    repos: [
      { repo: "claude-usage-monitor" },
      { repo: "claudify" },
      { repo: "clyrics" },
      { repo: "hieu-chu-han" },
      { repo: "react-hanzi-input" },
      { repo: "food-tour-sg" },
      { repo: "nextra-docs-starter" },
      { repo: "nextra-blog-starter" },
      { repo: "lipsum-generator" },
      { repo: "perxel/whack-a-mole" },
    ],
  },
  {
    title: "UI",
    repos: [
      { repo: "normalized-mouse-position" },
      { repo: "magnetic-button" },
      { repo: "cursor-effects" },
      { repo: "jquery-scroll-direction-plugin" },
    ],
  },
  {
    title: "Production-tested, at ViiVue",
    repos: [
      { repo: "viivue/easy-select" },
      { repo: "viivue/easy-popup" },
      { repo: "viivue/easy-tab-accordion" },
      { repo: "viivue/overlapping-slider" },
    ],
  },
]

export interface OssStats {
  description?: string
  stars?: number
  downloadsPerMonth?: number
}

// Filled by the data pipeline, keyed by `repo`. Empty until part 6.
export const ossStats: Record<string, OssStats> = {}

export const repoPath = (repo: string) => (repo.includes("/") ? repo : `phucbm/${repo}`)
