import { setting } from './env'

// Verifies the id_token that Telegram Login (telegram-login.js) hands to the account page. Telegram is an
// OpenID Connect provider: the token is a JWT signed with one of the keys at its JWKS URL, and the claims
// name the issuer, our bot (aud), the user (sub) and the nonce our API issued for this login attempt.
// Checked per https://core.telegram.org/widgets/login: signature, iss, aud, exp; plus nonce and iat.
const ISSUER = 'https://oauth.telegram.org'
const JWKS_URL = `${ISSUER}/.well-known/jwks.json`
const KEYS_TTL_MS = 60 * 60 * 1000
const CLOCK_SKEW_S = 60

interface Jwk {
  kid?: string
  alg?: string
  kty: string
  [k: string]: unknown
}

// Telegram signs with RS256 by default; ES256 and EdDSA can be chosen in BotFather. ES256K (secp256k1) is
// meant for Web3 logins and is not in WebCrypto, so it is rejected.
const IMPORT: Record<string, RsaHashedImportParams | EcKeyImportParams | Algorithm> = {
  RS256: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
  ES256: { name: 'ECDSA', namedCurve: 'P-256' },
  EdDSA: { name: 'Ed25519' },
}
const VERIFY: Record<string, AlgorithmIdentifier | EcdsaParams> = {
  RS256: { name: 'RSASSA-PKCS1-v1_5' },
  ES256: { name: 'ECDSA', hash: 'SHA-256' },
  EdDSA: { name: 'Ed25519' },
}

let cache: { keys: Jwk[]; at: number } | null = null

// Telegram's public keys, cached per function instance. TELEGRAM_JWKS_URL exists for netlify dev only, so
// the login can be tested against a local key set.
async function keys(refresh = false): Promise<Jwk[]> {
  if (!refresh && cache && Date.now() - cache.at < KEYS_TTL_MS) return cache.keys
  const res = await fetch(setting('TELEGRAM_JWKS_URL') ?? JWKS_URL)
  if (!res.ok) throw new Error(`JWKS fetch failed: HTTP ${res.status}`)
  const data = (await res.json()) as { keys?: Jwk[] }
  cache = { keys: data.keys ?? [], at: Date.now() }
  return cache.keys
}

const b64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
const parse = (s: string) => JSON.parse(new TextDecoder().decode(b64url(s))) as Record<string, unknown>

// Returns the Telegram user ID, or null when anything about the token is wrong.
export async function verifyIdToken(token: string, expected: { clientId: string; nonce: string }): Promise<number | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const header = parse(parts[0])
  const alg = typeof header.alg === 'string' ? header.alg : ''
  if (!(alg in IMPORT)) return null
  const byKid = (list: Jwk[]) => list.find((k) => k.kid === header.kid)
  // An unknown kid usually means Telegram rotated its keys; fetch them once more before giving up.
  const jwk = byKid(await keys()) ?? byKid(await keys(true))
  if (!jwk || (jwk.alg && jwk.alg !== alg)) return null

  const key = await crypto.subtle.importKey('jwk', jwk as JsonWebKey, IMPORT[alg], false, ['verify'])
  const signed = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  if (!(await crypto.subtle.verify(VERIFY[alg], key, b64url(parts[2]), signed))) return null

  const c = parse(parts[1])
  const now = Date.now() / 1000
  const aud = Array.isArray(c.aud) ? c.aud : [c.aud]
  if (c.iss !== ISSUER) return null
  if (!aud.some((a) => String(a) === expected.clientId)) return null
  if (typeof c.exp !== 'number' || c.exp < now - CLOCK_SKEW_S) return null
  if (typeof c.iat !== 'number' || c.iat > now + CLOCK_SKEW_S) return null
  if (c.nonce !== expected.nonce) return null
  return typeof c.sub === 'string' && /^\d{1,20}$/.test(c.sub) ? Number(c.sub) : null
}
