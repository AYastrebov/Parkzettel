import type { Config, Context } from '@netlify/functions'
import { createSession } from '../lib/session'
import { store, type Owner } from '../lib/stores'
import { verifyLogin } from '../lib/telegram'

// The Telegram Login Widget redirects here (data-auth-url) with the signed login data as query
// parameters. Only the numeric ID is kept; name, username and photo are discarded.
export default async (req: Request, context: Context) => {
  const uid = await verifyLogin(new URL(req.url).searchParams)
  if (!uid) return Response.redirect(new URL('/account?login=failed', req.url), 303)

  const owners = store(context, 'owners')
  if (!(await owners.get(String(uid)))) {
    await owners.setJSON(String(uid), { created: Date.now(), stickers: [] } satisfies Owner)
  }
  await createSession(context, uid)
  return new Response(null, { status: 303, headers: { location: '/account' } })
}

export const config: Config = { path: '/api/auth/telegram', method: 'GET' }
