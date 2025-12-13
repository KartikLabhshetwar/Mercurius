"use client"

import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { client } from "@/lib/client"
import { useUsername } from "@/hooks/use-username"
import { LandingPage } from "@/components/landing-page"

export default function CreateRoomPage() {
  const { username } = useUsername()
  const router = useRouter()

  const { mutate: createRoom, isPending } = useMutation({
    mutationFn: async () => {
      const res = await client.room.create.post()

      if (res.status === 200) {
        router.push(`/room/${res.data?.roomId}`)
      }
    },
  })

  return (
    <LandingPage
      title="Mercurius"
      description="A private, self-destructing chat room."
      username={username}
      onCreateRoom={() => createRoom()}
      isCreating={isPending}
    />
  )
}
