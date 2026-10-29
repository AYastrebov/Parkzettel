import type { Config, Context } from '@netlify/functions'
import { deployContext } from '../lib/env'
import { json, sameOrigin } from '../lib/http'
import { login } from '../lib/session'

// Local development only (netlify dev): the Telegram widget refuses to run on localhost,
// so this logs in as a fixed fake user. It answers 404 in every deployed context, and also
// checks the hostname so a missing deploy context (which deployContext reads as 'dev') fails closed.
const DEV_UID = 1
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

export default async (req: Request, context: Context) => {
  if (deployContext(context) !== 'dev' || !LOCAL_HOSTS.has(new URL(req.url).hostname) || !sameOrigin(req)) {
    return new Response('Not found', { status: 404 })
  }
  await login(context, DEV_UID)
  return json({ ok: true })
}

export const config: Config = { path: '/api/auth/dev', method: 'POST' }
