import { onLangChange, t, translate, type Key } from './i18n'
import { icon } from './icons'
import { EU_STARS_SVG } from './plate'

// Scanner page for relay stickers (/s/<id>). The owner's contact details never reach this page:
// messages go through /api/s/<id>/message and the owner answers via Telegram.

const TEMPLATE = `
<h1 class="plate">
  <span class="visually-hidden" data-i18n="c.eyebrow"></span>
  <span class="plate-eu" aria-hidden="true">${EU_STARS_SVG}<span class="plate-country"></span></span>
  <span class="plate-num"></span>
</h1>
<p class="note" hidden></p>
<p class="check-plate" data-i18n="c.check"></p>
<form class="relay-form" novalidate>
  <p class="r-lead" data-i18n="r.lead"></p>
  <fieldset class="presets">
    <label><input type="radio" name="preset" value="blocking" checked /><span data-i18n="r.blocking"></span></label>
    <label><input type="radio" name="preset" value="lights" /><span data-i18n="r.lights"></span></label>
    <label><input type="radio" name="preset" value="other" /><span data-i18n="r.other"></span></label>
  </fieldset>
  <textarea name="text" rows="2" maxlength="140" data-i18n-ph="r.textPh"></textarea>
  <button type="submit" class="big call">${icon('message', 28)}<span data-i18n="r.send"></span></button>
</form>
<div class="relay-status" role="status" hidden>
  <p class="status-main"></p>
  <p class="status-sub"></p>
</div>
<a class="create" href="/" data-i18n="c.create"></a>`

const POLL_MS = 4000
const POLL_FOR_MS = 15 * 60 * 1000

interface Info {
  plate: string
  country?: string
  note?: string
  active: boolean
}

export async function renderRelay(root: HTMLElement, id: string) {
  root.className = 'view-contact'
  root.innerHTML = TEMPLATE
  translate(root)
  const form = root.querySelector('form')!
  const status = root.querySelector<HTMLElement>('.relay-status')!
  let main: Key | null = null
  let sub: Key | null = null

  const show = (m: Key | null, s: Key | null = null) => {
    main = m
    sub = s
    status.hidden = !m
    status.querySelector('.status-main')!.textContent = m ? t(m) : ''
    status.querySelector('.status-sub')!.textContent = s ? t(s) : ''
  }
  onLangChange(() => {
    translate(root)
    show(main, sub)
  })

  const res = await fetch(`/api/s/${encodeURIComponent(id)}`).catch(() => null)
  if (!res?.ok) {
    root.querySelector('.plate')!.remove()
    root.querySelector('.check-plate')!.remove()
    form.remove()
    show('r.missing')
    return
  }
  const info = (await res.json()) as Info
  root.querySelector('.plate-num')!.textContent = info.plate
  root.querySelector('.plate-country')!.textContent = info.country ?? ''
  document.title = `${info.plate} · Parkzettel`
  const note = root.querySelector<HTMLElement>('.note')!
  note.hidden = !info.note
  note.textContent = info.note ?? ''
  if (!info.active) {
    form.remove()
    show('r.off')
    return
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const data = new FormData(form)
    const button = form.querySelector('button')!
    button.disabled = true
    const r = await fetch(`/api/s/${encodeURIComponent(id)}/message`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ preset: data.get('preset'), text: data.get('text') }),
    }).catch(() => null)
    button.disabled = false
    if (!r?.ok) {
      const errors: Record<number, Key> = { 400: 'r.needText', 410: 'r.off', 429: 'r.limit' }
      show(errors[r?.status ?? 0] ?? 'r.fail')
      return
    }
    const { id: messageId } = (await r.json()) as { id: string }
    form.remove()
    show('r.sent', 'r.waiting')
    poll(messageId)
  })

  // The owner may change their answer, so keep polling for a while after the first reply.
  async function poll(messageId: string) {
    const until = Date.now() + POLL_FOR_MS
    while (Date.now() < until) {
      await new Promise((ok) => setTimeout(ok, POLL_MS))
      const r = await fetch(`/api/m/${messageId}`).catch(() => null)
      if (!r?.ok) continue
      const { reply } = (await r.json()) as { reply: 'coming' | 'soon' | 'cant' | null }
      if (reply) show(`r.reply.${reply}`, 'r.sent')
    }
  }
}
