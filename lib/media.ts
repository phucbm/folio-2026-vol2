/**
 * Every media query the scripts use, in one place. The CSS twin is the "Breakpoints" block at the top of
 * `app/globals.css` (Tailwind's `sm`/`md`/`lg` and the `fine-pointer` and `touch` variants): change a value
 * in both. Never write a width or pointer query by hand in a component; add it here (and to the CSS block
 * if markup needs it). Image `sizes` use these too.
 *
 * No imports, so any module (and the lazy loaders that must stay small) can read it.
 */

/** Widths in px. Tailwind's defaults (40rem, 48rem, 64rem). */
export const BREAKPOINTS = {sm: 640, md: 768, lg: 1024} as const

const from = (px: number) => `(min-width: ${px}px)`
/** `.02` under the next breakpoint, so the two never match together and never both miss. */
const below = (px: number) => `(max-width: ${px - 0.02}px)`

/** `sm:` and up. */
export const SM = from(BREAKPOINTS.sm)
/** `md:` and up. */
export const MD = from(BREAKPOINTS.md)
/** Below `md` (`max-md:`): phones. */
export const BELOW_MD = below(BREAKPOINTS.md)
/** `lg:` and up. */
export const LG = from(BREAKPOINTS.lg)
/** Below `lg` (`max-lg:`). */
export const BELOW_LG = below(BREAKPOINTS.lg)

/** Media query for users who asked the OS to cut motion. Pair with `gsap.matchMedia()`. */
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

/**
 * The one gate for every pointer-driven effect (mouse move, hover, plucking Figure 1): a real hovering
 * pointer on a screen at least `lg` wide. Touch devices and small screens fail it and get no pointer
 * interaction at all (a 1024px-wide iPad too: wide enough, but no hover). CSS: `fine-pointer:`, and
 * its complement `touch:`.
 */
export const FINE_POINTER = `(hover: hover) and (pointer: fine) and ${LG}`

/** A finger, not a mouse (phones, tablets). */
export const COARSE_POINTER = "(hover: none) and (pointer: coarse)"
