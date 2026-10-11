---
name: copywriting
description: The one place for every writing rule on phucbm.com. Use before writing, revising or reviewing ANY copy on this site: notes (content/notes), archived projects (content/archived), page files (app/**/page.tsx), section intros, captions, the abstract. Covers the voice (first person, plain spoken English), what goes here versus on perxel.com, the paper's conventions, banned words, MDX structure and the review checklist. Triggers: "write a note", "write up this project", "revise the copy", "review content", "/copywriting", any edit to site text.
---

# Copywriting (phucbm.com)

Every writing rule for this site lives in this file. The only other piece is the deterministic linter (`content/lint/rules.mjs`, run by `pnpm content:lint` and automatically on every `.mdx` write through `.claude/hooks/content-lint.mjs`). If a rule changes, change it here (and in `rules.mjs` if a regex can check it). Do not start new rule files.

## 0. Workflow

**Write a new piece**
1. Decide where it belongs (section 3). If it belongs on perxel.com, say so and stop.
2. Read what is already there: the collection's existing entries, the page file you are adding to.
3. Draft following sections 1 to 5.
4. Reread it as the owner saying it out loud to another developer. Cut anything nobody would say.
5. `.mdx`: the hook lints on write; fix every finding. Page files (`.tsx`) are not linted, so check section 4 by hand.
6. Run the review checklist (section 7) on your own draft before showing it.
7. Then run the `visuals` skill to plan the images the entry needs.

**Revise existing copy**
- Show before → after pairs in chat and wait for approval. Never edit the file first.
- Keep every sentence that already reads fine. Change only what is actually off. A revision that rewrites everything is worse than the original, and on a personal site it erases the owner's voice.
- Reply with the pairs only. Flag facts that look wrong separately, never silently change a fact.

**Never add copy nobody asked for** (sublines, labels, a closing line). Suggest it in one line instead.

**Never invent the owner's experience.** A personal site is made of facts about one person: what they built, when, what broke, what they learned. Use only what is in the repo, in the old sites (`../phucbm-web`, `../folio-2026`), in git history, or what the owner said. Where a draft needs a fact you don't have, leave a visible `[TODO: ...]` and ask.

## 1. Voice

The owner is a front-end engineer in Ho Chi Minh City who writes in English as a second language. The target is how the owner talks to another developer: direct, first person, a bit playful, short sentences, no performance.

- **First person singular.** "I built", "I dropped it because". "We" only for a real team (ViiVue, Perxel) and only when the team did it.
- **Plain spoken English.** Say the thing; don't describe it. Short words over long ones (*use*, not *utilize*; *help*, not *facilitate*).
- **Correct, not polished.** Fix grammar (articles, tenses, plurals, "I" capitalised), keep the owner's phrasing. The old opening *"Took me less than a week to deploy this new version of my blog."* is the voice; *"This post hopefully be quite helpful!"* needs only the grammar fixed (*"I hope it helps."*), not a rewrite into marketing.
- **Playful carries the warmth**, never jokes for their own sake. One light line in an abstract or an intro, not one per paragraph.
- **Opinions stated as opinions**, with the reason: *"I stopped using X because Y."* Not *"X is bad."*
- **Specific over general.** The version number, the measurement, the file, the project name. A number with its unit and conditions beats an adjective.
- **No hedging stacks** (*"perhaps it might be worth considering"*). Say it once, plainly.

## 2. The paper's conventions (what makes this site this site)

The site is set like a research paper; the copy follows the paper's habits, not its costume.

- **Abstract first.** Every entry opens with what it is and what it found, in two or three sentences. No warm-up, no "In this post I will".
- **Results as tables.** Comparisons, measurements and before/after go in a markdown table, not in prose.
- **Numbers are measured, never typed.** Counts that change (commits, downloads, stars, number of notes) come from the data pipeline (plan 001, "Data"); copy never hard-codes them. Don't count things that will grow (*"three packages"*): list them, or say *the packages*.
- **Cite what you use.** A claim from somewhere else links to it. A note that builds on another note, a figure or a reference says so (`see N-012`, `Figure 3`).
- **Labels are exact.** Notes are `N-047`, archived projects are `Figure 3`, sections are `§1`. Use them the same way everywhere.
- **No costume.** No "herein", "we posit", "the author"; no Latin; no small-caps jokes. The structure is academic, the sentences are not.

## 3. What goes where

| Topic | Where | Here |
|---|---|---|
| Engineering notes, experiments, TILs, opinions, how I built something | **here**, `/notes` | the full entry |
| Client-facing posts (services, how Perxel works, why a client should pick X) | **perxel.com** insights | nothing, or a one-line note that links there if it is also a personal finding |
| ViiVue work, 2017 to 2025 | **here**, `/archived` | a figure: screenshots, 2 or 3 paragraphs, stack, year, what I learned. Not a case study |
| Current client work (Perxel) | **perxel.com** works | one line in `/perxel`, linking to the case study. Nothing written twice |
| Open source packages | **here**, `/oss` | what it does, numbers from the pipeline, link to the repo and docs (ui.phucbm.com for components) |

