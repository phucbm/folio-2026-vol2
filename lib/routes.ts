// The site's static pages, in contents order. Read by the sitemap and llms.txt; a new section page
// is added here when it is built (plan 001). Entry pages come from the content catalog instead.
export const staticRoutes: { path: string; title: string; description: string }[] = [
  { path: "/", title: "Phuc Bui", description: "Front matter: the abstract, Table 1 and the contents." },
]
