import type { Config, Context } from '@netlify/functions'
import { botText, ownerMessage } from '../lib/bot-text'
import { json, sameOrigin } from '../lib/http'
import { allow } from '../lib/ratelimit'
import { MESSAGE_TTL_MS, store, type Message, type Owner, type Preset, type Sticker } from '../lib/stores'
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
    return json({ reply: m.reply ?? null })
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
  const t = botText(owner?.lang)
  // Stored before sending, so a reply tapped right away always finds its message.
  const messageId = randomId(16)
  const messages = store(context, 'messages')
  await messages.setJSON(messageId, { sticker: id, preset, created: Date.now() } satisfies Message)
  const sent = await botApi('sendMessage', {
    chat_id: sticker.owner,
    text: ownerMessage(owner?.lang, sticker.plate, preset, text),
    reply_markup: {
      inline_keyboard: [
        [
          { text: t.reply.coming, callback_data: `r|${messageId}|coming` },
          { text: t.reply.soon, callback_data: `r|${messageId}|soon` },
        ],
        [{ text: t.reply.cant, callback_data: `r|${messageId}|cant` }],
      ],
    },
  }).then(
    () => true,
    (e) => (console.error(e), false),
  )
  if (!sent) {
    await messages.delete(messageId)
    return json({ error: 'undeliverable' }, 502)
  }
  return json({ id: messageId }, 201)
}

export const config: Config = {
  path: ['/api/s/:id', '/api/s/:id/message', '/api/m/:mid'],
  method: ['GET', 'POST'],
}
