// Contact data travels inside the URL fragment (after '#'), which browsers never send to a server.
// Format: "1" + base64url(key[16] | iv[12] | AES-GCM ciphertext). The key ships alongside the
// ciphertext because the scanner must be able to read the data. The encryption only keeps the data from
// being readable at a glance in the URL; anyone holding the link can decode it. GCM's tag catches damaged
// links, not forgery: anyone can mint a valid token with a key of their own.

export interface Contact {
  plate: string
  country?: string // EU plate country code shown under the stars, e.g. 'D'
  call?: string // E.164 phone number for the Call button
  whatsapp?: string // E.164 phone number for WhatsApp
  telegram?: string // username without '@'
  note?: string
}

const VERSION = '1'

// Short keys keep the QR code small. 'w' = '=' means "WhatsApp on the call number".
interface Packed {
  p: string
  k?: string
  c?: string
  w?: string
  t?: string
  n?: string
}

function pack(c: Contact): Packed {
  const out: Packed = { p: c.plate }
  if (c.country) out.k = c.country
  if (c.call) out.c = c.call
  if (c.whatsapp) out.w = c.whatsapp === c.call ? '=' : c.whatsapp
  if (c.telegram) out.t = c.telegram
  if (c.note) out.n = c.note
  return out
}

export const PHONE_RE = /^\+[1-9]\d{6,14}$/
export const TELEGRAM_RE = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/
export const COUNTRY_RE = /^[A-Z]{1,3}$/

// Tokens can be hand-crafted, so anything that ends up in a link is re-validated here.
function unpack(x: Packed): Contact {
  if (typeof x?.p !== 'string') throw new Error('bad payload')
  const str = (v: unknown, re?: RegExp) => (typeof v === 'string' && v && (!re || re.test(v)) ? v : undefined)
  return {
    plate: x.p.slice(0, 16),
    country: str(x.k, COUNTRY_RE),
    call: str(x.c, PHONE_RE),
    whatsapp: x.w === '=' ? str(x.c, PHONE_RE) : str(x.w, PHONE_RE),
    telegram: str(x.t, TELEGRAM_RE),
    note: str(x.n)?.slice(0, 100),
  }
}

function toB64url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromB64url(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(bin, (ch) => ch.charCodeAt(0))
}

export async function seal(contact: Contact): Promise<string> {
  const raw = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt'])
  const plain = new TextEncoder().encode(JSON.stringify(pack(contact)))
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain))
  const blob = new Uint8Array(raw.length + iv.length + ct.length)
  blob.set(raw, 0)
  blob.set(iv, raw.length)
  blob.set(ct, raw.length + iv.length)
  return VERSION + toB64url(blob)
}

export async function open(token: string): Promise<Contact> {
  if (!token.startsWith(VERSION)) throw new Error('unknown version')
  const blob = fromB64url(token.slice(VERSION.length))
  if (blob.length < 16 + 12 + 16) throw new Error('too short')
  const key = await crypto.subtle.importKey('raw', blob.slice(0, 16), 'AES-GCM', false, ['decrypt'])
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: blob.slice(16, 28) }, key, blob.slice(28))
  return unpack(JSON.parse(new TextDecoder().decode(plain)))
}
