import { isValidElement, type ComponentProps, type ReactElement } from "react"
import { CopyButton } from "@/components/content/CopyButton"
import { ScrollArea } from "@/components/ui/scroll-area"

// MDX's fenced code (`pre`, through mdx-components.tsx): a hairline frame, the language in a `label`
// header with a copy button, comments in muted ink and everything else ink. Two tones, no highlighter,
// as in the `code` visual (components/visuals/CodeImage.tsx): the site has no colours for syntax.

const LANGUAGES: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  jsx: "JSX",
  mjs: "JavaScript",
  json: "JSON",
  sh: "Shell",
  bash: "Shell",
  css: "CSS",
  html: "HTML",
  mdx: "MDX",
  md: "Markdown",
  py: "Python",
  txt: "Plain text",
  text: "Plain text",
}

// A whole-line comment, then a comment after code (`x = 1 // why`). The trailing one needs a space
// before the marker, so `https://` in a string stays ink.
const lineComment = (lang: string) => (["sh", "bash", "py"].includes(lang) ? "#" : "//")
const WHOLE = /^\s*(\/\/|#|\/\*|\*|<!--|\{\/\*)/

function Line({ text, lang }: { text: string; lang: string }) {
  if (WHOLE.test(text)) return <span className="text-ink-muted">{text}</span>
  const at = text.search(new RegExp(`\\s${lineComment(lang)}\\s`))
  if (at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <span className="text-ink-muted">{text.slice(at)}</span>
    </>
  )
}

export function CodeBlock({ children, ...props }: ComponentProps<"pre">) {
  const code = isValidElement(children) ? (children as ReactElement<{ className?: string; children?: unknown }>) : null
  const raw = typeof code?.props.children === "string" ? code.props.children.replace(/\n$/, "") : null
  if (raw === null) return <pre className="my-6 overflow-x-auto border border-rule px-4 py-3 text-[0.8125rem] leading-[1.7]" {...props}>{children}</pre>

  const lang = code?.props.className?.match(/language-(\S+)/)?.[1] ?? "text"
  return (
    <div className="my-6 border border-rule">
      <div className="label flex items-center justify-between border-b border-rule px-4 py-1.5">
        <span>{LANGUAGES[lang] ?? lang}</span>
        <CopyButton text={raw} />
      </div>
      {/* shadcn's ScrollArea: a thin thumb instead of the browser's horizontal scrollbar. */}
      <ScrollArea>
        <pre className="w-max min-w-full px-4 py-3 text-[0.8125rem] leading-[1.7]" {...props}>
          <code>
            {raw.split("\n").map((line, i) => (
              <span key={i} className="block min-h-[1.7em]">
                <Line text={line} lang={lang} />
              </span>
            ))}
          </code>
        </pre>
      </ScrollArea>
    </div>
  )
}