- **Never write the same thing in two places.** Link instead.
- **Archived work was done at ViiVue**, not by Perxel. Never imply Perxel delivered it, and on perxel.com never present it as Perxel's.
- **Perxel copy follows Perxel's own `copywriting` skill** (in `perxel-web-2026`), not this one.

## 4. Banned words and structures

| # | Rule |
|---|---|
| B.1 | **No em or en dash** (`—`, `–`, `--`) and no ` - ` joining two clauses. Use a comma, colon, parentheses or a new sentence. Number ranges take a plain hyphen (`2018-2024`). Linted. |
| B.2 | **No buzzwords**: game-changing, cutting-edge, world-class, best-in-class, seamless, revolutionise, unleash, supercharge, next-level, holistic, robust, leverage, empower. Linted (warn). |
| B.3 | **No stock AI phrasing**: "let's dive in", "delve", "tapestry", "a testament to", "in the realm of", "in today's fast-paced world", "it's worth noting", "embark on", "not just X, but Y". Linted (warn). Also: a summary sentence closing every paragraph, three-item lists by reflex, rhetorical questions as section openers. |
| B.4 | **Lowercase "i"** as the pronoun. Linted. |
| B.5 | **No stub sections**: a heading never holds a single line repeating the heading. |
| B.6 | **No self-promotion adjectives** about the owner (*passionate, expert, seasoned, creative*). Show the work; the reader decides. |

## 5. MDX mechanics

**Collections**: `content/notes/*.mdx` (route `/notes/<slug>`) and `content/archived/*.mdx` (route `/archived/<slug>`). The filename is the slug: short, kebab-case, English.

**Frontmatter** (first thing in the file, before imports; compiled to `meta`):
- Every entry: `title`, `excerpt` (one or two sentences: the listing line, meta description and feed summary), `tags` (lowercase list, first is primary; may be empty), `status` (`"draft"` / `"published"` / `"unlisted"`). Optional: `seoTitle`, `updated`, `related` (slugs in the same collection), `projects` (archived slugs the entry is about), `featureImage`, `ogImage`.
- Notes: `number` (the next free one: `grep -h '^number:' content/notes/*.mdx | sort -n | tail -1`, plus one; never renumber a published note) and `date`.
- Archived: `figure` (unique, never renumbered once published), optional `year` (figures are numbered by it once known), `client`, `role` (a few words), `stack` (plain names), `url` (the live site, if it still exists).
- **Quote every date** (`date: "2026-10-11"`). **No `slug` field.**
- `updated`: set by hand when a published entry changes in a way readers should know (not typos). Never on a new entry. The hook reminds you.

**Body**
- No `# H1` (the layout renders `title`). Start with the abstract paragraph, then `##` / `###`.
- One paragraph per physical line, no hard wrapping.
- Links are plain markdown, internal (`/notes/x`) and external alike.
- Tables are GFM tables (`remark-gfm`). Put the unit in the header (`Time (ms)`), not in every cell.
- Footnotes (`[^1]`) only where the entry actually cites something; the layout turns them into sidenotes (plan 001).
- Code in fenced blocks with a language. Code the reader should understand but not copy can be a `code` visual instead (`visuals` skill).
- Bold only the key claim of a paragraph, if anything.

**After adding a file**: add its filename to the collection's `index.ts` (no `fs` scanning), then `pnpm typecheck` and `pnpm content:lint`.

## 6. Linter

`pnpm content:lint [files]` checks the deterministic rules: dashes, lowercase "i", buzzwords and stock phrases (warnings), frontmatter shape, unique `number` / `figure`, unknown `projects` / `related` slugs. It runs on every `.mdx` write via the hook. It cannot judge sections 1 to 3; that is what section 7 is for.

## 7. Review checklist

Use for "review content", after drafting, or before showing a revision.

1. Scope: the given paths, or every changed `.mdx` under `content/` (`git status`). Page files when named.
2. Run `pnpm content:lint <files>`; report every error and warning; don't re-check what it caught.
3. Read each file in full.
4. Check, in order: section 3 (does it belong here?), section 1 (voice), section 2 (conventions, hard-coded numbers), section 4 (B.3 to B.6 by judgement), section 5 (structure), and any invented fact (section 0).
5. Report one list ordered by file then line: `path:line`, the quoted phrase, the rule, why in one sentence, a concrete rewrite. End with `clean` or `N findings` per file. Mark judgement calls as such and let the owner choose.
6. Don't edit unless asked. If asked, apply, then re-run `pnpm content:lint` on the touched files.
