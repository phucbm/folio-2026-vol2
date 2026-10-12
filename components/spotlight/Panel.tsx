"use client"

import type { PanelProps } from "@perxel/spotlight"
import { Chat, useAskChat } from "@perxel/spotlight/chat"
import { useSpotlight } from "@perxel/spotlight/react"
import type { MouseEvent } from "react"

// Ask's answers, set like the paper: a column on the right with a heavy rule on its left edge (the
// whole screen on phones), each question a run-in label, each answer prose, its sources as a
// numbered reference list. Words, not icons. The privacy line heads every conversation.

export default function PaperPanel({ open, onOpenChange }: PanelProps) {
  const chat = useAskChat()
  const s = useSpotlight()
  // Links in answers: this site through the router, others in a new tab.
  const onClick = (e: MouseEvent<HTMLElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null
    if (!a) return
    e.preventDefault()
    s.navigate(a.href, { from: "answer" })
  }
  return (
    <Chat.Panel
      open={open}
      onOpenChange={onOpenChange}
      onClickCapture={onClick}
      className="fixed inset-0 z-40 flex flex-col bg-paper text-ink outline-none md:inset-y-0 md:right-0 md:left-auto md:w-[28rem] md:border-l md:border-ink"
    >
      <div className="label flex items-baseline justify-between gap-4 border-b border-rule px-4 py-3 sm:px-6">
        <Chat.Title className="font-sans text-[0.8125rem] font-semibold tracking-[0.08em] text-ink uppercase">Ask</Chat.Title>
        <span className="flex gap-4">
          {chat.messages.length > 0 && (
            <button type="button" onClick={chat.newChat} className="cursor-pointer hover:text-ink">New</button>
          )}
          <Chat.Close className="cursor-pointer hover:text-ink">Close</Chat.Close>
        </span>
      </div>
      <Chat.Messages className="relative min-h-0 flex-1">
        <Chat.Content viewportProps={{ className: "h-full overflow-y-auto overscroll-contain" }} className="flex flex-col gap-6 px-4 py-4 sm:px-6">
          <p className="label">
            Questions go to an AI model (Claude, through OpenRouter) with this conversation. Nothing is stored on this site; your browser keeps the conversation for a week. See the <a href="/colophon">colophon</a>.
          </p>
          {chat.messages.map((m) => {
            const text = chat.textOf(m)
            const sources = m.role === "assistant" ? chat.sourcesOf(m) : []
            if (!text && !sources.length) return null
            return m.role === "user" ? (
              <p key={m.id} className="font-medium">
                <span className="label mr-2 font-semibold tracking-[0.08em] text-ink uppercase">Q.</span>
                {text}
              </p>
            ) : (
              <div key={m.id} className="flex flex-col gap-2">
                {text && <Chat.Markdown text={text} className="[&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5" />}
                {sources.length > 0 && (
                  <ol className="label list-decimal pl-5">
                    {sources.map((src) => (
                      <li key={src.url}><a href={src.url}>{src.title}</a></li>
                    ))}
                  </ol>
                )}
              </div>
            )
          })}
          {chat.waiting && <p className="label" role="status">Looking it up…</p>}
          {chat.errorCode && !chat.busy && <p className="label text-ink" role="alert">{chat.copy.errors[chat.errorCode]}</p>}
        </Chat.Content>
      </Chat.Messages>
      <Chat.Composer chat={chat} className="flex items-end gap-3 border-t border-ink px-4 py-3 sm:px-6" textareaProps={{ className: "max-h-40 min-h-[1.6em] flex-1 resize-none bg-transparent text-base outline-none [field-sizing:content] placeholder:text-ink-muted", placeholder: "Ask a question" }}>
        <Chat.Submit chat={chat} className="label cursor-pointer text-ink disabled:text-ink-muted" send="Send" stop="Stop" />
      </Chat.Composer>
    </Chat.Panel>
  )
}
