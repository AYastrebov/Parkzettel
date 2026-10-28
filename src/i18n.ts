const en = {
  'gen.title': 'The digital note behind your windshield wiper.',
  'f.country': 'Country code',
  'gen.lead':
    'Type your plate, choose how people can reach you, and print the sticker. Whoever you block in scans it and gets in touch. Your number is never printed on the car.',
  'f.plate': 'License plate',
  'f.phone': 'Phone number',
  'f.phoneHint': 'International format, e.g. +49 170 1234567',
  'f.channels': 'How can people reach you?',
  'f.call': 'Phone call',
  'f.wa': 'WhatsApp',
  'f.waOther': 'WhatsApp number, if different',
  'f.tg': 'Telegram username',
  'f.note': 'Short note (optional)',
  'f.notePh': 'e.g. I work in the building next door',
  'err.plate': 'Please enter your license plate.',
  'err.phone': 'Use international format, e.g. +49 170 1234567.',
  'err.tg': 'Telegram usernames have 5–32 letters, digits or underscores.',
  'err.channel': 'Choose at least one way to reach you.',
  'p.title': 'Your sticker',
  'p.png': 'Download PNG',
  'p.svg': 'Download SVG',
  'p.copy': 'Copy link',
  'p.copied': 'Copied!',
  'p.test': 'Open contact page',
  's.title': 'Blocking you?',
  's.sub': 'Scan to contact the driver',
  'how.title': 'How it works',
  'how.1': 'Enter your plate and how people can reach you.',
  'how.2': 'Download the sticker and print it, ideally on weatherproof sticker paper.',
  'how.3': 'Stick it inside the windshield. Scanning opens a page with contact buttons.',
  'priv.title': 'Privacy',
  'priv.body':
    'Nothing is stored anywhere. There is no server and no database. Your details are encrypted into the QR code itself and decrypted only in the browser of whoever scans it. Anyone who scans the code can see the contact options you chose. To change your details, create a new sticker.',
  'c.eyebrow': 'Contact the driver of',
  'c.call': 'Call',
  'c.wa': 'WhatsApp',
  'c.tg': 'Telegram',
  'c.waMsg': 'Hello! I am contacting you about your car {plate}.',
  'c.hint': 'Please be polite. The driver will see your number when you contact them.',
  'c.create': 'Create your own sticker',
  'bad.title': 'This code cannot be read',
  'bad.body': 'The link seems incomplete or damaged. Try scanning the QR code again.',
  'foot': 'No accounts, no tracking, no stored data.',
}

export type Key = keyof typeof en
type Dict = Record<Key, string>

const de: Dict = {
  'gen.title': 'Der digitale Zettel hinter dem Scheibenwischer.',
  'f.country': 'Länderkennung',
  'gen.lead':
    'Kennzeichen eintippen, Kontaktwege wählen, Aufkleber drucken. Wer zugeparkt ist, scannt ihn und meldet sich bei Ihnen. Ihre Nummer steht nie sichtbar am Auto.',
  'f.plate': 'Kennzeichen',
  'f.phone': 'Telefonnummer',
  'f.phoneHint': 'Internationales Format, z. B. +49 170 1234567',
  'f.channels': 'Wie kann man Sie erreichen?',
  'f.call': 'Anruf',
  'f.wa': 'WhatsApp',
  'f.waOther': 'WhatsApp-Nummer, falls abweichend',
  'f.tg': 'Telegram-Benutzername',
  'f.note': 'Kurze Notiz (optional)',
  'f.notePh': 'z. B. Ich arbeite im Gebäude nebenan',
  'err.plate': 'Bitte geben Sie Ihr Kennzeichen ein.',
  'err.phone': 'Bitte im internationalen Format, z. B. +49 170 1234567.',
  'err.tg': 'Telegram-Namen haben 5–32 Buchstaben, Ziffern oder Unterstriche.',
  'err.channel': 'Wählen Sie mindestens einen Kontaktweg.',
  'p.title': 'Ihr Aufkleber',
  'p.png': 'PNG herunterladen',
  'p.svg': 'SVG herunterladen',
  'p.copy': 'Link kopieren',
  'p.copied': 'Kopiert!',
  'p.test': 'Kontaktseite öffnen',
  's.title': 'Zugeparkt?',
  's.sub': 'Scannen und Fahrer kontaktieren',
  'how.title': "So funktioniert's",
  'how.1': 'Kennzeichen und Kontaktwege eingeben.',
  'how.2': 'Aufkleber herunterladen und drucken, am besten auf wetterfestem Etikettenpapier.',
  'how.3': 'Innen an die Windschutzscheibe kleben. Beim Scannen öffnet sich eine Seite mit Kontakt-Buttons.',
  'priv.title': 'Datenschutz',
  'priv.body':
    'Es wird nichts gespeichert. Es gibt keinen Server und keine Datenbank. Ihre Daten werden verschlüsselt im QR-Code selbst abgelegt und erst im Browser der scannenden Person entschlüsselt. Wer den Code scannt, sieht die von Ihnen gewählten Kontaktwege. Für neue Daten erstellen Sie einfach einen neuen Aufkleber.',
  'c.eyebrow': 'Fahrer kontaktieren von',
  'c.call': 'Anrufen',
  'c.wa': 'WhatsApp',
  'c.tg': 'Telegram',
  'c.waMsg': 'Hallo! Ich melde mich wegen Ihres Autos {plate}.',
  'c.hint': 'Bitte bleiben Sie freundlich. Der Fahrer sieht Ihre Nummer, wenn Sie ihn kontaktieren.',
  'c.create': 'Eigenen Aufkleber erstellen',
  'bad.title': 'Dieser Code ist nicht lesbar',
  'bad.body': 'Der Link scheint unvollständig oder beschädigt zu sein. Bitte scannen Sie den QR-Code erneut.',
  'foot': 'Keine Konten, kein Tracking, keine gespeicherten Daten.',
}

