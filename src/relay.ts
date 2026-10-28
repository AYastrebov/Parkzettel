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
<div class="relay-status" role="status" hidden>
  <p class="status-main"></p>
  <blockquote class="status-quote" hidden></blockquote>
  <p class="status-sub"></p>
</div>
<form class="relay-form" novalidate>
  <p class="r-lead" data-i18n="r.lead"></p>
  <fieldset class="presets">
    <label><input type="radio" name="preset" value="blocking" checked /><span data-i18n="r.blocking"></span></label>
    <label><input type="radio" name="preset" value="lights" /><span data-i18n="r.lights"></span></label>
    <label><input type="radio" name="preset" value="other" /><span data-i18n="r.other"></span></label>
  </fieldset>
  <textarea name="text" rows="2" maxlength="140" data-i18n-ph="r.textPh"></textarea>
  <p class="error" role="alert" hidden></p>
  <button type="submit" class="big call">${icon('message', 28)}<span class="send-label" data-i18n="r.send"></span></button>
</form>
<a class="create" href="/" data-i18n="c.create"></a>`

const POLL_MS = 4000
const POLL_FOR_MS = 15 * 60 * 1000
const CLOCK_MS = 30 * 1000

interface Info {
  plate: string
  country?: string
  note?: string
  active: boolean
}

type ReplyKind = 'coming' | 'soon' | 'cant'

interface Status {
  main: Key | null // headline (an error, "sent", or a quick reply)
  quote?: string // the owner's own text
  sentAt?: number // when the last message went out; drives the "x min ago" line
}

export async function renderRelay(root: HTMLElement, id: string) {
  root.className = 'view-contact'
  root.innerHTML = TEMPLATE
  translate(root)
  const form = root.querySelector('form')!
  const statusEl = root.querySelector<HTMLElement>('.relay-status')!
  const errorEl = form.querySelector<HTMLElement>('.error')!
  const textarea = form.querySelector('textarea')!
  const button = form.querySelector('button')!
  const sendLabel = form.querySelector<HTMLElement>('.send-label')!

  let status: Status = { main: null }
  let formError: Key | null = null
  let sending = false
  const sent: string[] = [] // message ids from this visit, newest last

  function paint() {
    statusEl.hidden = !status.main
    statusEl.querySelector('.status-main')!.textContent = status.main ? t(status.main) : ''
    const quote = statusEl.querySelector<HTMLElement>('.status-quote')!
    quote.hidden = !status.quote
    quote.textContent = status.quote ?? ''
    let sub = ''
    if (status.sentAt) {
      const min = Math.floor((Date.now() - status.sentAt) / 60000)
      sub = `${min < 1 ? t('r.agoNow') : t('r.ago', { min: String(min) })} ${t('r.keepOpen')}`
    }
    statusEl.querySelector('.status-sub')!.textContent = sub
    errorEl.hidden = !formError
    errorEl.textContent = formError ? t(formError) : ''
    sendLabel.textContent = t(sending ? 'r.sending' : sent.length ? 'r.more' : 'r.send')
    button.disabled = sending
  }
  onLangChange(() => {
    translate(root)
    paint()
  })
  setInterval(paint, CLOCK_MS)

  const res = await fetch(`/api/s/${encodeURIComponent(id)}`).catch(() => null)
  if (!res?.ok) {
    root.querySelector('.plate')!.remove()
    root.querySelector('.check-plate')!.remove()
    form.remove()
    status = { main: 'r.missing' }
    paint()
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
    status = { main: 'r.off' }
    paint()
    return
  }

  // "Something else" only makes sense with text, so take the person straight to the box.
  form.addEventListener('change', (e) => {
    if ((e.target as HTMLInputElement).name !== 'preset') return
    const other = (e.target as HTMLInputElement).value === 'other'
    textarea.required = other
    if (other) textarea.focus()
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (sending) return
    const data = new FormData(form)
    const text = String(data.get('text') ?? '').trim()
    if (data.get('preset') === 'other' && !text) {
      formError = 'r.needText'
      paint()
      textarea.focus()
      return
    }
    formError = null
    sending = true
    paint()
    const r = await fetch(`/api/s/${encodeURIComponent(id)}/message`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ preset: data.get('preset'), text }),
    }).catch(() => null)
    sending = false
    if (!r?.ok) {
      const errors: Record<number, Key> = { 400: 'r.needText', 410: 'r.off', 429: 'r.limit' }
      formError = errors[r?.status ?? 0] ?? 'r.fail'
      paint()
      return
    }
    const { id: messageId } = (await r.json()) as { id: string }
    sent.push(messageId)
    textarea.value = ''
    status = { main: 'r.sent', sentAt: Date.now() }
    paint()
    statusEl.scrollIntoView({ block: 'nearest' })
    poll()
  })

  // Polls every message sent from this page and shows the owner's most recent answer. The owner may
  // change or add to their answer, so polling continues for a while after the first reply.
  let polling = false
  async function poll() {
    const until = Date.now() + POLL_FOR_MS
    if (polling) return
    polling = true
    while (Date.now() < until) {
      await new Promise((ok) => setTimeout(ok, POLL_MS))
      const replies = await Promise.all(
        sent.map(async (mid) => {
          const r = await fetch(`/api/m/${mid}`).catch(() => null)
          return r?.ok ? ((await r.json()) as { reply: ReplyKind | null; text: string | null; repliedAt: number | null }) : null
        }),
      )
      const latest = replies.filter((x) => x?.repliedAt).sort((a, b) => b!.repliedAt! - a!.repliedAt!)[0]
      if (latest) {
        status = latest.text
          ? { main: 'r.reply.text', quote: latest.text, sentAt: status.sentAt }
          : { main: `r.reply.${latest.reply!}`, sentAt: status.sentAt }
        paint()
      }
    }
    polling = false
  }
}
