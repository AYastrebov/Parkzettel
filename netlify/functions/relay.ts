import type { Config, Context } from '@netlify/functions'
import { keyboard, ownerMessage } from '../lib/bot-text'
import { json, sameOrigin } from '../lib/http'
import { allow } from '../lib/ratelimit'
import { MESSAGE_TTL_MS, store, telegramRefKey, type Message, type Owner, type Preset, type Sticker, type TelegramRef } from '../lib/stores'
import { botApi } from '../lib/telegram'
import { cleanText, MESSAGE_ID_RE, randomId, STICKER_ID_RE } from '../lib/validate'

const PRESETS: Preset[] = ['blocking', 'lights', 'other']

// Scanner API, no login:
//   GET  /api/s/:id          public sticker data (never the owner's Telegram ID)
//   POST /api/s/:id/message  send the owner a message through the bot
//   GET  /api/m/:id          the owner's reply to a message, if any
export default async (req: Request, context: Context) => {
  const { id, mid } = context.params

  if (mid) {
    if (!MESSAGE_ID_RE.test(mid)) return json({ error: 'not found' }, 404)
    const m = (await store(context, 'messages').get(mid, { type: 'json' })) as Message | null
    if (!m || Date.now() - m.created > MESSAGE_TTL_MS) return json({ error: 'not found' }, 404)
    return json({ reply: m.reply ?? null, text: m.text ?? null, repliedAt: m.repliedAt ?? null })
  }

  if (!id || !STICKER_ID_RE.test(id)) return json({ error: 'not found' }, 404)
  const sticker = (await store(context, 'stickers').get(id, { type: 'json' })) as Sticker | null
  if (!sticker) return json({ error: 'not found' }, 404)

  if (req.method === 'GET') {
    return json({ plate: sticker.plate, country: sticker.country, note: sticker.note, active: sticker.active })
  }

  if (!new URL(req.url).pathname.endsWith('/message')) return json({ error: 'not found' }, 404)
  if (!sameOrigin(req)) return json({ error: 'forbidden' }, 403)
  if (!sticker.active) return json({ error: 'off' }, 410)
  const body = (await req.json().catch(() => ({}))) as { preset?: string; text?: unknown }
  const preset = PRESETS.find((p) => p === body.preset)
  const text = cleanText(body.text, 140)
  if (!preset || (preset === 'other' && !text)) return json({ error: 'bad request' }, 400)

  // Per scanner and sticker, and per sticker overall, so one person can't flood the owner.
  if (!(await allow(context, `${context.ip}|${id}`, 3)) || !(await allow(context, `sticker|${id}`, 20))) {
    return json({ error: 'limit' }, 429)
  }

  const owner = (await store(context, 'owners').get(String(sticker.owner), { type: 'json' })) as Owner | null
  // Stored before sending, so a reply tapped right away always finds its message.
  const messageId = randomId(16)
  const messages = store(context, 'messages')
  await messages.setJSON(messageId, { sticker: id, preset, created: Date.now() } satisfies Message)
  const sent = (await botApi('sendMessage', {
    chat_id: sticker.owner,
    text: ownerMessage(owner?.lang, sticker.plate, preset, text),
    reply_markup: keyboard(owner?.lang, messageId, id, true),
    link_preview_options: { is_disabled: true }, // a scanner's URL must not unfurl in the owner's chat
  }).catch((e) => (console.error(e), null))) as { message_id: number } | null
  if (!sent) {
    await messages.delete(messageId)
    return json({ error: 'undeliverable' }, 502)
  }
  // Remembered so a Telegram reply to this message can be routed back to the scanner.
  await messages.setJSON(telegramRefKey(sticker.owner, sent.message_id), { id: messageId, created: Date.now() } satisfies TelegramRef)
  return json({ id: messageId }, 201)
}

export const config: Config = {
  path: ['/api/s/:id', '/api/s/:id/message', '/api/m/:mid'],
  method: ['GET', 'POST'],
}
