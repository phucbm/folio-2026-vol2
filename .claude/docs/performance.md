# Performance

Rules carried over from perxel-web-2026 (`.claude/docs/performance.md` there), plus what this site measured.

## Fonts

- **Three faces, self-hosted, one cut-down file each** (`lib/fonts/*.woff2`, OFL licences beside them; 2026-10-11). Any face used anywhere in the DOM is fetched at load, so do not add a fourth for a few labels.
  - Source Serif 4, titles only. Optical size pinned at 32 (display), weight 400–600: 50 KB (109 KB with the `opsz` axis kept).
  - Source Sans 3, reading text, roman and italic, weight 300–700: 41 KB each. The italic loads only when a page uses it (citation titles).
  - IBM Plex Mono Regular, numbers, dates and IDs: 15 KB, latin only.
- **Cut:** Google's latin + vietnamese ranges (project and place names such as *Hiểu Chữ Hán*), plus the paper's symbols (arrows U+2190–2199, ≈ ≠ ≤ ≥ ∞, − ∕). Mono is latin only. A character outside the cut renders in the fallback: add its range and rebuild.
- **Figures:** Source Sans 3 has `onum` (old-style, used in running text) but no `tnum`; tables put their figures in mono (`num` utility), which is tabular by nature.
- **Rebuild** with fonttools (`pip install fonttools brotli`) from the variable fonts in google/fonts (`ofl/sourceserif4/SourceSerif4[opsz,wght].ttf`, `ofl/sourcesans3/SourceSans3[wght].ttf` and its `-Italic`, `ofl/ibmplexmono/IBMPlexMono-Regular.ttf`):

  ```sh
  fonttools varLib.instancer "SourceSerif4[opsz,wght].ttf" wght=400:600 opsz=32 -o serif-cut.ttf
  fonttools varLib.instancer "SourceSans3[wght].ttf" wght=300:700 -o sans-cut.ttf
  fonttools varLib.instancer "SourceSans3-Italic[wght].ttf" wght=300:700 -o sans-italic-cut.ttf

  U="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+1EA0-1EF9,U+20AB,U+2000-206F,U+20AC,U+2122,U+2190-2199,U+2212,U+2215,U+2248,U+2260,U+2264-2265,U+221E,U+FEFF,U+FFFD"
  F="--layout-features=kern,liga,calt,onum,lnum,tnum,pnum,case,frac,sups,subs,ordn,zero,ccmp,locl,mark,mkmk"
  fonttools subset serif-cut.ttf --unicodes="$U" $F --flavor=woff2 --output-file=source-serif-4-latin-vi.woff2
  fonttools subset sans-cut.ttf --unicodes="$U" $F --flavor=woff2 --output-file=source-sans-3-latin-vi.woff2
  fonttools subset sans-italic-cut.ttf --unicodes="$U" $F --flavor=woff2 --output-file=source-sans-3-italic-latin-vi.woff2
  # Mono: latin only (the first line of $U up to U+00FF, plus U+2000-206F,U+2190-2199,U+2212)
  fonttools subset IBMPlexMono-Regular.ttf --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2190-2199,U+2212,U+2215,U+2248,U+2260,U+2264-2265,U+221E,U+FEFF,U+FFFD" $F --flavor=woff2 --output-file=ibm-plex-mono-latin.woff2
  ```

- **Share cards** (`lib/fonts/og/*.ttf`, build time only, never shipped): Satori reads neither woff2 nor variable fonts, so static TTF instances are cut from the three files above: serif at 500, sans at 400, mono as is.

  ```sh
  fonttools varLib.instancer source-serif-4-latin-vi.woff2 wght=500 -o og/source-serif-4-500.ttf
  fonttools varLib.instancer source-sans-3-latin-vi.woff2 wght=400 -o og/source-sans-3-400.ttf
  python -c "from fontTools.ttLib import TTFont; f=TTFont('ibm-plex-mono-latin.woff2'); f.flavor=None; f.save('og/ibm-plex-mono-400.ttf')"
  # then set flavor=None and save the two instances again: the instancer keeps woff2
  ```

## Motion

- Pointer effects only behind `FINE_POINTER` (`lib/media.ts`, CSS `fine-pointer:`), and off under `REDUCED_MOTION`. `app/globals.css` also flattens every CSS transition and animation under reduced motion.
