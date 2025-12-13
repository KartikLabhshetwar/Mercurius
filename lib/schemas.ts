import { z } from "zod"

export const messageSchema = z.object({
  id: z.string(),
  sender: z.string(),
  text: z.string(),
  timestamp: z.number(),
  roomId: z.string(),
  token: z.string().optional(),
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

export const realtimeSchema = {
  chat: {
    message: messageSchema,
    destroy: chatDestroySchema,
  },
}

export type Message = z.infer<typeof messageSchema>
export type ChatDestroy = z.infer<typeof chatDestroySchema>
export type RoomIdQuery = z.infer<typeof roomIdQuerySchema>
export type CreateMessageBody = z.infer<typeof createMessageBodySchema>
