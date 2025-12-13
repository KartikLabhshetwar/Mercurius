import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CountdownTimer } from "./countdown-timer"
import { CopyButton } from "./copy-button"
import { GitHubStarButton } from "./github-star-button"
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
    <header className="border-b px-4 py-3.5 sm:py-3 bg-card">
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-center justify-between w-full sm:w-auto sm:items-center gap-3 sm:gap-6 min-w-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 min-w-0 flex-1">
            <div className="flex items-center gap-2.5 sm:gap-2 min-w-0 flex-1 sm:flex-initial">
              <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap shrink-0">
                ROOM ID
              </span>
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
                <Badge variant="outline" className="font-mono text-success rounded-full px-3 py-1.5 text-xs sm:text-sm max-w-[180px] sm:max-w-none truncate">
                  {roomId}
                </Badge>
                <CopyButton text={roomUrl} className="h-7 rounded-full shrink-0" />
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-2 shrink-0">
              <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap">
                SELF-DESTRUCT
              </span>
              <CountdownTimer initialTtl={timeToLive} onExpire={onExpire} />
            </div>
          </div>
          <div className="sm:hidden">
            <GitHubStarButton variant="compact" />
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <GitHubStarButton variant="compact" />
          <Button
            onClick={onDestroy}
            variant="outline"
            size="xs"
            className="gap-2 rounded-full h-8 sm:h-7 w-full sm:w-auto sm:shrink-0"
          >
            <Bomb className="size-3.5 sm:size-3" />
            DESTROY NOW
          </Button>
        </div>
      </div>
    </header>
  )
}
