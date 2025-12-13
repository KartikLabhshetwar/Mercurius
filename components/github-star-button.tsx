"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"

interface GitHubStarButtonProps {
  className?: string
  variant?: "default" | "compact" | "hero"
}

const GITHUB_REPO = "https://github.com/KartikLabhshetwar/Mercurius"
const GITHUB_API_URL = "https://api.github.com/repos/KartikLabhshetwar/Mercurius"

export function GitHubStarButton({ className, variant = "default" }: GitHubStarButtonProps) {
  const [starCount, setStarCount] = useState<number | null>(null)
  const [displayCount, setDisplayCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const fetchStarCount = async () => {
      try {
        const response = await fetch(GITHUB_API_URL, {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        })
        if (response.ok) {
          const data = await response.json()
          const count = data.stargazers_count || 0
          setStarCount(count)
          animateCount(count)
        } else {
          setStarCount(0)
          setDisplayCount(0)
        }
      } catch {
        setStarCount(0)
        setDisplayCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStarCount()

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const animateCount = (target: number) => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    const duration = 800
    const startTime = performance.now()
    const startValue = 0

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const current = Math.floor(startValue + (target - startValue) * easeOutQuart)
      
      setDisplayCount(current)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayCount(target)
        animationFrameRef.current = null
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)
  }

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  if (variant === "hero") {
    return (
      <Link
        href={GITHUB_REPO}
        target="_blank"
        rel="noopener noreferrer"
        className={`group relative inline-flex items-center gap-2 px-12 py-6 bg-transparent border border-orange-500/30 hover:border-orange-400 text-orange-200 hover:text-white font-medium text-lg tracking-wider uppercase transition-all duration-500 overflow-hidden ${className}`}
      >
        <svg
          className="w-5 h-5 fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        {!isLoading && starCount !== null ? (
          <span className="relative z-10 tabular-nums">
            {formatCount(displayCount)}
          </span>
        ) : (
          <div className="w-12 h-4 bg-orange-500/20 rounded animate-pulse" />
        )}
        <svg
          className="w-5 h-5"
          fill="none"
          strokeWidth="2"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
          />
        </svg>
        <div className="absolute inset-0 bg-linear-to-r from-orange-600/0 via-orange-500/20 to-orange-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </Link>
    )
  }

  if (variant === "compact") {
    return (
      <Link
        href={GITHUB_REPO}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/10 bg-black/40 hover:bg-black/60 hover:border-white/20 transition-all duration-200 ${className}`}
      >
        <svg
          className="w-4 h-4 fill-white"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        {!isLoading && starCount !== null && (
          <span className="text-sm font-medium text-white">
            {formatCount(displayCount)}
          </span>
        )}
        <svg
          className="w-4 h-4 text-white"
          fill="none"
          strokeWidth="2"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
          />
        </svg>
      </Link>
    )
  }

  return (
    <Link
      href={GITHUB_REPO}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-0 rounded-lg border border-white/10 bg-black/40 hover:bg-black/60 hover:border-white/20 transition-all duration-200 overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-r border-white/10">
        <div className="relative w-5 h-5">
          <svg
            className="w-5 h-5 fill-white"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </div>
        {!isLoading && starCount !== null && (
          <span className="text-sm font-medium text-white tabular-nums">
            {formatCount(displayCount)}
            {displayCount < starCount && "+"}
          </span>
        )}
        {isLoading && (
          <div className="w-8 h-4 bg-white/10 rounded animate-pulse" />
        )}
      </div>
      <div className="px-3 py-2">
        <svg
          className="w-4 h-4 text-white group-hover:fill-white transition-colors duration-200"
          fill="none"
          strokeWidth="2"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
          />
        </svg>
      </div>
    </Link>
  )
}
