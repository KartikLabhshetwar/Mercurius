import { redis } from "@/lib/redis"
import { Elysia, t } from "elysia"
import { nanoid } from "nanoid"
import { authMiddleware } from "./auth"
import { realtime } from "@/lib/realtime"
import {
  roomIdQuerySchema,
  createMessageBodySchema,
  type Message,
  type Reaction,
} from "@/lib/schemas"

const ROOM_TTL_SECONDS =60 * 10

const rooms = new Elysia({ prefix: "/room" })
  .post("/create", async () => {
    const roomId = nanoid()

    await redis.hset(`meta:${roomId}`, {
      connected: JSON.stringify([]),
      createdAt: Date.now(),
    })

    await redis.expire(`meta:${roomId}`, ROOM_TTL_SECONDS)

    return { roomId }
  })
  .get(
    "/check",
    async ({ query }) => {
      const { roomId } = query
      
      const meta = await redis.hgetall(`meta:${roomId}`)
      const ttl = await redis.ttl(`meta:${roomId}`)
      const ttlNumber = typeof ttl === "number" ? ttl : 0
      
      if (!meta || ttlNumber <= 0) {
        return { exists: false, isFull: false, ttl: 0 }
      }

      const connectedRaw = await redis.hget<string | string[]>(`meta:${roomId}`, "connected")
      const connected: string[] = Array.isArray(connectedRaw) 
        ? connectedRaw 
        : connectedRaw 
          ? JSON.parse(connectedRaw) 
          : []

      const [presenceData, usersData] = await Promise.all([
        redis.hgetall<Record<string, string | { username: string; lastSeen: number }>>(`presence:${roomId}`),
        redis.hgetall<Record<string, string>>(`users:${roomId}`),
      ])

      const now = Date.now()
      const activeTokens = new Set<string>()

      for (const token of connected) {
        const hasUser = usersData?.[token]
        if (!hasUser) continue

        const presence = presenceData?.[token]
        if (presence) {
          const parsed = typeof presence === "string" ? JSON.parse(presence) : presence
          const isActive = now - parsed.lastSeen < 60000
          if (isActive) {
            activeTokens.add(token)
          }
        } else {
          let roomCreatedAt: number
          if (typeof meta.createdAt === "string") {
            roomCreatedAt = parseInt(meta.createdAt, 10)
          } else if (typeof meta.createdAt === "number") {
            roomCreatedAt = meta.createdAt
          } else {
            roomCreatedAt = now
          }
          const roomAge = now - roomCreatedAt
          if (roomAge <= 120000) {
            activeTokens.add(token)
          }
        }
      }

      return { 
        exists: true, 
        isFull: activeTokens.size >= 2, 
        ttl: ttlNumber > 0 ? ttlNumber : 0 
      }
    },
    { query: roomIdQuerySchema }
  )
  .use(authMiddleware)
  .post(
    "/join",
    async ({ body, auth }) => {
      const { username } = body
      const { roomId, token } = auth
      
      const remaining = await redis.ttl(`meta:${roomId}`)
      
      await Promise.all([
        redis.hset(`users:${roomId}`, {
          [token]: username,
        }),
        remaining > 0 ? redis.expire(`users:${roomId}`, remaining) : Promise.resolve(),
        realtime.channel(roomId).emit("chat.connection", {
          username,
          action: "joined",
          timestamp: Date.now(),
        }),
      ])
      
      return { success: true }
    },
    {
      query: roomIdQuerySchema,
      body: t.Object({
        username: t.String(),
      }),
    }
  )
  .get(
    "/ttl",
    async ({ auth }) => {
      const ttl = await redis.ttl(`meta:${auth.roomId}`)
      return { ttl: ttl > 0 ? ttl : 0 }
    },
    { query: roomIdQuerySchema }
  )
  .delete(
    "/",
    async ({ auth }) => {
      const { roomId } = auth
      
      await realtime.channel(roomId).emit("chat.destroy", { isDestroyed: true })

      const keysToDelete = [
        `meta:${roomId}`,
        `messages:${roomId}`,
        `users:${roomId}`,
        `presence:${roomId}`,
        `history:${roomId}`,
      ]

      await Promise.all(keysToDelete.map((key) => redis.del(key)))
    },
    { query: roomIdQuerySchema }
  )

