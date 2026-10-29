import type { Config, Context } from '@netlify/functions'
import { setting } from '../lib/env'
import { json, sameOrigin } from '../lib/http'
import { verifyIdToken } from '../lib/oidc'
import { login, takeLoginNonce } from '../lib/session'

// The account page POSTs the id_token it received from Telegram Login. The token must be signed by
// Telegram, be meant for our bot and carry the nonce this browser was given (see session.ts). Only the
// numeric user ID is kept; the token asks for no name, username or photo.
export default async (req: Request, context: Context) => {
  if (!sameOrigin(req)) return json({ error: 'forbidden' }, 403)
  const body = (await req.json().catch(() => null)) as { id_token?: unknown } | null
  const nonce = await takeLoginNonce(context)
  const clientId = setting('TELEGRAM_CLIENT_ID')
  if (typeof body?.id_token !== 'string' || !nonce || !clientId) return json({ error: 'login' }, 401)
  const uid = await verifyIdToken(body.id_token, { clientId, nonce }).catch((e) => (console.error(e), null))
  if (!uid) return json({ error: 'login' }, 401)
  await login(context, uid)
  return json({ ok: true })
}

export const config: Config = { path: '/api/auth/telegram', method: 'POST' }
