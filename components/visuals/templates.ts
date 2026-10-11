import type { ComponentType } from "react"
import CodeImage from "./CodeImage"
import Gallery from "./Gallery"

/** Every template gets the output size in CSS pixels (the runner renders at 2x). */
export interface TemplateSize {
  width: number
  height: number
}

/**
 * Templates for composed visuals, by the name a recipe uses (`template: "gallery"`).
 * Props arrive as JSON from the recipe, so each template checks what it needs.
 * Rendered by `app/(visuals)/visuals/[template]/page.dev.tsx`; add new ones here.
 */
type AnyTemplate = ComponentType<TemplateSize & Record<string, unknown>>
const template = <P extends TemplateSize>(component: ComponentType<P>) => component as unknown as AnyTemplate

export const templates: Record<string, AnyTemplate> = {
  code: template(CodeImage),
  gallery: template(Gallery),
}
