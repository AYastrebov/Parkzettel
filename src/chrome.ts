import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/700.css'
import '@fontsource/barlow/400.css'
import '@fontsource/barlow/600.css'
// Barlow has no Cyrillic; Ukrainian and Russian fall back to Roboto Condensed (fetched only when needed).
import '@fontsource/roboto-condensed/cyrillic-600.css'
import '@fontsource/roboto-condensed/cyrillic-700.css'
import './style.css'
import { lang, LANG_NAMES, onLangChange, setLang, t, type Lang } from './i18n'

// Header with language picker and footer, shared by every page. Returns the <main> to render into.
export function mountChrome(): HTMLElement {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
<header class="top">
  <a class="brand" href="/"><img src="/favicon.svg" alt="" width="28" height="28" />Parkzettel</a>
  <label class="langs"><span class="visually-hidden">Language</span><select></select></label>
</header>
<main id="view"></main>
<footer class="foot"><span class="foot-text"></span> <a class="foot-link" href="/account"></a></footer>`

  const select = app.querySelector<HTMLSelectElement>('.langs select')!
  for (const l of Object.keys(LANG_NAMES) as Lang[]) select.append(new Option(LANG_NAMES[l], l))
  select.addEventListener('change', () => setLang(select.value as Lang))

  const sync = () => {
    document.documentElement.lang = lang()
    select.value = lang()
    app.querySelector('.foot-text')!.textContent = t('foot')
    app.querySelector('.foot-link')!.textContent = t('nav.account')
  }
  onLangChange(sync)
  sync()
  return app.querySelector<HTMLElement>('#view')!
}
