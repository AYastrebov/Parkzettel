import { mountChrome } from './chrome'
import { lang, onLangChange, t, translate, type FullLang, type Key } from './i18n'
import { COUNTRY_OPTIONS, isNonEu } from './plate'
import { canShareFiles, printSticker, shareSticker } from './share'
import { followCountry, STICKER_LANG_OPTIONS, stickerSvg, stickerText, svgToPngBlob } from './sticker'

const BOT_USERNAME = 'ParkzettelBot'

const TEMPLATE = `
<section class="account">
  <h1 data-i18n="acc.title"></h1>
  <p class="lead" data-i18n="acc.lead"></p>
  <div class="acc-out" hidden>
    <div class="tg-login"></div>
    <button type="button" class="btn dev-login" hidden>Dev login (localhost)</button>
    <p class="small" data-i18n="acc.stored"></p>
  </div>
  <div class="acc-in" hidden>
    <ul class="sticker-list"></ul>
    <p class="small acc-empty" data-i18n="acc.empty" hidden></p>
    <form class="new-sticker" novalidate>
      <h2 data-i18n="acc.new"></h2>
      <div class="new-row">
        <select name="country" data-i18n-label="f.country">${COUNTRY_OPTIONS}</select>
        <input name="plate" class="plate-input" maxlength="16" autocomplete="off" autocapitalize="characters" placeholder="M-AB 1234" data-i18n-label="f.plate" />
      </div>
      <input name="note" maxlength="100" data-i18n-ph="f.notePh" data-i18n-label="f.note" />
      <button type="submit" class="btn primary" data-i18n="acc.create"></button>
      <p class="small" data-i18n="acc.limit"></p>
    </form>
    <div class="acc-footer">
      <p class="acc-status" data-i18n="acc.in"></p>
      <div class="acc-actions">
        <button type="button" class="btn" data-act="logout" data-i18n="acc.logout"></button>
        <button type="button" class="btn danger" data-act="delete" data-i18n="acc.delete"></button>
      </div>
    </div>
  </div>
  <p class="error" role="alert" hidden></p>
</section>`

const ITEM = `
<li class="sticker-item">
  <div class="item-row">
    <select name="country" data-i18n-label="f.country">${COUNTRY_OPTIONS}</select>
    <input name="plate" class="plate-input" maxlength="16" autocomplete="off" autocapitalize="characters" data-i18n-label="f.plate" />
    <span class="badge"></span>
  </div>
  <input name="note" maxlength="100" data-i18n-ph="f.notePh" data-i18n-label="f.note" />
  <label class="sticker-lang"><span data-i18n="p.lang"></span><select name="stickerLang">${STICKER_LANG_OPTIONS}</select></label>
  <div class="item-actions">
    <button type="button" class="btn primary" data-act="print" data-i18n="p.print"></button>
    <button type="button" class="btn" data-act="share" hidden data-i18n="p.share"></button>
    <button type="button" class="btn" data-act="png" data-i18n="p.png"></button>
    <button type="button" class="btn" data-act="svg" data-i18n="p.svg"></button>
    <a class="btn" data-act="open" target="_blank" rel="noopener" data-i18n="p.test"></a>
    <button type="button" class="btn" data-act="toggle"></button>
    <button type="button" class="btn danger" data-act="remove" data-i18n="acc.remove"></button>
  </div>
</li>`

interface StickerView {
  id: string
  plate: string
  country?: string
  note?: string
  active: boolean
}

// Telegram's widget replaces itself with an iframe, so it is re-created whenever the language changes.
// On success it redirects to /api/auth/telegram, which verifies the login and sets the session cookie.
function mountWidget(el: HTMLElement) {
  el.replaceChildren()
  const s = document.createElement('script')
  s.async = true
  s.src = 'https://telegram.org/js/telegram-widget.js?22'
  s.dataset.telegramLogin = BOT_USERNAME
  s.dataset.size = 'large'
  s.dataset.authUrl = new URL('/api/auth/telegram', location.origin).href
  s.dataset.requestAccess = 'write'
  s.dataset.lang = lang()
  el.append(s)
}

async function api<T>(path: string, method: 'GET' | 'POST' = 'GET', body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify({ ...body, lang: lang() }) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(String(res.status)), { code: (data as { error?: string }).error })
  return data as T
}

const root = mountChrome()
root.className = 'view-account'
root.innerHTML = TEMPLATE
translate(root)
const errorEl = root.querySelector<HTMLElement>('.error')!
let errorKey: Key | null = null

function showError(key: Key | null) {
  errorKey = key
  errorEl.hidden = !key
  errorEl.textContent = key ? t(key) : ''
}

// Sticker languages the owner picked, by sticker id; render() rebuilds the items, so they live here.
const pickedLangs = new Map<string, FullLang>()

// Per-item language refreshers; replaced on every render so detached items don't pile up.
let itemSyncs: (() => void)[] = []

const stickerUrl = (id: string) => new URL(`/s/${id}`, location.origin).href

const buildSvg = (s: StickerView, l: FullLang) => stickerSvg(stickerUrl(s.id), stickerText(l), ['message'], 'H')
const fileName = (s: StickerView) => `parkzettel-${s.plate.replace(/[^A-Z0-9]+/gi, '-')}`

