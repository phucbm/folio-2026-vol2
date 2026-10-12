// Single source of truth for the content linter.
//
// `scripts/lint-content.mjs` (the `pnpm content:lint` CLI and the Claude Code edit hook) reads this
// file, and the `copywriting` skill points to it. Only DETERMINISTIC rules live here (what a regex or a
// frontmatter check can catch with few false positives). Judgement calls (voice, what goes where) are in
// .claude/skills/copywriting/SKILL.md.

import {readFileSync, readdirSync, existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";
import {parse} from "yaml";
import {COLLECTIONS} from "../../scripts/content-collections.mjs";

const contentDir = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * @typedef {Object} Rule
 * @property {string} id           kebab-case identifier, shown in output
 * @property {"error"|"warn"} severity  error => non-zero exit, warn => report only
 * @property {RegExp} pattern      tested against each preprocessed prose line
 * @property {string} message      what is wrong
 * @property {string} [suggest]    what to write instead
 */

/** @type {Rule[]} */
export const proseRules = [
  // --- Punctuation that reads as machine-written ---------------------------------------------
  {
    id: "em-dash",
    severity: "error",
    pattern: /[—–]|(?<=\S)\s--\s(?=\S)/u,
    message: "Em or en dash (—/–) or `--` joining clauses reads as AI writing.",
    suggest: "Two sentences, or a comma, colon or parentheses. A range of numbers takes a plain hyphen (2018-2024).",
  },
  {
    id: "hyphen-clause-joiner",
    severity: "warn",
    pattern: /(?<=[\p{L}\p{N}])\s-\s(?=[\p{L}\p{N}])/u,
    message: "` - ` between two clauses is an em dash in disguise.",
    suggest: "Two sentences, or a comma or colon. Compound words (`no-code`, `re-run`) are fine.",
  },

  // --- Voice ----------------------------------------------------------------------------------
  {
    id: "lowercase-i",
    severity: "error",
    pattern: /(?<![\p{L}\p{N}_.\/@#-])i(?=\s|'(?:m|ve|d|ll)\b)/u,
    message: "The pronoun `I` is a capital letter.",
  },
  {
    id: "buzzword",
    severity: "warn",
    pattern: /\b(game[- ]?chang(?:er|ing)|cutting[- ]edge|world[- ]class|best[- ]in[- ]class|seamless(?:ly)?|revolutioni[sz]e|unleash|supercharge|next[- ]level|holistic|robust|leverag(?:e|ing)|empower(?:s|ing)?)\b/iu,
    message: "Empty buzzword.",
    suggest: "Say what the thing does, with the number, the project or the code behind it.",
  },
  {
    id: "ai-template",
    severity: "warn",
    pattern: /\b(let'?s dive (?:in|into)|dive deep|delve|tapestry|testament to|in the (?:realm|world) of|in today'?s (?:fast[- ]paced|digital)|it'?s worth noting|embark on|navigat(?:e|ing) the (?:complex|ever)|not just (?:a|an) [^.\n]{0,30}, but)\b/iu,
    message: "Stock phrase of machine-written prose.",
    suggest: "Say the thing directly, the way you would to a colleague.",
  },

  // --- Labels ---------------------------------------------------------------------------------
  {
    id: "alias-in-prose",
    severity: "error",
    pattern: /\b[NPBR]-\d{3,}\b/u,
    message: "An alias (N-001, P-001, B-001, R-001) is a position by date and shifts when an older item is added (lib/aliases.ts).",
    suggest: "Name the item and link it: [How I Built My Blog](/notes/how-i-built-my-blog).",
  },
];

// Rules checked once per raw line.
export const structureRules = {
  // The layout renders `title`; the body starts with the first paragraph.
  noH1: {
    id: "no-h1-in-body",
    severity: "error",
    test: (line) => /^#\s+\S/.test(line) && !/^#{2,}/.test(line),
    message: "No `# H1` in the body: the layout renders the title from frontmatter.",
  },
  noJsMeta: {
    id: "no-js-meta-export",
    severity: "error",
    test: (line) => /export\s+const\s+meta\s*=/.test(line),
    message: "Use YAML frontmatter (--- ... ---), not `export const meta = {}`.",
  },
};

function parseFm(fm) {
  try {
    return parse(fm) ?? {};
  } catch {
    return null;
  }
}

const isDateString = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

// Checked once per file against the raw frontmatter text (`fm` is null when there is none).
export const frontmatterRules = [
  {
    id: "frontmatter-missing",
    severity: "error",
    test: (fm) => fm === null,
    message: "No YAML frontmatter block (--- ... ---) at the top of the file.",
  },
  {
    id: "frontmatter-invalid",
    severity: "error",
    test: (fm) => fm !== null && parseFm(fm) === null,
    message: "Frontmatter is not valid YAML.",
  },
  {
    id: "frontmatter-unquoted-date",
    severity: "error",
    test: (fm) => fm !== null && /^(date|updated):\s*(?!["'])\S/m.test(fm),
    message: "Quote `date` and `updated` (`date: \"2026-10-11\"`); unquoted, YAML turns them into Date objects.",
  },
  {
    id: "frontmatter-updated-before-date",
    severity: "error",
    test: (fm) => {
      const data = fm !== null && parseFm(fm);
      return Boolean(data && isDateString(data.date) && isDateString(data.updated) && data.updated < data.date);
    },
    message: "`updated` is earlier than `date`.",
  },
  {
    id: "frontmatter-slug-field",
    severity: "error",
    test: (fm) => fm !== null && /^slug:\s*\S/m.test(fm),
    message: "Drop `slug`: the filename is the slug.",
  },
  {
    id: "frontmatter-number-field",
    severity: "error",
    test: (fm) => fm !== null && /^number:/m.test(fm),
    message: "Drop `number`: N-001 is derived from the date (lib/aliases.ts).",
  },
  {
    id: "frontmatter-required",
    severity: "error",
    test: (fm) => {
      const data = fm !== null && parseFm(fm);
      if (!data) return false;
      return (
        typeof data.title !== "string" || !data.title.trim() ||
        typeof data.excerpt !== "string" || !data.excerpt.trim() ||
        !Array.isArray(data.tags)
      );
    },
    message: "Every entry needs `title`, `excerpt` (strings) and `tags` (a list, may be empty).",
  },
  {
    id: "frontmatter-status",
    severity: "error",
    test: (fm) => {
      const data = fm !== null && parseFm(fm);
      return Boolean(data) && !["draft", "published", "unlisted"].includes(data.status);
    },
    message: "`status` must be \"draft\", \"published\" or \"unlisted\".",
  },
];

// --- Rules that need the rest of the collection -------------------------------------------------

/** Frontmatter of every .mdx in content/<collection>, by slug. Read fresh on every run (the hook lints one file). */
function collection(name) {
  const dir = join(contentDir, name);
  if (!existsSync(dir)) return new Map();
  const out = new Map();
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".mdx"))) {
    const fm = readFileSync(join(dir, file), "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
    out.set(file.slice(0, -".mdx".length), (fm && parseFm(fm)) || {});
  }
  return out;
}

/** The file without its frontmatter. */
const body = (raw) => raw.replace(/^---\r?\n[\s\S]*?\r?\n---/, "");

/** Lines inside fenced code blocks. */
function codeLines(raw) {
  let inside = false;
  let n = 0;
  for (const line of body(raw).split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inside = !inside;
    else if (inside) n++;
  }
  return n;
}

// A note with a skill may show a short snippet; past this, it is the recipe again.
const SKILL_NOTE_CODE_MAX = 20;
// A note without a skill and more code than this reads as a recipe for agents.
const RECIPE_CODE_MIN = 80;

function collectionOf(rel) {
  return rel.split("\\").join("/").match(/^content\/([^/]+)\//)?.[1];
}

/**
 * @typedef {Object} FileRule
 * @property {string} id
 * @property {"error"|"warn"} severity
 * @property {(fm: string|null, rel: string, raw: string) => string|null} test  returns the message, or null when fine
 */

/** @type {FileRule[]} */
export const fileRules = [
  {
    id: "note-date",
    severity: "error",
    test: (fm, rel) => {
      if (collectionOf(rel) !== "notes") return null;
      const data = fm !== null && parseFm(fm);
      return data && !isDateString(data.date) ? "Notes need `date: \"YYYY-MM-DD\"`." : null;
    },
  },
  {
    id: "note-skill-path",
    severity: "error",
    test: (fm, rel) => {
      const data = fm !== null && parseFm(fm);
      if (!data || data.skill === undefined) return null;
      if (collectionOf(rel) !== "notes") return "`skill` is for notes only.";
      // Same pattern as SKILL_PATH in lib/skills.ts.
      return typeof data.skill === "string" && /^[a-z0-9-]+\/[a-z0-9-]+$/.test(data.skill)
        ? null
        : "`skill` is the skill's folder in phucbm/skills, `domain/name` (`skill: \"nextjs/og-images\"`).";
    },
  },
  // A note's recipe for agents lives in phucbm/skills (`skill`); the note keeps what a person reads.
  {
    id: "skill-repeated-in-body",
    severity: "error",
    test: (fm, rel, raw) => {
      const data = fm !== null && parseFm(fm);
      if (!data?.skill || collectionOf(rel) !== "notes") return null;
      return /npx skills|github\.com\/phucbm\/skills/.test(body(raw))
        ? "The note page already shows the skill's link and install line (`skill` in frontmatter): drop them from the body."
        : null;
    },
  },
  {
    id: "skill-recipe-in-body",
    severity: "warn",
    test: (fm, rel, raw) => {
      const data = fm !== null && parseFm(fm);
      if (!data?.skill || collectionOf(rel) !== "notes") return null;
      const lines = codeLines(raw);
      return lines > SKILL_NOTE_CODE_MAX
        ? `${lines} lines of code in a note with a skill: the recipe goes in the skill, the note keeps what happened and what surprised you.`
        : null;
    },
  },
  {
    id: "recipe-without-skill",
    severity: "warn",
    test: (fm, rel, raw) => {
      const data = fm !== null && parseFm(fm);
      if (!data || data.skill || collectionOf(rel) !== "notes") return null;
      const lines = codeLines(raw);
      return lines > RECIPE_CODE_MIN
        ? `${lines} lines of code: a recipe this long is for agents. Move it to phucbm/skills (its /add-skill) and set \`skill\` (copywriting skill, "Write a note with a skill").`
        : null;
    },
  },
  {
    id: "related-unknown-slug",
    severity: "error",
    test: (fm, rel) => {
      const data = fm !== null && parseFm(fm);
      const name = collectionOf(rel);
      if (!data || !name || !Array.isArray(data.related)) return null;
      const known = collection(name);
      const unknown = data.related.filter((slug) => !known.has(slug));
      return unknown.length ? `\`related\` names unknown entries: ${unknown.join(", ")} (slugs are content/${name}/*.mdx filenames).` : null;
    },
  },
];

// Directories scanned by the linter, relative to the repo root.
export const contentGlobs = COLLECTIONS.map((name) => `content/${name}`);
