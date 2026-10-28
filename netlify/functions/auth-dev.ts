import type { Config, Context } from '@netlify/functions'
import { deployContext } from '../lib/env'
import { json, sameOrigin } from '../lib/http'
import { createSession } from '../lib/session'
import { store, type Owner } from '../lib/stores'

// Local development only (netlify dev): the Telegram widget refuses to run on localhost,
// so this logs in as a fixed fake user. It answers 404 in every deployed context.
const DEV_UID = 1

export default async (req: Request, context: Context) => {
  if (deployContext(context) !== 'dev' || !sameOrigin(req)) return new Response('Not found', { status: 404 })
  const owners = store(context, 'owners')
  if (!(await owners.get(String(DEV_UID)))) {
    await owners.setJSON(String(DEV_UID), { created: Date.now(), stickers: [] } satisfies Owner)
  }
  await createSession(context, DEV_UID)
  return json({ ok: true })
}

export const config: Config = { path: '/api/auth/dev', method: 'POST' }
