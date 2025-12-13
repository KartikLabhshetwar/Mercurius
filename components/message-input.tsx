import { useRef, useState, useEffect, useCallback } from "react"
import {ArrowUp } from "lucide-react"

interface MessageInputProps {
  onSend: (text: string) => void
  onTyping?: (isTyping: boolean) => void
  isPending?: boolean
  placeholder?: string
}

export function MessageInput({
  onSend,
  onTyping,
  isPending = false,
  placeholder = "Type message...",
}: MessageInputProps) {
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleTyping = useCallback((isTyping: boolean) => {
    if (!onTyping) return
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    onTyping(isTyping)
    
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        onTyping?.(false)
      }, 3000)
    }
  }, [onTyping])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const handleSend = () => {
    if (!input.trim() || isPending) return

    handleTyping(false)
    onSend(input)
    setInput("")
    inputRef.current?.focus()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)
    
    if (value.trim()) {
      handleTyping(true)
    } else {
      handleTyping(false)
    }
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
          onChange={handleChange}
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
