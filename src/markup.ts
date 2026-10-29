import { LANG_NAMES, tIn, type Key, type Lang } from './i18n'
import { icon } from './icons'
import { EU_STARS_SVG } from './plate'

// Page markup shared by the app and the build-time prerender in vite.config.ts, so it must not touch the DOM.
// Text goes into empty [data-i18n] elements: translate() fills them in the browser, fillText() at build time.

export const GITHUB = 'https://github.com/AYastrebov/Parkzettel'

export const escHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Header with language picker, the view, and the footer.
export const chromeHtml = (l: Lang, view = '', viewClass = '') => `
<header class="top">
  <a class="brand" href="/"><img src="/favicon.svg" alt="" width="28" height="28" />Parkzettel</a>
  <label class="langs"><span class="visually-hidden">Language</span><select>${(Object.keys(LANG_NAMES) as Lang[])
    .map((o) => `<option value="${o}"${o === l ? ' selected' : ''}>${LANG_NAMES[o]}</option>`)
    .join('')}</select></label>
</header>
<main id="view"${viewClass ? ` class="${viewClass}"` : ''}>${view}</main>
<footer class="foot"><span class="foot-text" data-i18n="foot"></span> <a class="foot-link" href="/account" data-i18n="nav.account"></a></footer>`

// Question and answer keys; also the source of the FAQPage structured data.
export const FAQ: [Key, Key][] = [
  ['l.q1', 'l.a1'],
  ['l.q2', 'l.a2'],
  ['l.q3', 'l.a3'],
  ['l.q4', 'l.a4'],
]

export const LANDING = `
<section class="l-hero">
  <div class="l-hero-text">
    <h1 data-i18n="gen.title"></h1>
    <p class="lead" data-i18n="l.lead"></p>
    <div class="l-cta-row">
      <a class="btn primary l-cta" href="/create" data-i18n="l.cta"></a>
      <button type="button" class="btn l-cta" data-act="share" data-i18n="l.share"></button>
    </div>
    <p class="small"><span data-i18n="l.free"></span> <a class="l-gh-inline" href="${GITHUB}" rel="noopener" data-i18n="l.github"></a></p>
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
  ${FAQ.map(([q, a]) => `<details><summary data-i18n="${q}"></summary><p data-i18n="${a}"></p></details>`).join('')}
</section>

<section class="l-end">
  <h2 data-i18n="l.endTitle"></h2>
  <div class="l-cta-row">
    <a class="btn primary l-cta" href="/create" data-i18n="l.cta"></a>
    <button type="button" class="btn l-cta" data-act="share" data-i18n="l.share"></button>
  </div>
  <a class="l-gh" href="${GITHUB}" rel="noopener">${icon('github', 20)}<span data-i18n="l.github"></span></a>
</section>`

// Fills every empty [data-i18n] element in a markup string, for pages rendered without a DOM.
export const fillText = (html: string, l: Lang) =>
  html.replace(/(<(\w+)\b[^>]*\sdata-i18n="([\w.]+)"[^>]*>)(<\/\2>)/g, (_, open, _tag, key, close) => open + escHtml(tIn(l, key as Key)) + close)
