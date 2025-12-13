"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardPanel } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { UserAvatar } from "@/components/user-avatar"

interface LandingPageProps {
  title: string
  description: string
  username: string
  onCreateRoom: () => void
  isCreating: boolean
  createButtonText?: string
  creatingButtonText?: string
}

export function LandingPage({
  title,
  description,
  username,
  onCreateRoom,
  isCreating,
  createButtonText = "CREATE NEW ROOM",
  creatingButtonText = "Creating...",
}: LandingPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 pt-20 sm:pt-24">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <PageHeader title={title} description={description} />
        <Card>
          <CardHeader>
            <CardTitle>Create Room</CardTitle>
            <CardDescription>
              Start a new private chat room that self-destructs after 10 minutes. You&apos;ll join anonymously with a random name.
            </CardDescription>
          </CardHeader>
          <CardPanel className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <UserAvatar username={username} size="md" isCurrentUser={true} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">You&apos;ll join as</p>
                <p className="text-sm font-medium truncate">{username}</p>
              </div>
            </div>
            <Button
              onClick={onCreateRoom}
              disabled={isCreating}
              className="w-full"
              size="lg"
            >
              {isCreating ? creatingButtonText : createButtonText}
            </Button>
          </CardPanel>
        </Card>
      </div>
    </main>
  )
}
