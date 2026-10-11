import localFont from "next/font/local";

// Self-hosted, one cut-down file per face: latin + vietnamese (project and place names) plus the
// symbols the paper uses (§, arrows, ≈ ≠ ≤ ≥ ∞, − ∕). Rebuild: .claude/docs/performance.md.
// Any face used anywhere in the DOM is fetched at load, so there are three and no more.

// Titles only: the name and section headings. Optical size pinned at 32 (display),
// weight kept 400-600. 50 KB.
const serif = localFont({
  variable: "--font-source-serif",
  src: "./fonts/source-serif-4-latin-vi.woff2",
  weight: "400 600",
});

// Reading text. Has true old-style figures (`onum`), used in running text. 41 KB.
const sans = localFont({
  variable: "--font-source-sans",
  src: "./fonts/source-sans-3-latin-vi.woff2",
  weight: "300 700",
});

// Its italic, as a family of its own so it isn't preloaded: next/font preloads every file of a
// family, and most pages have no italic. `app/globals.css` points `em`, `i` and `cite` in running
// text at it; the browser fetches it only when such an element is on the page. 41 KB.
const sansItalic = localFont({
  variable: "--font-source-sans-italic",
  src: "./fonts/source-sans-3-italic-latin-vi.woff2",
  weight: "300 700",
  style: "italic",
  preload: false,
});

// Numbers, dates and IDs only (N-047, 2026-10-11, table figures). Latin only, regular only. 15 KB.
const mono = localFont({
  variable: "--font-plex-mono",
  src: "./fonts/ibm-plex-mono-latin.woff2",
  weight: "400",
});

export const fontVariables = `${serif.variable} ${sans.variable} ${sansItalic.variable} ${mono.variable}`;
