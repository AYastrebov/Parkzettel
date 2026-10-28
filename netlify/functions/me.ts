import type { Config, Context } from '@netlify/functions'
import { json, sameOrigin } from '../lib/http'
import { clearSession, readSession } from '../lib/session'
import { store, type Owner } from '../lib/stores'

// GET: who is logged in. POST {action: 'logout' | 'delete'}: end the session, or delete the account.
export default async (req: Request, context: Context) => {
  const uid = await readSession(context)
  const owners = store(context, 'owners')
  const owner = uid ? ((await owners.get(String(uid), { type: 'json' })) as Owner | null) : null

  if (req.method === 'GET') {
    return json(owner ? { loggedIn: true, stickers: owner.stickers.length } : { loggedIn: false })
  }

  if (!sameOrigin(req)) return json({ error: 'forbidden' }, 403)
  const { action } = (await req.json().catch(() => ({}))) as { action?: string }
  if (action === 'delete' && uid) await owners.delete(String(uid))
  if (action === 'logout' || action === 'delete') {
    clearSession(context)
    return json({ ok: true })
  }
  return json({ error: 'bad request' }, 400)
}

export const config: Config = { path: '/api/me', method: ['GET', 'POST'] }
