// Chrome for Testing via puppeteer-core: page setup, scrolling a live page, serving cached captures.
import puppeteer from "puppeteer-core"
import {existsSync, readdirSync, readFileSync} from "node:fs"
import {homedir} from "node:os"
import {join} from "node:path"
import {DEVICES, PATHS} from "../../lib/visuals/presets.ts"

/** `CHROME_PATH`, or the newest Chrome for Testing in puppeteer's cache. */
function chromePath() {
    if (process.env.CHROME_PATH) return process.env.CHROME_PATH
    const root = join(homedir(), ".cache/puppeteer/chrome")
    const platform = process.platform === "darwin" ? (process.arch === "arm64" ? "mac_arm-" : "mac-") : "linux-"
    const version = (dir) => dir.split("-").pop().split(".").map(Number)
    const newest = existsSync(root) && readdirSync(root)
        .filter((d) => d.startsWith(platform))
        .sort((a, b) => {
            const [va, vb] = [version(a), version(b)]
            return va.reduce((r, n, i) => r || n - (vb[i] ?? 0), 0)
        })
        .pop()
    const app = newest && [
        "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
        "chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
        "chrome-linux64/chrome",
    ].map((p) => join(root, newest, p)).find(existsSync)
    if (!app) throw new Error("No Chrome for Testing found: `pnpm dlx @puppeteer/browsers install chrome@stable` or set CHROME_PATH")
    return app
}

/**
 * Live pages run headful: pointer effects need `(hover: hover) and (pointer: fine)`
 * and a real window. Composed templates are static, so they run headless.
 */
export function launch({headless}) {
    return puppeteer.launch({
        executablePath: chromePath(),
        headless,
        defaultViewport: null,
        args: ["--hide-scrollbars", "--autoplay-policy=no-user-gesture-required", "--window-size=1600,1300"],
    })
}

/** A page with a device's viewport; `scale: 1` for recordings (screencast frames are 1x anyway). */
export async function openPage(browser, {device = "desktop", scale, reducedMotion} = {}) {
    const d = DEVICES[device]
    const page = await browser.newPage()
    await page.setViewport({width: d.width, height: d.height, deviceScaleFactor: scale ?? d.scale, isMobile: d.mobile, hasTouch: d.mobile})
    if (reducedMotion) await page.emulateMediaFeatures([{name: "prefers-reduced-motion", value: "reduce"}])
    return page
}

/** Serves `PATHS.cacheUrl/<collection>/<slug>/<file>` from the local cache, so templates can show captures. */
export async function serveCache(page) {
    await page.setRequestInterception(true)
    page.on("request", (req) => {
        const {pathname} = new URL(req.url())
        if (!pathname.startsWith(`${PATHS.cacheUrl}/`)) return req.continue()
        const file = join(".visuals", decodeURIComponent(pathname.slice(PATHS.cacheUrl.length + 1)))
        if (!existsSync(file)) return req.respond({status: 404, body: "not cached"})
        req.respond({status: 200, contentType: file.endsWith(".png") ? "image/png" : "application/octet-stream", body: readFileSync(file)})
    })
}

export const sleep = (seconds) => new Promise((r) => setTimeout(r, seconds * 1000))

/** A scroll target (see `ScrollTarget` in lib/visuals/types.ts) in page pixels. */
export function resolveScroll(page, target) {
    return page.evaluate((target) => {
        if (typeof target === "number") return target
        const selector = typeof target === "string" ? target : target.selector
        const el = document.querySelector(selector)
        if (!el) throw new Error(`No element for ${selector}`)
        // A pinned stage is sticky inside a taller spacer: measure the first ancestor taller than it.
        let spacer = el.parentElement
        while (spacer && spacer.offsetHeight <= el.offsetHeight + 10) spacer = spacer.parentElement
        const box = (spacer && spacer.offsetHeight < innerHeight * 12 ? spacer : el).getBoundingClientRect()
        const top = box.top + scrollY
        if (typeof target === "string") return top
        return top + target.at * Math.max(0, box.height - innerHeight)
    }, target)
}

/** Eased scroll inside the page on rAF (ScrollTrigger and smooth scrollers follow a native scroll). */
export async function scrollTo(page, target, seconds = 0) {
    const y = await resolveScroll(page, target)
    await page.evaluate((y, seconds) => new Promise((resolve) => {
        const from = scrollY, start = performance.now()
        const ease = (t) => t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
        const tick = () => {
            const t = seconds ? Math.min(1, (performance.now() - start) / (seconds * 1000)) : 1
            scrollTo(0, from + (y - from) * ease(t))
            if (t < 1) requestAnimationFrame(tick)
            else resolve()
        }
        tick()
    }), y, seconds)
}

/**
 * Loads a live page and puts it at `scroll`. A scroll made before hydration can be reset when a smooth scroller
 * and ScrollTrigger start, so it waits a moment first and checks the position after `settle`.
 */
export async function preparePage(page, url, {scroll, settle}) {
    await page.goto(url, {waitUntil: "load", timeout: 60000})
    await sleep(1)
    if (scroll === undefined) return sleep(settle)
    await scrollTo(page, scroll)
    await sleep(settle)
    const [want, have] = [await resolveScroll(page, scroll), await page.evaluate(() => scrollY)]
    if (Math.abs(want - have) > 4) {
        await scrollTo(page, scroll)
        await sleep(Math.max(1.5, settle / 2))
    }
}

/** Moves the pointer to a share of the viewport over `seconds`. */
export async function pointTo(page, [fx, fy], seconds = 0) {
    const {width, height} = page.viewport()
    await page.mouse.move(fx * width, fy * height, {steps: Math.max(1, Math.round(seconds * 60))})
}

/** A slow loop over the lower half of the screen until `stop()`; keeps pointer effects alive. */
export function wander(page) {
    let on = true
    const {width, height} = page.viewport()
    const run = (async () => {
        const start = Date.now()
        while (on) {
            const s = (Date.now() - start) / 1000
            await page.mouse.move(width * (0.5 + 0.32 * Math.sin(s * 0.55)), height * (0.6 + 0.2 * Math.sin(s * 0.83 + 1))).catch(() => {})
            await sleep(1 / 60)
        }
    })()
    return async () => {
        on = false
        await run
    }
}
