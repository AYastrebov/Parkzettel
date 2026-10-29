import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { LANGS, tIn, type FullLang, type Key } from './src/i18n'
import { chromeHtml, escHtml, FAQ, fillText, LANDING } from './src/markup'

// Production origin for canonical URLs, hreflang, the sitemap and robots.txt. Update it, and the Open Graph
// tags in index.html, if the domain changes.
const SITE = 'https://parkzettel.fyi'

const LOCALE: Record<FullLang, string> = { de: 'de_DE', en: 'en_US', it: 'it_IT' }
const langs = Object.keys(LANGS) as FullLang[]
const pageUrl = (l: FullLang) => `${SITE}/${l}/`

// Swaps one known tag in the built index.html; fails the build if the markup no longer matches.
function swap(html: string, pattern: RegExp, by: string) {
  if (!pattern.test(html)) throw new Error(`prerender: ${pattern} not found in index.html`)
  return html.replace(pattern, () => by)
}

const jsonLd = (l: FullLang) =>
  JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Parkzettel',
      url: pageUrl(l),
      inLanguage: l,
      description: tIn(l, 'l.lead'),
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: l,
      mainEntity: FAQ.map(([q, a]) => ({
        '@type': 'Question',
        name: tIn(l, q),
        acceptedAnswer: { '@type': 'Answer', text: tIn(l, a) },
      })),
    },
  ]).replace(/</g, '\\u003c')

// The landing page in one language, as plain HTML: crawlers that don't run JavaScript see the full text,
// and the app script re-renders the same markup on load.
function landingPage(shell: string, l: FullLang) {
  const text = (k: Key) => escHtml(tIn(l, k))
  const head = [
    `<link rel="canonical" href="${pageUrl(l)}" />`,
    ...langs.map((o) => `<link rel="alternate" hreflang="${o}" href="${pageUrl(o)}" />`),
    `<link rel="alternate" hreflang="x-default" href="${pageUrl('en')}" />`,
    `<meta property="og:locale" content="${LOCALE[l]}" />`,
    `<script type="application/ld+json">${jsonLd(l)}</script>`,
  ]
  let html = shell
  html = swap(html, /<html lang="en">/, `<html lang="${l}">`)
  html = swap(html, /<title>[^<]*<\/title>/, `<title>${text('l.title')}</title>`)
  html = swap(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${text('l.lead')}" />`)
  html = swap(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${pageUrl(l)}" />`)
  html = swap(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${text('l.title')}" />`)
  html = swap(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${text('l.shareText')}" />`)
  html = swap(html, /<\/head>/, `  ${head.join('\n    ')}\n  </head>`)
  return swap(html, /<div id="app"><\/div>/, `<div id="app">${fillText(chromeHtml(l, LANDING, 'view-landing'), l)}</div>`)
}

const sitemap = () => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${langs
  .map(
    (l) => `  <url>
    <loc>${pageUrl(l)}</loc>
${langs.map((o) => `    <xhtml:link rel="alternate" hreflang="${o}" href="${pageUrl(o)}" />`).join('\n')}
  </url>`,
  )
  .join('\n')}
  <url><loc>${SITE}/create</loc></url>
</urlset>
`

// Relay pages (/s/*) and /account stay crawlable so search engines can see their noindex (netlify.toml).
const robots = () => `User-agent: *
Disallow: /api/

Sitemap: ${SITE}/sitemap.xml
`

function prerender(): Plugin {
  let out = ''
  return {
    name: 'parkzettel-prerender',
    apply: 'build',
    configResolved(c) {
      out = resolve(c.root, c.build.outDir)
    },
    closeBundle() {
      const shell = readFileSync(resolve(out, 'index.html'), 'utf8')
      for (const l of langs) {
        mkdirSync(resolve(out, l), { recursive: true })
        writeFileSync(resolve(out, l, 'index.html'), landingPage(shell, l))
      }
      writeFileSync(resolve(out, 'sitemap.xml'), sitemap())
      writeFileSync(resolve(out, 'robots.txt'), robots())
    },
  }
}

// Two pages: the public app (generator + contact page) and the owner account page, which is the only
// one allowed to load Telegram's login widget (see the CSP meta tags in each HTML file). The landing page is
// also prerendered once per full language (see above).
export default defineConfig({
  plugins: [prerender()],
  build: {
    rollupOptions: {
      input: { main: 'index.html', account: 'account.html' },
    },
  },
})
