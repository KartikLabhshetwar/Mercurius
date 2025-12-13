"use client"

import { Button } from "@/components/ui/button"
import { Reaction } from "@/lib/schemas"
import { SmilePlus } from "lucide-react"
import { useState } from "react"

interface MessageReactionsProps {
  reactions: Reaction[]
  currentUsername: string
  onReaction: (emoji: string, action: "add" | "remove") => void
  isOwnMessage?: boolean
}

const COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"]

export function MessageReactions({
  reactions,
  currentUsername,
  onReaction,
  isOwnMessage = false,
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false)

  const groupedReactions = reactions.reduce((acc, reaction) => {
    const key = reaction.emoji
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(reaction)
    return acc
  }, {} as Record<string, Reaction[]>)

  const handleReactionClick = (emoji: string) => {
    const userReaction = reactions.find(
      (r) => r.emoji === emoji && r.username === currentUsername
    )
    onReaction(emoji, userReaction ? "remove" : "add")
    setShowPicker(false)
  }

  return (
    <>
      <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 flex-wrap">
        {Object.entries(groupedReactions).map(([emoji, emojiReactions]) => {
          const hasUserReaction = emojiReactions.some(
            (r) => r.username === currentUsername
          )
          return (
            <Button
              key={emoji}
              variant={hasUserReaction ? "default" : "outline"}
              size="xs"
              onClick={() => handleReactionClick(emoji)}
              className="h-5 sm:h-6 px-1.5 sm:px-2 rounded-full text-[10px] sm:text-xs gap-0.5 sm:gap-1"
            >
              <span>{emoji}</span>
              <span className="text-[9px] sm:text-[10px]">{emojiReactions.length}</span>
            </Button>
          )
        })}

        <Button
          variant="ghost"
          size="xs"
          onClick={() => setShowPicker(!showPicker)}
          className="h-5 sm:h-6 px-1.5 sm:px-2 rounded-full"
        >
          <SmilePlus className="size-3 sm:size-3.5" />
        </Button>
      </div>

      {showPicker && (
        <div
          className={`absolute ${
            isOwnMessage ? "top-0 right-0 translate-x-0 sm:translate-x-0" : "top-0 left-0 translate-x-0 sm:translate-x-0"
          } bg-card border rounded-lg p-1.5 sm:p-2 shadow-lg z-20 flex flex-row gap-1 sm:gap-1.5 max-w-[calc(100vw-2rem)] sm:max-w-none`}
        >
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReactionClick(emoji)}
              className="text-base sm:text-lg hover:scale-125 transition-transform p-1 sm:p-1.5"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
