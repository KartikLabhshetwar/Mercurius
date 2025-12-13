"use client"

interface TypingIndicatorProps {
  usernames: string[]
}

export function TypingIndicator({ usernames }: TypingIndicatorProps) {
  if (usernames.length === 0) return null

  const text = usernames.length === 1 
    ? `${usernames[0]} is typing...`
    : `${usernames.join(" and ")} are typing...`

  return (
    <div className="px-4 sm:px-6 py-2 sm:py-2.5">
      <p className="text-xs sm:text-sm text-muted-foreground italic animate-pulse">
        {text}
      </p>
    </div>
  )
}
