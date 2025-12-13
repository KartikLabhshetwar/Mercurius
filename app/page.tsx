"use client"

import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { client } from "@/lib/client"
import { useUsername } from "@/hooks/use-username"
import { Card, CardHeader, CardTitle, CardDescription, CardPanel } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { UsernameDisplay } from "@/components/username-display"

export default function Home() {
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
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <PageHeader
          title="Mercurius"
          description="A private, self-destructing chat room."
        />
        <Card>
          <CardHeader>
            <CardTitle>Create Room</CardTitle>
            <CardDescription>
              Start a new private chat room that self-destructs after 10 minutes
            </CardDescription>
          </CardHeader>
          <CardPanel className="space-y-4">
            <UsernameDisplay username={username} />
            <Button
              onClick={() => createRoom()}
              disabled={isPending}
              className="w-full"
              size="lg"
            >
              {isPending ? "Creating..." : "CREATE NEW ROOM"}
            </Button>
          </CardPanel>
        </Card>
      </div>
    </main>
  )
}
