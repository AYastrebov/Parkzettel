import type { Context } from '@netlify/functions'
import { hmacHex } from './crypto'
import { secret } from './env'
import { store } from './stores'

interface Bucket {
  count: number
  start: number
}

export const WINDOW_MS = 10 * 60 * 1000
const ATTEMPTS = 5
// A short random pause between attempts, so simultaneous requests stop colliding on the same ETag.
const backoff = () => new Promise((ok) => setTimeout(ok, 20 + Math.random() * 60))

// Fixed-window counter. Keys are HMACs, so the store never contains a raw IP address. The write is
// conditional on the ETag that was read, so parallel requests cannot all pass on the same count; a
// request that keeps losing the race is refused, which errs on the side of the limit.
export async function allow(context: Context, key: string, max: number): Promise<boolean> {
  const limits = store(context, 'ratelimit')
  const k = (await hmacHex(secret('SESSION_SECRET'), `rl|${key}`)).slice(0, 40)
  for (let i = 0; i < ATTEMPTS; i++) {
    const now = Date.now()
    const cur = (await limits.getWithMetadata(k, { type: 'json' })) as { data: Bucket | null; etag?: string } | null
    const b = cur?.data
    const bucket: Bucket = b && now - b.start < WINDOW_MS ? b : { count: 0, start: now }
    if (bucket.count >= max) return false
    bucket.count++
    // The local Blobs server (netlify dev) sends no ETag on reads; the write is then unconditional, as before.
    const condition = !cur ? { onlyIfNew: true } : cur.etag ? { onlyIfMatch: cur.etag } : {}
    const { modified } = await limits.setJSON(k, bucket, condition)
    if (modified) return true
    await backoff()
  }
  return false
}
