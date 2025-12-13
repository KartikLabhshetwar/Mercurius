"use client"

import { Check, CheckCheck } from "lucide-react"
import { ReadReceipt } from "@/lib/schemas"

interface ReadReceiptProps {
  readBy: ReadReceipt[]
  currentUsername: string
  otherUsername?: string
}

export function ReadReceiptIndicator({ readBy, currentUsername, otherUsername }: ReadReceiptProps) {
  if (!readBy || readBy.length === 0) return null

  const isReadByOther = otherUsername 
    ? readBy.some((r) => r.username === otherUsername)
    : readBy.some((r) => r.username !== currentUsername)

  if (!isReadByOther) return null

  return (
    <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
      <CheckCheck className="size-3 sm:size-3.5 text-muted-foreground" />
      <span className="text-[9px] sm:text-[10px] text-muted-foreground">Read</span>
    </div>
  )
}
