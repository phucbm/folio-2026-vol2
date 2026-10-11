import { isValidElement, type ReactNode } from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** URL-safe slug; strips Vietnamese diacritics (đ has no combining form, so it goes first). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** A heading's rendered children (which may hold `<code>` or `<em>`) as plain text, for anchor ids. */
export function reactNodeToText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(reactNodeToText).join("")
  if (isValidElement(node)) return reactNodeToText((node.props as { children?: ReactNode }).children)
  return ""
}
