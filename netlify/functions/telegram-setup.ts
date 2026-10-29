import type { Config, Context } from '@netlify/functions'
import { safeEqual } from '../lib/crypto'
import { isProduction, secret } from '../lib/env'
import { json } from '../lib/http'
import { botApi } from '../lib/telegram'

// Points the bot's webhook at this deployment, so the secrets never have to leave Netlify. It can only
// register our own URL, but every call costs a Telegram API request, so the caller must know the webhook
// secret: `curl -X POST -H "Authorization: Bearer $TELEGRAM_WEBHOOK_SECRET" .../api/telegram/setup`.
export default async (req: Request, context: Context) => {
  if (!isProduction(context)) return json({ error: 'production only' }, 404)
  const bearer = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  if (!safeEqual(bearer, secret('TELEGRAM_WEBHOOK_SECRET'))) return json({ error: 'unauthorized' }, 401)
  const url = new URL('/api/telegram', req.url).href
  await botApi('setWebhook', {
    url,
    secret_token: secret('TELEGRAM_WEBHOOK_SECRET'),
    allowed_updates: ['message', 'callback_query'],
  })
  return json({ ok: true, webhook: url })
}

export const config: Config = { path: '/api/telegram/setup', method: 'POST' }
