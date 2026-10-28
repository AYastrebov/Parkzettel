import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/700.css'
import './style.css'
import { renderContact } from './contact'
import { renderGenerator } from './generator'
import { lang, LANGS, onLangChange, setLang, t, type Lang } from './i18n'

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
<header class="top">
  <a class="brand" href="./"><img src="./favicon.svg" alt="" width="28" height="28" />Parkzettel</a>
  <nav class="langs" aria-label="Language"></nav>
</header>
<main id="view"></main>
<footer class="foot"></footer>`

const view = app.querySelector<HTMLElement>('#view')!
const nav = app.querySelector<HTMLElement>('.langs')!
const foot = app.querySelector<HTMLElement>('.foot')!

for (const l of Object.keys(LANGS) as Lang[]) {
  const b = document.createElement('button')
  b.type = 'button'
  b.textContent = l.toUpperCase()
  b.dataset.lang = l
  b.addEventListener('click', () => setLang(l))
  nav.append(b)
}

function syncChrome() {
  document.documentElement.lang = lang()
  nav.querySelectorAll<HTMLButtonElement>('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang())))
  foot.textContent = t('foot')
}
onLangChange(syncChrome)
syncChrome()

const token = location.hash.slice(1)
if (token) {
  // Contact pages carry personal data; keep them out of search indexes.
  const robots = document.createElement('meta')
  robots.name = 'robots'
  robots.content = 'noindex'
  document.head.append(robots)
  renderContact(view, token)
} else {
  renderGenerator(view)
}

// The app is one page: a different fragment means a different mode or contact, so start fresh.
window.addEventListener('hashchange', () => location.reload())
