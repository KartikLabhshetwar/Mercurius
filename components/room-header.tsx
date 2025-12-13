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
    <header className="border-b px-3 sm:px-4 py-2.5 sm:py-3 bg-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-6 min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap shrink-0">
              ROOM ID
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <Badge variant="outline" className="font-mono text-success rounded-full px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs md:text-sm max-w-[140px] sm:max-w-[180px] md:max-w-none truncate">
                {roomId}
              </Badge>
              <CopyButton text={roomUrl} className="h-6 sm:h-7 rounded-full shrink-0" />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap">
              SELF-DESTRUCT
            </span>
            <CountdownTimer initialTtl={timeToLive} onExpire={onExpire} />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <GitHubStarButton variant="compact" />
          </div>
          <Button
            onClick={onDestroy}
            variant="outline"
            size="xs"
            className="gap-1.5 sm:gap-2 rounded-full h-7 w-full sm:w-auto sm:shrink-0 text-[10px] sm:text-xs"
          >
            <Bomb className="size-3" />
            <span className="hidden sm:inline">DESTROY NOW</span>
            <span className="sm:hidden">DESTROY</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
