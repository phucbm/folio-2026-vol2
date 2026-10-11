// §4 Open source: the repos to show, in groups (from phucbm-web's /shipped). Only the list is
// authored; descriptions, stars and downloads come from the data pipeline (`lib/live.ts`), which
// reads this list too (`scripts/data/fetch.mjs`).
export interface OssRepo {
  // "owner/name" on GitHub; a bare name means phucbm.
  repo: string
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

export const repoPath = (repo: string) => (repo.includes("/") ? repo : `phucbm/${repo}`)
