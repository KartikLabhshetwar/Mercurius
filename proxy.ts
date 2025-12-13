import { NextRequest, NextResponse } from "next/server"
import { redis } from "./lib/redis"
import { nanoid } from "nanoid"

const PRESENCE_TIMEOUT_MS = 60000

export const proxy = async (req: NextRequest) => {
  const pathname = req.nextUrl.pathname

  const roomMatch = pathname.match(/^\/room\/([^/]+)$/)
  if (!roomMatch) return NextResponse.redirect(new URL("/", req.url))

  const roomId = roomMatch[1]

  const meta = await redis.hgetall<{ connected: string | string[]; createdAt: string | number }>(
    `meta:${roomId}`
  )

  if (!meta) {
    return NextResponse.redirect(new URL("/?error=room-not-found", req.url))
  }

  const connected: string[] = Array.isArray(meta.connected) 
    ? meta.connected 
    : typeof meta.connected === "string" 
      ? JSON.parse(meta.connected) 
      : []

  const existingToken = req.cookies.get("x-auth-token")?.value

  if (existingToken && connected.includes(existingToken)) {
    return NextResponse.next()
  }

  const presenceData = await redis.hgetall<Record<string, string | { username: string; lastSeen: number }>>(
    `presence:${roomId}`
  )

  const now = Date.now()
  const activeTokens = new Set<string>()
  const staleTokens: string[] = []

  for (const token of connected) {
    const presence = presenceData?.[token]
    if (presence) {
      const parsed = typeof presence === "string" ? JSON.parse(presence) : presence
      const isActive = now - parsed.lastSeen < PRESENCE_TIMEOUT_MS
      if (isActive) {
        activeTokens.add(token)
      } else {
        staleTokens.push(token)
      }
    } else {
      const roomCreatedAt = typeof meta.createdAt === "string" ? parseInt(meta.createdAt) : meta.createdAt
      const roomAge = now - (roomCreatedAt || now)
      if (roomAge > PRESENCE_TIMEOUT_MS * 2) {
        staleTokens.push(token)
      } else {
        activeTokens.add(token)
      }
    }
  }

  const remaining = await redis.ttl(`meta:${roomId}`)

  if (staleTokens.length > 0) {
    const cleanedConnected = connected.filter((token: string) => !staleTokens.includes(token))
    await Promise.all([
      redis.hset(`meta:${roomId}`, {
        connected: JSON.stringify(cleanedConnected),
      }),
      remaining > 0 ? redis.expire(`meta:${roomId}`, remaining) : Promise.resolve(),
    ])
  }

  if (activeTokens.size >= 2) {
    return NextResponse.redirect(new URL("/?error=room-full", req.url))
  }

  const response = NextResponse.next()

  const token = nanoid()

  response.cookies.set("x-auth-token", token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })

  const updatedConnected = connected.filter((t: string) => !staleTokens.includes(t))
  await Promise.all([
    redis.hset(`meta:${roomId}`, {
      connected: JSON.stringify([...updatedConnected, token]),
    }),
    remaining > 0 ? redis.expire(`meta:${roomId}`, remaining) : Promise.resolve(),
  ])

  return response
}

export const config = {
  matcher: "/room/:path*",
}