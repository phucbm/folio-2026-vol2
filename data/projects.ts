// §2 Projects: every project, one line each, in one list by date. No entry pages and no images: the
// list is the page. A project with a case study elsewhere (perxel.com) links there; nothing is
// written twice. Blank fields stay blank on the page until filled in.
//
// The slug is the ID. P-001 is only the position by date, oldest first (lib/aliases.ts): adding an
// older project shifts the ones after it. A project without a date counts as the oldest, and
// projects sharing a month keep the order of this list.
import { aliasesByDate } from "@/lib/aliases"

export type ProjectAt = "Perxel" | "Freelance" | "ViiVue"

export interface Project {
  // The ID: kebab-case, never changes.
  slug: string
  title: string
  // Where I did it.
  at: ProjectAt
  // "YYYY-MM": when it shipped (or started, if it is still running).
  date?: string
  // What I did on it, in a few words ("front-end, animation").
  role?: string
  // One line: what it is and the one technical point worth knowing.
  line?: string
  // The live site or the case study.
  href?: string
}

const caseStudy = (slug: string) => `https://perxel.com/en/works/${slug}`

// Oldest first. Dates decide the order; this list only breaks ties and places projects without a date.
const list: Project[] = [
  { slug: "bach-suites-saigon", title: "Bach Suites Saigon", at: "ViiVue" },
  { slug: "bong-bach-tuyet", title: "Bong Bach Tuyet", at: "ViiVue" },
  { slug: "canh-dieu", title: "Canh Dieu", at: "ViiVue" },
  { slug: "duc-khang-hospital", title: "Duc Khang Hospital", at: "ViiVue" },
  { slug: "food-source-international", title: "Food Source International", at: "ViiVue" },
  { slug: "gilimex", title: "Gilimex", at: "ViiVue" },
  { slug: "huynchi", title: "Huynchi", at: "ViiVue" },
  { slug: "jones-payne", title: "Jones Payne", at: "ViiVue" },
  { slug: "koru-education", title: "Koru Education", at: "ViiVue" },
  { slug: "little-einstein-academy", title: "Little Einstein Academy", at: "ViiVue" },
  { slug: "long-an-international-port", title: "Long An International Port", at: "ViiVue" },
  { slug: "mia-saigon", title: "Mia Saigon", at: "ViiVue" },
  { slug: "ree-corporation", title: "REE Corporation", at: "ViiVue" },
  { slug: "rmit-experience-day-2023", title: "RMIT Experience Day 2023", at: "ViiVue" },
  { slug: "rmit-vietnam", title: "RMIT Vietnam", at: "ViiVue" },
  { slug: "sakura-vietnam", title: "Sakura Vietnam", at: "ViiVue" },
  { slug: "sky-international-preschool-vietnam", title: "Sky International Preschool Vietnam", at: "ViiVue" },
  { slug: "source-of-asia", title: "Source of Asia", at: "ViiVue" },
  { slug: "techvico", title: "Techvico", at: "ViiVue" },
  { slug: "tuan-loc-commodities", title: "Tuan Loc Commodities", at: "ViiVue" },
  { slug: "mia-nha-trang", title: "Mia Nha Trang", at: "ViiVue" },
  { slug: "tam-coc-garden", title: "Tam Coc Garden", at: "ViiVue" },
  { slug: "the-deck-saigon", title: "The Deck Saigon", at: "ViiVue" },
  { slug: "dmd-by-sun-group", title: "DMD by Sun Group", at: "Freelance" },
  {
    slug: "growtrics",
    title: "Growtrics",
    at: "Perxel",
    line: "Website for an EdTech startup in Singapore: Next.js and GSAP, TinaCMS for content.",
    href: caseStudy("growtrics"),
  },
  {
    slug: "dta-luxury",
    title: "DTA Luxury",
    at: "Perxel",
    line: "Website for a luxury travel agency in Australia, on WordPress with plain Gutenberg blocks and no page builder.",
    href: caseStudy("dta-luxury"),
  },
  {
    slug: "khatra",
    title: "Khatra Tile",
    at: "Perxel",
    line: "Rebuild of a tile company's 10-year-old WordPress site: close to 800 products and 14,000 images cleaned up, SEO structure kept.",
    href: caseStudy("khatra"),
  },
  {
    slug: "openwallet",
    title: "OpenWallet",
    at: "Perxel",
    line: "Look up and compare bank cards in Vietnam, with an MCP server so AI assistants can query the card data.",
    href: caseStudy("openwallet"),
  },
]

const labels = aliasesByDate("P", list, (project) => project.date)

// Newest first, as the page shows them, each with its alias.
export const projects: (Project & { label: string })[] = list
  .map((project) => ({ ...project, label: labels.get(project)! }))
  .sort((a, b) => b.label.localeCompare(a.label, "en", { numeric: true }))