const it: Dict = {
  'gen.title': 'Il biglietto digitale sotto il tergicristallo.',
  'f.country': 'Sigla del paese',
  'gen.lead':
    "Scrivi la targa, scegli come farti contattare e stampa l'adesivo. Chi resta bloccato lo scansiona e ti contatta. Il tuo numero non è mai stampato sull'auto.",
  'f.plate': 'Targa',
  'f.phone': 'Numero di telefono',
  'f.phoneHint': 'Formato internazionale, es. +39 333 1234567',
  'f.channels': 'Come possono contattarti?',
  'f.call': 'Chiamata',
  'f.wa': 'WhatsApp',
  'f.waOther': 'Numero WhatsApp, se diverso',
  'f.tg': 'Username Telegram',
  'f.note': 'Breve nota (facoltativa)',
  'f.notePh': "es. Lavoro nell'edificio accanto",
  'err.plate': 'Inserisci la tua targa.',
  'err.phone': 'Usa il formato internazionale, es. +39 333 1234567.',
  'err.tg': 'Gli username Telegram hanno 5–32 lettere, cifre o trattini bassi.',
  'err.channel': 'Scegli almeno un modo per essere contattato.',
  'p.title': 'Il tuo adesivo',
  'p.png': 'Scarica PNG',
  'p.svg': 'Scarica SVG',
  'p.copy': 'Copia link',
  'p.copied': 'Copiato!',
  'p.test': 'Apri pagina di contatto',
  's.title': 'Ti blocco?',
  's.sub': 'Scansiona e contatta il conducente',
  'how.title': 'Come funziona',
  'how.1': 'Inserisci la targa e come possono contattarti.',
  'how.2': "Scarica l'adesivo e stampalo, meglio su carta adesiva resistente all'acqua.",
  'how.3': "Attaccalo all'interno del parabrezza. La scansione apre una pagina con i pulsanti di contatto.",
  'priv.title': 'Privacy',
  'priv.body':
    "Non viene salvato nulla. Non c'è nessun server né database. I tuoi dati sono cifrati nel codice QR stesso e decifrati solo nel browser di chi lo scansiona. Chi scansiona il codice vede i contatti che hai scelto. Per cambiare i dati, crea un nuovo adesivo.",
  'c.eyebrow': 'Contatta il conducente di',
  'c.call': 'Chiama',
  'c.wa': 'WhatsApp',
  'c.tg': 'Telegram',
  'c.waMsg': 'Ciao! Ti scrivo per la tua auto {plate}.',
  'c.hint': 'Sii gentile. Il conducente vedrà il tuo numero quando lo contatti.',
  'c.create': 'Crea il tuo adesivo',
  'bad.title': 'Questo codice non è leggibile',
  'bad.body': 'Il link sembra incompleto o danneggiato. Prova a scansionare di nuovo il codice QR.',
  'foot': 'Nessun account, nessun tracciamento, nessun dato salvato.',
}

export const LANGS = { de, en, it } as const
export type Lang = keyof typeof LANGS

const STORAGE_KEY = 'parkzettel.lang'

function detect(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && saved in LANGS) return saved as Lang
  } catch {}
  for (const l of navigator.languages ?? [navigator.language]) {
    const base = l.slice(0, 2).toLowerCase()
    if (base in LANGS) return base as Lang
  }
  return 'en'
}

let current: Lang = detect()
const listeners = new Set<() => void>()

export const lang = () => current

export function t(key: Key, vars: Record<string, string> = {}): string {
  return LANGS[current][key].replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
}

export function setLang(l: Lang) {
  current = l
  try {
    localStorage.setItem(STORAGE_KEY, l)
  } catch {}
  document.documentElement.lang = l
  listeners.forEach((fn) => fn())
}

export function onLangChange(fn: () => void) {
  listeners.add(fn)
}

// Fills every [data-i18n] / [data-i18n-ph] / [data-i18n-label] element under root.
export function translate(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n as Key)
  })
  root.querySelectorAll<HTMLInputElement>('[data-i18n-ph]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh as Key)
  })
  root.querySelectorAll<HTMLElement>('[data-i18n-label]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nLabel as Key))
  })
}
