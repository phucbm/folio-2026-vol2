// The site's static pages, in contents order. Read by the sitemap, llms.txt and the home page's
// contents; a new section page is added here when it is built (plan 001). Entry pages come from
// the content catalog instead.
export interface StaticRoute {
  path: string
  title: string
  // "§1": numbered sections of the paper. Unnumbered pages (uses, colophon) have none.
  section?: string
  description: string
}

export const staticRoutes: StaticRoute[] = [
  { path: "/", title: "Phuc Bui", description: "Front matter: the abstract, Table 1 and the contents." },
  { path: "/notes", section: "§1", title: "Notes", description: "Lab notebook: short notes, small findings and how I built things." },
  { path: "/archived", section: "§2", title: "Archived", description: "ViiVue work, 2017 to 2025: one figure per project, with the year, the stack and what I learned." },
  { path: "/perxel", section: "§3", title: "Perxel", description: "Client work at Perxel, one line each, linking to the case studies on perxel.com." },
  { path: "/oss", section: "§4", title: "Open source", description: "Packages and repos I've built and open-sourced, with stars and downloads." },
  { path: "/reading", section: "§5", title: "Reading", description: "The books I've read, from Goodreads, as a bibliography with short reviews." },
  { path: "/references", section: "§6", title: "References", description: "Links I've saved: articles, tools and demos, as a list of references." },
  { path: "/now", section: "§7", title: "Now", description: "What I'm working on right now." },
  { path: "/stats", title: "Stats", description: "The charts behind Table 1: commits per week, books per year, package downloads." },
  { path: "/uses", title: "Uses", description: "Hardware, apps and tools I use." },
  { path: "/colophon", title: "Colophon", description: "How this site is built, set and hosted." },
  { path: "/errata", title: "Errata", description: "What changed on this site, version by version." },
]
