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

// Login nonce cookie: "<nonce>.<expiry>.<hmac>", set when the account page shows the login button. The nonce
// goes to Telegram with the login request and comes back inside the id_token, and the cookie proves that
// this browser started the attempt. A token obtained in another browser therefore cannot log anyone in here.
const LOGIN_COOKIE = 'pz_login'
const LOGIN_MAX_AGE_S = 10 * 60

const cookie = (context: Context, name: string, value: string, exp: number) =>
  context.cookies.set({ name, value, path: '/api', httpOnly: true, secure: true, sameSite: 'Strict', expires: exp * 1000 })

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
  cookie(context, COOKIE, `${payload}.${await hmacHex(secret('SESSION_SECRET'), payload)}`, exp)
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

export async function issueLoginNonce(context: Context): Promise<string> {
  const nonce = randomId(16)
  const exp = Math.floor(Date.now() / 1000) + LOGIN_MAX_AGE_S
  cookie(context, LOGIN_COOKIE, `${nonce}.${exp}.${await hmacHex(secret('SESSION_SECRET'), `login|${nonce}.${exp}`)}`, exp)
  return nonce
}

// Reads and clears the nonce cookie, so each nonce completes at most one login.
export async function takeLoginNonce(context: Context): Promise<string | null> {
  const raw = context.cookies.get(LOGIN_COOKIE)
  context.cookies.delete({ name: LOGIN_COOKIE, path: '/api' })
  const m = raw?.match(/^([A-Za-z0-9]{16})\.(\d{1,12})\.([0-9a-f]{64})$/)
  if (!m) return null
  const [, nonce, exp, sig] = m
  if (Number(exp) * 1000 < Date.now()) return null
  const expected = await hmacHex(secret('SESSION_SECRET'), `login|${nonce}.${exp}`)
  return safeEqual(sig, expected) ? nonce : null
}
