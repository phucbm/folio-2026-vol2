// Encoding for the media scripts (`visuals/`): one place for the
// codec settings, so every video and image comes out the same.
import {execFileSync} from "node:child_process"

/** In-post and project videos are shown at most ~900px wide; crf 34 softens tiny text only. */
export const VIDEO = {crf: "34", preset: "medium", maxWidth: "1120"}
/** Widest image written to `public/` (a prose figure is ~800px, so 2x). */
export const IMAGE = {maxWidth: 1600, quality: 82}

export const videoCodecArgs = ({crf = VIDEO.crf, preset = VIDEO.preset} = {}) =>
    ["-c:v", "libx264", "-preset", preset, "-crf", String(crf), "-pix_fmt", "yuv420p", "-movflags", "+faststart"]

export function assertTools(...tools) {
    for (const tool of tools) {
        try {
            execFileSync(tool, ["-version"], {stdio: "ignore"})
        } catch {
            console.error(`${tool} not found. Install it first: brew install ${tool === "magick" ? "imagemagick" : tool}`)
            process.exit(1)
        }
    }
}

/** Silent H.264 MP4, faststart, at most `maxWidth` wide; `fps` resamples, `from`/`to` trim (seconds). */
export function encodeVideo(input, output, {maxWidth = VIDEO.maxWidth, crf, fps, from, to} = {}) {
    const filters = [`scale='min(${maxWidth},iw)':-2`, ...(fps ? [`fps=${fps}`] : [])]
    execFileSync("ffmpeg", [
        "-y", ...(from ? ["-ss", String(from)] : []), "-i", input, ...(to ? ["-t", String(to - (from ?? 0))] : []),
        "-map_metadata", "-1", "-vf", filters.join(","), ...videoCodecArgs({crf}), "-an", output,
    ], {stdio: ["ignore", "ignore", "pipe"]})
}

/** One frame of a video, as a full-size PNG. */
export function extractFrame(input, output, seconds = 0) {
    execFileSync("ffmpeg", ["-y", "-ss", String(seconds), "-i", input, "-frames:v", "1", output], {stdio: ["ignore", "ignore", "pipe"]})
}

/** WebP, downscaled with Lanczos to `width` (exact) or to at most `maxWidth`. */
export function encodeWebp(input, output, {width, maxWidth = IMAGE.maxWidth, quality = IMAGE.quality} = {}) {
    const resize = width ? `${width}x` : `${maxWidth}x>`
    execFileSync("magick", [input, "-filter", "Lanczos", "-resize", resize, "-quality", String(quality), "-define", "webp:method=6", output])
}
