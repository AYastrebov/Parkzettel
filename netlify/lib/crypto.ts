const enc = new TextEncoder()

const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')

export async function hmacHex(key: string | ArrayBuffer, data: string): Promise<string> {
  const raw = typeof key === 'string' ? enc.encode(key) : key
  const k = await crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return hex(await crypto.subtle.sign('HMAC', k, enc.encode(data)))
}

// Constant-time comparison so signature checks don't leak how many leading characters matched.
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
