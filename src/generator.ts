import { PHONE_RE, seal, TELEGRAM_RE, type Contact } from './codec'
import { lang, onLangChange, t, translate, type Key } from './i18n'
import { COUNTRIES, EU_STARS_SVG } from './plate'
import { canShareFiles, printSticker, shareSticker } from './share'
import { stickerSvg, svgToPngBlob, type Channel } from './sticker'

// The plate sits outside the <form> in the hero; form="gen" still makes it a form control.
const TEMPLATE = `
<div class="bench">
<section class="hero">
  <h1 data-i18n="gen.title"></h1>
  <div class="plate plate-edit">
    <label class="plate-eu">
      ${EU_STARS_SVG}
      <select name="country" form="gen" data-i18n-label="f.country">
        <option value="">–</option>
        ${COUNTRIES.map((c) => `<option>${c}</option>`).join('')}
      </select>
    </label>
    <input name="plate" form="gen" class="plate-num" autocomplete="off" autocapitalize="characters"
      spellcheck="false" maxlength="16" placeholder="M-AB 1234" data-i18n-label="f.plate" />
  </div>
  <p class="lead" data-i18n="gen.lead"></p>
  <p class="relay-hint"><a href="/account" data-i18n="gen.relay"></a></p>
</section>
<aside class="preview">
  <div class="sticker draft" aria-live="polite"></div>
  <div class="actions">
    <button type="button" class="btn primary" data-act="print" disabled data-i18n="p.print"></button>
    <button type="button" class="btn" data-act="share" disabled hidden data-i18n="p.share"></button>
    <button type="button" class="btn" data-act="png" disabled data-i18n="p.png"></button>
    <button type="button" class="btn" data-act="svg" disabled data-i18n="p.svg"></button>
    <button type="button" class="btn" data-act="copy" disabled data-i18n="p.copy"></button>
    <a class="btn" data-act="test" target="_blank" rel="noopener" aria-disabled="true" data-i18n="p.test"></a>
  </div>
</aside>
<form id="gen" class="form" novalidate>
  <label class="field">
    <span data-i18n="f.phone"></span>
    <input name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="24" placeholder="+49 170 1234567" />
    <small data-i18n="f.phoneHint"></small>
  </label>
  <fieldset class="field">
    <legend data-i18n="f.channels"></legend>
    <div class="checks">
      <label class="check"><input type="checkbox" name="call" checked /><span data-i18n="f.call"></span></label>
      <label class="check"><input type="checkbox" name="wa" checked /><span data-i18n="f.wa"></span></label>
    </div>
    <input name="waPhone" type="tel" inputmode="tel" maxlength="24" class="sub-input" data-i18n-ph="f.waOther" />
  </fieldset>
  <label class="field">
    <span data-i18n="f.tg"></span>
    <div class="prefixed"><span>@</span><input name="telegram" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="33" /></div>
    <small data-i18n="f.tgHint"></small>
  </label>
  <label class="field">
    <span data-i18n="f.note"></span>
    <textarea name="note" rows="2" maxlength="100" data-i18n-ph="f.notePh"></textarea>
  </label>
  <p class="error" role="alert" hidden></p>
</form>
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

  // Nothing to complain about until the user has typed a way to reach them.
  if (!v('phone') && !v('telegram') && !v('waPhone')) return { ok: false, error: null }
  if (!plate) return { ok: false, error: 'err.plate' }
  if (phone === null || waPhone === null) return { ok: false, error: 'err.phone' }
  if (telegram === null) return { ok: false, error: 'err.tg' }

  const call = checked('call') && phone ? phone : undefined
  const whatsapp = checked('wa') ? waPhone || phone || undefined : undefined
  if ((checked('call') || (checked('wa') && !waPhone)) && !phone) return { ok: false, error: 'err.phone' }
  if (!call && !whatsapp && !telegram) return { ok: false, error: 'err.channel' }
  const country = v('country') || undefined
  return { ok: true, contact: { plate, country, call, whatsapp, telegram: telegram || undefined, note: note || undefined } }
}

function download(blob: Blob, name: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

const DEFAULT_COUNTRY: Record<string, string> = { de: 'D', it: 'I' }

export function renderGenerator(root: HTMLElement) {
  root.innerHTML = TEMPLATE
  root.className = 'view-gen'
  translate(root)

  const form = root.querySelector('form')!
  const errorEl = root.querySelector<HTMLElement>('.error')!
  const stickerEl = root.querySelector<HTMLElement>('.sticker')!
  const field = <T extends Element = HTMLInputElement>(n: string) => form.elements.namedItem(n) as unknown as T
  const btn = (act: string) => root.querySelector<HTMLButtonElement>(`[data-act="${act}"]`)!
  const testLink = root.querySelector<HTMLAnchorElement>('[data-act="test"]')!
  field<HTMLSelectElement>('country').value = DEFAULT_COUNTRY[lang()] ?? ''

  let current: { url: string; svg: string; plate: string } | null = null
  let error: Key | null = null
  let seq = 0

  const setReady = (ready: boolean) => {
    for (const a of ['print', 'share', 'png', 'svg', 'copy']) btn(a).disabled = !ready
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
    field('waPhone').hidden = !field('wa').checked
    error = res.ok ? null : res.error
    showError()

    // Until the form is complete, show a faded draft that already follows the chosen channels.
    // Private stickers always point at the site root (/#token), whichever page the generator runs on.
    let url = new URL('/', location.href).href
    const channels: Channel[] = []
    if (res.ok) {
      url = new URL('#' + (await seal(res.contact)), url).href
      if (res.contact.call) channels.push('call')
      if (res.contact.whatsapp) channels.push('whatsapp')
      if (res.contact.telegram) channels.push('telegram')
    } else {
      if (field('call').checked) channels.push('call')
      if (field('wa').checked) channels.push('whatsapp')
      if (field('telegram').value) channels.push('telegram')
    }
    const svg = await stickerSvg(url, { title: t('s.title'), sub: t('s.sub'), domain: location.host }, channels)
    if (mine !== seq) return // a newer edit superseded this one
    current = res.ok ? { url, svg, plate: res.contact.plate } : null
    stickerEl.innerHTML = svg
    stickerEl.classList.toggle('draft', !res.ok)
    setReady(res.ok)
  }

  // The '@' is already shown as a prefix; drop it when typed or pasted.
  const tgEl = field('telegram')
  tgEl.addEventListener('input', () => {
    if (tgEl.value.startsWith('@')) tgEl.value = tgEl.value.slice(1)
  })

  // Listen on root: the plate inputs live outside the <form> element, so their events don't reach it.
  let timer = 0
  root.addEventListener('input', () => {
    clearTimeout(timer)
    timer = window.setTimeout(update, 150)
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
  btn('print').addEventListener('click', () => {
    if (current) printSticker(current.svg)
  })
  btn('share').hidden = !canShareFiles()
  btn('share').addEventListener('click', () => {
    if (current) shareSticker(current.svg, fileBase() + '.png')
  })
  btn('copy').addEventListener('click', async () => {
    if (!current) return
    await navigator.clipboard.writeText(current.url)
    btn('copy').textContent = t('p.copied')
    setTimeout(() => (btn('copy').textContent = t('p.copy')), 1500)
  })

  update()
}
