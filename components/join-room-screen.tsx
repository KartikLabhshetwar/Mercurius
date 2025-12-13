"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardPanel } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { UserAvatar } from "@/components/user-avatar"

interface JoinRoomScreenProps {
  roomId: string
  username: string
  onJoin: () => void
  isJoining: boolean
}

export function JoinRoomScreen({ roomId, username, onJoin, isJoining }: JoinRoomScreenProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 pt-20 sm:pt-24">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <PageHeader 
          title="Join Room" 
          description="You&apos;re about to join this private chat room" 
        />
        <Card>
          <CardHeader>
            <CardTitle>Join Chat Room</CardTitle>
            <CardDescription>
              You&apos;ll join anonymously with a random name. The room will self-destruct after 10 minutes.
            </CardDescription>
          </CardHeader>
          <CardPanel className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <UserAvatar username={username} size="md" isCurrentUser={true} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">You&apos;ll join as</p>
                    <p className="text-sm font-medium truncate">{username}</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Room ID</p>
                  <p className="text-sm font-mono break-all">{roomId}</p>
                </div>
              </div>
            </div>
            <Button
              onClick={onJoin}
              disabled={isJoining}
              className="w-full"
              size="lg"
            >
              {isJoining ? "Joining..." : "Join Room"}
            </Button>
          </CardPanel>
        </Card>
      </div>
    </main>
  )
}
