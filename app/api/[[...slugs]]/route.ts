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
      connected: [],
      createdAt: Date.now(),
    })

    await redis.expire(`meta:${roomId}`, ROOM_TTL_SECONDS)

    return { roomId }
  })
  .use(authMiddleware)
  .post(
    "/join",
    async ({ body, auth }) => {
      const { username } = body
      const { roomId, token } = auth
      
      await redis.hset(`users:${roomId}`, {
        [token]: username,
      })
      
      const remaining = await redis.ttl(`meta:${roomId}`)
      await redis.expire(`users:${roomId}`, remaining)
      
      await realtime.channel(roomId).emit("chat.connection", {
        username,
        action: "joined",
        timestamp: Date.now(),
      })
      
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
      await realtime.channel(auth.roomId).emit("chat.destroy", { isDestroyed: true })

      await Promise.all([
        redis.del(auth.roomId),
        redis.del(`meta:${auth.roomId}`),
        redis.del(`messages:${auth.roomId}`),
      ])
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

      const roomExists = await redis.exists(`meta:${roomId}`)

      if (!roomExists) {
        throw new Error("Room does not exist")
      }

      const message: Message = {
        id: nanoid(),
        sender,
        text,
        timestamp: Date.now(),
        roomId,
      }

      await redis.rpush(`messages:${roomId}`, JSON.stringify({ ...message, token: auth.token }))
      await realtime.channel(roomId).emit("chat.message", message)

      const remaining = await redis.ttl(`meta:${roomId}`)

      await redis.expire(`messages:${roomId}`, remaining)
      await redis.expire(`history:${roomId}`, remaining)
      await redis.expire(roomId, remaining)
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
      await redis.lset(`messages:${roomId}`, messageIndex, JSON.stringify(updatedMessage))

      await realtime.channel(roomId).emit("chat.reaction", {
        messageId,
        emoji,
        username,
        action,
      })

      const remaining = await redis.ttl(`meta:${roomId}`)
      await redis.expire(`messages:${roomId}`, remaining)

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
      
      await redis.hset(`presence:${auth.roomId}`, {
        [auth.token]: JSON.stringify({ username, lastSeen: now }),
      })
      
      const remaining = await redis.ttl(`meta:${auth.roomId}`)
      await redis.expire(`presence:${auth.roomId}`, remaining)
      
      await realtime.channel(auth.roomId).emit("chat.presence", {
        username,
        status: "online",
        lastSeen: now,
      })
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