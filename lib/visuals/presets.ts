// Shared numbers for post visuals (`scripts/visuals/`, `components/visuals/`, `app/(visuals)/`).
// The runner imports this file straight from Node (type stripping), so it stays plain:
// no imports, no `@/` paths, only erasable TypeScript.

/** Browser viewports. Screenshots use `scale` (sharp); recordings are always 1x (screencast). */
export const DEVICES = {
    desktop: {width: 1440, height: 900, scale: 2, mobile: false},
    tablet: {width: 820, height: 1180, scale: 2, mobile: true},
    phone: {width: 390, height: 844, scale: 3, mobile: true},
} as const

export type DeviceName = keyof typeof DEVICES

/** Output sizes for composed images, in final pixels (rendered at 2x, then downscaled). */
export const SIZES = {
    /** Detail-page banner and in-post hero, 16:9. */
    banner: {width: 1600, height: 900},
    /** Share image (`ogImage`). */
    og: {width: 1200, height: 630},
    /** In-post figure, 3:2. */
    figure: {width: 1600, height: 1067},
    /** Wide strip, for screenshots side by side. */
    wide: {width: 1600, height: 640},
    /** Square, for social. */
    square: {width: 1200, height: 1200},
} as const

export type SizeName = keyof typeof SIZES

/** Where outputs land and where raw captures are cached (gitignored). */
export const PATHS = {
    publicDir: (collection: string) => `public/images/${collection}`,
    publicUrl: (collection: string) => `/images/${collection}`,
    cacheDir: (collection: string, slug: string) => `.visuals/${collection}/${slug}`,
    /** URL prefix a composed template uses to load a cached capture (served by the runner). */
    cacheUrl: "/__visuals",
} as const
