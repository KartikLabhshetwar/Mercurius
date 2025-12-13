import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useState } from "react"

interface CopyButtonProps {
  text: string
  label?: string
  variant?: "ghost" | "outline" | "default"
  size?: "xs" | "sm" | "default" | "lg"
  className?: string
}

export function CopyButton({
  text,
  label = "COPY",
  variant = "ghost",
  size = "xs",
  className,
}: CopyButtonProps) {
  const [status, setStatus] = useState(label)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setStatus("COPIED!")
    setTimeout(() => setStatus(label), 2000)
  }

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      size={size}
      className={className}
    >
      <Copy className="size-3" />
      {status}
    </Button>
  )
}
