import type { ComponentProps } from "react"
import type { MDXComponents } from "mdx/types"
import { A } from "@/components/content/A"
import { CodeBlock } from "@/components/content/CodeBlock"
import { reactNodeToText, slugify } from "@/lib/utils"

// Prose styling for every compiled .mdx (notes, pages). Next wires it up for
// each MDX module, so routes pass no `components`. h2/h3 get ids from their text, for anchors and
// a contents list. The rules behind it: .claude/docs/design.md.
const components: MDXComponents = {
  h2: ({ children, ...props }: ComponentProps<"h2">) => (
    <h2 id={slugify(reactNodeToText(children))} className="text-2xl mt-12 mb-3 scroll-mt-8" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: ComponentProps<"h3">) => (
    <h3 id={slugify(reactNodeToText(children))} className="text-xl mt-8 mb-2 scroll-mt-8" {...props}>
      {children}
    </h3>
  ),
  a: A,
  p: (props: ComponentProps<"p">) => <p className="my-4" {...props} />,
  ul: (props: ComponentProps<"ul">) => <ul className="my-4 list-disc pl-5 marker:text-ink-muted [&>li]:my-1" {...props} />,
  ol: (props: ComponentProps<"ol">) => <ol className="my-4 list-decimal pl-5 marker:text-ink-muted [&>li]:my-1" {...props} />,
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote className="my-6 border-l border-rule pl-4 text-ink-muted" {...props} />
  ),
  hr: () => <hr className="my-10" />,
  img: ({ alt, ...props }: ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} className="my-6 block w-full border border-rule" loading="lazy" {...props} />
  ),
  pre: CodeBlock,
  // Results as tables: horizontal rules only, figures in mono (the `num` utility in globals.css).
  table: (props: ComponentProps<"table">) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse border-y border-ink text-[0.9375rem] [&_td]:py-1.5 [&_td]:pr-4 [&_th]:py-1.5 [&_th]:pr-4 [&_th]:text-left [&_th]:font-normal [&_th]:text-ink-muted [&_thead]:border-b [&_thead]:border-rule" {...props} />
    </div>
  ),
}

export function useMDXComponents(): MDXComponents {
  return components
}
