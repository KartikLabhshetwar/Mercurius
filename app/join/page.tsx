"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Card, CardHeader, CardTitle, CardDescription, CardPanel } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { PageHeader } from "@/components/page-header"
import { useUsername } from "@/hooks/use-username"
import { UserAvatar } from "@/components/user-avatar"
import { client } from "@/lib/client"

const NANOID_PATTERN = /^[A-Za-z0-9_-]{21}$/

export default function JoinRoomPage() {
  const router = useRouter()
  const { username } = useUsername()
  const [roomId, setRoomId] = useState("")
  const [error, setError] = useState<string | null>(null)

  const { mutate: checkAndJoin, isPending: isJoining } = useMutation({
    mutationFn: async (roomIdToCheck: string) => {
      if (!NANOID_PATTERN.test(roomIdToCheck)) {
        throw new Error("Invalid room ID format")
      }

      const res = await client.room.check.get({ query: { roomId: roomIdToCheck } })
      
      if (!res.data?.exists) {
        throw new Error("Room not found or expired")
      }

      if (res.data.isFull) {
        throw new Error("Room is full")
      }

      return roomIdToCheck
    },
    onSuccess: (validRoomId) => {
      router.push(`/room/${validRoomId}`)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmedRoomId = roomId.trim()
    if (trimmedRoomId) {
      checkAndJoin(trimmedRoomId)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text").trim()
    if (pastedText && NANOID_PATTERN.test(pastedText)) {
      setRoomId(pastedText)
      setError(null)
      setTimeout(() => {
        checkAndJoin(pastedText)
      }, 100)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 pt-20 sm:pt-24">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <PageHeader 
          title="Join Room" 
          description="Enter the room ID to join a private chat room" 
        />
        <Card>
          <CardHeader>
            <CardTitle>Join Chat Room</CardTitle>
            <CardDescription>
              Paste the room ID shared with you. You&apos;ll join anonymously with a random name.
            </CardDescription>
          </CardHeader>
          <CardPanel>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="roomId">Room ID</Label>
                <Input
                  id="roomId"
                  value={roomId}
                  onChange={(e) => {
                    setRoomId(e.target.value)
                    setError(null)
                  }}
                  onPaste={handlePaste}
                  placeholder="Paste room ID here (auto-joins on paste)"
                  className="w-full font-mono"
                  disabled={isJoining}
                  autoFocus
                  aria-invalid={error ? "true" : "false"}
                />
                {error && (
                  <Alert variant="error" className="text-sm">
                    {error}
                  </Alert>
                )}
                {!error && roomId && !NANOID_PATTERN.test(roomId.trim()) && (
                  <p className="text-xs text-muted-foreground">
                    Room ID should be 21 characters (letters, numbers, _, -)
                  </p>
                )}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <UserAvatar username={username} size="md" isCurrentUser={true} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">You&apos;ll join as</p>
                    <p className="text-sm font-medium truncate">{username}</p>
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                disabled={!roomId.trim() || isJoining || !NANOID_PATTERN.test(roomId.trim())}
                className="w-full"
                size="lg"
              >
                {isJoining ? "Joining..." : "Join Room"}
              </Button>
            </form>
          </CardPanel>
        </Card>
      </div>
    </main>
  )
}
