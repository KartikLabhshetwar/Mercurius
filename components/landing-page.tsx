"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardPanel } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { UsernameDisplay } from "@/components/username-display"

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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md space-y-8">
        <PageHeader title={title} description={description} />
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
