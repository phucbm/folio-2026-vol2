import type {VisualRecipe} from "../../../lib/visuals/types"

// The live share cards themselves: each URL is the PNG a page's og:image points to.
const recipe: VisualRecipe = {
    collection: "notes",
    slug: "dynamic-og-images",
    visuals: [
        {
            id: "phucbm",
            kind: "capture",
            note: "This site's card for a note: paper, serif title, alias, date and version.",
            url: "https://phucbm.com/og/notes/how-i-built-my-blog.png",
            selector: "img",
        },
        {
            id: "perxel",
            kind: "capture",
            note: "Perxel's card for an insight: category pill and a row of tech logos.",
            url: "https://perxel.com/en/insights/nextjs-performance/og",
            selector: "img",
        },
        {
            id: "openrace",
            kind: "capture",
            note: "OpenRace's card for a race: race-type pill, date and Vietnamese place name.",
            url: "https://openrace-web.bmp.workers.dev/en/races/vpbank-hanoi-international-marathon-2026/opengraph-image",
            settle: 3,
            selector: "img",
        },
    ],
}

export default recipe
