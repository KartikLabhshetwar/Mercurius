"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { MessageItem } from "./message-item"
import { Message } from "@/lib/schemas"

interface MessageListProps {
  messages: Message[]
  currentUsername: string
  otherUsername?: string
  onReaction?: (messageId: string, emoji: string, action: "add" | "remove") => void
  onMessageRead?: (messageId: string) => void
  onDelete?: (messageId: string) => void
}

export function MessageList({ messages, currentUsername, otherUsername, onReaction, onMessageRead, onDelete }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const readMessagesRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const viewport = container.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement
    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth",
        })
      })
    }
  }, [messages.length])

  useEffect(() => {
    if (!onMessageRead || !otherUsername) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute("data-message-id")
            if (messageId && !readMessagesRef.current.has(messageId)) {
              readMessagesRef.current.add(messageId)
              onMessageRead(messageId)
            }
          }
        })
      },
      { threshold: 0.5 }
    )

    messageRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => {
      observer.disconnect()
    }
  }, [messages, onMessageRead, otherUsername])

  return (
    <div ref={containerRef} className="flex-1 min-h-0 flex flex-col">
      <ScrollArea className="flex-1" scrollFade hideScrollbar>
        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full min-h-[300px] sm:min-h-[400px]">
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No messages yet</EmptyTitle>
                  <EmptyDescription>
                    Start the conversation by sending a message below.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              ref={(el) => {
                if (el) messageRefs.current.set(msg.id, el)
                else messageRefs.current.delete(msg.id)
              }}
              data-message-id={msg.id}
            >
              <MessageItem 
                message={msg} 
                currentUsername={currentUsername}
                otherUsername={otherUsername}
                onReaction={onReaction}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
