// §D CV: the resume from folio-2026 (content/pages/resume.md), moved over and brought up to date with
// perxel.com (2026-10-11): Perxel is my studio (working since 2022, registered 2026), hosted on
// Cloudflare. The projects themselves are in data/projects.ts; this file is the one-page summary for
// whoever is hiring.

export interface Job {
  role: string
  company: string
  href: string
  // "YYYY-MM"; no end means it is still running.
  start: string
  end?: string
  // Links are written [text](url), the only markup the page reads.
  body: string
  // Said plainly, under the entry: what a recruiter would ask about it.
  note?: string
}

export const cv = {
  headline: "Frontend engineer. Production websites, open-source libraries, AI integration.",
  summary: "Shipped 300+ production sites. Now running Perxel, my web studio: WordPress and Next.js websites, open-source WordPress plugins, and MCP servers that connect AI to a company's data.",
  location: "Ho Chi Minh City, Vietnam",
  focus: "Frontend Engineering / AI Integration",
  availability: "I'm open to new opportunities.",
  jobs: [
    {
      role: "Founder & Lead Engineer",
      company: "Perxel",
      href: "https://perxel.com",
      start: "2022-04",
      body: "Founded a web studio building WordPress and Next.js websites, often from Figma designs for agencies and designers. Ships open-source WordPress plugins ([AI translation for WPML](https://perxel.com/en/products/perxel-ai-translate) through OpenRouter, [WebP image optimization](https://perxel.com/en/products/perxel-image-optimizer)) and builds MCP servers that connect AI assistants to business data ([OpenWallet](https://perxel.com/en/works/openwallet)'s card data). Owns full delivery end to end: architecture, performance, cross-browser QA, and Cloudflare deployment.",
      note: "From April 2022 to May 2025 I worked at ViiVue and on Perxel at the same time. Perxel was registered as a company in 2026.",
    },
    {
      role: "Lead Frontend Engineer",
      company: "ViiVue",
      href: "https://www.viivue.com",
      start: "2017-09",
      end: "2025-05",
      body: "Delivered 300+ production websites across enterprise, education, and hospitality. Proposed and led jQuery-to-vanilla-JS migration; built the custom component libraries that replaced it. Introduced atomic-css, an in-house utility system adopted across all projects. Led a 5+ person team: CI/CD migration to GitHub Actions, code review standards, internal documentation.",
    },
  ] satisfies Job[],
  stack: [
    "HTML5 / CSS3 / Vanilla JS",
    "TypeScript",
    "React",
    "Next.js",
    "WordPress / Gutenberg",
    "Tailwind CSS",
    "CSS Animation",
    "MCP / Claude API",
    "OpenRouter",
    "Langfuse",
    "Vite",
    "Vitest",
    "GitHub Actions",
    "Vercel",
  ],
  // Linked where the work has a public case study.
  clients: [
    "REE Corp",
    "Long An International Port",
    "RMIT Vietnam",
    "Sky Preschool",
    "Tam Coc Garden",
    "Mia Nha Trang",
    "The Deck Saigon",
    { name: "Growtrics", href: "https://perxel.com/en/works/growtrics" },
    "DMD by Sun Group",
    "Koru Education",
  ],
}
