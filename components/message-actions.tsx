"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useState } from "react"

interface MessageActionsProps {
  onDelete: () => void
}

export function MessageActions({ onDelete }: MessageActionsProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="xs"
        onClick={() => setShowMenu(!showMenu)}
        className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <span className="text-xs">⋯</span>
      </Button>
      {showMenu && (
        <div className="absolute right-0 top-6 bg-card border rounded-lg shadow-lg z-10 flex flex-col min-w-[100px]">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              onDelete()
              setShowMenu(false)
            }}
            className="justify-start gap-2 h-8 text-destructive"
          >
            <Trash2 className="size-3" />
            Delete
          </Button>
        </div>
      )}
    </div>
  )
}
