"use client"

import { Badge } from "@/components/ui/badge"

interface ConnectionNotificationProps {
  username: string
  action: "joined" | "left"
}

export function ConnectionNotification({ username, action }: ConnectionNotificationProps) {
  return (
    <div className="flex justify-center px-4 sm:px-6 py-2 sm:py-2.5">
      <Badge variant="outline" className="text-[11px] sm:text-xs font-normal">
        <span className="truncate max-w-[200px] sm:max-w-none inline-block">
          {username}
        </span>{" "}
        {action === "joined" ? "joined" : "left"} the chat
      </Badge>
    </div>
  )
}
