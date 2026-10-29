import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/700.css'
import '@fontsource/barlow/400.css'
import '@fontsource/barlow/600.css'
// Barlow has no Cyrillic; Ukrainian and Russian fall back to Roboto Condensed (fetched only when needed).
import '@fontsource/roboto-condensed/cyrillic-600.css'
import '@fontsource/roboto-condensed/cyrillic-700.css'
import './style.css'
import { lang, onLangChange, setLang, translate, type Lang } from './i18n'
import { chromeHtml } from './markup'

// Header with language picker and footer, shared by every page. Returns the <main> to render into.
export function mountChrome(): HTMLElement {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = chromeHtml(lang())

  const select = app.querySelector<HTMLSelectElement>('.langs select')!
  select.addEventListener('change', () => setLang(select.value as Lang))

  const sync = () => {
    document.documentElement.lang = lang()
    select.value = lang()
    translate(app.querySelector('.foot')!)
  }
  onLangChange(sync)
  sync()
  return app.querySelector<HTMLElement>('#view')!
}
