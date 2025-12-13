"use client"

import { Badge } from "@/components/ui/badge"
import { Circle } from "lucide-react"
import { UserAvatar } from "./user-avatar"

interface PresenceIndicatorProps {
  username: string
  status: "online" | "offline" | "away"
}

export function PresenceIndicator({ username, status }: PresenceIndicatorProps) {
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-500",
    away: "bg-yellow-500",
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2.5">
      <UserAvatar username={username} size="sm" />
      <Badge 
        variant="outline" 
        size="sm" 
        className="font-normal text-xs sm:text-sm max-w-[200px] sm:max-w-none truncate"
      >
        {username}
      </Badge>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Circle className={`size-2 ${statusColors[status]} rounded-full shrink-0`} />
        <span className="text-[11px] sm:text-xs text-muted-foreground capitalize whitespace-nowrap">
          {status}
        </span>
      </div>
    </div>
  )
}
