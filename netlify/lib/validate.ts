// Same rules as the private-sticker generator (src/codec.ts), applied server-side.
const COUNTRY_RE = /^[A-Z]{1,3}$/
const ID_ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O, 1/l/I

export const STICKER_ID_RE = new RegExp(`^[${ID_ALPHABET}]{8}$`)
export const MESSAGE_ID_RE = new RegExp(`^[${ID_ALPHABET}]{16}$`)

export function randomId(length: number): string {
  // Rejection sampling keeps every character equally likely.
  const out: string[] = []
  while (out.length < length) {
    for (const b of crypto.getRandomValues(new Uint8Array(length * 2))) {
      if (b < 256 - (256 % ID_ALPHABET.length) && out.length < length) out.push(ID_ALPHABET[b % ID_ALPHABET.length])
    }
  }
  return out.join('')
}

export function cleanPlate(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const plate = v.trim().toUpperCase().replace(/\s+/g, ' ')
  return plate && plate.length <= 16 ? plate : null
}

export function cleanCountry(v: unknown): string | undefined {
  return typeof v === 'string' && COUNTRY_RE.test(v) ? v : undefined
}

export function cleanText(v: unknown, max: number): string | undefined {
  if (typeof v !== 'string') return undefined
  // Drop control characters; Telegram messages are sent as plain text, so no markup can sneak in.
  const s = v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max)
  return s || undefined
}
