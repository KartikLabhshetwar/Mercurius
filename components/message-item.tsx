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
    <div className={`flex flex-col gap-1 ${isOwnMessage ? "items-end ml-auto" : "items-start"}`}>
      <div className="max-w-[55%]">
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
        </div>
        <div
          className={`relative rounded-2xl px-4 py-3 ${
            isOwnMessage
              ? "bg-[#367954] text-foreground"
              : "bg-muted text-white"
          }`}
        >
          <p className="text-lg leading-relaxed wrap-break-word">
            {message.text}
          </p>
        </div>
      </div>
    </div>
  )
}
