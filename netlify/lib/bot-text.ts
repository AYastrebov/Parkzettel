import type { Lang, Preset, Reply } from './stores'

interface Text {
  preset: Record<Preset, string>
  reply: Record<Reply, string>
  replied: string
  textSent: string
  hint: string
  off: string
  switchOff: string
  switchOn: string
  switchedOff: string
  switchedOn: string
}

// What the owner sees in Telegram. Scanner-facing text lives in src/i18n.ts.
const TEXT: Record<Lang, Text> = {
  en: {
    preset: { blocking: 'You are blocking me in.', lights: 'Your lights are on.', other: 'Someone wants to reach you.' },
    reply: { coming: 'On my way', soon: 'In about 10 minutes', cant: "Can't come right now" },
    replied: 'You replied: {reply}',
    textSent: 'Your reply was shown to the person at your car.',
    hint: 'Tap a button, or reply to this message to send your own text.',
    off: 'This sticker is switched off or deleted, so the reply was not sent.',
    switchOff: 'Switch sticker off',
    switchOn: 'Switch sticker on',
    switchedOff: 'Sticker switched off. Scans now show that it is off.',
    switchedOn: 'Sticker switched on.',
  },
  de: {
    preset: { blocking: 'Sie parken mich zu.', lights: 'Bei Ihrem Auto ist das Licht an.', other: 'Jemand möchte Sie erreichen.' },
    reply: { coming: 'Bin unterwegs', soon: 'In etwa 10 Minuten', cant: 'Kann gerade nicht kommen' },
    replied: 'Ihre Antwort: {reply}',
    textSent: 'Ihre Antwort wurde der Person an Ihrem Auto angezeigt.',
    hint: 'Tippen Sie auf einen Button, oder antworten Sie auf diese Nachricht mit eigenem Text.',
    off: 'Dieser Aufkleber ist ausgeschaltet oder gelöscht, die Antwort wurde nicht gesendet.',
    switchOff: 'Aufkleber ausschalten',
    switchOn: 'Aufkleber einschalten',
    switchedOff: 'Aufkleber ausgeschaltet. Beim Scannen wird jetzt angezeigt, dass er aus ist.',
    switchedOn: 'Aufkleber eingeschaltet.',
  },
  it: {
    preset: { blocking: 'Mi stai bloccando.', lights: 'Hai le luci accese.', other: 'Qualcuno vuole contattarti.' },
    reply: { coming: 'Arrivo', soon: 'Tra circa 10 minuti', cant: 'Non posso venire ora' },
    replied: 'Hai risposto: {reply}',
    textSent: 'La tua risposta è stata mostrata alla persona vicino alla tua auto.',
    hint: 'Tocca un pulsante, oppure rispondi a questo messaggio con un testo tuo.',
    off: "Questo adesivo è spento o eliminato, quindi la risposta non è stata inviata.",
    switchOff: 'Spegni adesivo',
    switchOn: 'Accendi adesivo',
    switchedOff: "Adesivo spento. Chi lo scansiona ora vede che è spento.",
    switchedOn: 'Adesivo acceso.',
  },
}

export const botText = (lang: Lang | undefined) => TEXT[lang ?? 'en']

export function ownerMessage(lang: Lang | undefined, plate: string, preset: Preset, text?: string): string {
  const t = botText(lang)
  // Plain text (no parse_mode), so whatever the scanner typed is shown literally.
  return `🚗 ${plate}\n${t.preset[preset]}${text ? `\n\n“${text}”` : ''}\n\n${t.hint}`
}

// Inline keyboard under a scanner's message: three quick replies and a switch for the sticker.
// callback_data: "r|<messageId>|<reply>" and "s|<messageId>|<stickerId>|on|off".
export function keyboard(lang: Lang | undefined, messageId: string, stickerId: string, active: boolean) {
  const t = botText(lang)
  return {
    inline_keyboard: [
      [
        { text: t.reply.coming, callback_data: `r|${messageId}|coming` },
        { text: t.reply.soon, callback_data: `r|${messageId}|soon` },
      ],
      [{ text: t.reply.cant, callback_data: `r|${messageId}|cant` }],
      [{ text: active ? t.switchOff : t.switchOn, callback_data: `s|${messageId}|${stickerId}|${active ? 'off' : 'on'}` }],
    ],
  }
}
