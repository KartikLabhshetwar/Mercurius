"use client"

import { getUserColor, getInitials } from "@/lib/user-colors"

interface UserAvatarProps {
  username: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "size-6 text-xs",
  md: "size-8 text-sm",
  lg: "size-10 text-base",
}

export function UserAvatar({ username, size = "md", className = "" }: UserAvatarProps) {
  const color = getUserColor(username)
  const initials = getInitials(username)

  return (
    <div
      className={`${sizeClasses[size]} ${color.bg} ${color.text} rounded-full flex items-center justify-center font-bold shrink-0 ${className}`}
      title={username}
    >
      {initials}
    </div>
  )
}
