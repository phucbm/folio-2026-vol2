import { A } from "@/components/content/A"
import { CodeBlock } from "@/components/content/CodeBlock"
import { SKILLS_REPO, type SkillRef } from "@/lib/skills"

/** Under a note's title block when its frontmatter has `skill`: the link and the install line, ready to copy. */
export function NoteSkill({ skill }: { skill: SkillRef }) {
  return (
    <section aria-label="Agent skill" className="mb-10">
      <p className="label">
        This note as an agent skill: <A href={skill.url}>{skill.name}</A> in {SKILLS_REPO}.
      </p>
      <CodeBlock>
        <code className="language-sh">{skill.install}</code>
      </CodeBlock>
    </section>
  )
}
