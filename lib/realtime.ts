import { redis } from "@/lib/redis"
import { InferRealtimeEvents, Realtime } from "@upstash/realtime"
import { realtimeSchema, type Message } from "@/lib/schemas"

export const realtime = new Realtime({ schema: realtimeSchema, redis })
export type RealtimeEvents = InferRealtimeEvents<typeof realtime>
export type { Message }