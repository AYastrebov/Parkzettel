import type { Config, Context } from '@netlify/functions'
import { isProduction, secret } from '../lib/env'
import { json } from '../lib/http'
import { botApi } from '../lib/telegram'

// Points the bot's webhook at this deployment, so the secrets never have to leave Netlify.
// Safe to call by anyone: it can only ever register our own URL with our own secret.
export default async (req: Request, context: Context) => {
  if (!isProduction(context)) return json({ error: 'production only' }, 404)
  const url = new URL('/api/telegram', req.url).href
  await botApi('setWebhook', {
    url,
    secret_token: secret('TELEGRAM_WEBHOOK_SECRET'),
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true,
  })
  return json({ ok: true, webhook: url })
}

export const config: Config = { path: '/api/telegram/setup', method: 'POST' }
