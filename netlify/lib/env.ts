import type { Context } from '@netlify/functions'

export function secret(name: 'TELEGRAM_BOT_TOKEN' | 'TELEGRAM_WEBHOOK_SECRET' | 'SESSION_SECRET'): string {
  const value = Netlify.env.get(name)
  if (!value) throw new Error(`Missing environment variable ${name}`)
  return value
}

// Settings that are not secret and may be absent. TELEGRAM_CLIENT_ID is the bot's Client ID from BotFather's
// Login Widget settings; TELEGRAM_JWKS_URL points netlify dev at a local key set for testing the login.
export const setting = (name: 'TELEGRAM_CLIENT_ID' | 'TELEGRAM_JWKS_URL'): string | undefined => Netlify.env.get(name) || undefined

// 'production', 'deploy-preview', 'branch-deploy' or 'dev' (netlify dev).
export const deployContext = (context: Context) => context.deploy?.context || 'dev'
export const isProduction = (context: Context) => deployContext(context) === 'production'
