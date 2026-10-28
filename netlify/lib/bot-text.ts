import type { Lang, Preset, Reply } from './stores'

// What the owner sees in Telegram. Scanner-facing text lives in src/i18n.ts.
const TEXT: Record<Lang, { preset: Record<Preset, string>; reply: Record<Reply, string>; replied: string; off: string }> = {
  en: {
    preset: { blocking: 'You are blocking me in.', lights: 'Your lights are on.', other: 'Someone wants to reach you.' },
    reply: { coming: 'On my way', soon: 'In about 10 minutes', cant: "Can't come right now" },
    replied: 'You replied: {reply}',
    off: 'This sticker is switched off or deleted, so the reply was not sent.',
  },
  de: {
    preset: { blocking: 'Sie parken mich zu.', lights: 'Bei Ihrem Auto ist das Licht an.', other: 'Jemand möchte Sie erreichen.' },
    reply: { coming: 'Bin unterwegs', soon: 'In etwa 10 Minuten', cant: 'Kann gerade nicht kommen' },
    replied: 'Ihre Antwort: {reply}',
    off: 'Dieser Aufkleber ist ausgeschaltet oder gelöscht, die Antwort wurde nicht gesendet.',
  },
  it: {
    preset: { blocking: 'Mi stai bloccando.', lights: 'Hai le luci accese.', other: 'Qualcuno vuole contattarti.' },
    reply: { coming: 'Arrivo', soon: 'Tra circa 10 minuti', cant: 'Non posso venire ora' },
    replied: 'Hai risposto: {reply}',
    off: "Questo adesivo è spento o eliminato, quindi la risposta non è stata inviata.",
  },
}

export const botText = (lang: Lang | undefined) => TEXT[lang ?? 'en']

export function ownerMessage(lang: Lang | undefined, plate: string, preset: Preset, text?: string): string {
  const t = botText(lang)
  // Plain text (no parse_mode), so whatever the scanner typed is shown literally.
  return `🚗 ${plate}\n${t.preset[preset]}${text ? `\n\n“${text}”` : ''}`
}
