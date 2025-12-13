import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

interface CountdownTimerProps {
  initialTtl?: number
  onExpire?: () => void
}

function formatTimeRemaining(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function CountdownTimer({ initialTtl, onExpire }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (initialTtl !== undefined) {
      setTimeout(() => {
        setTimeRemaining(initialTtl)
      }, 1000)
    }
  }, [initialTtl])

  useEffect(() => {
    if (timeRemaining === null || timeRemaining < 0) return

    if (timeRemaining === 0) {
      onExpire?.()
      return
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, onExpire])

  return (
    <Badge
      variant={timeRemaining !== null && timeRemaining < 60 ? "destructive" : "warning"}
      className="font-mono rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs"
    >
      {timeRemaining !== null ? formatTimeRemaining(timeRemaining) : "--:--"}
    </Badge>
  )
}