const messages = new Elysia({ prefix: "/messages" })
  .use(authMiddleware)
  .post(
    "/",
    async ({ body, auth }) => {
      const { sender, text } = body
      const { roomId } = auth


      const message: Message = {
        id: nanoid(),
        sender,
        text,
        timestamp: Date.now(),
        roomId,
      }

      const messageWithToken = JSON.stringify({ ...message, token: auth.token })

      await Promise.all([
        redis.rpush(`messages:${roomId}`, messageWithToken),
        realtime.channel(roomId).emit("chat.message", message),
      ])

      const remaining = await redis.ttl(`meta:${roomId}`)
      if (remaining > 0) {
        await redis.expire(`messages:${roomId}`, remaining)
      }
    },
    {
      query: roomIdQuerySchema,
      body: createMessageBodySchema,
    }
  )
  .get(
    "/",
    async ({ auth }) => {
      const messages = await redis.lrange<string>(`messages:${auth.roomId}`, 0, -1)

      return {
        messages: messages.map((m) => {
          const parsed = typeof m === "string" ? JSON.parse(m) : m
          return {
            ...parsed,
            token: parsed.token === auth.token ? auth.token : undefined,
          }
        }),
      }
    },
    { query: roomIdQuerySchema }
  )
  .post(
    "/reaction",
    async ({ body, auth }) => {
      const { messageId, emoji, username, action } = body
      const { roomId } = auth

      const messages = await redis.lrange<string>(`messages:${roomId}`, 0, -1)
      const messageIndex = messages.findIndex((m) => {
        const parsed = typeof m === "string" ? JSON.parse(m) : m
        return parsed.id === messageId
      })

      if (messageIndex === -1) {
        throw new Error("Message not found")
      }

      const messageStr = messages[messageIndex]
      const message = typeof messageStr === "string" ? JSON.parse(messageStr) : messageStr
      const reactions = message.reactions || []

      let updatedReactions: typeof reactions
      if (action === "add") {
        const existingIndex = reactions.findIndex(
          (r: Reaction) => r.emoji === emoji && r.username === username
        )
        if (existingIndex === -1) {
          updatedReactions = [
            ...reactions,
            { emoji, username, timestamp: Date.now() },
          ]
        } else {
          updatedReactions = reactions
        }
      } else {
        updatedReactions = reactions.filter(
          (r: Reaction) => !(r.emoji === emoji && r.username === username)
        )
      }

      const updatedMessage = { ...message, reactions: updatedReactions }
      const updatedMessageStr = JSON.stringify(updatedMessage)

      await Promise.all([
        redis.lset(`messages:${roomId}`, messageIndex, updatedMessageStr),
        realtime.channel(roomId).emit("chat.reaction", {
          messageId,
          emoji,
          username,
          action,
        }),
      ])

      const remaining = await redis.ttl(`meta:${roomId}`)
      if (remaining > 0) {
        await redis.expire(`messages:${roomId}`, remaining)
      }

      return { success: true }
    },
    {
      query: roomIdQuerySchema,
      body: t.Object({
        messageId: t.String(),
        emoji: t.String(),
        username: t.String(),
        action: t.Union([t.Literal("add"), t.Literal("remove")]),
      }),
    }
  )
  .post(
    "/read",
    async ({ body, auth }) => {
      const { messageId, username } = body
      const { roomId } = auth

      const messages = await redis.lrange<string>(`messages:${roomId}`, 0, -1)
      const messageIndex = messages.findIndex((m) => {
        const parsed = typeof m === "string" ? JSON.parse(m) : m
        return parsed.id === messageId
      })

      if (messageIndex === -1) {
        throw new Error("Message not found")
      }

      const messageStr = messages[messageIndex]
      const message: Message = typeof messageStr === "string" ? JSON.parse(messageStr) : messageStr
      const readBy = message.readBy || []
      
      const alreadyRead = readBy.some((r) => r.username === username)
      if (!alreadyRead) {
        const updatedReadBy = [
          ...readBy,
          { username, timestamp: Date.now() },
        ]
        const updatedMessage = { ...message, readBy: updatedReadBy }
        await redis.lset(`messages:${roomId}`, messageIndex, JSON.stringify(updatedMessage))

        const remaining = await redis.ttl(`meta:${roomId}`)
        await redis.expire(`messages:${roomId}`, remaining)
      }

      return { success: true }
    },
    {
      query: roomIdQuerySchema,
      body: t.Object({
        messageId: t.String(),
        username: t.String(),
      }),
    }
  )
  .delete(
    "/",
    async ({ query, auth }) => {
      const { messageId } = query
      const { roomId, token } = auth

      const messages = await redis.lrange<string>(`messages:${roomId}`, 0, -1)
      const messageIndex = messages.findIndex((m) => {
        const parsed = typeof m === "string" ? JSON.parse(m) : m
        return parsed.id === messageId
      })

      if (messageIndex === -1) {
        throw new Error("Message not found")
      }

      const messageStr = messages[messageIndex]
      const message = typeof messageStr === "string" ? JSON.parse(messageStr) : messageStr
      if (message.token !== token) {
        throw new Error("Unauthorized")
      }

      const deletedMessage = { ...message, deleted: true, text: "" }
      await redis.lset(`messages:${roomId}`, messageIndex, JSON.stringify(deletedMessage))

      await realtime.channel(roomId).emit("chat.message", deletedMessage)

      const remaining = await redis.ttl(`meta:${roomId}`)
      await redis.expire(`messages:${roomId}`, remaining)

      return { success: true }
    },
    {
      query: t.Object({
        roomId: t.String(),
        messageId: t.String(),
      }),
    }
  )

