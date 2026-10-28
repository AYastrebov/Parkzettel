import type { Config, Context } from '@netlify/functions'
import { botText } from '../lib/bot-text'
import { safeEqual } from '../lib/crypto'
import { secret } from '../lib/env'
import { MESSAGE_TTL_MS, store, type Message, type Owner, type Reply, type Sticker } from '../lib/stores'
import { botApi } from '../lib/telegram'
import { MESSAGE_ID_RE } from '../lib/validate'

const WELCOME: Record<string, string> = {
  de: 'Hallo! Ich bin der Parkzettel-Bot. Über mich können Personen, die Sie zugeparkt haben, Sie erreichen, ohne Ihre Telefonnummer zu sehen.\n\nIhre Relay-Aufkleber verwalten Sie hier: {url}',
  it: "Ciao! Sono il bot di Parkzettel. Tramite me ti può contattare chi hai bloccato, senza vedere il tuo numero di telefono.\n\nGestisci i tuoi adesivi relay qui: {url}",
  en: "Hi! I'm the Parkzettel bot. People you have blocked in can reach you through me without seeing your phone number.\n\nManage your relay stickers here: {url}",
}

const REPLIES: Reply[] = ['coming', 'soon', 'cant']

interface Update {
  message?: { chat: { id: number; type: string }; text?: string; from?: { language_code?: string } }
  callback_query?: { id: string; from: { id: number }; data?: string; message?: { chat: { id: number }; message_id: number; text?: string; reply_markup?: unknown } }
}

// Owner tapped a reply button under a scanner's message ("r|<messageId>|<reply>").
async function onReply(context: Context, q: NonNullable<Update['callback_query']>) {
  const [, messageId, reply] = q.data?.split('|') ?? []
  const choice = REPLIES.find((r) => r === reply)
  const messages = store(context, 'messages')
  const m = MESSAGE_ID_RE.test(messageId ?? '') ? ((await messages.get(messageId, { type: 'json' })) as Message | null) : null
  const sticker = m ? ((await store(context, 'stickers').get(m.sticker, { type: 'json' })) as Sticker | null) : null
  const owner = (await store(context, 'owners').get(String(q.from.id), { type: 'json' })) as Owner | null
  const t = botText(owner?.lang)

  // Only the sticker's owner may answer, and only while the message is fresh and the sticker is on.
  if (!choice || !m || !sticker || sticker.owner !== q.from.id || !sticker.active || Date.now() - m.created > MESSAGE_TTL_MS) {
    await botApi('answerCallbackQuery', { callback_query_id: q.id, text: t.off, show_alert: true })
    return
  }
  m.reply = choice
  await messages.setJSON(messageId, m)
  const confirmation = t.replied.replace('{reply}', t.reply[choice])
  await botApi('answerCallbackQuery', { callback_query_id: q.id, text: confirmation })
  if (q.message?.text) {
    // Show the chosen answer under the original text; the buttons stay so the owner can change it.
    const base = q.message.text.split('\n\n✅ ')[0]
    await botApi('editMessageText', {
      chat_id: q.message.chat.id,
      message_id: q.message.message_id,
      text: `${base}\n\n✅ ${confirmation}`,
      reply_markup: q.message.reply_markup,
    }).catch(() => {}) // "message is not modified" when the same button is tapped twice
  }
}

// Telegram webhook. Telegram sends the secret registered with setWebhook in a header, which is
// how we know the request really comes from Telegram.
export default async (req: Request, context: Context) => {
  const token = req.headers.get('x-telegram-bot-api-secret-token') ?? ''
  if (!safeEqual(token, secret('TELEGRAM_WEBHOOK_SECRET'))) return new Response('Forbidden', { status: 403 })

  const update = (await req.json().catch(() => ({}))) as Update
  try {
    const msg = update.message
    if (msg?.chat.type === 'private' && msg.text?.startsWith('/start')) {
      const lang = msg.from?.language_code?.slice(0, 2) ?? 'en'
      const text = (WELCOME[lang] ?? WELCOME.en).replace('{url}', new URL('/account', req.url).href)
      await botApi('sendMessage', { chat_id: msg.chat.id, text, link_preview_options: { is_disabled: true } })
    }
    if (update.callback_query) await onReply(context, update.callback_query)
  } catch (e) {
    console.error(e)
  }
  // Always 200: anything else makes Telegram retry the same update.
  return new Response('ok')
}

export const config: Config = { path: '/api/telegram', method: 'POST' }
