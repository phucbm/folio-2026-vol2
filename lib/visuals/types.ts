import type {DeviceName, SizeName} from "./presets"

/**
 * Where to scroll: page pixels, a selector (its top), or a point through a pinned section
 * (`at` 0 = the pin starts, 1 = it lets go). Pinned stages are sticky inside a taller spacer;
 * the runner measures the spacer.
 */
export type ScrollTarget = number | string | {selector: string, at: number}

export type RecordStep =
    | {scroll: ScrollTarget, seconds: number}
    | {wait: number}
    /** Move the pointer to a point (share of the viewport) over `seconds`. */
    | {pointer: [number, number], seconds?: number}
    /** Click an element (opens a dialog, a viewer). */
    | {click: string}

interface Base {
    /** Kebab-case; the output is `<slug>-<id>.webp|mp4` in `public/images/<collection>/`. */
    id: string
    /** What it shows and where it goes in the post (for the plan and for review). */
    note: string
    /** Only an input for a composed visual: kept in the cache, never written to `public/`. */
    intermediate?: boolean
}

interface Page {
    /**
     * Path on the site or a full URL (a project's live site); paths resolve against `--origin`.
     */
    url: string
    device?: DeviceName
    /** Emulate `prefers-reduced-motion: reduce`. */
    reducedMotion?: boolean
    /** Scroll here before anything else, then wait `settle` seconds. */
    scroll?: ScrollTarget
    settle?: number
}

/** A screenshot of a live page. */
export interface CaptureVisual extends Base, Page {
    kind: "capture"
    /** Screenshot one element instead of the viewport. */
    selector?: string
    /** Pointer position (share of the viewport) during the shot; desktop only. */
    pointer?: [number, number]
}

/** A short silent loop of a live page, for `<AutoplayVideo>`. */
export interface RecordVisual extends Base, Page, VideoOutput {
    kind: "record"
    steps: RecordStep[]
    /** `wander`: a slow loop over the lower half (keeps pointer effects alive). Default `still`. */
    pointer?: "wander" | "still"
    /** Record the load itself, from the first HTML on screen; `scroll` and `settle` are ignored. */
    fromLoad?: boolean
    /** CPU slowdown (Chrome's throttling rate, e.g. 4), so a fast sequence is visible. */
    cpu?: number
    fps?: number
}

/** Shared by recorded and provided videos. */
interface VideoOutput {
    /** Second of the clip used as the poster. Default 0. */
    poster?: number
    /** Keep only `[from, to]` seconds of the source. */
    trim?: [number, number]
}

/** A designed image from a template in `components/visuals/`. */
export interface ComposeVisual extends Base {
    kind: "compose"
    template: string
    size: SizeName
    /** Template props. A string `@<id>` is the cached output of another visual in this recipe. */
    props: Record<string, unknown>
}

/** Something only the owner can capture (logins, dashboards, results that change per run). */
export interface ProvideVisual extends Base, VideoOutput {
    kind: "provide"
    /** Exactly what to capture, written for the owner. */
    ask: string
    /** `video`: a screen recording, published like a recorded one. Default `image`. */
    media?: "image" | "video"
}

/** Already in `public/`, used as is. */
export interface ReuseVisual extends Base {
    kind: "reuse"
    src: string
}

export type Visual = CaptureVisual | RecordVisual | ComposeVisual | ProvideVisual | ReuseVisual

export interface VisualRecipe {
    collection: "notes"
    slug: string
    visuals: Visual[]
}
