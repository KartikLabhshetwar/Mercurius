import { treaty } from "@elysiajs/eden"
import type { App } from "../app/api/[[...slugs]]/route"

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
}

export const client = treaty<App>(getBaseUrl()).api