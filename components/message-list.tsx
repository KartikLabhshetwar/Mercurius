import { ScrollArea } from "@/components/ui/scroll-area"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { MessageItem } from "./message-item"
import { Message } from "@/lib/schemas"

interface MessageListProps {
  messages: Message[]
  currentUsername: string
}

export function MessageList({ messages, currentUsername }: MessageListProps) {
  return (
    <ScrollArea className="flex-1" scrollFade>
      <div className="p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full min-h-[400px]">
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
          <MessageItem key={msg.id} message={msg} currentUsername={currentUsername} />
        ))}
      </div>
    </ScrollArea>
  )
}
