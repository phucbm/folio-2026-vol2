import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page is static (Cloudflare static assets, `wrangler.toml`). Anything dynamic
  // (Ask, forms) lives on the MCP Worker, never here.
  output: "export",
  // Let phones on the LAN load dev assets (otherwise the page doesn't hydrate).
  allowedDevOrigins: ["192.168.1.*"],
  images: {
    // No image server on static assets; images are optimised at build time instead.
    unoptimized: true,
  },
};

export default nextConfig;
