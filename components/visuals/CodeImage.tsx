"use client"

import type { TemplateSize } from "./templates"

export interface CodeImageProps extends TemplateSize {
  /** The code, lines separated by `\n`. Keep it short: it is drawn, not copied. */
  code: string
  /** Small label above, e.g. the file path. */
  file?: string
}

// Comments in muted ink, everything else ink: enough to read the intent, no highlighter.
const COMMENT = /^\s*(\/\/|#|\*|\/\*|<!--)/

/**
 * Code drawn as a picture, for snippets the reader should understand but not copy (a share card,
 * a trick described rather than recommended). Copyable code goes in a fenced block.
 */
export default function CodeImage({ width, height, code, file }: CodeImageProps) {
  if (typeof code !== "string" || !code) return <p data-visual-error="">code required</p>
  const lines = code.split("\n")
  const pad = width * 0.06
  const longest = Math.max(...lines.map((l) => l.length))
  // Fit the longest line and every row; IBM Plex Mono is 0.6em per character.
  const size = Math.min((width - pad * 2 - 40) / (longest * 0.6), (height - pad * 2 - 60) / (lines.length * 1.85 + (file ? 2 : 0)), 22)
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-paper" style={{ padding: pad }}>
      <div className="w-full border border-rule bg-white" style={{ padding: size * 1.4 }}>
        {file && <div className="font-mono text-ink-muted" style={{ fontSize: size * 0.8, marginBottom: size * 0.9 }}>{file}</div>}
        <pre className="m-0 font-mono" style={{ fontSize: size, lineHeight: 1.85 }}>
          {lines.map((line, i) => (
            <div key={i} className={COMMENT.test(line) ? "text-ink-muted" : "text-ink"}>{line || " "}</div>
          ))}
        </pre>
      </div>
    </div>
  )
}
