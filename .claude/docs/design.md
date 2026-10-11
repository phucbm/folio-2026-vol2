# Design

A research paper, not a portfolio (plan 001, "Direction"). The paper's conventions organise the site; its costume (Computer Modern, small caps, footnote markers everywhere) stays out. Tokens live in `app/globals.css`; this file says how to use them.

## Tokens

| Token | Value | Use |
|---|---|---|
| `paper` | `#f7f5f0` | Background. Light only: dark mode comes designed, or not at all |
| `ink` | `#1c1b19` | Text, headings, the heavy rules of a table |
| `ink-muted` | `#625e57` | Labels, captions, dates, counts (5.4:1 on paper) |
| `rule` | `#d8d2c6` | Hairlines: the running head, a table's inner rule, list dividers |
| `accent` | `#1a6399` | Links only (5.3:1). Nothing else is blue |
| `plot` | `#1f77b4` | Plots (matplotlib's C0) and the selection tint. Never text |
| `measure` | `38rem` | Reading column: prose, the home page, listings |
| `measure-wide` | `52rem` | The page frame (running head, colophon); wide tables and figures |

No other colours. A state that needs one (error, success) is said in words.

## Type

Three faces (`lib/fonts.ts`, `.claude/docs/performance.md`), each with one job:

- **Serif** (Source Serif 4): the name and headings (`h1`-`h4`, by the base layer). Weight 500 (`font-medium`). Never body text, never a label.
- **Sans** (Source Sans 3): everything you read. Old-style figures in running text (`body` sets `oldstyle-nums`). Italic only through `em`, `i`, `cite`.
- **Mono** (IBM Plex Mono): numbers, dates and IDs, through the `num` utility (lining, tabular, 0.875em). Never a word.

Sizes: the root is 17px (18px from `md`). Name `text-4xl md:text-5xl`; page title `text-3xl md:text-4xl` (`PageHeader`); section `text-2xl`; MDX `h2` `text-2xl`, `h3` `text-xl`; table text `0.9375rem`; `label` `0.8125rem`. Nothing else.

The `label` utility (muted, small) is the one secondary style: running head, captions, table headers, meta lines. A run-in heading that should read like a paper's ("Abstract") is a `label` set in ink, semibold, uppercase, tracked `0.08em`.

## Layout

- `main` is `measure-wide`, gutter `px-4 sm:px-6`. Content sits in `max-w-measure` inside it; only tables and figures that need it take the full width.
- Vertical rhythm: `mt-10` from a title block to the first section, `mt-14` between sections of a page, `my-4` between paragraphs, `my-6` around tables, code and images.
- Breakpoints: `sm`/`md`/`lg` only (`lib/media.ts` and the block at the top of `globals.css`). Never a raw `@media`.

## The paper's parts

- **Labels** are exact and mono: `§1`, `N-047`, `Figure 3`, `Table 1`. Sections are numbered (`§1`) and back matter lettered as appendices (`§A`), both in `staticRoutes` (`lib/routes.ts`); only the numbered ones go in the running head.
- **Title block** (`components/content/PageHeader.tsx`): label above, serif title, a `label` meta line below.
- **Tables**: rules only, no fills and no vertical lines. A heavy `ink` rule above and below (`border-y border-ink`), a `rule` hairline under the header. Header cells `label`, left-aligned for words, right-aligned for figures. Figures in `num`, right-aligned, `toLocaleString("en-US")`. A figure not measured yet is a blank cell (with `sr-only` text), never a typed number or a dash. MDX tables get the same through `mdx-components.tsx`.
- **Table captions go above the table**, figure captions below the figure, as in a paper: `Table 1.` (or `Figure 3.`) in semibold ink, then one sentence in `label`.
- **Contents**: section label, title as a link, dotted leaders to a count in `num`. Pages without a count get no leader.
- **Lists of entries** (`/notes`): label column, title, date in `num`, divided by `rule` hairlines.
- **Links**: `accent`, underlined at 35% and solid on hover. No buttons for navigation.

## Motion

Still by default. The one live element is the pluckable line of Figure 0 (part 6), on `/stats` only; the home page shows Figure 0 as the still calendar. Pointer effects behind `FINE_POINTER` / `fine-pointer:`, all of them off under reduced motion (`.claude/docs/performance.md`).

## Don't

- No cards, shadows, gradients, rounded boxes, icons beside links, or hero sections.
- No "latest posts" on the home page: the contents and Table 1 point to the sections.
- No fourth font, no second accent, no dark mode by inversion.
