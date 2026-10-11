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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** "2026-04-29" → "29 Apr 2026". Plain string work, so server and client agree whatever the timezone. */
export function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

/** "2023-05" → "May 2023"; a year alone ("2023") stays "2023". */
export function formatMonth(month: string): string {
  const [y, m] = month.split("-").map(Number)
  return m ? `${MONTHS[m - 1]} ${y}` : `${y}`
}
