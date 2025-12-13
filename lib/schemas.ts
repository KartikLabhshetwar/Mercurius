import { z } from "zod"

export const reactionSchema = z.object({
  emoji: z.string(),
  username: z.string(),
  timestamp: z.number(),
})

export const readReceiptSchema = z.object({
  username: z.string(),
  timestamp: z.number(),
})

export const messageSchema = z.object({
  id: z.string(),
  sender: z.string(),
  text: z.string(),
  timestamp: z.number(),
  roomId: z.string(),
  token: z.string().optional(),
  reactions: z.array(reactionSchema).optional(),
  readBy: z.array(readReceiptSchema).optional(),
  edited: z.boolean().optional(),
  deleted: z.boolean().optional(),
})

export const chatDestroySchema = z.object({
  isDestroyed: z.literal(true),
})

export const roomIdQuerySchema = z.object({
  roomId: z.string(),
})

export const createMessageBodySchema = z.object({
  sender: z.string().max(100),
  text: z.string().max(1000),
})

export const typingSchema = z.object({
  username: z.string(),
  isTyping: z.boolean(),
})

export const presenceSchema = z.object({
  username: z.string(),
  status: z.enum(["online", "offline", "away"]),
  lastSeen: z.number().optional(),
})

export const connectionSchema = z.object({
  username: z.string(),
  action: z.enum(["joined", "left"]),
  timestamp: z.number(),
})

export const reactionUpdateSchema = z.object({
  messageId: z.string(),
  emoji: z.string(),
  username: z.string(),
  action: z.enum(["add", "remove"]),
})

export const realtimeSchema = {
  chat: {
    message: messageSchema,
    destroy: chatDestroySchema,
    typing: typingSchema,
    presence: presenceSchema,
    connection: connectionSchema,
    reaction: reactionUpdateSchema,
  },
}

export type Message = z.infer<typeof messageSchema>
export type Reaction = z.infer<typeof reactionSchema>
export type ReactionUpdate = z.infer<typeof reactionUpdateSchema>
export type ReadReceipt = z.infer<typeof readReceiptSchema>
export type ChatDestroy = z.infer<typeof chatDestroySchema>
export type RoomIdQuery = z.infer<typeof roomIdQuerySchema>
export type CreateMessageBody = z.infer<typeof createMessageBodySchema>
