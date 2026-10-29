import type { Config, Context } from '@netlify/functions'
import { json, sameOrigin } from '../lib/http'
import { readSession } from '../lib/session'
import { MAX_STICKERS, store, type Lang, type Sticker } from '../lib/stores'
import { botApi } from '../lib/telegram'
import { cleanCountry, cleanPlate, cleanText, randomId, STICKER_ID_RE } from '../lib/validate'

const LANGS = ['de', 'en', 'it']
const CONFIRM: Record<Lang, string> = {
  en: 'Your relay sticker {plate} is ready. Messages from people who scan it will arrive here.',
  de: 'Ihr Relay-Aufkleber {plate} ist bereit. Nachrichten von Personen, die ihn scannen, kommen hier an.',
  it: "Il tuo adesivo relay {plate} è pronto. I messaggi di chi lo scansiona arriveranno qui.",
}

const view = (id: string, s: Sticker) => ({ id, plate: s.plate, country: s.country, note: s.note, active: s.active })

// Owner API. GET /api/stickers lists the owner's stickers; POST /api/stickers creates one;
// POST /api/stickers/:id with {action: 'update' | 'delete'} changes one.
export default async (req: Request, context: Context) => {
  const session = await readSession(context)
  if (!session) return json({ error: 'unauthorized' }, 401)
  const { uid, owner } = session
  const owners = store(context, 'owners')
  const stickers = store(context, 'stickers')

  if (req.method === 'GET') {
    const list = await Promise.all(
      owner.stickers.map(async (id) => {
        const s = (await stickers.get(id, { type: 'json' })) as Sticker | null
        return s ? view(id, s) : null
      }),
    )
    return json({ stickers: list.filter(Boolean) })
  }

  if (!sameOrigin(req)) return json({ error: 'forbidden' }, 403)
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  if (typeof body.lang === 'string' && LANGS.includes(body.lang)) owner.lang = body.lang as Lang
  const id = context.params.id

  if (!id) {
    const plate = cleanPlate(body.plate)
    if (!plate) return json({ error: 'plate' }, 400)
    if (owner.stickers.length >= MAX_STICKERS) return json({ error: 'limit' }, 409)
    // Confirms the bot can actually reach the owner before anything gets printed.
    const ok = await botApi('sendMessage', {
      chat_id: uid,
      text: CONFIRM[owner.lang ?? 'en'].replace('{plate}', plate),
    }).then(
      () => true,
      () => false,
    )
    if (!ok) return json({ error: 'undeliverable' }, 409)

    const newId = randomId(8)
    const sticker: Sticker = {
      owner: uid,
      plate,
      country: cleanCountry(body.country),
      note: cleanText(body.note, 100),
      active: true,
      created: Date.now(),
    }
    await stickers.setJSON(newId, sticker)
    owner.stickers.push(newId)
    await owners.setJSON(String(uid), owner)
    return json({ sticker: view(newId, sticker) }, 201)
  }

  if (!STICKER_ID_RE.test(id) || !owner.stickers.includes(id)) return json({ error: 'not found' }, 404)
  const sticker = (await stickers.get(id, { type: 'json' })) as Sticker | null
  if (!sticker) return json({ error: 'not found' }, 404)

  if (body.action === 'delete') {
    await stickers.delete(id)
    owner.stickers = owner.stickers.filter((s) => s !== id)
    await owners.setJSON(String(uid), owner)
    return json({ ok: true })
  }
  if (body.action === 'update') {
    if ('plate' in body) {
      const plate = cleanPlate(body.plate)
      if (!plate) return json({ error: 'plate' }, 400)
      sticker.plate = plate
    }
    if ('country' in body) sticker.country = cleanCountry(body.country)
    if ('note' in body) sticker.note = cleanText(body.note, 100)
    if (typeof body.active === 'boolean') sticker.active = body.active
    await stickers.setJSON(id, sticker)
    await owners.setJSON(String(uid), owner)
    return json({ sticker: view(id, sticker) })
  }
  return json({ error: 'bad request' }, 400)
}

export const config: Config = { path: ['/api/stickers', '/api/stickers/:id'], method: ['GET', 'POST'] }
