import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CountdownTimer } from "./countdown-timer"
import { CopyButton } from "./copy-button"
import { Bomb } from "lucide-react"

interface RoomHeaderProps {
  roomId: string
  timeToLive?: number
  onDestroy: () => void
  onExpire?: () => void
  roomUrl: string
}

export function RoomHeader({
  roomId,
  timeToLive,
  onDestroy,
  onExpire,
  roomUrl,
}: RoomHeaderProps) {
  return (
    <header className="border-b p-4 flex items-center justify-between bg-card">
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Room ID
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-success">
              {roomId.slice(0, 10)}...
            </Badge>
            <CopyButton text={roomUrl} className="h-6" />
          </div>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Self-Destruct
          </span>
          <CountdownTimer initialTtl={timeToLive} onExpire={onExpire} />
        </div>
      </div>

      <Button
        onClick={onDestroy}
        variant="destructive"
        size="sm"
        className="gap-2"
      >
        <Bomb className="size-4" />
        DESTROY NOW
      </Button>
    </header>
  )
}
