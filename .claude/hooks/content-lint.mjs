#!/usr/bin/env node
// Claude Code content hooks. PreToolUse: remind the model to load the `copywriting` skill before
// editing a copy file, and the `paper` skill before editing a page or the paper's registries. PostToolUse: run the content linter whenever an .mdx file in a collection is
// written or edited, and feed any findings back so they are fixed in the same turn.
//
// Wired in .claude/settings.json (PreToolUse and PostToolUse, matcher "Write|Edit|MultiEdit").

import {execFileSync} from "node:child_process";
import {readFileSync} from "node:fs";
import {resolve, relative} from "node:path";
import {fileURLToPath} from "node:url";
import {COLLECTIONS} from "../../scripts/content-collections.mjs";

const repoRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));

let payload = {};
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

const filePath = payload?.tool_input?.file_path || payload?.tool_response?.filePath || payload?.tool_input?.path;
if (!filePath) process.exit(0);

const abs = resolve(filePath);
const rel = relative(repoRoot, abs).split("\\").join("/");
const isContentMdx = new RegExp(`^content/(${COLLECTIONS.join("|")})/.+\\.mdx$`).test(rel);

// PreToolUse: before the first write to a copy file, remind the model to load the `copywriting`
// skill (the only place the writing rules live); before the first write to a file that shapes the
// paper (pages, routes, tables and figures, lists), the `paper` skill. Never blocks. Each reminder is
// silent once the transcript shows its skill was invoked or its SKILL.md read.
if (payload.hook_event_name === "PreToolUse") {
  const isPage = /^app\/(.+\/)?page\.tsx$/.test(rel);
  const isCopyFile = isContentMdx || isPage || /^content\/pages\/.+\.mdx$/.test(rel);
  const isPaperFile = isPage || /^lib\/(routes|exhibits|aliases)\.ts$/.test(rel) || /^components\/(content|plots)\//.test(rel) || /^data\/[^/]+\.ts$/.test(rel);
  let transcript = "";
  try {
    transcript = readFileSync(payload.transcript_path, "utf8");
  } catch {
    // no transcript: remind anyway
  }
  const loaded = (skill) =>
    transcript.includes(`"name":"Skill","input":{"skill":"${skill}"`) || transcript.includes(`.claude/skills/${skill}/SKILL.md`);
  const notes = [];
  if (isCopyFile && !loaded("copywriting")) {
    notes.push(
      `${rel} holds site copy. If you have not loaded the \`copywriting\` skill in this session, ` +
        `load it (Skill tool, skill "copywriting") and follow it before writing: first person, plain ` +
        `spoken English, what goes here versus on Perxel, and the revise rule (show before/after, wait for approval).`,
    );
  }
  if (isPaperFile && !loaded("paper")) {
    notes.push(
      `${rel} shapes the paper (sections, tables, figures, lists, labels). Load the \`paper\` skill ` +
        `(Skill tool, skill "paper") and follow it: numbering in reading order, captions from lib/exhibits.ts, ` +
        `and \`pnpm build\` (it ends with scripts/check-paper.mjs) before saying it is done.`,
    );
  }
  if (notes.length) {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: notes.join("\n\n") } }));
  }
  process.exit(0);
}

if (!isContentMdx) process.exit(0);

let output = "";
let failed = false;
try {
  output = execFileSync("node", [resolve(repoRoot, "scripts/lint-content.mjs"), abs, "--quiet"], {
    cwd: repoRoot,
    encoding: "utf8",
    env: {...process.env, NO_COLOR: "1"},
  });
} catch (err) {
  failed = true; // non-zero exit => at least one error-severity finding
  output = (err.stdout || "") + (err.stderr || "");
}

const clean = output.replace(/\x1b\[[0-9;]*m/g, "").trim();

// Reminder (never blocking): editing an already published entry should usually set `updated`.
// Only for git-tracked files, so a brand-new entry (where `date` is the publish date) is not nagged.
function updatedReminder() {
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", rel], {cwd: repoRoot, stdio: "ignore"});
  } catch {
    return "";
  }
  const fm = readFileSync(abs, "utf8").match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  if (/^status:\s*["']?draft/m.test(fm)) return "";
  const now = new Date();
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
  const current = fm.match(/^updated:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
  if (current === today) return "";
  return (
    `Reminder: ${rel} is already published. If this edit changes what readers should know (not a typo or ` +
    `formatting fix), set \`updated: "${today}"\` in the frontmatter` +
    (current ? ` (currently "${current}")` : "") +
    `, and add a line to /errata once it exists. Skip for trivial edits.`
  );
}
const reminder = updatedReminder();

if (failed) {
  process.stdout.write(
    JSON.stringify({
      decision: "block",
      reason:
        `Content lint found rule violations in ${rel}. Fix these before continuing ` +
        `(rules: content/lint/rules.mjs, writing rules: .claude/skills/copywriting/SKILL.md):\n\n${clean}` +
        (reminder ? `\n\n${reminder}` : ""),
    }),
  );
} else if (clean || reminder) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: [clean && `Content lint warnings in ${rel} (not blocking):\n\n${clean}`, reminder].filter(Boolean).join("\n\n"),
      },
    }),
  );
}
process.exit(0);
