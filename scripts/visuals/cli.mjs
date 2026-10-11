#!/usr/bin/env node
// Post visuals: captures, recordings and composed images for MDX content, made from a recipe
// (`content/visuals/<collection>/<slug>.ts`) so they can be re-made when the site changes.
// Workflow and rules: .claude/skills/visuals/SKILL.md.
//
//   pnpm visuals inventory [collection]          what media exists and which posts use it
//   pnpm visuals status <slug>                   each visual: made? placed in the MDX? what to provide
//   pnpm visuals build <slug> [id...] [--origin=<site>] [--dev=http://localhost:3000]
//
// `build` captures and records against --origin (ORIGIN below by default) and composes against
// --dev (a running `pnpm dev`: the template route exists only in development).
import {existsSync, mkdirSync, readdirSync, readFileSync, statSync} from "node:fs"
import {join, relative} from "node:path"
import {pathToFileURL} from "node:url"
import {PATHS, SIZES} from "../../lib/visuals/presets.ts"
import {assertTools, encodeVideo, encodeWebp, extractFrame} from "../lib/media.mjs"
import {launch, openPage, pointTo, preparePage, scrollTo, serveCache, sleep, wander} from "./browser.mjs"
import {COLLECTIONS} from "../content-collections.mjs"

// The deployed site. The preview until launch (plan 001, part 8), then https://phucbm.com.
const ORIGIN = "https://phucbm-com-2026-vol2.bmp.workers.dev"
const [command, target, ...rest] = process.argv.slice(2)
const flag = (name, fallback) => rest.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=") ?? fallback
const ids = rest.filter((a) => !a.startsWith("--"))

// ---------------------------------------------------------------------------------------------
// Recipes and files

async function loadRecipe(arg) {
    if (!arg) fail("Name a post: `pnpm visuals status <slug>` (or <collection>/<slug>)")
    const [c, s] = arg.includes("/") ? arg.split("/") : [undefined, arg]
    const file = (c ? [c] : COLLECTIONS).map((col) => `content/visuals/${col}/${s}.ts`).find(existsSync)
    if (!file) fail(`No recipe for ${arg}. Create content/visuals/<collection>/${s}.ts (see the visuals skill).`)
    return (await import(pathToFileURL(file).href)).default
}

const cacheDir = (r) => PATHS.cacheDir(r.collection, r.slug)
const cacheFile = (r, v, ext) => join(cacheDir(r), `${v.id}.${ext}`)
const outBase = (r, v) => join(PATHS.publicDir(r.collection), `${r.slug}-${v.id}`)
const outUrl = (r, v, ext) => `${PATHS.publicUrl(r.collection)}/${r.slug}-${v.id}.${ext}`

/** What a visual puts in `public/` (nothing for intermediates and reuse). */
function outputs(r, v) {
    if (v.intermediate || v.kind === "reuse") return []
    if (isVideo(v)) return [`${outBase(r, v)}.mp4`, `${outBase(r, v)}.webp`]
    return [`${outBase(r, v)}.webp`]
}

const isVideo = (v) => v.kind === "record" || (v.kind === "provide" && v.media === "video")
const PROVIDED = {image: ["png", "jpg", "jpeg", "webp"], video: ["mov", "mp4", "webm"]}

/** The raw file the owner dropped for a `provide` visual, in any format of its media. */
const providedRaw = (r, v) => PROVIDED[v.media ?? "image"].map((ext) => cacheFile(r, v, ext)).find(existsSync)

function mdxFiles(r) {
    return [`content/${r.collection}/${r.slug}.mdx`].filter(existsSync)
}

function fail(message) {
    console.error(message)
    process.exit(1)
}

// ---------------------------------------------------------------------------------------------
// Making each kind

async function capture(browser, r, v, origin) {
    const page = await openPage(browser, v)
    await preparePage(page, new URL(v.url, origin).href, {scroll: v.scroll, settle: v.settle ?? 6})
    if (v.pointer) {
        await pointTo(page, v.pointer)
        await sleep(1)
    }
    const raw = cacheFile(r, v, "png")
    if (v.selector) {
        const el = await page.$(v.selector)
        if (!el) throw new Error(`No element for ${v.selector}`)
        await el.screenshot({path: raw})
    } else await page.screenshot({path: raw})
    await page.close()
    if (!v.intermediate) encodeWebp(raw, `${outBase(r, v)}.webp`)
}

