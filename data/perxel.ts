// §3 Perxel: current client work, one line each, linking to the case study on perxel.com.
// Nothing is written twice: the story lives there (copywriting skill, section 3). A new case
// study on perxel.com gets one entry here, in the order to show.
export interface PerxelWork {
  slug: string
  title: string
  // One line: what it is and the one technical point worth knowing.
  line: string
  // The English case study on perxel.com.
  href: string
}

const caseStudy = (slug: string) => `https://perxel.com/en/works/${slug}`

export const perxelWorks: PerxelWork[] = [
  {
    slug: "openwallet",
    title: "OpenWallet",
    line: "Look up and compare bank cards in Vietnam, with an MCP server so AI assistants can query the card data.",
    href: caseStudy("openwallet"),
  },
  {
    slug: "khatra",
    title: "Khatra Tile",
    line: "Rebuild of a tile company's 10-year-old WordPress site: close to 800 products and 14,000 images cleaned up, SEO structure kept.",
    href: caseStudy("khatra"),
  },
  {
    slug: "dta-luxury",
    title: "DTA Luxury",
    line: "Website for a luxury travel agency in Australia, on WordPress with plain Gutenberg blocks and no page builder.",
    href: caseStudy("dta-luxury"),
  },
  {
    slug: "growtrics",
    title: "Growtrics",
    line: "Website for an EdTech startup in Singapore: Next.js and GSAP, TinaCMS for content. Built freelance, before Perxel.",
    href: caseStudy("growtrics"),
  },
]
