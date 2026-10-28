import QRCode from 'qrcode'
import { ICONS, type IconName } from './icons'

const W = 400
const H = 510
const FONT = "'Arial Narrow', 'Helvetica Neue', Arial, sans-serif"

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const CHANNEL_COLORS: Record<IconName, string> = { call: '#111111', whatsapp: '#1faa53', telegram: '#229ed9' }

export interface StickerText {
  title: string
  sub: string
}

// Self-contained SVG (no external fonts or images) so it can be printed as is or rasterized to PNG.
export async function stickerSvg(url: string, text: StickerText, channels: IconName[]): Promise<string> {
  const qr = await QRCode.toString(url, { errorCorrectionLevel: 'M', margin: 0, color: { dark: '#111111', light: '#ffffff' } })
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
<rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="28" fill="#ffffff" stroke="#111111" stroke-width="8"/>
<path d="M4 32a28 28 0 0 1 28-28h${W - 64}a28 28 0 0 1 28 28v76H4z" fill="#ffcc00" stroke="#111111" stroke-width="8"/>
<text x="${W / 2}" y="66" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="40" fill="#111111">${esc(text.title)}</text>
<text x="${W / 2}" y="94" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="19" fill="#111111">${esc(text.sub)}</text>
${qrInner}
${badges}
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
