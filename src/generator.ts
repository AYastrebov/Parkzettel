import { PHONE_RE, seal, TELEGRAM_RE, type Contact } from './codec'
import { onLangChange, t, translate, type Key } from './i18n'
import type { IconName } from './icons'
import { stickerSvg, svgToPngBlob } from './sticker'

const TEMPLATE = `
<section class="intro">
  <h1 data-i18n="gen.title"></h1>
  <p class="lead" data-i18n="gen.lead"></p>
</section>
<div class="gen-grid">
  <form class="card form" novalidate>
    <label class="field">
      <span data-i18n="f.plate"></span>
      <input name="plate" class="plate-input" autocomplete="off" autocapitalize="characters" maxlength="16" placeholder="M-AB 1234" required />
    </label>
    <label class="field">
      <span data-i18n="f.phone"></span>
      <input name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="24" placeholder="+49 170 1234567" />
      <small data-i18n="f.phoneHint"></small>
    </label>
    <fieldset class="field">
      <legend data-i18n="f.channels"></legend>
      <label class="check"><input type="checkbox" name="call" checked /><span data-i18n="f.call"></span></label>
      <label class="check"><input type="checkbox" name="wa" checked /><span data-i18n="f.wa"></span></label>
      <input name="waPhone" type="tel" inputmode="tel" maxlength="24" class="sub-input" data-i18n-ph="f.waOther" />
    </fieldset>
    <label class="field">
      <span data-i18n="f.tg"></span>
      <div class="prefixed"><span>@</span><input name="telegram" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="33" /></div>
    </label>
    <label class="field">
      <span data-i18n="f.note"></span>
      <textarea name="note" rows="2" maxlength="100" data-i18n-ph="f.notePh"></textarea>
    </label>
    <p class="error" role="alert" hidden></p>
  </form>
  <aside class="card preview">
    <h2 data-i18n="p.title"></h2>
    <div class="sticker" aria-live="polite"><p class="empty" data-i18n="p.empty"></p></div>
    <div class="actions">
      <button type="button" class="btn primary" data-act="png" disabled data-i18n="p.png"></button>
      <button type="button" class="btn" data-act="svg" disabled data-i18n="p.svg"></button>
      <button type="button" class="btn" data-act="copy" disabled data-i18n="p.copy"></button>
      <a class="btn" data-act="test" target="_blank" rel="noopener" aria-disabled="true" data-i18n="p.test"></a>
    </div>
  </aside>
</div>
<section class="info">
  <div>
    <h2 data-i18n="how.title"></h2>
    <ol class="steps"><li data-i18n="how.1"></li><li data-i18n="how.2"></li><li data-i18n="how.3"></li></ol>
  </div>
  <div>
    <h2 data-i18n="priv.title"></h2>
    <p data-i18n="priv.body"></p>
  </div>
</section>`

// Returns E.164 ('+491701234567'), '' for empty input, or null when invalid.
function normalizePhone(input: string): string | null {
  let s = input.replace(/[\s().\/-]/g, '')
  if (!s) return ''
  if (s.startsWith('00')) s = '+' + s.slice(2)
  return PHONE_RE.test(s) ? s : null
}

