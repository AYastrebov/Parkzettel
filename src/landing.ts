import { lang, LANGS, onLangChange, pathLang, t, translate } from './i18n'
import heroQr, { domain as heroDomain } from 'virtual:hero-qr'
import { LANDING } from './markup'
import { stickerFrame } from './sticker-frame'

// Marketing page at "/" and at /de/, /en/, /it/ (prerendered at build time for search engines, see
// vite.config.ts). The generator lives at /create; printed private stickers (/#token) and relay stickers
// (/s/<id>) are routed in main.ts before this page is considered.

export function renderLanding(root: HTMLElement) {
  root.className = 'view-landing'
  root.innerHTML = LANDING
  const home = new URL('/', location.href).href

  // Drawn by the same template as real stickers, with a QR made at build time (it always leads to the site
  // root), so the landing page needs neither the QR library nor the embedded font.
  const drawSticker = () => {
    const text = { title: t('s.title'), sub: t('s.sub'), domain: heroDomain }
    root.querySelector('.l-sticker')!.innerHTML = stickerFrame(heroQr, text, ['call', 'whatsapp', 'telegram'])
  }

  const sync = () => {
    // On a language URL, the picker loads that language's prerendered page, so the head (canonical,
    // description, structured data) matches too. Scanner languages have no landing URL; "/" uses the saved choice.
    const fromPath = pathLang(location.pathname)
    if (fromPath && fromPath !== lang()) {
      location.replace(lang() in LANGS ? `/${lang()}/` : '/')
      return
    }
    translate(root)
    document.title = t('l.title')
    drawSticker()
  }
  sync()
  onLangChange(sync)

  // Phones get the share sheet; elsewhere the link is copied.
  root.querySelectorAll<HTMLButtonElement>('[data-act="share"]').forEach((b) =>
    b.addEventListener('click', async () => {
      if (navigator.share) {
        await navigator.share({ title: 'Parkzettel', text: t('l.shareText'), url: home }).catch(() => {})
        return
      }
      await navigator.clipboard.writeText(home)
      b.textContent = t('l.copied')
      setTimeout(() => (b.textContent = t('l.share')), 1500)
    }),
  )
}
