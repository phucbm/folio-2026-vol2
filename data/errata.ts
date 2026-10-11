// /errata: the changelog, one entry per version, newest first. The version is `version` in
// package.json (shown in the running head); bump it and add a line here together.
export interface Erratum {
  version: string
  date: string
  changes: string[]
}

export const errata: Erratum[] = [
  {
    version: "0.1.0",
    date: "2026-10-11",
    changes: ["First version, on the preview. Archived entries are placeholders."],
  },
]
