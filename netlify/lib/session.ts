import type { Context } from '@netlify/functions'
import { hmacHex, safeEqual } from './crypto'
import { secret } from './env'
import { store, type Owner } from './stores'
import { randomId } from './validate'

// Session cookie: "<telegram id>.<expiry>.<session id>.<hmac>". It carries no personal data beyond the
// numeric Telegram ID, and only the API reads it (HttpOnly, Path=/api). The session id must match the one
// stored on the owner; logging out replaces that id, so every cookie issued before it stops working.
const COOKIE = 'pz_session'
const MAX_AGE_S = 30 * 24 * 60 * 60

export interface Session {
  uid: number
  owner: Owner
}

// Logs the Telegram user in: creates the owner record on first login and sets the cookie.
export async function login(context: Context, uid: number) {
  const owners = store(context, 'owners')
  const owner = ((await owners.get(String(uid), { type: 'json' })) as Owner | null) ?? { created: Date.now(), stickers: [] }
  if (!owner.session) {
    owner.session = randomId(16)
    await owners.setJSON(String(uid), owner)
  }
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_S
  const payload = `${uid}.${exp}.${owner.session}`
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

// The logged-in owner, or null when the cookie is missing, expired, forged or revoked.
export async function readSession(context: Context): Promise<Session | null> {
  const raw = context.cookies.get(COOKIE)
  const m = raw?.match(/^(\d{1,20})\.(\d{1,12})\.([A-Za-z0-9]{16})\.([0-9a-f]{64})$/)
  if (!m) return null
  const [, uid, exp, sid, sig] = m
  if (Number(exp) * 1000 < Date.now()) return null
  const expected = await hmacHex(secret('SESSION_SECRET'), `${uid}.${exp}.${sid}`)
  if (!safeEqual(sig, expected)) return null
  const owner = (await store(context, 'owners').get(uid, { type: 'json' })) as Owner | null
  return owner && owner.session === sid ? { uid: Number(uid), owner } : null
}

// Ends the session on this device and revokes it everywhere else by rotating the stored id.
export async function logout(context: Context, session: Session | null) {
  if (session) {
    session.owner.session = randomId(16)
    await store(context, 'owners').setJSON(String(session.uid), session.owner)
  }
  context.cookies.delete({ name: COOKIE, path: '/api' })
}
