import type { Config, Context } from '@netlify/functions'
import { login } from '../lib/session'
import { verifyLogin } from '../lib/telegram'

// The Telegram Login Widget redirects here (data-auth-url) with the signed login data as query
// parameters. Only the numeric ID is kept; name, username and photo are discarded.
export default async (req: Request, context: Context) => {
  const uid = await verifyLogin(new URL(req.url).searchParams)
  if (!uid) return Response.redirect(new URL('/account?login=failed', req.url), 303)

  await login(context, uid)
  return new Response(null, { status: 303, headers: { location: '/account' } })
}

export const config: Config = { path: '/api/auth/telegram', method: 'GET' }