async function record(browser, r, v, origin) {
    const fps = v.fps ?? 30
    const page = await openPage(browser, {...v, scale: 1})
    if (v.cpu) await (await page.createCDPSession()).send("Emulation.setCPUThrottlingRate", {rate: v.cpu})
    const stopWander = v.pointer === "wander" ? wander(page) : null
    const url = new URL(v.url, origin).href
    const webm = cacheFile(r, v, "webm")
    let recorder
    if (v.fromLoad) {
        // A fresh load (no cache from earlier captures), recorded from the first HTML on screen:
        // the blank frames before it vary per run, so they are skipped rather than trimmed.
        await page.setCacheEnabled(false)
        const loaded = page.goto(url, {waitUntil: "load", timeout: 60000})
        await page.waitForSelector("body > *", {timeout: 60000})
        recorder = await page.screencast({path: webm, fps})
        await loaded
    } else {
        await preparePage(page, url, {scroll: v.scroll, settle: v.settle ?? 3})
        recorder = await page.screencast({path: webm, fps})
    }
    for (const step of v.steps) {
        if ("wait" in step) await sleep(step.wait)
        else if ("scroll" in step) await scrollTo(page, step.scroll, step.seconds)
        else if ("pointer" in step) await pointTo(page, step.pointer, step.seconds)
        else if ("click" in step) await page.click(step.click)
    }
    await recorder.stop()
    await stopWander?.()
    await page.close()
    if (!v.intermediate) publishVideo(r, v, webm, fps)
}

/** The MP4 for `<AutoplayVideo>` and its poster (same name, .webp) at `v.poster` seconds. */
function publishVideo(r, v, input, fps = 30) {
    const mp4 = `${outBase(r, v)}.mp4`
    encodeVideo(input, mp4, {fps, from: v.trim?.[0], to: v.trim?.[1]})
    const frame = cacheFile(r, v, "png")
    extractFrame(mp4, frame, v.poster ?? 0)
    encodeWebp(frame, `${outBase(r, v)}.webp`)
}

async function compose(browser, r, v, dev) {
    const size = SIZES[v.size]
    const resolve = (value) => {
        if (typeof value === "string" && value.startsWith("@")) {
            const dep = r.visuals.find((d) => d.id === value.slice(1))
            if (!dep) throw new Error(`${v.id}: no visual ${value} in the recipe`)
            if (!existsSync(cacheFile(r, dep, "png"))) throw new Error(`${v.id}: ${value} is not made yet; build it first`)
            return `${PATHS.cacheUrl}/${r.collection}/${r.slug}/${dep.id}.png`
        }
        if (Array.isArray(value)) return value.map(resolve)
        if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, x]) => [k, resolve(x)]))
        return value
    }
    const props = Buffer.from(JSON.stringify(resolve(v.props))).toString("base64url")
    const page = await browser.newPage()
    await page.setViewport({width: size.width, height: size.height, deviceScaleFactor: 2})
    await serveCache(page)
    const url = `${dev}/visuals/${v.template}?w=${size.width}&h=${size.height}&p=${props}`
    await page.goto(url, {waitUntil: "load", timeout: 120000})
    const error = await page.$eval("[data-visual-error]", (el) => el.textContent).catch(() => null)
    if (error) throw new Error(`${v.id}: ${error}`)
    await page.waitForFunction(() =>
        document.querySelector("[data-visual-root]") && !document.querySelector("[data-visual-pending]")
        && document.fonts.status === "loaded" && [...document.images].every((i) => i.complete && i.naturalWidth > 0),
    {timeout: 60000})
    await sleep(0.3)
    const raw = cacheFile(r, v, "png")
    await page.screenshot({path: raw})
    await page.close()
    if (!v.intermediate) encodeWebp(raw, `${outBase(r, v)}.webp`, {width: size.width})
}

function provide(r, v) {
    const raw = providedRaw(r, v)
    if (raw) {
        if (isVideo(v)) publishVideo(r, v, raw)
        // An intermediate stays in the cache, as the input of a compose.
        else if (!v.intermediate) encodeWebp(raw, `${outBase(r, v)}.webp`)
        return "encoded"
    }
    if (outputs(r, v).every(existsSync)) return "done"
    return `waiting: ${dropHint(r, v)}\n      ${v.ask}`
}

const dropHint = (r, v) => `drop the ${v.media ?? "image"} at ${cacheDir(r)}/${v.id}.(${PROVIDED[v.media ?? "image"].join("|")})`

// ---------------------------------------------------------------------------------------------
// Commands

