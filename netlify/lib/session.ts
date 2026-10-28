import type { Context } from '@netlify/functions'
import { hmacHex, safeEqual } from './crypto'
import { secret } from './env'

// Session cookie: "<telegram id>.<expiry>.<hmac>". It carries no personal data beyond the numeric
// Telegram ID, and only the API reads it (HttpOnly, Path=/api).
const COOKIE = 'pz_session'
const MAX_AGE_S = 30 * 24 * 60 * 60

export async function createSession(context: Context, uid: number) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_S
  const payload = `${uid}.${exp}`
  const sig = await hmacHex(secret('SESSION_SECRET'), payload)
  context.cookies.set({
    name: COOKIE,
    value: `${payload}.${sig}`,
    path: '/api',
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    expires: exp * 1000,
  })
}

export async function readSession(context: Context): Promise<number | null> {
  const raw = context.cookies.get(COOKIE)
  const m = raw?.match(/^(\d{1,20})\.(\d{1,12})\.([0-9a-f]{64})$/)
  if (!m) return null
  const [, uid, exp, sig] = m
  if (Number(exp) * 1000 < Date.now()) return null
  const expected = await hmacHex(secret('SESSION_SECRET'), `${uid}.${exp}`)
  return safeEqual(sig, expected) ? Number(uid) : null
}

export function clearSession(context: Context) {
  context.cookies.delete({ name: COOKIE, path: '/api' })
}
