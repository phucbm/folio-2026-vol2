#!/usr/bin/env node
// Content linter.
//
//   pnpm content:lint              lint every .mdx under content/{notes,archived}
//   pnpm content:lint <file...>    lint only the given files (used by the Claude Code edit hook)
//   pnpm content:lint --quiet      only print when there is something to report
//
// Rules live in content/lint/rules.mjs (shared with the copywriting skill).
// Exit code: 1 if any `error`-severity finding, 0 otherwise (warnings never fail).

import {readFileSync, readdirSync, statSync} from "node:fs";
import {join, relative, resolve, extname} from "node:path";
import {fileURLToPath} from "node:url";

import {proseRules, structureRules, frontmatterRules, fileRules, contentGlobs} from "../content/lint/rules.mjs";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const args = process.argv.slice(2);
const quiet = args.includes("--quiet");
const fileArgs = args.filter((a) => !a.startsWith("--"));

const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir, {withFileTypes: true});
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    // index.mdx is a route page shell (Next `export const metadata`), not a post.
    else if (entry.isFile() && extname(entry.name) === ".mdx" && entry.name !== "index.mdx") {
      out.push(full);
    }
  }
  return out;
}

function collectFiles() {
  if (fileArgs.length > 0) {
    return fileArgs
      .map((f) => resolve(f))
      .filter((f) => extname(f) === ".mdx")
      .filter((f) => {
        try {
          return statSync(f).isFile();
        } catch {
          return false;
        }
      });
  }
  return contentGlobs.flatMap((g) => walk(join(repoRoot, g)));
}

// Strip the parts of an .mdx file that are not prose the rules should scan:
// fenced code blocks, inline code, and single-line `{ ... }` JSX expressions
// (which legitimately contain separators like {" - "}). Line numbers are kept
// by blanking rather than deleting.
function toProseLines(raw) {
  const lines = raw.split("\n");
  let inFence = false;
  return lines.map((line) => {
    const fence = /^\s*(```|~~~)/.test(line);
    if (fence) {
      inFence = !inFence;
      return "";
    }
    if (inFence) return "";
    if (/^\s*(import|export)\s/.test(line)) return "";
    return line
      .replace(/`[^`]*`/g, " ")
      .replace(/\{[^{}]*\}/g, " ");
  });
}

function extractFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  return m ? m[1] : null;
}

/** @returns {{file: string, findings: Array<{severity: string, line: number|null, id: string, message: string, suggest?: string, text?: string}>}} */
function lintFile(absPath) {
  const raw = readFileSync(absPath, "utf8");
  const rel = relative(repoRoot, absPath);
  const findings = [];

  // Frontmatter
  const fm = extractFrontmatter(raw);
  for (const rule of frontmatterRules) {
    if (rule.test(fm)) {
      findings.push({severity: rule.severity, line: null, id: rule.id, message: rule.message});
    }
  }
  // Rules that need the file's place in its collection (unique numbers, known project slugs).
  for (const rule of fileRules) {
    const message = rule.test(fm, rel);
    if (message) findings.push({severity: rule.severity, line: null, id: rule.id, message});
  }

  const rawLines = raw.split("\n");
  const proseLines = toProseLines(raw);

  // Structure rules (per raw line)
  for (const rule of Object.values(structureRules)) {
    rawLines.forEach((line, i) => {
      if (rule.test(line)) {
        findings.push({severity: rule.severity, line: i + 1, id: rule.id, message: rule.message, text: line.trim()});
      }
    });
  }

  // Prose rules (per preprocessed line)
  proseLines.forEach((line, i) => {
    if (!line.trim()) return;
    for (const rule of proseRules) {
      const m = line.match(rule.pattern);
      if (m) {
        findings.push({
          severity: rule.severity,
          line: i + 1,
          id: rule.id,
          message: rule.message,
          suggest: rule.suggest,
          text: rawLines[i].trim(),
        });
      }
    }
  });

  findings.sort((a, b) => (a.line ?? 0) - (b.line ?? 0));
  return {file: rel, findings};
}

const files = collectFiles();
const results = files.map(lintFile).filter((r) => r.findings.length > 0);

let errorCount = 0;
let warnCount = 0;

for (const {file, findings} of results) {
  if (!quiet || findings.length) {
    process.stdout.write(`\n${BOLD}${file}${RESET}\n`);
  }
  for (const f of findings) {
    const isError = f.severity === "error";
    if (isError) errorCount++;
    else warnCount++;
    const tag = isError ? `${RED}error${RESET}` : `${YELLOW}warn ${RESET}`;
    const loc = f.line === null ? "frontmatter" : `line ${f.line}`;
    process.stdout.write(`  ${tag} ${DIM}${loc}${RESET}  [${f.id}] ${f.message}\n`);
    if (f.text) process.stdout.write(`        ${DIM}> ${f.text}${RESET}\n`);
    if (f.suggest) process.stdout.write(`        ${DIM}→ ${f.suggest}${RESET}\n`);
  }
}

const total = errorCount + warnCount;
if (total === 0) {
  if (!quiet) {
    process.stdout.write(
      `\n${files.length} file${files.length === 1 ? "" : "s"} checked, no issues.\n`,
    );
  }
  process.exit(0);
}

process.stdout.write(
  `\n${errorCount} error${errorCount === 1 ? "" : "s"}, ${warnCount} warning${warnCount === 1 ? "" : "s"} in ${results.length} file${results.length === 1 ? "" : "s"}.\n`,
);
process.stdout.write(
  `${DIM}Rules: content/lint/rules.mjs · Writing rules: .claude/skills/copywriting/SKILL.md${RESET}\n`,
);
process.exit(errorCount > 0 ? 1 : 0);
