"use client"

import { useRef, useCallback } from "react"

export function useSound(soundPath: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const play = useCallback(() => {
    if (typeof window === "undefined") return

    if (!audioRef.current) {
      audioRef.current = new Audio(soundPath)
      audioRef.current.volume = 0.8
    }

    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
  }, [soundPath])

  return play
}
