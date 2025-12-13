"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useUsername } from "@/hooks/use-username"
import { client } from "@/lib/client"
import { useRealtime } from "@/lib/realtime-client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { RoomHeader } from "@/components/room-header"
import { MessageList } from "@/components/message-list"
import { MessageInput } from "@/components/message-input"
import { TypingIndicator } from "@/components/typing-indicator"
import { PresenceIndicator } from "@/components/presence-indicator"
import { ConnectionNotification } from "@/components/connection-notification"
import type { Message } from "@/lib/schemas"

const Page = () => {
  const params = useParams()
  const roomId = params.roomId as string
  const router = useRouter()
  const { username } = useUsername()
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [otherUser, setOtherUser] = useState<{ username: string; status: "online" | "offline" | "away" } | null>(null)
  const [connectionNotification, setConnectionNotification] = useState<{ username: string; action: "joined" | "left" } | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const typingDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const { data: ttlData } = useQuery({
    queryKey: ["ttl", roomId],
    queryFn: async () => {
      const res = await client.room.ttl.get({ query: { roomId } })
      return res.data
    },
  })

  const queryClient = useQueryClient()
  const { data: messages } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: async () => {
      const res = await client.messages.get({ query: { roomId } })
      return res.data
    },
  })

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      await client.messages.post({ sender: username, text }, { query: { roomId } })
    },
  })

  const { mutate: destroyRoom } = useMutation({
    mutationFn: async () => {
      await client.room.delete(null, { query: { roomId } })
    },
  })

  const { mutate: joinRoom } = useMutation({
    mutationFn: async (username: string) => {
      await client.room.join.post({ username }, { query: { roomId } })
    },
  })

  const { mutate: sendTyping } = useMutation({
    mutationFn: async ({ isTyping }: { isTyping: boolean }) => {
      await client.presence.typing.post({ username, isTyping }, { query: { roomId } })
    },
  })

  const { mutate: sendHeartbeat } = useMutation({
    mutationFn: async (username: string) => {
      await client.presence.heartbeat.post({ username }, { query: { roomId } })
    },
  })

  const { mutate: addReaction } = useMutation({
    mutationFn: async ({ messageId, emoji, action }: { messageId: string; emoji: string; action: "add" | "remove" }) => {
      await client.messages.reaction.post({ messageId, emoji, username, action }, { query: { roomId } })
    },
  })

  const { mutate: markAsRead } = useMutation({
    mutationFn: async (messageId: string) => {
      await client.messages.read.post({ messageId, username }, { query: { roomId } })
    },
    onSuccess: (_, messageId) => {
      queryClient.setQueryData<{ messages: Message[] }>(["messages", roomId], (old) => {
        if (!old?.messages) return old
        return {
          messages: old.messages.map((msg) => {
            if (msg.id === messageId) {
              const readBy = msg.readBy || []
              if (!readBy.some((r) => r.username === username)) {
                return {
                  ...msg,
                  readBy: [...readBy, { username, timestamp: Date.now() }],
                }
              }
            }
            return msg
          }),
        }
      })
    },
  })

  const { mutate: deleteMessage } = useMutation({
    mutationFn: async (messageId: string) => {
      await client.messages.delete(null, { query: { roomId, messageId } })
    },
    onSuccess: (_, messageId) => {
      queryClient.setQueryData<{ messages: Message[] }>(["messages", roomId], (old) => {
        if (!old?.messages) return old
        return {
          messages: old.messages.map((msg) =>
            msg.id === messageId ? { ...msg, deleted: true, text: "" } : msg
          ),
        }
      })
    },
  })

  const { data: presenceData } = useQuery({
    queryKey: ["presence", roomId],
    queryFn: async () => {
      const res = await client.presence.get({ query: { roomId } })
      return res.data
    },
    refetchInterval: 30000,
  })

  useEffect(() => {
    if (!username) return

    joinRoom(username)
    sendHeartbeat(username)
    
    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat(username)
    }, 30000)

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
    }
  }, [username, roomId, joinRoom, sendHeartbeat])

  const computedOtherUser = useMemo(() => {
    if (!presenceData?.users) return null
    const other = presenceData.users.find((u) => u.username !== username)
    return other ? { username: other.username, status: other.status } : null
  }, [presenceData, username])

  useEffect(() => {
    setOtherUser(computedOtherUser)
  }, [computedOtherUser])

  useRealtime({
    channels: [roomId],
    events: ["chat.message", "chat.destroy", "chat.typing", "chat.presence", "chat.connection", "chat.reaction"],
    onData: ({ event, data }) => {
      if (event === "chat.message") {
        queryClient.setQueryData<{ messages: Message[] }>(["messages", roomId], (old) => {
          if (!old?.messages) return old
          const messageWithToken: Message = { ...data, token: data.sender === username ? "current" : undefined }
          return {
            messages: [...old.messages, messageWithToken],
          }
        })
      }

      if (event === "chat.destroy") {
        router.push("/create/?destroyed=true")
      }

      if (event === "chat.reaction") {
        queryClient.setQueryData<{ messages: Message[] }>(["messages", roomId], (old) => {
          if (!old?.messages) return old
          return {
            messages: old.messages.map((msg) => {
              if (msg.id === data.messageId) {
                const reactions = msg.reactions || []
                let updatedReactions = [...reactions]
                if (data.action === "add") {
                  if (!reactions.some((r) => r.emoji === data.emoji && r.username === data.username)) {
                    updatedReactions.push({ emoji: data.emoji, username: data.username, timestamp: Date.now() })
                  }
                } else {
                  updatedReactions = updatedReactions.filter(
                    (r) => !(r.emoji === data.emoji && r.username === data.username)
                  )
                }
                return { ...msg, reactions: updatedReactions }
              }
              return msg
            }),
          }
        })
      }

      if (event === "chat.typing" && data.username !== username) {
        setTypingUsers((prev) => {
          if (data.isTyping) {
            return prev.includes(data.username) ? prev : [...prev, data.username]
          }
          return prev.filter((u) => u !== data.username)
        })
      }

      if (event === "chat.presence" && data.username !== username) {
        setOtherUser({ username: data.username, status: data.status })
      }

      if (event === "chat.connection" && data.username !== username) {
        setConnectionNotification({ username: data.username, action: data.action })
        setTimeout(() => setConnectionNotification(null), 3000)
      }
    },
  })

  const handleTyping = (isTyping: boolean) => {
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current)
    }

    typingDebounceRef.current = setTimeout(() => {
      sendTyping({ isTyping })
    }, 300)
  }

  const handleExpire = () => {
    router.push("/create/?destroyed=true")
  }

  const roomUrl = typeof window !== "undefined" ? window.location.href : ""

  return (
    <main className="flex flex-col h-screen overflow-hidden bg-background">
      <RoomHeader
        roomId={roomId}
        timeToLive={ttlData?.ttl}
        onDestroy={() => destroyRoom()}
        onExpire={handleExpire}
        roomUrl={roomUrl}
      />

      <div className="flex-1 flex flex-col items-center overflow-hidden">
        <div className="w-full max-w-4xl flex flex-col h-full">
          {otherUser && (
            <div className="px-4 sm:px-6 py-2 sm:py-2.5 border-b">
              <PresenceIndicator username={otherUser.username} status={otherUser.status} />
            </div>
          )}

          {connectionNotification && (
            <ConnectionNotification
              username={connectionNotification.username}
              action={connectionNotification.action}
            />
          )}

          <MessageList
            messages={messages?.messages ?? []}
            currentUsername={username}
            otherUsername={otherUser?.username}
            onReaction={(messageId, emoji, action) => addReaction({ messageId, emoji, action })}
            onMessageRead={(messageId) => markAsRead(messageId)}
            onDelete={(messageId) => deleteMessage(messageId)}
          />

          <TypingIndicator usernames={typingUsers} />

          <MessageInput
            onSend={(text) => sendMessage({ text })}
            onTyping={handleTyping}
            isPending={isPending}
          />
        </div>
      </div>
    </main>
  )
}

export default Page