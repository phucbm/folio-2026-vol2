import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import createMDX from "@next/mdx";

export default async function config(phase: string): Promise<NextConfig> {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;

  const nextConfig: NextConfig = {
    // OpenNext on Workers (plan 002, `wrangler.toml`): every page is prerendered, and the five with
    // outside numbers render again hourly. `SHOW_DRAFTS` is fixed at build, so a page rendered again
    // on the Worker lists the same notes as the build.
    env: { SHOW_DRAFTS: process.env.SHOW_DRAFTS ?? "" },
    // `*.dev.tsx` routes exist only in `next dev` (the visual templates, `app/(visuals)/`), so they
    // never reach the production build.
    pageExtensions: ["ts", "tsx", "md", "mdx", ...(dev ? ["dev.tsx"] : [])],
    // Let phones on the LAN load dev assets (otherwise the page doesn't hydrate).
    allowedDevOrigins: ["192.168.1.*"],
    images: {
      // No image server on the Worker; images are optimised at build time instead.
      unoptimized: true,
    },
  };

  const withMDX = createMDX({
    options: {
      // Turbopack can't pass JS functions to its Rust core, so plugins are named by package.
      remarkPlugins: ["remark-gfm", "remark-frontmatter", ["remark-mdx-frontmatter", { name: "meta" }]],
    },
  });

  // Keep content/meta.generated.json (the collections' frontmatter) in step with MDX edits.
  if (dev) {
    const { watchContentMeta } = await import("./scripts/content-meta.mjs");
    watchContentMeta();
  }
  return withMDX(nextConfig);
}
