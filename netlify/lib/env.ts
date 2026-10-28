import type { Context } from '@netlify/functions'

export function secret(name: 'TELEGRAM_BOT_TOKEN' | 'TELEGRAM_WEBHOOK_SECRET' | 'SESSION_SECRET'): string {
  const value = Netlify.env.get(name)
  if (!value) throw new Error(`Missing environment variable ${name}`)
  return value
}

// 'production', 'deploy-preview', 'branch-deploy' or 'dev' (netlify dev).
export const deployContext = (context: Context) => context.deploy?.context || 'dev'
export const isProduction = (context: Context) => deployContext(context) === 'production'
