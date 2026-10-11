---
name: paper
description: Keep phucbm.com set like a research paper. Use whenever a page, section, route, table, figure, list or label is added, removed, moved or renumbered; after any change to lib/routes.ts, lib/exhibits.ts, lib/aliases.ts or a page's layout; and to review the site's structure ("check the paper rules", "is this how a journal does it", "/paper"). Covers sections and appendices, table and figure numbering and captions, the lists of tables and figures, list aliases, cross-references, and leftovers whose reason is gone.
---

# Paper

The site follows a paper's conventions, not its costume. The rules live in `.claude/docs/design.md` ("The paper's parts") and `.claude/docs/content.md` ("Aliases"); this skill is how to apply and check them. Copy itself (voice, banned words) is the `copywriting` skill.

## 1. Run the check

`pnpm build` ends with `scripts/check-paper.mjs` (also `pnpm check:paper` after a build) and fails on:

- sections not numbered `§1, §2…` in contents order, appendices not lettered `§A, §B…` after them, or a page's title block disagreeing with `lib/routes.ts`;
- tables or figures not numbered `1, 2, 3` per kind in reading order (no gaps, no `0`, no `S1`), or with the wrong anchor id;
- a registered table or figure missing from its page, or its caption not the one in `lib/exhibits.ts`;
- a numbered caption on a page that is not registered;
- a mention of `Table N`, `Figure N` or `§N` in visible text that points at nothing.

`pnpm content:lint` covers MDX: no alias (`N-001`, `P-001`, `B-001`, `R-001`) in prose, no `number` field.

Fix every failure; never weaken the check to pass. If a rule is wrong, change it in `design.md` and the script together, with the owner.

## 2. Then check by judgement

The script sees numbers and anchors. Read the changed pages for the rest:

1. **Does each part have its paper equivalent?** A page is a section (numbered) or back matter (appendix). A set of measurements to compare is a table. A plot or picture is a figure. A run of entries (notes, projects, books, links) is a list. Don't use a table to lay out entries, or a list for measurements.
2. **Tables**: rules only, caption above, header cells `label`, figures right-aligned in `num`, a blank cell (with `sr-only` text) for a figure not measured. Columns the reader asked for, nothing decorative.
3. **Figures**: caption below; sub-figures `(a)`, `(b)` named in the caption.
4. **Captions**: the registered first sentence says what the table or figure shows; a page may add one more sentence (a source, a caveat). The List of Tables and List of Figures show the first sentence, so it must make sense on its own.
5. **Lists of entries**: flat, newest first, alias column in `num`, no groups (the order is the timeline; what a group said goes in a `label` on the row).
6. **Labels are exact and mono**: `§3`, `Table 2`, `Figure 1`, `N-004`. Copy names an item, never its alias (aliases shift).
7. **Numbers follow the reading order.** Adding a table or figure before others renumbers the ones after it: update `lib/exhibits.ts` in order, then search the copy for the old numbers (the check catches dead ones, not ones that now point at the wrong thing).
8. **Leftovers.** Every convention needs a reason that still holds. When something is removed (a collection, a page, a section), look for numbering, labels, comments and docs that existed only because of it, and raise them with the owner instead of keeping them. Past examples: Figure 0 and Figure S1 existed only to avoid clashing with archived-project figures; when those went, the reason went too.

## 3. Report

When reviewing, list each finding as `path:line`, what breaks, which rule, a concrete fix. Say "matches a journal convention" or "stale" when the owner asks why something is the way it is, and say which.
