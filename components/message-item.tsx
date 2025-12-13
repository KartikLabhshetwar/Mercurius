"use client"

import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Message } from "@/lib/schemas"
import { MessageReactions } from "./message-reactions"
import { ReadReceiptIndicator } from "./read-receipt"
import { MessageActions } from "./message-actions"
import { UserAvatar } from "./user-avatar"

interface MessageItemProps {
  message: Message
  currentUsername: string
  otherUsername?: string
  onReaction?: (messageId: string, emoji: string, action: "add" | "remove") => void
  onDelete?: (messageId: string) => void
}

export function MessageItem({ message, currentUsername, otherUsername, onReaction, onDelete }: MessageItemProps) {
  const isOwnMessage = message.sender === currentUsername

  if (message.deleted) {
    return (
      <div className={`flex flex-col gap-1 ${isOwnMessage ? "items-end ml-auto" : "items-start"}`}>
        <div className="max-w-[55%]">
          <p className="text-sm text-muted-foreground italic">This message was deleted</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex gap-2 ${isOwnMessage ? "flex-row-reverse" : "flex-row"} group`}>
      <UserAvatar username={message.sender} size="sm" className="mt-1" />
      <div className={`flex flex-col gap-1 ${isOwnMessage ? "items-end" : "items-start"} flex-1 max-w-[55%]`}>
        <div className="flex items-baseline gap-2 mb-1.5">
          <Badge
            variant={isOwnMessage ? "success" : "info"}
            size="sm"
            className="font-bold"
          >
            {isOwnMessage ? "YOU" : message.sender}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {format(message.timestamp, "HH:mm")}
          </span>
          {isOwnMessage && onDelete && (
            <MessageActions
              onDelete={() => onDelete(message.id)}
            />
          )}
        </div>
        <div className="relative">
          <div
            className={`rounded-2xl px-4 py-3 ${
              isOwnMessage
                ? "bg-[#367954] text-foreground"
                : "bg-muted text-white"
            }`}
          >
            <p className="text-lg leading-relaxed wrap-break-word">
              {message.text}
            </p>
          </div>
          {onReaction && (
            <MessageReactions
              reactions={message.reactions || []}
              currentUsername={currentUsername}
              onReaction={(emoji, action) => onReaction(message.id, emoji, action)}
              isOwnMessage={isOwnMessage}
            />
          )}
        </div>
        {isOwnMessage && message.readBy && (
          <ReadReceiptIndicator
            readBy={message.readBy}
            currentUsername={currentUsername}
            otherUsername={otherUsername}
          />
        )}
      </div>
    </div>
  )
}
