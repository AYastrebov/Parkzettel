import { hmacHex, safeEqual, sha256 } from './crypto'
import { secret } from './env'

export const BOT_USERNAME = 'ParkzettelBot'

const MAX_LOGIN_AGE_S = 10 * 60

// Verifies data from the Telegram Login Widget: https://core.telegram.org/widgets/login#checking-authorization
// Returns the Telegram user ID, or null if the signature is wrong or the login is stale.
export async function verifyLogin(params: URLSearchParams, botToken = secret('TELEGRAM_BOT_TOKEN')): Promise<number | null> {
  const hash = params.get('hash')
  const id = params.get('id')
  const authDate = Number(params.get('auth_date'))
  if (!hash || !id || !/^\d{1,20}$/.test(id) || !authDate) return null
  if (Date.now() / 1000 - authDate > MAX_LOGIN_AGE_S) return null

  const checkString = [...params.entries()]
    .filter(([k]) => k !== 'hash')
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n')
  const expected = await hmacHex(await sha256(botToken), checkString)
  return safeEqual(hash, expected) ? Number(id) : null
}

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
