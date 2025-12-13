import { useRef, useState } from "react"
import {ArrowUp } from "lucide-react"

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
    <div className="p-6">
      <div className="relative flex items-center bg-[#3C3E41] rounded-full px-4 py-3 shadow-lg">
        <input
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
          className="flex-1 bg-transparent border-0 outline-0 text-white placeholder:text-[#A6A8AA] px-4 text-base"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || isPending}
          className="flex items-center justify-center size-10 rounded-full bg-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          aria-label="Send message"
        >
          <ArrowUp className="size-5 text-[#3C3E41]" />
        </button>
      </div>
    </div>
  )
}
