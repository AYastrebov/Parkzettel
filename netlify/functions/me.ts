import type { Config, Context } from '@netlify/functions'
import { json, sameOrigin } from '../lib/http'
import { logout, readSession } from '../lib/session'
import { store } from '../lib/stores'

// GET: who is logged in. POST {action: 'logout' | 'delete'}: end the session, or delete the account.
export default async (req: Request, context: Context) => {
  const session = await readSession(context)

  if (req.method === 'GET') {
    return json(session ? { loggedIn: true, stickers: session.owner.stickers.length } : { loggedIn: false })
  }

  if (!sameOrigin(req)) return json({ error: 'forbidden' }, 403)
  const { action } = (await req.json().catch(() => ({}))) as { action?: string }
  if (action === 'delete' && session) {
    // Deleting the account also deletes its stickers; their QR codes then show "not found".
    const stickers = store(context, 'stickers')
    await Promise.all(session.owner.stickers.map((id) => stickers.delete(id)))
    await store(context, 'owners').delete(String(session.uid))
  }
  if (action === 'logout' || action === 'delete') {
    await logout(context, action === 'logout' ? session : null)
    return json({ ok: true })
  }
  return json({ error: 'bad request' }, 400)
}

export const config: Config = { path: '/api/me', method: ['GET', 'POST'] }
