const COLORS = [
  { bg: "bg-blue-500", text: "text-blue-50" },
  { bg: "bg-green-500", text: "text-green-50" },
  { bg: "bg-purple-500", text: "text-purple-50" },
  { bg: "bg-pink-500", text: "text-pink-50" },
  { bg: "bg-orange-500", text: "text-orange-50" },
  { bg: "bg-cyan-500", text: "text-cyan-50" },
  { bg: "bg-yellow-500", text: "text-yellow-50" },
  { bg: "bg-red-500", text: "text-red-50" },
  { bg: "bg-indigo-500", text: "text-indigo-50" },
  { bg: "bg-teal-500", text: "text-teal-50" },
]

export function getUserColor(username: string) {
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % COLORS.length
  return COLORS[index]
}

export function getInitials(username: string): string {
  const parts = username.split("-")
  if (parts.length >= 2) {
    return parts[1].charAt(0).toUpperCase()
  }
  return username.charAt(0).toUpperCase()
}
