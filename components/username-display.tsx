import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface UsernameDisplayProps {
  username: string
}

export function UsernameDisplay({ username }: UsernameDisplayProps) {
  return (
    <div className="space-y-2">
      <Label>Your Identity</Label>
      <Input value={username} readOnly className="font-mono" />
    </div>
  )
}
