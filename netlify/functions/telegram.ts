import type { Config, Context } from '@netlify/functions'
import { safeEqual } from '../lib/crypto'
import { secret } from '../lib/env'
import { botApi } from '../lib/telegram'

const WELCOME: Record<string, string> = {
  de: 'Hallo! Ich bin der Parkzettel-Bot. Über mich können Personen, die Sie zugeparkt haben, Sie erreichen, ohne Ihre Telefonnummer zu sehen.\n\nIhre Relay-Aufkleber verwalten Sie hier: {url}',
  it: "Ciao! Sono il bot di Parkzettel. Tramite me ti può contattare chi hai bloccato, senza vedere il tuo numero di telefono.\n\nGestisci i tuoi adesivi relay qui: {url}",
  en: "Hi! I'm the Parkzettel bot. People you have blocked in can reach you through me without seeing your phone number.\n\nManage your relay stickers here: {url}",
}

interface Update {
  message?: { chat: { id: number; type: string }; text?: string; from?: { language_code?: string } }
}

// Telegram webhook. Telegram sends the secret registered with setWebhook in a header, which is
// how we know the request really comes from Telegram.
export default async (req: Request, _context: Context) => {
  const token = req.headers.get('x-telegram-bot-api-secret-token') ?? ''
  if (!safeEqual(token, secret('TELEGRAM_WEBHOOK_SECRET'))) return new Response('Forbidden', { status: 403 })

  const update = (await req.json().catch(() => ({}))) as Update
  const msg = update.message
  if (msg?.chat.type === 'private' && msg.text?.startsWith('/start')) {
    const lang = msg.from?.language_code?.slice(0, 2) ?? 'en'
    const text = (WELCOME[lang] ?? WELCOME.en).replace('{url}', new URL('/account', req.url).href)
    await botApi('sendMessage', { chat_id: msg.chat.id, text, link_preview_options: { is_disabled: true } }).catch((e) =>
      console.error(e),
    )
  }
  // Always 200: anything else makes Telegram retry the same update.
  return new Response('ok')
}

export const config: Config = { path: '/api/telegram', method: 'POST' }
