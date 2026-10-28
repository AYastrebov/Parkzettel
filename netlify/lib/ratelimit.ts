import type { Context } from '@netlify/functions'
import { hmacHex } from './crypto'
import { secret } from './env'
import { store } from './stores'

interface Bucket {
  count: number
  start: number
}

export const WINDOW_MS = 10 * 60 * 1000

// Fixed-window counter. Keys are HMACs, so the store never contains a raw IP address.
export async function allow(context: Context, key: string, max: number): Promise<boolean> {
  const limits = store(context, 'ratelimit')
  const k = (await hmacHex(secret('SESSION_SECRET'), `rl|${key}`)).slice(0, 40)
  const now = Date.now()
  const b = (await limits.get(k, { type: 'json' })) as Bucket | null
  const bucket = b && now - b.start < WINDOW_MS ? b : { count: 0, start: now }
  if (bucket.count >= max) return false
  bucket.count++
  await limits.setJSON(k, bucket)
  return true
}
