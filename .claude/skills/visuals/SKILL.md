---
name: visuals
description: Plan and make the images and short videos an entry needs (notes), consistently, from a recipe that can be re-run. Use after writing or revising any MDX content, when an entry mentions something the reader should see, or when the user says "add images", "illustrate this", "visuals for", "/visuals". Decides per spot whether to reuse an existing file, capture or record a live page, compose an image from a template, or ask the owner for a screenshot.
---

# Visuals

Every visual in an entry comes from a **recipe**, `content/visuals/<collection>/<slug>.ts` (type `VisualRecipe`, `lib/visuals/types.ts`). The runner makes the files; nothing is drawn by hand, so the same recipe gives the same pictures and one command re-makes them.

```
pnpm visuals inventory [collection]     media in public/images, which files use it, its alt text
pnpm visuals status <slug>              each visual: made? placed in the MDX? what to provide
pnpm visuals build <slug> [id...]       make them (all, or the ids named)
    --origin=<url>                      site to capture (default: ORIGIN in scripts/visuals/cli.mjs)
    --dev=http://localhost:3000         running `pnpm dev`, needed for compose (template route is dev-only)
```

Outputs: `public/images/<collection>/<slug>-<id>.webp|mp4`. Raw captures are cached in `.visuals/` (gitignored). Needs `ffmpeg`, `magick` and Chrome for Testing (`pnpm dlx @puppeteer/browsers install chrome@stable`, or `CHROME_PATH`).

## Workflow

1. **Audit.** Read the entry. Mark each spot where the reader should *see* something: a UI, an effect, a result. A visual shows what the text says, never decorates. Run `pnpm visuals inventory <collection>`.
2. **Visual plan, then wait.** Show a table: spot (heading) → what it shows → route (below) → id. The owner approves before anything is placed. Making files before approval is fine when it helps judge them; editing the MDX is not (the `copywriting` skill's revise rule).
3. **Write the recipe** and run `pnpm visuals build <slug>`. For compose, `pnpm dev` must be running.
4. **Check every output by eye before showing it.** Images: Read them. Videos: a contact sheet, `ffmpeg -i <mp4> -vf "fps=1,scale=280:-1,tile=5x2" -frames:v 1 sheet.png`. Fix the recipe and rebuild what fails: wrong start, dead time at the end, blank frames, a dev badge, a cookie banner.
5. **Place them** (after approval), with alt text and a caption per the `copywriting` skill. Run `pnpm visuals status <slug>`: everything `made, placed`.
6. **Provided files:** when the owner sends one, put it at the path `status` prints and run `build <slug> <id>`.

## Routes

| Route (`kind`) | When | Output |
|---|---|---|
| `reuse` | A fitting file already exists (`inventory`) | the existing path |
| `capture` | Something visible on a live page: a screen, or one element (`selector`). `url` may be a full URL (a project's live site) | WebP, 2-3x sharp, max 1600px |
| `record` | The motion is the point (a scroll effect, a hover) | MP4 (1120px, crf 34, silent) + poster WebP |
| `compose` | Nothing to screenshot: screenshots side by side, code as a picture | WebP at a fixed size (`SIZES` in `lib/visuals/presets.ts`) |
| `provide` | Only the owner can get it: old projects that are offline (ViiVue archive screenshots), anything behind a login, dashboards, results that change per run. `media: "video"` for a screen recording | same as capture / record |
| `intermediate: true` | An input for a compose only | cache only, not in `public/` |

Rules:
- **Scores and stats are `provide`** or come from the data pipeline, never captured by the runner.
- **Real, not generated.** No AI imagery, no stock photos.
- **Records stay short**: 5 to 8 s, start in motion, end within about a second of the effect finishing. One effect per clip.

## Templates (`components/visuals/`)

Registered in `components/visuals/templates.ts`, rendered by `app/(visuals)/visuals/[template]/page.dev.tsx` (only `next dev` builds `.dev.tsx` routes; the root layout still renders around it, and the template root is fixed over it). Props come from the recipe as JSON; `"@<id>"` is another visual's cached capture.

- `gallery`: `{images, labels?, columns?}`. Screenshots side by side on paper with hairline borders, labels in mono under each (sub-figure style: `(a) desktop`).
- `code`: `{code, file?}`. Code drawn as a picture in Plex Mono, comments muted.

A new template: a client component taking `TemplateSize` plus its props, `data-visual-pending` on anything still loading until drawn, `data-visual-error` for bad props. Use the site's tokens (`bg-paper`, `text-ink`, `border-rule`, `num`), never Perxel's.

## Placing in MDX

```mdx
![Alt text describing what the image shows](/images/notes/<slug>-<id>.webp)

*Figure caption, one sentence.*
```

A video player component comes with the first entry that needs one. A banner goes in frontmatter as `featureImage`.
