"use client"

import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import { useUsername } from "@/hooks/use-username"
import { useSound } from "@/hooks/use-sound"
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
import { JoinRoomScreen } from "@/components/join-room-screen"
import type { Message } from "@/lib/schemas"

const JOINED_STORAGE_KEY = (roomId: string) => `joined_${roomId}`

const Page = () => {
  const params = useParams()
  const roomId = params.roomId as string
  const router = useRouter()
  const { username } = useUsername()
  const playBombSound = useSound("/meme_bomb_sound.mp3")
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [otherUser, setOtherUser] = useState<{ username: string; status: "online" | "offline" | "away" } | null>(null)
  const [connectionNotification, setConnectionNotification] = useState<{ username: string; action: "joined" | "left" } | null>(null)
  const [hasJoined, setHasJoined] = useState<boolean>(false)
  const [joinedUsername, setJoinedUsername] = useState<string>(username)
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
      await client.messages.post({ sender: joinedUsername, text }, { query: { roomId } })
    },
    onMutate: async ({ text }) => {
      await queryClient.cancelQueries({ queryKey: ["messages", roomId] })
      const previousMessages = queryClient.getQueryData<{ messages: Message[] }>(["messages", roomId])
      
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        sender: joinedUsername,
        text,
        timestamp: Date.now(),
        roomId,
        token: "current",
      }

      queryClient.setQueryData<{ messages: Message[] }>(["messages", roomId], (old) => {
        if (!old?.messages) return { messages: [optimisticMessage] }
        return { messages: [...old.messages, optimisticMessage] }
      })

      return { previousMessages }
    },
    onError: (err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["messages", roomId], context.previousMessages)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", roomId] })
    },
  })

  const cleanupRoom = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(JOINED_STORAGE_KEY(roomId))
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = undefined
    }
    
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current)
      typingDebounceRef.current = undefined
    }
    
    queryClient.removeQueries({ queryKey: ["messages", roomId] })
    queryClient.removeQueries({ queryKey: ["presence", roomId] })
    queryClient.removeQueries({ queryKey: ["ttl", roomId] })
    
    setTypingUsers([])
    setOtherUser(null)
    setConnectionNotification(null)
    setHasJoined(false)
  }, [roomId, queryClient])

  const { mutate: destroyRoom } = useMutation({
    mutationFn: async () => {
      await client.room.delete(null, { query: { roomId } })
    },
    onSuccess: () => {
      cleanupRoom()
      playBombSound()
      router.push("/create/?destroyed=true")
    },
  })

  const { mutate: joinRoom, isPending: isJoining } = useMutation({
    mutationFn: async () => {
      await client.room.join.post({ username }, { query: { roomId } })
    },
    onSuccess: () => {
      setJoinedUsername(username)
      setHasJoined(true)
      if (typeof window !== "undefined") {
        localStorage.setItem(JOINED_STORAGE_KEY(roomId), "true")
      }
    },
  })

  const { mutate: sendTyping } = useMutation({
    mutationFn: async ({ isTyping }: { isTyping: boolean }) => {
      await client.presence.typing.post({ username: joinedUsername, isTyping }, { query: { roomId } })
    },
  })

  const { mutate: sendHeartbeat } = useMutation({
    mutationFn: async (username: string) => {
      await client.presence.heartbeat.post({ username }, { query: { roomId } })
    },
  })

  const { mutate: addReaction } = useMutation({
    mutationFn: async ({ messageId, emoji, action }: { messageId: string; emoji: string; action: "add" | "remove" }) => {
      await client.messages.reaction.post({ messageId, emoji, username: joinedUsername, action }, { query: { roomId } })
    },
  })

  const { mutate: markAsRead } = useMutation({
    mutationFn: async (messageId: string) => {
      await client.messages.read.post({ messageId, username: joinedUsername }, { query: { roomId } })
    },
    onSuccess: (_, messageId) => {
      queryClient.setQueryData<{ messages: Message[] }>(["messages", roomId], (old) => {
        if (!old?.messages) return old
        return {
          messages: old.messages.map((msg) => {
            if (msg.id === messageId) {
              const readBy = msg.readBy || []
              if (!readBy.some((r) => r.username === joinedUsername)) {
                return {
                  ...msg,
                  readBy: [...readBy, { username: joinedUsername, timestamp: Date.now() }],
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
    enabled: hasJoined,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const joined = localStorage.getItem(JOINED_STORAGE_KEY(roomId)) === "true"
      if (joined && username) {
        setJoinedUsername(username)
        setHasJoined(true)
      }
    }
  }, [roomId, username])

  useEffect(() => {
    if (!hasJoined || !joinedUsername) return

    sendHeartbeat(joinedUsername)
    
    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat(joinedUsername)
    }, 30000)

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
    }
  }, [hasJoined, joinedUsername, roomId, sendHeartbeat])

  useEffect(() => {
    if (presenceData?.users && username && !hasJoined) {
      const userInRoom = presenceData.users.find((u) => u.username === username)
      if (userInRoom) {
        setJoinedUsername(username)
        setHasJoined(true)
        if (typeof window !== "undefined") {
          localStorage.setItem(JOINED_STORAGE_KEY(roomId), "true")
        }
      }
    }
  }, [presenceData, username, hasJoined, roomId])

  useEffect(() => {
    return () => {
      cleanupRoom()
    }
  }, [cleanupRoom])

  useEffect(() => {
    if (!hasJoined && username && roomId) {
      joinRoom()
    }
  }, [hasJoined, username, roomId, joinRoom])

  const computedOtherUser = useMemo(() => {
    if (!presenceData?.users) return null
    const other = presenceData.users.find((u) => u.username !== joinedUsername)
    return other ? { username: other.username, status: other.status } : null
  }, [presenceData, joinedUsername])

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
          
          const messageWithToken: Message = { ...data, token: data.sender === joinedUsername ? "current" : undefined }
          
          if (data.sender === joinedUsername) {
            const existingIndex = old.messages.findIndex(
              (msg) => msg.id.startsWith("temp-") && msg.text === data.text && msg.sender === data.sender
            )
            
            if (existingIndex !== -1) {
              const updatedMessages = [...old.messages]
              updatedMessages[existingIndex] = messageWithToken
              return { messages: updatedMessages }
            }
          }
          
          const alreadyExists = old.messages.some(
            (msg) => msg.id === data.id || (msg.text === data.text && msg.sender === data.sender && Math.abs(msg.timestamp - data.timestamp) < 2000)
          )
          
          if (alreadyExists) {
            return old
          }
          
          return {
            messages: [...old.messages, messageWithToken],
          }
        })
      }

      if (event === "chat.destroy") {
        cleanupRoom()
        playBombSound()
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

      if (event === "chat.typing" && data.username !== joinedUsername) {
        setTypingUsers((prev) => {
          if (data.isTyping) {
            return prev.includes(data.username) ? prev : [...prev, data.username]
          }
          return prev.filter((u) => u !== data.username)
        })
      }

      if (event === "chat.presence" && data.username !== joinedUsername) {
        setOtherUser({ username: data.username, status: data.status })
      }

      if (event === "chat.connection" && data.username !== joinedUsername) {
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
    cleanupRoom()
    playBombSound()
    router.push("/create/?destroyed=true")
  }

  const roomUrl = typeof window !== "undefined" ? window.location.href : ""

  if (!hasJoined || !username) {
    if (isJoining) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Joining room...</p>
          </div>
        </main>
      )
    }
    return (
      <JoinRoomScreen
        roomId={roomId}
        username={username}
        onJoin={() => joinRoom()}
        isJoining={isJoining}
      />
    )
  }

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
            <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 border-b">
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
            currentUsername={joinedUsername}
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