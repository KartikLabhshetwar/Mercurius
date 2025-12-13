"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"

export function HeroLanding() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-12 text-center">
        <PageHeader
          title="Mercurius"
          description="Private, self-destructing chat rooms that disappear after 10 minutes. No accounts, no history, just secure conversations."
        />

        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Ephemeral. Secure. Private.
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Create a temporary chat room, share the link, and have a conversation that automatically
              expires. Perfect for sensitive discussions, one-time exchanges, or when you need
              privacy without the hassle.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => router.push("/create")}
              size="lg"
              className="w-full sm:w-auto min-w-[200px]"
            >
              Create Room
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Self-Destructing</h3>
            <p className="text-xs text-muted-foreground">
              Rooms automatically expire after 10 minutes
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">No Accounts</h3>
            <p className="text-xs text-muted-foreground">
              Start chatting immediately without registration
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Real-Time</h3>
            <p className="text-xs text-muted-foreground">
              Instant message delivery with live updates
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
