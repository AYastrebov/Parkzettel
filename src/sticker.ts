import QRCode from 'qrcode'
import fontUrl from '@fontsource/barlow-condensed/files/barlow-condensed-latin-700-normal.woff2?inline'
import { lang, LANG_NAMES, LANGS, tIn, type FullLang, type Lang } from './i18n'
import { BLACK, H, stickerFrame, W, type Channel, type StickerText } from './sticker-frame'

export type { Channel, StickerText } from './sticker-frame'

// The font is embedded as a data URL: an SVG rendered through <img> (PNG export) cannot fetch anything.
const FONT_FACE = `<style>@font-face{font-family:'Sticker';font-weight:700;src:url(${fontUrl}) format('woff2')}</style>`

// The printed text is for passers-by, so it follows the plate's country rather than the owner's UI language.
// Only full languages: the embedded font covers basic Latin, not Polish, Turkish or Cyrillic letters.
// Switzerland is multilingual, so CH keeps the UI language.
const COUNTRY_LANG: Record<string, FullLang> = { D: 'de', A: 'de', FL: 'de', I: 'it', UK: 'en', IRL: 'en', M: 'en' }

export const stickerLangFor = (country: string | undefined, ui: Lang): FullLang =>
  COUNTRY_LANG[country ?? ''] ?? (ui in LANGS ? (ui as FullLang) : 'en')

// Keeps a sticker-language select on the plate country's language until the owner picks one (or `picked`
// restores an earlier pick). Returns the language to print in.
export function followCountry(select: HTMLSelectElement, country: () => string | undefined, picked?: FullLang) {
  if (picked) select.value = picked
  let chosen = !!picked
  select.addEventListener('change', () => (chosen = true))
  return (): FullLang => {
    if (!chosen) select.value = stickerLangFor(country(), lang())
    return select.value as FullLang
  }
}

export const STICKER_LANG_OPTIONS = (Object.keys(LANGS) as FullLang[]).map((l) => `<option value="${l}">${LANG_NAMES[l]}</option>`).join('')

export const stickerText = (l: FullLang): StickerText => ({ title: tIn(l, 's.title'), sub: tIn(l, 's.sub'), domain: location.host })

// Self-contained SVG (no external fonts or images) so it can be printed as is or rasterized to PNG.
// Private stickers carry a long URL, so they stay at level M to keep the code scannable; relay URLs are
// short enough for level H, which survives glare, dirt and a wet windshield much better.
export async function stickerSvg(url: string, text: StickerText, channels: Channel[], ecl: 'M' | 'H' = 'M'): Promise<string> {
  const qr = await QRCode.toString(url, { errorCorrectionLevel: ecl, margin: 0, color: { dark: BLACK, light: '#ffffff' } })
  return stickerFrame(qr, text, channels, FONT_FACE)
}

export async function svgToPngBlob(svg: string, scale = 3): Promise<Blob> {
  const img = new Image()
  const src = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  try {
    img.src = src
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = W * scale
    canvas.height = H * scale
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    return await new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png'),
    )
  } finally {
    URL.revokeObjectURL(src)
  }
}
