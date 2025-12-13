"use client"

import { useUsername } from "@/hooks/use-username"
import { client } from "@/lib/client"
import { useRealtime } from "@/lib/realtime-client"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { RoomHeader } from "@/components/room-header"
import { MessageList } from "@/components/message-list"
import { MessageInput } from "@/components/message-input"

const Page = () => {
  const params = useParams()
  const roomId = params.roomId as string
  const router = useRouter()
  const { username } = useUsername()

  const { data: ttlData } = useQuery({
    queryKey: ["ttl", roomId],
    queryFn: async () => {
      const res = await client.room.ttl.get({ query: { roomId } })
      return res.data
    },
  })

  const { data: messages, refetch } = useQuery({
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

  useRealtime({
    channels: [roomId],
    events: ["chat.message", "chat.destroy"],
    onData: ({ event }) => {
      if (event === "chat.message") {
        refetch()
      }

      if (event === "chat.destroy") {
        router.push("/?destroyed=true")
      }
    },
  })

  const handleExpire = () => {
    router.push("/?destroyed=true")
  }

  const roomUrl = typeof window !== "undefined" ? window.location.href : ""

  return (
    <main className="flex flex-col h-screen max-h-screen overflow-hidden bg-background">
      <RoomHeader
        roomId={roomId}
        timeToLive={ttlData?.ttl}
        onDestroy={() => destroyRoom()}
        onExpire={handleExpire}
        roomUrl={roomUrl}
      />

      <div className="flex-1 flex flex-col items-center overflow-hidden">
        <div className="w-full max-w-4xl flex flex-col h-full">
          <MessageList
            messages={messages?.messages ?? []}
            currentUsername={username}
          />

          <MessageInput
            onSend={(text) => sendMessage({ text })}
            isPending={isPending}
          />
        </div>
      </div>
    </main>
  )
}

export default Page