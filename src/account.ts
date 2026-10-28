import { mountChrome } from './chrome'
import { lang, onLangChange, t, translate } from './i18n'

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
    <p class="acc-status" data-i18n="acc.in"></p>
    <p data-i18n="acc.soon"></p>
    <div class="acc-actions">
      <button type="button" class="btn" data-act="logout" data-i18n="acc.logout"></button>
      <button type="button" class="btn danger" data-act="delete" data-i18n="acc.delete"></button>
    </div>
  </div>
  <p class="error" role="alert" hidden></p>
</section>`

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

async function api(method: 'GET' | 'POST', body?: unknown) {
  const res = await fetch('/api/me', {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(String(res.status))
  return res.json() as Promise<{ loggedIn?: boolean; stickers?: number; ok?: boolean }>
}

async function render(root: HTMLElement) {
  const out = root.querySelector<HTMLElement>('.acc-out')!
  const inn = root.querySelector<HTMLElement>('.acc-in')!
  const error = root.querySelector<HTMLElement>('.error')!
  const failed = new URLSearchParams(location.search).get('login') === 'failed'
  if (failed) history.replaceState(null, '', '/account')

  const showError = (on: boolean) => {
    error.hidden = !on
    error.textContent = on ? t('acc.error') : ''
  }

  let me: { loggedIn?: boolean }
  try {
    me = await api('GET')
  } catch {
    showError(true)
    return
  }
  showError(failed)
  out.hidden = !!me.loggedIn
  inn.hidden = !me.loggedIn
  if (!me.loggedIn) {
    if (location.hostname === 'localhost') root.querySelector<HTMLElement>('.dev-login')!.hidden = false
    else mountWidget(root.querySelector('.tg-login')!)
  }
}

const root = mountChrome()
root.className = 'view-account'
root.innerHTML = TEMPLATE
translate(root)
render(root)

onLangChange(() => {
  translate(root)
  const widget = root.querySelector<HTMLElement>('.tg-login')!
  if (!root.querySelector<HTMLElement>('.acc-out')!.hidden && widget.childElementCount) mountWidget(widget)
})

root.querySelector('[data-act="logout"]')!.addEventListener('click', async () => {
  await api('POST', { action: 'logout' })
  render(root)
})
root.querySelector('[data-act="delete"]')!.addEventListener('click', async () => {
  if (!confirm(t('acc.deleteConfirm'))) return
  await api('POST', { action: 'delete' })
  render(root)
})
root.querySelector('.dev-login')!.addEventListener('click', async () => {
  await fetch('/api/auth/dev', { method: 'POST' })
  render(root)
})
