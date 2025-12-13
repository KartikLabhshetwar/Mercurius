import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRef, useState } from "react"

interface MessageInputProps {
  onSend: (text: string) => void
  isPending?: boolean
  placeholder?: string
}

export function MessageInput({
  onSend,
  isPending = false,
  placeholder = "Type message...",
}: MessageInputProps) {
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (!input.trim() || isPending) return

    onSend(input)
    setInput("")
    inputRef.current?.focus()
  }

  return (
    <div className="p-4 border-t bg-card">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            autoFocus
            type="text"
            value={input}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                handleSend()
              }
            }}
            placeholder={placeholder}
            onChange={(e) => setInput(e.target.value)}
            className="pr-4"
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isPending}
          size="lg"
        >
          {isPending ? "Sending..." : "SEND"}
        </Button>
      </div>
    </div>
  )
}
