import { secret } from './env'

export const BOT_USERNAME = 'ParkzettelBot'

export async function botApi(method: string, body: Record<string, unknown>): Promise<unknown> {
  // Local development: log instead of calling Telegram (set TELEGRAM_DRY_RUN=1 for netlify dev).
  if (Netlify.env.get('TELEGRAM_DRY_RUN') === '1') {
    console.log(`[telegram dry run] ${method}`, JSON.stringify(body))
    return { message_id: 1 }
  }
  // The URL carries the bot token, so a transport error is replaced before it can reach a log.
  const res = await fetch(`https://api.telegram.org/bot${secret('TELEGRAM_BOT_TOKEN')}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {
    throw new Error(`Telegram ${method} failed: network error`)
  })
  const data = (await res.json().catch(() => ({ ok: false, description: `HTTP ${res.status}` }))) as {
    ok: boolean
    description?: string
    result?: unknown
  }
  if (!data.ok) throw new Error(`Telegram ${method} failed: ${data.description}`)
  return data.result
}
