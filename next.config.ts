import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import createMDX from "@next/mdx";

export default async function config(phase: string): Promise<NextConfig> {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;

  const nextConfig: NextConfig = {
    // Every page is static (Cloudflare static assets, `wrangler.toml`). Anything dynamic (Ask, forms)
    // lives on the MCP Worker, never here. Not under `next dev`: the dev-only visuals route reads
    // search params, which an export build cannot.
    ...(dev ? {} : { output: "export" as const }),
    // `*.dev.tsx` routes exist only in `next dev` (the visual templates, `app/(visuals)/`), so they
    // never reach the production build.
    pageExtensions: ["ts", "tsx", "md", "mdx", ...(dev ? ["dev.tsx"] : [])],
    // Let phones on the LAN load dev assets (otherwise the page doesn't hydrate).
    allowedDevOrigins: ["192.168.1.*"],
    images: {
      // No image server on static assets; images are optimised at build time instead.
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
