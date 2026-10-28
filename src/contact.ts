import { open, type Contact } from './codec'
import { onLangChange, t, translate } from './i18n'
import { icon } from './icons'
import { EU_STARS_SVG } from './plate'

const TEMPLATE = `
<h1 class="plate">
  <span class="visually-hidden" data-i18n="c.eyebrow"></span>
  <span class="plate-eu" aria-hidden="true">${EU_STARS_SVG}<span class="plate-country"></span></span>
  <span class="plate-num"></span>
</h1>
<p class="note" hidden></p>
<p class="check-plate" data-i18n="c.check"></p>
<div class="contact-actions">
  <a class="big call" data-ch="call" hidden>${icon('call', 28)}<span data-i18n="c.call"></span></a>
  <a class="big wa" data-ch="whatsapp" hidden target="_blank" rel="noopener">${icon('whatsapp', 28)}<span data-i18n="c.wa"></span></a>
  <a class="big tg" data-ch="telegram" hidden target="_blank" rel="noopener">${icon('telegram', 28)}<span data-i18n="c.tg"></span></a>
</div>
<p class="hint" data-i18n="c.hint"></p>
<a class="create" href="./" data-i18n="c.create"></a>`

const BAD = `
<div class="bad">
  <h1 data-i18n="bad.title"></h1>
  <p data-i18n="bad.body"></p>
  <a class="btn primary" href="./" data-i18n="c.create"></a>
</div>`

function fill(root: HTMLElement, c: Contact) {
  translate(root)
  root.querySelector('.plate-num')!.textContent = c.plate
  root.querySelector('.plate-country')!.textContent = c.country ?? ''
  document.title = `${c.plate} · Parkzettel`
  const note = root.querySelector<HTMLElement>('.note')!
  note.hidden = !c.note
  note.textContent = c.note ?? ''

  const link = (ch: string) => root.querySelector<HTMLAnchorElement>(`[data-ch="${ch}"]`)!
  if (c.call) {
    link('call').href = 'tel:' + c.call
    link('call').hidden = false
  }
  if (c.whatsapp) {
    const text = encodeURIComponent(t('c.waMsg', { plate: c.plate }))
    link('whatsapp').href = `https://wa.me/${c.whatsapp.slice(1)}?text=${text}`
    link('whatsapp').hidden = false
  }
  if (c.telegram) {
    link('telegram').href = 'https://t.me/' + c.telegram
    link('telegram').hidden = false
  }
}

export async function renderContact(root: HTMLElement, token: string) {
  root.className = 'view-contact'
  let contact: Contact
  try {
    contact = await open(token)
  } catch {
    root.innerHTML = BAD
    translate(root)
    onLangChange(() => translate(root))
    return
  }
  root.innerHTML = TEMPLATE
  fill(root, contact)
  onLangChange(() => fill(root, contact))
}
