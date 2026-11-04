import { ICONS, type IconName } from './icons'

// The sticker drawing without its dependencies: no QR library, no embedded font. sticker.ts adds both for
// real stickers; the landing hero and the build-time prerender use this directly with a QR made at build time.

export const W = 400
export const H = 530

// 'Sticker' is the font embedded for PNG export; inline in a page the sticker falls back to the page's
// Barlow Condensed, which is already loaded.
const FONT = "'Sticker', 'Barlow Condensed', 'Arial Narrow', Arial, sans-serif"

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

// RAL 1023 traffic yellow and RAL 9017 traffic black.
const YELLOW = '#f7ba0b'
export const BLACK = '#1e1e1e'

// Icons that can appear as contact badges on a sticker.
export type Channel = Exclude<IconName, 'github'>

const CHANNEL_COLORS: Record<Channel, string> = { call: BLACK, whatsapp: '#1faa53', telegram: '#229ed9', message: BLACK }

export interface StickerText {
  title: string
  sub: string
  domain: string // printed under the code so people can see where it leads before scanning
}

// `qr` is a complete <svg> from QRCode.toString(); `head` is extra markup for the top of the SVG (the
// embedded font, for export).
export function stickerFrame(qr: string, text: StickerText, channels: Channel[], head = ''): string {
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
${head}
<rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="28" fill="#ffffff" stroke="${BLACK}" stroke-width="8"/>
<path d="M4 32a28 28 0 0 1 28-28h${W - 64}a28 28 0 0 1 28 28v76H4z" fill="${YELLOW}" stroke="${BLACK}" stroke-width="8"/>
<text x="${W / 2}" y="66" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="46" fill="${BLACK}">${esc(text.title)}</text>
<text x="${W / 2}" y="94" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="22" fill="${BLACK}">${esc(text.sub)}</text>
${qrInner}
${badges}
<text x="${W / 2}" y="508" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="16" letter-spacing="0.5" fill="#6b6b6b">${esc(text.domain)}</text>
</svg>`
}
