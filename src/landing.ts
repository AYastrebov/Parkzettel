import { LANG_NAMES, onLangChange, t, translate, type Lang } from './i18n'
import { icon } from './icons'
import { EU_STARS_SVG } from './plate'

// Marketing page at "/". The generator lives at /create; printed private stickers (/#token) and relay
// stickers (/s/<id>) are routed in main.ts before this page is considered.

const TEMPLATE = `
<section class="l-hero">
  <div class="l-hero-text">
    <h1 data-i18n="gen.title"></h1>
    <p class="lead" data-i18n="l.lead"></p>
    <div class="l-cta-row">
      <a class="btn primary l-cta" href="/create" data-i18n="l.cta"></a>
      <button type="button" class="btn l-cta" data-act="share" data-i18n="l.share"></button>
    </div>
    <p class="small" data-i18n="l.free"></p>
  </div>
  <div class="l-hero-visual" aria-hidden="true">
    <div class="l-phone">
      <div class="l-screen">
        <div class="plate">
          <span class="plate-eu">${EU_STARS_SVG}<span class="plate-country">D</span></span>
          <span class="plate-num">M-PZ 2026</span>
        </div>
        <p class="check-plate" data-i18n="c.check"></p>
        <span class="big call">${icon('call', 22)}<span data-i18n="c.call"></span></span>
        <span class="big wa">${icon('whatsapp', 22)}<span data-i18n="c.wa"></span></span>
        <span class="big tg">${icon('telegram', 22)}<span data-i18n="c.tg"></span></span>
      </div>
    </div>
    <div class="l-sticker"></div>
  </div>
</section>

<section class="l-problem">
  <h2 data-i18n="l.problemTitle"></h2>
  <p data-i18n="l.problemBody"></p>
</section>

<section class="l-how">
  <h2 data-i18n="l.howTitle"></h2>
  <ol class="l-steps">
    <li><h3 data-i18n="l.step1"></h3><p data-i18n="l.step1Body"></p></li>
    <li><h3 data-i18n="l.step2"></h3><p data-i18n="l.step2Body"></p></li>
    <li><h3 data-i18n="l.step3"></h3><p data-i18n="l.step3Body"></p></li>
  </ol>
</section>

<section class="compare">
  <h2 data-i18n="cmp.title"></h2>
  <div class="compare-grid">
    <div>
      <h3 data-i18n="cmp.private"></h3>
      <ul><li data-i18n="cmp.p1"></li><li data-i18n="cmp.p2"></li><li data-i18n="cmp.p3"></li></ul>
      <a class="btn" href="/create" data-i18n="l.cta"></a>
    </div>
    <div>
      <h3 data-i18n="cmp.relay"></h3>
      <ul><li data-i18n="cmp.r1"></li><li data-i18n="cmp.r2"></li><li data-i18n="cmp.r3"></li></ul>
      <a class="btn" href="/account" data-i18n="cmp.relayLink"></a>
    </div>
  </div>
</section>

<section class="l-split">
  <div>
    <h2 data-i18n="l.privTitle"></h2>
    <ul class="l-checks">
      <li data-i18n="l.priv1"></li><li data-i18n="l.priv2"></li><li data-i18n="l.priv3"></li><li data-i18n="l.priv4"></li>
    </ul>
  </div>
  <div>
    <h2 data-i18n="l.langTitle"></h2>
    <p data-i18n="l.langBody"></p>
    <ul class="l-chips">${(Object.keys(LANG_NAMES) as Lang[]).map((l) => `<li lang="${l}">${LANG_NAMES[l]}</li>`).join('')}</ul>
  </div>
</section>

<section class="l-faq">
  <h2 data-i18n="l.faqTitle"></h2>
  ${[1, 2, 3, 4].map((n) => `<details><summary data-i18n="l.q${n}"></summary><p data-i18n="l.a${n}"></p></details>`).join('')}
</section>

<section class="l-end">
  <h2 data-i18n="l.endTitle"></h2>
  <div class="l-cta-row">
    <a class="btn primary l-cta" href="/create" data-i18n="l.cta"></a>
    <button type="button" class="btn l-cta" data-act="share" data-i18n="l.share"></button>
  </div>
</section>`

export function renderLanding(root: HTMLElement) {
  root.className = 'view-landing'
  root.innerHTML = TEMPLATE
  const home = new URL('/', location.href).href

  // The sticker is drawn by the same code as real stickers. Its QR leads back to this page.
  // Loaded after first paint, because it pulls in the QR library and the embedded font.
  const drawSticker = async () => {
    const { stickerSvg } = await import('./sticker')
    root.querySelector('.l-sticker')!.innerHTML = await stickerSvg(home, { title: t('s.title'), sub: t('s.sub'), domain: location.host }, [
      'call',
      'whatsapp',
      'telegram',
    ])
  }

  const sync = () => {
    translate(root)
    document.title = t('l.title')
    drawSticker()
  }
  sync()
  onLangChange(sync)

  // Phones get the share sheet; elsewhere the link is copied.
  root.querySelectorAll<HTMLButtonElement>('[data-act="share"]').forEach((b) =>
    b.addEventListener('click', async () => {
      if (navigator.share) {
        await navigator.share({ title: 'Parkzettel', text: t('l.shareText'), url: home }).catch(() => {})
        return
      }
      await navigator.clipboard.writeText(home)
      b.textContent = t('l.copied')
      setTimeout(() => (b.textContent = t('l.share')), 1500)
    }),
  )
}
