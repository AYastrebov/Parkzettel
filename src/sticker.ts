import QRCode from 'qrcode'
import fontUrl from '@fontsource/barlow-condensed/files/barlow-condensed-latin-700-normal.woff2?inline'
import { ICONS, type IconName } from './icons'

const W = 400
const H = 530
// The font is embedded as a data URL: an SVG rendered through <img> (PNG export) cannot fetch anything.
const FONT = "'Sticker', 'Arial Narrow', Arial, sans-serif"
const FONT_FACE = `<style>@font-face{font-family:'Sticker';font-weight:700;src:url(${fontUrl}) format('woff2')}</style>`

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

// RAL 1023 traffic yellow and RAL 9017 traffic black.
const YELLOW = '#f7ba0b'
const BLACK = '#1e1e1e'
const CHANNEL_COLORS: Record<IconName, string> = { call: BLACK, whatsapp: '#1faa53', telegram: '#229ed9' }

export interface StickerText {
  title: string
  sub: string
  domain: string // printed under the code so people can see where it leads before scanning
}

// Self-contained SVG (no external fonts or images) so it can be printed as is or rasterized to PNG.
export async function stickerSvg(url: string, text: StickerText, channels: IconName[]): Promise<string> {
  const qr = await QRCode.toString(url, { errorCorrectionLevel: 'M', margin: 0, color: { dark: BLACK, light: '#ffffff' } })
  const qrSize = 290
  const qrX = (W - qrSize) / 2
  const qrY = 128
  const qrInner = qr.replace('<svg ', `<svg x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" `)

  const step = 56
  const startX = W / 2 - ((channels.length - 1) * step) / 2
  const badges = channels
    .map((c, i) => {
      const cx = startX + i * step
      return `<g transform="translate(${cx - 20} 440)"><circle cx="20" cy="20" r="20" fill="${CHANNEL_COLORS[c]}"/><g transform="translate(9 9) scale(0.9167)" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${ICONS[c]}</g></g>`
    })
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
${FONT_FACE}
<rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="28" fill="#ffffff" stroke="${BLACK}" stroke-width="8"/>
<path d="M4 32a28 28 0 0 1 28-28h${W - 64}a28 28 0 0 1 28 28v76H4z" fill="${YELLOW}" stroke="${BLACK}" stroke-width="8"/>
<text x="${W / 2}" y="66" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="46" fill="${BLACK}">${esc(text.title)}</text>
<text x="${W / 2}" y="94" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="22" fill="${BLACK}">${esc(text.sub)}</text>
${qrInner}
${badges}
<text x="${W / 2}" y="508" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="16" letter-spacing="0.5" fill="#6b6b6b">${esc(text.domain)}</text>
</svg>`
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
