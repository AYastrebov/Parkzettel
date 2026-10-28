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
  'f.tgHint': 'With Telegram only, people can reach you without ever seeing your phone number.',
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
    'A private sticker stores nothing on any server. Your details are encrypted into the QR code itself and decrypted only in the browser of whoever opens it. That keeps them out of plain sight, but anyone with the link or a photo of the sticker can see the contact options you chose. If you would rather keep your number private, use Telegram only or a second number. To change your details, create a new sticker.',
  'c.eyebrow': 'Contact the driver of',
  'c.call': 'Call',
  'c.wa': 'WhatsApp',
  'c.tg': 'Telegram',
  'c.waMsg': 'Hello! I am contacting you about your car {plate}.',
  'c.check': 'Check that the plate matches the car before you get in touch.',
  'c.hint': 'Please be polite. The driver will see your number when you contact them.',
  'c.create': 'Create your own sticker',
  'bad.title': 'This code cannot be read',
  'bad.body': 'The link seems incomplete or damaged. Try scanning the QR code again.',
  'nav.account': 'Relay stickers & login',
  'acc.title': 'Relay stickers',
  'acc.lead':
    'A relay sticker keeps your phone number private: people message you through the Parkzettel Telegram bot instead of calling you. Log in with Telegram to manage your relay stickers.',
  'acc.stored': 'We keep only your numeric Telegram ID. Your name, username and photo are discarded, and the login cookie is used for nothing else.',
  'acc.in': 'You are logged in with Telegram.',
  'acc.logout': 'Log out',
  'acc.delete': 'Delete my account',
  'acc.deleteConfirm': 'Delete your account and everything stored for it?',
  'acc.error': 'Login did not work. Please try again.',
  'gen.relay': 'Rather keep your number private? Create a relay sticker instead.',
  'acc.new': 'New relay sticker',
  'acc.create': 'Create sticker',
  'acc.empty': 'You have no relay stickers yet.',
  'acc.limit': 'You can have up to 5 relay stickers.',
  'acc.active': 'Active',
  'acc.inactive': 'Switched off',
  'acc.turnOff': 'Switch off',
  'acc.turnOn': 'Switch on',
  'acc.remove': 'Delete',
  'acc.removeConfirm': 'Delete this sticker? Its QR code will stop working.',
  'acc.undeliverable': 'The bot could not message you. Open @ParkzettelBot in Telegram, press Start, then try again.',
  'r.lead': "Send the driver a message. They get it on Telegram, and neither of you sees the other's phone number.",
  'r.blocking': 'You are blocking me in',
  'r.lights': 'Your lights are on',
  'r.other': 'Something else',
  'r.textPh': 'Add a short message (optional)',
  'r.send': 'Send to the driver',
  'r.sent': 'Sent. The driver has been notified.',
  'r.waiting': 'Waiting for a reply…',
  'r.reply.coming': 'The driver is on the way.',
  'r.reply.soon': 'The driver will be there in about 10 minutes.',
  'r.reply.cant': "The driver can't come right now.",
  'r.off': 'This sticker is switched off.',
  'r.missing': 'This sticker does not exist (any more).',
  'r.limit': 'Too many messages. Please wait a few minutes.',
  'r.fail': 'The message could not be delivered. Please try again later.',
  'r.sending': 'Sending…',
  'r.agoNow': 'Sent just now.',
  'r.ago': 'Sent {min} min ago.',
  'r.keepOpen': 'Keep this page open to see the reply.',
  'r.reply.text': 'The driver wrote:',
  'r.more': 'Send another message',
  'r.needText': 'Please write a short message.',
  'foot': 'Private stickers need no account and store nothing.',
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
  'f.tgHint': 'Nur mit Telegram erreicht man Sie, ohne Ihre Telefonnummer zu sehen.',
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
    'Ein privater Aufkleber speichert nichts auf einem Server. Ihre Daten werden verschlüsselt im QR-Code selbst abgelegt und erst im Browser der Person entschlüsselt, die ihn öffnet. So stehen sie nicht im Klartext da, aber wer den Link oder ein Foto des Aufklebers hat, sieht die von Ihnen gewählten Kontaktwege. Wenn Ihre Nummer privat bleiben soll, nutzen Sie nur Telegram oder eine Zweitnummer. Für neue Daten erstellen Sie einfach einen neuen Aufkleber.',
  'c.eyebrow': 'Fahrer kontaktieren von',
  'c.call': 'Anrufen',
  'c.wa': 'WhatsApp',
  'c.tg': 'Telegram',
  'c.waMsg': 'Hallo! Ich melde mich wegen Ihres Autos {plate}.',
  'c.check': 'Prüfen Sie, ob das Kennzeichen zum Auto passt, bevor Sie Kontakt aufnehmen.',
  'c.hint': 'Bitte bleiben Sie freundlich. Der Fahrer sieht Ihre Nummer, wenn Sie ihn kontaktieren.',
  'c.create': 'Eigenen Aufkleber erstellen',
  'bad.title': 'Dieser Code ist nicht lesbar',
  'bad.body': 'Der Link scheint unvollständig oder beschädigt zu sein. Bitte scannen Sie den QR-Code erneut.',
  'nav.account': 'Relay-Aufkleber & Login',
  'acc.title': 'Relay-Aufkleber',
  'acc.lead':
    'Ein Relay-Aufkleber hält Ihre Telefonnummer privat: Man schreibt Ihnen über den Parkzettel-Bot in Telegram, statt Sie anzurufen. Melden Sie sich mit Telegram an, um Ihre Relay-Aufkleber zu verwalten.',
  'acc.stored': 'Wir speichern nur Ihre numerische Telegram-ID. Name, Benutzername und Foto werden verworfen, und das Login-Cookie dient nur der Anmeldung.',
  'acc.in': 'Sie sind mit Telegram angemeldet.',
  'acc.logout': 'Abmelden',
  'acc.delete': 'Mein Konto löschen',
  'acc.deleteConfirm': 'Ihr Konto und alle dazu gespeicherten Daten löschen?',
  'acc.error': 'Die Anmeldung hat nicht funktioniert. Bitte versuchen Sie es erneut.',
  'gen.relay': 'Nummer lieber privat halten? Erstellen Sie stattdessen einen Relay-Aufkleber.',
  'acc.new': 'Neuer Relay-Aufkleber',
  'acc.create': 'Aufkleber erstellen',
  'acc.empty': 'Sie haben noch keine Relay-Aufkleber.',
  'acc.limit': 'Sie können bis zu 5 Relay-Aufkleber haben.',
  'acc.active': 'Aktiv',
  'acc.inactive': 'Ausgeschaltet',
  'acc.turnOff': 'Ausschalten',
  'acc.turnOn': 'Einschalten',
  'acc.remove': 'Löschen',
  'acc.removeConfirm': 'Diesen Aufkleber löschen? Sein QR-Code funktioniert dann nicht mehr.',
  'acc.undeliverable': 'Der Bot konnte Ihnen nicht schreiben. Öffnen Sie @ParkzettelBot in Telegram, tippen Sie auf Start und versuchen Sie es erneut.',
  'r.lead': 'Schreiben Sie dem Fahrer eine Nachricht. Er erhält sie über Telegram, und keiner von Ihnen sieht die Telefonnummer des anderen.',
  'r.blocking': 'Sie parken mich zu',
  'r.lights': 'Bei Ihrem Auto ist das Licht an',
  'r.other': 'Etwas anderes',
  'r.textPh': 'Kurze Nachricht hinzufügen (optional)',
  'r.send': 'An den Fahrer senden',
  'r.sent': 'Gesendet. Der Fahrer wurde benachrichtigt.',
  'r.waiting': 'Warte auf Antwort…',
  'r.reply.coming': 'Der Fahrer ist unterwegs.',
  'r.reply.soon': 'Der Fahrer ist in etwa 10 Minuten da.',
  'r.reply.cant': 'Der Fahrer kann gerade nicht kommen.',
  'r.off': 'Dieser Aufkleber ist ausgeschaltet.',
  'r.missing': 'Diesen Aufkleber gibt es nicht (mehr).',
  'r.limit': 'Zu viele Nachrichten. Bitte warten Sie ein paar Minuten.',
  'r.fail': 'Die Nachricht konnte nicht zugestellt werden. Bitte versuchen Sie es später erneut.',
  'r.sending': 'Wird gesendet…',
  'r.agoNow': 'Gerade eben gesendet.',
  'r.ago': 'Vor {min} Min. gesendet.',
  'r.keepOpen': 'Lassen Sie diese Seite geöffnet, um die Antwort zu sehen.',
  'r.reply.text': 'Der Fahrer schreibt:',
  'r.more': 'Weitere Nachricht senden',
  'r.needText': 'Bitte schreiben Sie eine kurze Nachricht.',
  'foot': 'Private Aufkleber brauchen kein Konto und speichern nichts.',
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
  'f.tgHint': 'Con solo Telegram possono contattarti senza mai vedere il tuo numero di telefono.',
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
    "Un adesivo privato non salva nulla su nessun server. I tuoi dati sono cifrati nel codice QR stesso e decifrati solo nel browser di chi lo apre. Così non sono leggibili a colpo d'occhio, ma chiunque abbia il link o una foto dell'adesivo vede i contatti che hai scelto. Se vuoi tenere privato il tuo numero, usa solo Telegram o un secondo numero. Per cambiare i dati, crea un nuovo adesivo.",
  'c.eyebrow': 'Contatta il conducente di',
  'c.call': 'Chiama',
  'c.wa': 'WhatsApp',
  'c.tg': 'Telegram',
  'c.waMsg': 'Ciao! Ti scrivo per la tua auto {plate}.',
  'c.check': "Controlla che la targa corrisponda all'auto prima di contattare il conducente.",
  'c.hint': 'Sii gentile. Il conducente vedrà il tuo numero quando lo contatti.',
  'c.create': 'Crea il tuo adesivo',
  'bad.title': 'Questo codice non è leggibile',
  'bad.body': 'Il link sembra incompleto o danneggiato. Prova a scansionare di nuovo il codice QR.',
  'nav.account': 'Adesivi relay e accesso',
  'acc.title': 'Adesivi relay',
  'acc.lead':
    'Un adesivo relay tiene privato il tuo numero di telefono: ti scrivono tramite il bot Telegram di Parkzettel invece di chiamarti. Accedi con Telegram per gestire i tuoi adesivi relay.',
  'acc.stored': "Conserviamo solo il tuo ID numerico di Telegram. Nome, username e foto vengono scartati, e il cookie di accesso serve solo per l'accesso.",
  'acc.in': "Hai effettuato l'accesso con Telegram.",
  'acc.logout': 'Esci',
  'acc.delete': 'Elimina il mio account',
  'acc.deleteConfirm': 'Eliminare il tuo account e tutti i dati salvati?',
  'acc.error': "L'accesso non è riuscito. Riprova.",
  'gen.relay': 'Preferisci tenere privato il tuo numero? Crea invece un adesivo relay.',
  'acc.new': 'Nuovo adesivo relay',
  'acc.create': 'Crea adesivo',
  'acc.empty': 'Non hai ancora adesivi relay.',
  'acc.limit': 'Puoi avere fino a 5 adesivi relay.',
  'acc.active': 'Attivo',
  'acc.inactive': 'Spento',
  'acc.turnOff': 'Spegni',
  'acc.turnOn': 'Accendi',
  'acc.remove': 'Elimina',
  'acc.removeConfirm': 'Eliminare questo adesivo? Il suo codice QR smetterà di funzionare.',
  'acc.undeliverable': 'Il bot non è riuscito a scriverti. Apri @ParkzettelBot in Telegram, premi Avvia e riprova.',
  'r.lead': "Manda un messaggio al conducente. Lo riceve su Telegram, e nessuno dei due vede il numero di telefono dell'altro.",
  'r.blocking': 'Mi stai bloccando',
  'r.lights': 'Hai le luci accese',
  'r.other': 'Altro',
  'r.textPh': 'Aggiungi un breve messaggio (facoltativo)',
  'r.send': 'Invia al conducente',
  'r.sent': 'Inviato. Il conducente è stato avvisato.',
  'r.waiting': 'In attesa di risposta…',
  'r.reply.coming': 'Il conducente sta arrivando.',
  'r.reply.soon': 'Il conducente arriva tra circa 10 minuti.',
  'r.reply.cant': 'Il conducente non può venire ora.',
  'r.off': 'Questo adesivo è spento.',
  'r.missing': 'Questo adesivo non esiste (più).',
  'r.limit': 'Troppi messaggi. Aspetta qualche minuto.',
  'r.fail': 'Il messaggio non è stato consegnato. Riprova più tardi.',
  'r.sending': 'Invio in corso…',
  'r.agoNow': 'Inviato adesso.',
  'r.ago': 'Inviato {min} min fa.',
  'r.keepOpen': 'Tieni aperta questa pagina per vedere la risposta.',
  'r.reply.text': 'Il conducente scrive:',
  'r.more': 'Invia un altro messaggio',
  'r.needText': 'Scrivi un breve messaggio.',
  'foot': 'Gli adesivi privati non richiedono account e non salvano nulla.',
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
