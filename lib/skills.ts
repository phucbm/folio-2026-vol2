// A note's `skill` frontmatter: the agent-facing version of the note, kept in the skills repo
// (`skills/<domain>/<name>/SKILL.md`). The note links it and shows the install line; the recipe
// itself lives only there. Pure (the catalog and Vitest use it).

export const SKILLS_REPO = "phucbm/skills"

/** `domain/name`, the skill's folder under `skills/` in the repo. Checked by content:lint. */
export const SKILL_PATH = /^[a-z0-9-]+\/[a-z0-9-]+$/

export interface SkillRef {
  /** The folder under `skills/`, as written in frontmatter: "nextjs/og-images". */
  path: string
  /** The skill's name, what `--skill` takes: "og-images". */
  name: string
  url: string
  install: string
}

export function skillRef(path: string): SkillRef {
  const name = path.split("/").pop()!
  return {
    path,
    name,
    url: `https://github.com/${SKILLS_REPO}/tree/main/skills/${path}`,
    install: `npx skills@latest add ${SKILLS_REPO} --skill ${name}`,
  }
}
