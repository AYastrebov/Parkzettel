import type { Config, Context } from '@netlify/functions'
import { botText, keyboard } from '../lib/bot-text'
import { safeEqual } from '../lib/crypto'
import { secret } from '../lib/env'
import {
  MESSAGE_TTL_MS,
  store,
  telegramRefKey,
  type Message,
  type Owner,
  type Reply,
  type Sticker,
  type TelegramRef,
} from '../lib/stores'
import { botApi } from '../lib/telegram'
import { cleanText, MESSAGE_ID_RE, STICKER_ID_RE } from '../lib/validate'

const WELCOME: Record<string, string> = {
  de: 'Hallo! Ich bin der Parkzettel-Bot. Über mich können Personen, die Sie zugeparkt haben, Sie erreichen, ohne Ihre Telefonnummer zu sehen.\n\nIhre Relay-Aufkleber verwalten Sie hier: {url}',
  it: "Ciao! Sono il bot di Parkzettel. Tramite me ti può contattare chi hai bloccato, senza vedere il tuo numero di telefono.\n\nGestisci i tuoi adesivi relay qui: {url}",
  en: "Hi! I'm the Parkzettel bot. People you have blocked in can reach you through me without seeing your phone number.\n\nManage your relay stickers here: {url}",
}

const REPLIES: Reply[] = ['coming', 'soon', 'cant']

interface TgMessage {
  message_id: number
  chat: { id: number; type: string }
  text?: string
  from?: { id: number; language_code?: string }
  reply_to_message?: { message_id: number }
}

interface Update {
  message?: TgMessage
  callback_query?: { id: string; from: { id: number }; data?: string; message?: TgMessage }
}

// Loads a scanner message and checks that `uid` owns the sticker it belongs to and may still answer it.
async function loadAnswerable(context: Context, messageId: string, uid: number) {
  const messages = store(context, 'messages')
  const m = MESSAGE_ID_RE.test(messageId) ? ((await messages.get(messageId, { type: 'json' })) as Message | null) : null
  const sticker = m ? ((await store(context, 'stickers').get(m.sticker, { type: 'json' })) as Sticker | null) : null
  const ok = m && sticker && sticker.owner === uid && sticker.active && Date.now() - m.created <= MESSAGE_TTL_MS
  return ok ? { messages, m, sticker } : null
}

// Shows the chosen answer under the original text; the buttons stay so the owner can change it.
async function annotate(msg: TgMessage | undefined, line: string, replyMarkup: unknown) {
  if (!msg?.text) return
  const base = msg.text.split('\n\n✅ ')[0]
  await botApi('editMessageText', {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    text: `${base}\n\n✅ ${line}`,
    reply_markup: replyMarkup,
  }).catch(() => {}) // "message is not modified" when the same button is tapped twice
}

async function onCallback(context: Context, q: NonNullable<Update['callback_query']>) {
  const [kind, messageId = '', a = '', b = ''] = q.data?.split('|') ?? []
  const owner = (await store(context, 'owners').get(String(q.from.id), { type: 'json' })) as Owner | null
  const t = botText(owner?.lang)
  const alert = (text: string) => botApi('answerCallbackQuery', { callback_query_id: q.id, text, show_alert: true })

  // "r|<messageId>|<reply>": a quick reply.
  if (kind === 'r') {
    const choice = REPLIES.find((r) => r === a)
    const found = choice && (await loadAnswerable(context, messageId, q.from.id))
    if (!choice || !found) return alert(t.off)
    found.m.reply = choice
    found.m.repliedAt = Date.now()
    await found.messages.setJSON(messageId, found.m)
    const confirmation = t.replied.replace('{reply}', t.reply[choice])
    await botApi('answerCallbackQuery', { callback_query_id: q.id, text: confirmation })
    await annotate(q.message, confirmation, keyboard(owner?.lang, messageId, found.m.sticker, true))
    return
  }

  // "s|<messageId>|<stickerId>|on|off": switch the sticker from inside Telegram.
  if (kind === 's') {
    const stickers = store(context, 'stickers')
    const sticker = STICKER_ID_RE.test(a) ? ((await stickers.get(a, { type: 'json' })) as Sticker | null) : null
    if (!sticker || sticker.owner !== q.from.id || (b !== 'on' && b !== 'off')) return alert(t.off)
    sticker.active = b === 'on'
    await stickers.setJSON(a, sticker)
    await botApi('answerCallbackQuery', { callback_query_id: q.id, text: sticker.active ? t.switchedOn : t.switchedOff })
    if (q.message) {
      await botApi('editMessageReplyMarkup', {
        chat_id: q.message.chat.id,
        message_id: q.message.message_id,
        reply_markup: keyboard(owner?.lang, messageId, a, sticker.active),
      }).catch(() => {})
    }
    return
  }
  await botApi('answerCallbackQuery', { callback_query_id: q.id })
}

// The owner used Telegram's "Reply" on one of the bot's messages: forward the text to the scanner.
async function onTextReply(context: Context, msg: TgMessage) {
  const messages = store(context, 'messages')
  const ref = (await messages.get(telegramRefKey(msg.chat.id, msg.reply_to_message!.message_id), { type: 'json' })) as TelegramRef | null
  const owner = (await store(context, 'owners').get(String(msg.chat.id), { type: 'json' })) as Owner | null
  const t = botText(owner?.lang)
  const text = cleanText(msg.text, 200)
  const found = ref && text ? await loadAnswerable(context, ref.id, msg.chat.id) : null
  if (!ref || !found) {
    await botApi('sendMessage', { chat_id: msg.chat.id, text: t.off })
    return
  }
  found.m.text = text
  found.m.repliedAt = Date.now()
  await found.messages.setJSON(ref.id, found.m)
  await botApi('sendMessage', { chat_id: msg.chat.id, text: t.textSent, reply_parameters: { message_id: msg.message_id } })
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
    } else if (msg?.chat.type === 'private' && msg.reply_to_message && msg.text) {
      await onTextReply(context, msg)
    }
    if (update.callback_query) await onCallback(context, update.callback_query)
  } catch (e) {
    console.error(e)
  }
  // Always 200: anything else makes Telegram retry the same update.
  return new Response('ok')
}

export const config: Config = { path: '/api/telegram', method: 'POST' }
