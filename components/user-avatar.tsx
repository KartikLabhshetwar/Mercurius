"use client"

import Image from "next/image"

interface UserAvatarProps {
  username: string
  size?: "sm" | "md" | "lg"
  className?: string
  isCurrentUser?: boolean
}

const sizeClasses = {
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
}

export function UserAvatar({ username, size = "md", className = "", isCurrentUser = false }: UserAvatarProps) {
  const avatarSrc = isCurrentUser ? "/avatar01.jpeg" : "/avatar02.jpeg"

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center shrink-0 relative overflow-hidden ${className}`}
      title={username}
    >
      <Image
        src={avatarSrc}
        alt={username}
        fill
        className="object-cover rounded-full"
        sizes={`${sizeClasses[size]}`}
        unoptimized
      />
    </div>
  )
}