function normalizeTelegram(input: string): string | null {
  const s = input.trim().replace(/^@/, '').replace(/^(https?:\/\/)?t\.me\//i, '')
  if (!s) return ''
  return TELEGRAM_RE.test(s) ? s : null
}

type Result = { ok: true; contact: Contact } | { ok: false; error: Key | null }

function readForm(form: HTMLFormElement): Result {
  const v = (n: string) => (form.elements.namedItem(n) as HTMLInputElement).value
  const checked = (n: string) => (form.elements.namedItem(n) as HTMLInputElement).checked
  const plate = v('plate').trim().toUpperCase().replace(/\s+/g, ' ')
  const phone = normalizePhone(v('phone'))
  const waPhone = normalizePhone(v('waPhone'))
  const telegram = normalizeTelegram(v('telegram'))
  const note = v('note').trim()

  const untouched = !plate && !v('phone') && !v('telegram')
  if (untouched) return { ok: false, error: null }
  if (!plate) return { ok: false, error: 'err.plate' }
  if (phone === null || waPhone === null) return { ok: false, error: 'err.phone' }
  if (telegram === null) return { ok: false, error: 'err.tg' }

  const call = checked('call') && phone ? phone : undefined
  const whatsapp = checked('wa') ? waPhone || phone || undefined : undefined
  if ((checked('call') || (checked('wa') && !waPhone)) && !phone) return { ok: false, error: 'err.phone' }
  if (!call && !whatsapp && !telegram) return { ok: false, error: 'err.channel' }
  return { ok: true, contact: { plate, call, whatsapp, telegram: telegram || undefined, note: note || undefined } }
}

function download(blob: Blob, name: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export function renderGenerator(root: HTMLElement) {
  root.innerHTML = TEMPLATE
  root.className = 'view-gen'
  translate(root)

  const form = root.querySelector('form')!
  const errorEl = root.querySelector<HTMLElement>('.error')!
  const stickerEl = root.querySelector<HTMLElement>('.sticker')!
  const waPhoneEl = form.elements.namedItem('waPhone') as HTMLInputElement
  const btn = (act: string) => root.querySelector<HTMLButtonElement>(`[data-act="${act}"]`)!
  const testLink = root.querySelector<HTMLAnchorElement>('[data-act="test"]')!

  let current: { url: string; svg: string; plate: string } | null = null
  let error: Key | null = null
  let seq = 0

  const setReady = (ready: boolean) => {
    for (const a of ['png', 'svg', 'copy']) btn(a).disabled = !ready
    testLink.setAttribute('aria-disabled', String(!ready))
    if (ready && current) testLink.href = current.url
    else testLink.removeAttribute('href')
  }

  const showError = () => {
    errorEl.hidden = !error
    errorEl.textContent = error ? t(error) : ''
  }

  async function update() {
    const mine = ++seq
    const res = readForm(form)
    waPhoneEl.hidden = !(form.elements.namedItem('wa') as HTMLInputElement).checked
    error = res.ok ? null : res.error
    showError()
    if (!res.ok) {
      current = null
      stickerEl.innerHTML = `<p class="empty">${t('p.empty')}</p>`
      setReady(false)
      return
    }
    const token = await seal(res.contact)
    const url = new URL('#' + token, location.href.split('#')[0]).href
    const channels: IconName[] = []
    if (res.contact.call) channels.push('call')
    if (res.contact.whatsapp) channels.push('whatsapp')
    if (res.contact.telegram) channels.push('telegram')
    const svg = await stickerSvg(url, { title: t('s.title'), sub: t('s.sub') }, channels)
    if (mine !== seq) return // a newer edit superseded this one
    current = { url, svg, plate: res.contact.plate }
    stickerEl.innerHTML = svg
    setReady(true)
  }

  // The '@' is already shown as a prefix; drop it when typed or pasted.
  const tgEl = form.elements.namedItem('telegram') as HTMLInputElement
  tgEl.addEventListener('input', () => {
    if (tgEl.value.startsWith('@')) tgEl.value = tgEl.value.slice(1)
  })

  let timer = 0
  form.addEventListener('input', () => {
    clearTimeout(timer)
    timer = window.setTimeout(update, 200)
  })
  form.addEventListener('submit', (e) => e.preventDefault())
  onLangChange(() => {
    translate(root)
    update()
  })

  const fileBase = () => 'parkzettel-' + (current?.plate ?? 'sticker').replace(/[^A-Z0-9]+/gi, '-')
  btn('svg').addEventListener('click', () => {
    if (current) download(new Blob([current.svg], { type: 'image/svg+xml' }), fileBase() + '.svg')
  })
  btn('png').addEventListener('click', async () => {
    if (current) download(await svgToPngBlob(current.svg), fileBase() + '.png')
  })
  btn('copy').addEventListener('click', async () => {
    if (!current) return
    await navigator.clipboard.writeText(current.url)
    btn('copy').textContent = t('p.copied')
    setTimeout(() => (btn('copy').textContent = t('p.copy')), 1500)
  })

  update()
}