const presence = new Elysia({ prefix: "/presence" })
  .use(authMiddleware)
  .post(
    "/typing",
    async ({ body, auth }) => {
      const { username, isTyping } = body
      await realtime.channel(auth.roomId).emit("chat.typing", { username, isTyping })
    },
    {
      query: roomIdQuerySchema,
      body: t.Object({
        username: t.String(),
        isTyping: t.Boolean(),
      }),
    }
  )
  .post(
    "/heartbeat",
    async ({ body, auth }) => {
      const { username } = body
      const now = Date.now()
      
      const remaining = await redis.ttl(`meta:${auth.roomId}`)
      
      await Promise.all([
        redis.hset(`presence:${auth.roomId}`, {
          [auth.token]: JSON.stringify({ username, lastSeen: now }),
        }),
        remaining > 0 ? redis.expire(`presence:${auth.roomId}`, remaining) : Promise.resolve(),
        realtime.channel(auth.roomId).emit("chat.presence", {
          username,
          status: "online",
          lastSeen: now,
        }),
      ])
    },
    {
      query: roomIdQuerySchema,
      body: t.Object({
        username: t.String(),
      }),
    }
  )
  .get(
    "/",
    async ({ auth }) => {
      const presenceData = await redis.hgetall<Record<string, string | { username: string; lastSeen: number }>>(`presence:${auth.roomId}`)
      
      const users = Object.entries(presenceData || {}).map(([, data]) => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data
        const isOnline = Date.now() - parsed.lastSeen < 60000
        return {
          username: parsed.username,
          status: isOnline ? ("online" as const) : ("offline" as const),
          lastSeen: parsed.lastSeen,
        }
      })
      
      return { users }
    },
    { query: roomIdQuerySchema }
  )

const app = new Elysia({ prefix: "/api" }).use(rooms).use(messages).use(presence)

export const GET = app.fetch
export const POST = app.fetch
export const DELETE = app.fetch

export type App = typeof app