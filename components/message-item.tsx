import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Message } from "@/lib/schemas"

interface MessageItemProps {
  message: Message
  currentUsername: string
}

export function MessageItem({ message, currentUsername }: MessageItemProps) {
  const isOwnMessage = message.sender === currentUsername

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="max-w-[80%]">
        <div className="flex items-baseline gap-2 mb-1">
          <Badge
            variant={isOwnMessage ? "success" : "info"}
            size="sm"
            className="font-bold"
          >
            {isOwnMessage ? "YOU" : message.sender}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {format(message.timestamp, "HH:mm")}
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed wrap-break-word">
          {message.text}
        </p>
      </div>
    </div>
  )
}
