import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { site } from "@/lib/site";
import { shareMetadata } from "@/lib/og";
import { RunningHead } from "@/components/layout/RunningHead";
import { Colophon } from "@/components/layout/Colophon";
import "./globals.css";

export const metadata: Metadata = {
  // Under `next dev`, absolute URLs (og:image) point at the dev server, so the cards can be checked before a deploy.
  metadataBase: new URL(process.env.NODE_ENV === "development" ? `http://localhost:${process.env.PORT ?? 3000}` : site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
  // The home page's card; a page without its own (404) falls back to it.
  ...shareMetadata("/", { title: site.name, description: site.description }),
};

export const viewport: Viewport = {
  themeColor: "#f7f5f0",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-dvh flex flex-col">
        <RunningHead />
        <main className="flex-1 w-full max-w-measure-wide mx-auto px-4 sm:px-6 pt-14 pb-24 md:pt-20">
          {children}
        </main>
        <Colophon />
      </body>
    </html>
  );
}