async function build() {
    const r = await loadRecipe(target)
    const origin = flag("origin", ORIGIN)
    const dev = flag("dev", "http://localhost:3000")
    const chosen = ids.length ? r.visuals.filter((v) => ids.includes(v.id)) : r.visuals
    if (ids.length && chosen.length !== ids.length) fail(`Unknown id. Known: ${r.visuals.map((v) => v.id).join(", ")}`)
    assertTools("ffmpeg", "magick")
    mkdirSync(cacheDir(r), {recursive: true})
    mkdirSync(PATHS.publicDir(r.collection), {recursive: true})

    const live = chosen.filter((v) => v.kind === "capture" || v.kind === "record")
    const composed = chosen.filter((v) => v.kind === "compose")
    if (live.length) {
        const browser = await launch({headless: false})
        for (const v of live) {
            process.stdout.write(`${v.kind} ${v.id} ... `)
            await (v.kind === "capture" ? capture : record)(browser, r, v, origin).then(() => console.log("ok"), (e) => console.log(`FAILED ${e.message}`))
        }
        await browser.close()
    }
    if (composed.length) {
        if (!(await fetch(dev).then((res) => res.ok, () => false))) fail(`Compose needs \`pnpm dev\` running at ${dev} (or pass --dev=<url>).`)
        const browser = await launch({headless: true})
        for (const v of composed) {
            process.stdout.write(`compose ${v.id} ... `)
            await compose(browser, r, v, dev).then(() => console.log("ok"), (e) => console.log(`FAILED ${e.message}`))
        }
        await browser.close()
    }
    for (const v of chosen.filter((v) => v.kind === "provide")) console.log(`provide ${v.id} ... ${provide(r, v)}`)
    for (const v of chosen.filter((v) => v.kind === "reuse")) console.log(`reuse ${v.id} ... ${existsSync(join("public", v.src)) ? "ok" : `MISSING ${v.src}`}`)
}

async function status() {
    const r = await loadRecipe(target)
    const mdx = mdxFiles(r).map((f) => [f, readFileSync(f, "utf8")])
    console.log(`${r.collection}/${r.slug}: ${r.visuals.length} visuals; MDX: ${mdx.map(([f]) => f).join(", ") || "none"}\n`)
    for (const v of r.visuals) {
        const files = v.kind === "reuse" ? [join("public", v.src)] : outputs(r, v)
        const made = v.intermediate ? existsSync(cacheFile(r, v, "png")) : files.every(existsSync)
        const url = v.kind === "reuse" ? v.src : v.intermediate ? null : outUrl(r, v, isVideo(v) ? "mp4" : "webp")
        const placed = url ? mdx.some(([, text]) => text.includes(url)) : false
        const state = v.intermediate ? (made ? "cached" : "not made") : `${made ? "made" : "NOT MADE"}, ${placed ? "placed" : "not placed"}`
        console.log(`- ${v.id} [${v.kind}${v.intermediate ? ", input" : ""}] ${state}\n    ${v.note}${url ? `\n    ${url}` : ""}`)
        if (v.kind === "provide" && !made) console.log(`    ASK: ${v.ask}\n    ${dropHint(r, v)}`)
    }
}

/** Every media file under the given public folders, with the content files that reference it. */
function inventory() {
    const folders = target ? [`public/images/${target}`] : ["public/images"]
    const walk = (dir) => readdirSync(dir, {withFileTypes: true}).flatMap((e) => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])
    const sources = ["content", "data", "app", "components"].filter(existsSync).flatMap((d) => walk(d)).filter((f) => /\.(mdx|tsx?)$/.test(f))
    const texts = sources.map((f) => [f, readFileSync(f, "utf8")])
    const altOf = (text, url) => text.match(new RegExp(`!\\[([^\\]]*)\\]\\(${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`))?.[1]
    for (const folder of folders.filter(existsSync)) {
        console.log(`\n${folder}/`)
        for (const file of walk(folder).filter((f) => !f.endsWith(".DS_Store")).sort()) {
            const url = `/${relative("public", file)}`
            const users = texts.filter(([, t]) => t.includes(url))
            const alt = users.map(([, t]) => altOf(t, url)).find(Boolean)
            const kb = Math.round(statSync(file).size / 1024)
            console.log(`  ${url} (${kb} KB) ${users.length ? users.map(([f]) => f).join(", ") : "UNUSED"}${alt ? `\n    alt: ${alt}` : ""}`)
        }
    }
}

const commands = {build, status, inventory}
if (!commands[command]) fail("Usage: pnpm visuals <inventory [collection] | status <slug> | build <slug> [id...]>")
await commands[command]()
