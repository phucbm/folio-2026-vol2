import pkg from "@/package.json"

export const site = {
  name: "Phuc Bui",
  url: "https://phucbm.com",
  /** The paper's version, shown instead of "last updated". Bump it in package.json; changes go in /errata. */
  version: pkg.version,
  description: "Phuc Bui's notes, work and numbers: a front-end developer's personal site, kept like a research paper.",
  email: "phucbm.dev@gmail.com",
}

/** Where to find me, in the order they are shown (from phucbm-web's /connect). */
export const contactLinks: { label: string; name: string; href: string }[] = [
  { label: "Email", name: site.email, href: `mailto:${site.email}` },
  { label: "GitHub", name: "phucbm", href: "https://github.com/phucbm" },
  { label: "LinkedIn", name: "phucbm", href: "https://www.linkedin.com/in/phucbm/" },
  { label: "X", name: "phucbm_", href: "https://x.com/phucbm_" },
  { label: "npm", name: "phucbm", href: "https://www.npmjs.com/org/phucbm" },
  { label: "Discord", name: "Join server", href: "https://discord.gg/9UFRcUZtPp" },
]
