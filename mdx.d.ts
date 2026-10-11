// Every content MDX module: the compiled body plus its frontmatter as `meta`
// (remark-mdx-frontmatter, next.config.ts). Entry routes import them as `@/content/<collection>/<slug>.mdx`.
declare module "*.mdx" {
  import type { MDXProps } from "mdx/types"
  export default function MDXContent(props: MDXProps): React.JSX.Element
  export const meta: Record<string, unknown>
}
