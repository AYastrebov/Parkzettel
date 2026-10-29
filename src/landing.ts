import { lang, LANGS, onLangChange, pathLang, t, translate } from './i18n'
import { LANDING } from './markup'

// Marketing page at "/" and at /de/, /en/, /it/ (prerendered at build time for search engines, see
// vite.config.ts). The generator lives at /create; printed private stickers (/#token) and relay stickers
// (/s/<id>) are routed in main.ts before this page is considered.

export function renderLanding(root: HTMLElement) {
  root.className = 'view-landing'
  root.innerHTML = LANDING
  const home = new URL('/', location.href).href

  // The sticker is drawn by the same code as real stickers. Its QR leads back to this page.
  // Loaded after first paint, because it pulls in the QR library and the embedded font.
  const drawSticker = async () => {
    const { stickerSvg } = await import('./sticker')
    root.querySelector('.l-sticker')!.innerHTML = await stickerSvg(home, { title: t('s.title'), sub: t('s.sub'), domain: location.host }, [
      'call',
      'whatsapp',
      'telegram',
    ])
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
