import type { Config, Context } from '@netlify/functions'
import { WINDOW_MS } from '../lib/ratelimit'
import { MESSAGE_TTL_MS, store } from '../lib/stores'

// Deletes expired scanner messages and rate-limit counters once an hour, so neither outlives its purpose.
export default async (_req: Request, context: Context) => {
  const now = Date.now()
  for (const [name, ttl] of [
    ['messages', MESSAGE_TTL_MS],
    ['ratelimit', WINDOW_MS],
  ] as const) {
    const s = store(context, name)
    const { blobs } = await s.list()
    for (const { key } of blobs) {
      const v = (await s.get(key, { type: 'json' })) as { created?: number; start?: number } | null
      if (!v || now - (v.created ?? v.start ?? 0) > ttl) await s.delete(key)
    }
  }
}

export const config: Config = { schedule: '@hourly' }
