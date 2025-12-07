import { Elysia, t } from 'elysia'

const app = new Elysia({ prefix: '/api' })
  .get('/', 'Hello Next.js')
  .post(
    '/', ({ body }) => body,
    {
      body: t.Object({
        name: t.String()
      })
    }
  )

export type app = typeof app

export const GET = app.fetch   // ← Next.js uses this for GET
export const POST = app.fetch  // ← and for POST
