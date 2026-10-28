import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/700.css'
import '@fontsource/barlow/400.css'
import '@fontsource/barlow/600.css'
import './style.css'
import { lang, LANGS, onLangChange, setLang, t, type Lang } from './i18n'

// Header with language switcher and footer, shared by every page. Returns the <main> to render into.
export function mountChrome(): HTMLElement {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
<header class="top">
  <a class="brand" href="/"><img src="/favicon.svg" alt="" width="28" height="28" />Parkzettel</a>
  <nav class="langs" aria-label="Language"></nav>
</header>
<main id="view"></main>
<footer class="foot"><span class="foot-text"></span> <a class="foot-link" href="/account"></a></footer>`

  const nav = app.querySelector<HTMLElement>('.langs')!
  for (const l of Object.keys(LANGS) as Lang[]) {
    const b = document.createElement('button')
    b.type = 'button'
    b.textContent = l.toUpperCase()
    b.dataset.lang = l
    b.addEventListener('click', () => setLang(l))
    nav.append(b)
  }

  const sync = () => {
    document.documentElement.lang = lang()
    nav.querySelectorAll<HTMLButtonElement>('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang())))
    app.querySelector('.foot-text')!.textContent = t('foot')
    app.querySelector('.foot-link')!.textContent = t('nav.account')
  }
  onLangChange(sync)
  sync()
  return app.querySelector<HTMLElement>('#view')!
}