async function download(s: StickerView, l: FullLang, kind: 'png' | 'svg') {
  const svg = await buildSvg(s, l)
  const blob = kind === 'svg' ? new Blob([svg], { type: 'image/svg+xml' }) : await svgToPngBlob(svg)
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${fileName(s)}.${kind}`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

function renderItem(s: StickerView): HTMLLIElement {
  const tpl = document.createElement('template')
  tpl.innerHTML = ITEM.trim()
  const li = tpl.content.firstElementChild as HTMLLIElement
  const field = <T extends HTMLElement = HTMLInputElement>(n: string) => li.querySelector(`[name="${n}"]`) as T
  field<HTMLSelectElement>('country').value = s.country ?? ''
  field('plate').value = s.plate
  field('note').value = s.note ?? ''
  li.querySelector<HTMLAnchorElement>('[data-act="open"]')!.href = stickerUrl(s.id)
  // Not saved to the server: it only affects the next print or download.
  const stickerLang = followCountry(field<HTMLSelectElement>('stickerLang'), () => s.country, pickedLangs.get(s.id))

  const sync = () => {
    translate(li)
    stickerLang()
    field('country').classList.toggle('non-eu', isNonEu(s.country))
    li.classList.toggle('off', !s.active)
    li.querySelector('.badge')!.textContent = t(s.active ? 'acc.active' : 'acc.inactive')
    li.querySelector('[data-act="toggle"]')!.textContent = t(s.active ? 'acc.turnOff' : 'acc.turnOn')
  }
  sync()
  itemSyncs.push(sync)

  // Edits apply to the printed sticker right away; that is the point of relay stickers.
  const save = async (patch: Record<string, unknown>) => {
    try {
      const { sticker } = await api<{ sticker: StickerView }>(`/api/stickers/${s.id}`, 'POST', { action: 'update', ...patch })
      // Cleared optional fields are missing from the JSON, so reset them instead of keeping the old values.
      Object.assign(s, { country: undefined, note: undefined }, sticker)
      showError(null)
      sync()
    } catch {
      showError('acc.error')
    }
  }
  li.addEventListener('change', (e) => {
    const el = e.target as HTMLInputElement
    if (el.name === 'stickerLang') {
      pickedLangs.set(s.id, el.value as FullLang)
      return
    }
    if (el.name === 'country') el.classList.toggle('non-eu', isNonEu(el.value))
    if (el.name === 'plate') el.value = el.value.trim().toUpperCase()
    save({ [el.name]: el.value })
  })
  li.querySelector('[data-act="print"]')!.addEventListener('click', async () => printSticker(await buildSvg(s, stickerLang())))
  const share = li.querySelector<HTMLElement>('[data-act="share"]')!
  share.hidden = !canShareFiles()
  share.addEventListener('click', async () => shareSticker(await buildSvg(s, stickerLang()), `${fileName(s)}.png`))
  li.querySelector('[data-act="png"]')!.addEventListener('click', () => download(s, stickerLang(), 'png'))
  li.querySelector('[data-act="svg"]')!.addEventListener('click', () => download(s, stickerLang(), 'svg'))
  li.querySelector('[data-act="toggle"]')!.addEventListener('click', () => save({ active: !s.active }))
  li.querySelector('[data-act="remove"]')!.addEventListener('click', async () => {
    if (!confirm(t('acc.removeConfirm'))) return
    await api(`/api/stickers/${s.id}`, 'POST', { action: 'delete' })
    render()
  })
  return li
}

async function render() {
  const out = root.querySelector<HTMLElement>('.acc-out')!
  const inn = root.querySelector<HTMLElement>('.acc-in')!
  const failed = new URLSearchParams(location.search).get('login') === 'failed'
  if (failed) history.replaceState(null, '', '/account')

  let me: { loggedIn?: boolean }
  try {
    me = await api('/api/me')
  } catch {
    showError('acc.error')
    return
  }
  showError(failed ? 'acc.error' : null)
  out.hidden = !!me.loggedIn
  inn.hidden = !me.loggedIn
  if (!me.loggedIn) {
    if (location.hostname === 'localhost') root.querySelector<HTMLElement>('.dev-login')!.hidden = false
    else mountWidget(root.querySelector('.tg-login')!)
    return
  }
  const { stickers } = await api<{ stickers: StickerView[] }>('/api/stickers')
  itemSyncs = []
  root.querySelector('.sticker-list')!.replaceChildren(...stickers.map(renderItem))
  root.querySelector<HTMLElement>('.acc-empty')!.hidden = stickers.length > 0
}

render()

onLangChange(() => {
  translate(root)
  itemSyncs.forEach((sync) => sync())
  showError(errorKey)
  const widget = root.querySelector<HTMLElement>('.tg-login')!
  if (!root.querySelector<HTMLElement>('.acc-out')!.hidden && widget.childElementCount) mountWidget(widget)
})

const newCountry = root.querySelector<HTMLSelectElement>('.new-sticker [name="country"]')!
newCountry.addEventListener('change', () => newCountry.classList.toggle('non-eu', isNonEu(newCountry.value)))
root.querySelector('.new-sticker')!.addEventListener('submit', async (e) => {
  e.preventDefault()
  const form = e.target as HTMLFormElement
  const data = Object.fromEntries(new FormData(form))
  try {
    await api('/api/stickers', 'POST', data)
    form.reset()
    newCountry.classList.remove('non-eu')
    showError(null)
    render()
  } catch (err) {
    const code = (err as { code?: string }).code
    showError(code === 'undeliverable' ? 'acc.undeliverable' : code === 'limit' ? 'acc.limit' : code === 'plate' ? 'err.plate' : 'acc.error')
  }
})
root.querySelector('[data-act="logout"]')!.addEventListener('click', async () => {
  await api('/api/me', 'POST', { action: 'logout' })
  render()
})
root.querySelector('[data-act="delete"]')!.addEventListener('click', async () => {
  if (!confirm(t('acc.deleteConfirm'))) return
  await api('/api/me', 'POST', { action: 'delete' })
  render()
})
root.querySelector('.dev-login')!.addEventListener('click', async () => {
  await fetch('/api/auth/dev', { method: 'POST' })
  render()
})
