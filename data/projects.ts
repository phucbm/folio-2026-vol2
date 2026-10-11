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
  // "YYYY-MM" ("YYYY" when the month is not known): when it shipped (or started, if it is still running).
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
  { slug: "bach-suites-saigon", title: "Bach Suites Saigon", at: "ViiVue", date: "2025-03", href: "https://www.thebachsuites.com/" },
  { slug: "bong-bach-tuyet", title: "Bong Bach Tuyet", at: "ViiVue", date: "2024", href: "https://bongbachtuyet.com.vn/" },
  { slug: "canh-dieu", title: "Canh Dieu", at: "ViiVue", date: "2024", href: "https://sachcanhdieu.vn/" },
  { slug: "duc-khang-hospital", title: "Duc Khang Hospital", at: "ViiVue", date: "2024" },
  { slug: "food-source-international", title: "Food Source International", at: "ViiVue", date: "2024", href: "https://foodsource.ae/" },
  { slug: "gilimex", title: "Gilimex", at: "ViiVue", date: "2024", href: "https://www.gilimex.com/" },
  { slug: "huynchi", title: "Huynchi", at: "ViiVue", date: "2024", href: "https://huynchi.com/" },
  { slug: "jones-payne", title: "Jones Payne", at: "ViiVue", date: "2024", href: "https://www.jonespayne.com/" },
  { slug: "koru-education", title: "Koru Education", at: "ViiVue", date: "2024", href: "https://koru.edu.vn/" },
  { slug: "little-einstein-academy", title: "Little Einstein Academy", at: "ViiVue", date: "2024" },
  { slug: "long-an-international-port", title: "Long An International Port", at: "ViiVue", date: "2023-08", href: "https://longanport.com/" },
  { slug: "mia-saigon", title: "Mia Saigon", at: "ViiVue", date: "2024", href: "https://www.miasaigon.com/" },
  { slug: "ree-corporation", title: "REE Corporation", at: "ViiVue", date: "2024", href: "https://www.reecorp.com/" },
  { slug: "rmit-experience-day-2023", title: "RMIT Experience Day 2023", at: "ViiVue", date: "2024", href: "https://experienceday.rmit.edu.vn/" },
  { slug: "rmit-vietnam", title: "RMIT Vietnam", at: "ViiVue", date: "2024" },
  { slug: "sakura-vietnam", title: "Sakura Vietnam", at: "ViiVue", date: "2023-06", href: "https://www.sakura-vn.vn/" },
  { slug: "sky-international-preschool-vietnam", title: "Sky International Preschool Vietnam", at: "ViiVue", date: "2025-05", href: "https://skypreschool.edu.vn/" },
  { slug: "source-of-asia", title: "Source of Asia", at: "ViiVue", date: "2024", href: "https://www.sourceofasia.com/" },
  { slug: "techvico", title: "Techvico", at: "ViiVue", date: "2025-01", href: "https://techvico.com/" },
  { slug: "tuan-loc-commodities", title: "Tuan Loc Commodities", at: "ViiVue", date: "2024", href: "https://tlcommodities.com/" },
  { slug: "mia-nha-trang", title: "Mia Nha Trang", at: "ViiVue", date: "2023-04", href: "https://mianhatrang.com/" },
  { slug: "tam-coc-garden", title: "Tam Coc Garden", at: "ViiVue", date: "2024-11", href: "https://www.tamcocgarden.com/" },
  { slug: "the-deck-saigon", title: "The Deck Saigon", at: "ViiVue", date: "2024", href: "https://www.thedecksaigon.com/" },
  { slug: "the-vintage-emporium", title: "The Vintage Emporium", at: "Freelance", date: "2021", href: "https://vintageemporium.net/" },
  { slug: "dr-linh-clinic", title: "Dr. Linh Clinic", at: "Freelance", date: "2021-08", href: "https://drlinhclinic.vn/" },
  { slug: "easy-earth", title: "Easy Earth", at: "Freelance", date: "2021-08", role: "Shopify" },
  { slug: "dmd-by-sun-group", title: "DMD by Sun Group", at: "Freelance", date: "2026-03", href: "https://sundmd.com/" },
  { slug: "nimanja-vietnam", title: "Nimanja Vietnam", at: "Perxel", date: "2026-03" },
  { slug: "mooi", title: "MOOI", at: "Perxel", date: "2025-11", href: "https://mooi.vn/" },
  { slug: "volvo-mien-bac", title: "Volvo Mien Bac", at: "Perxel", date: "2019-06", href: "https://volvomienbac.vn" },
  { slug: "sgems", title: "SGems", at: "Perxel", date: "2023" },
  {
    slug: "growtrics",
    title: "Growtrics",
    at: "Perxel",
    date: "2026-01",
    line: "Website for an EdTech startup in Singapore: Next.js and GSAP, TinaCMS for content.",
    href: caseStudy("growtrics"),
  },
  {
    slug: "dta-luxury",
    title: "DTA Luxury",
    at: "Perxel",
    date: "2025-09",
    line: "Website for a luxury travel agency in Australia, on WordPress with plain Gutenberg blocks and no page builder.",
    href: caseStudy("dta-luxury"),
  },
  {
    slug: "khatra",
    title: "Khatra Tile",
    at: "Perxel",
    date: "2026-09",
    line: "Rebuild of a tile company's 10-year-old WordPress site: close to 800 products and 14,000 images cleaned up, SEO structure kept.",
    href: caseStudy("khatra"),
  },
  {
    slug: "openwallet",
    title: "OpenWallet",
    at: "Perxel",
    date: "2026-05",
    line: "Look up and compare bank cards in Vietnam, with an MCP server so AI assistants can query the card data.",
    href: caseStudy("openwallet"),
  },
]

const labels = aliasesByDate("P", list, (project) => project.date)

// Newest first, as the page shows them, each with its alias.
export const projects: (Project & { label: string })[] = list
  .map((project) => ({ ...project, label: labels.get(project)! }))
  .sort((a, b) => b.label.localeCompare(a.label, "en", { numeric: true }))
