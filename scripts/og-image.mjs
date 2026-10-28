// Renders public/og.png, the 1200x630 card shown when someone shares a Parkzettel link.
// The sticker in it is drawn by src/sticker.ts (through a throwaway Vite server) with the production URL.
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const SITE = 'https://parkzettel.netlify.app/'

const file = (p) => readFileSync(new URL(p, import.meta.url))
const b64 = (p) => file(p).toString('base64')
const font = (w) => `url(data:font/woff2;base64,${b64(`../node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-${w}-normal.woff2`)})`
const body = `url(data:font/woff2;base64,${b64('../node_modules/@fontsource/barlow/files/barlow-latin-400-normal.woff2')})`
const logo = `data:image/svg+xml;base64,${b64('../public/favicon.svg')}`

const html = `<style>
  @font-face { font-family: S; font-weight: 600; src: ${font(600)} }
  @font-face { font-family: S; font-weight: 700; src: ${font(700)} }
  @font-face { font-family: B; src: ${body} }
  html, body { margin: 0 }
  .card { width: 1200px; height: 630px; box-sizing: border-box; background: #eef0f0; display: flex; align-items: center;
          padding: 0 0 0 80px; position: relative; overflow: hidden; font-family: B; color: #1e1e1e }
  .band { position: absolute; right: 0; top: 0; bottom: 0; width: 420px; background: #f7ba0b }
  .text { position: relative; width: 640px }
  .brand { display: flex; align-items: center; gap: 16px; font: 700 44px/1 S; margin-bottom: 36px }
  .brand img { width: 56px; height: 56px }
  h1 { font: 700 72px/1.02 S; margin: 0 0 18px }
  .de { font: 600 36px/1.1 S; color: #565b60; margin: 0 0 30px }
  .plate { display: inline-flex; height: 70px; border: 4px solid #1e1e1e; border-radius: 10px; overflow: hidden; background: #fff }
  .eu { width: 40px; background: #003399; color: #fff; font: 700 18px S; display: grid; place-items: end center; padding-bottom: 8px }
  .num { font: 600 44px/70px S; letter-spacing: .06em; padding: 0 22px }
  .sticker { position: absolute; right: 120px; top: 70px; width: 340px; transform: rotate(-5deg);
             filter: drop-shadow(0 2px 2px rgba(0,0,0,.3)) drop-shadow(0 22px 30px rgba(0,0,0,.25)) }
</style>
<div class="card">
  <div class="band"></div>
  <div class="text">
    <div class="brand"><img src="${logo}">Parkzettel</div>
    <h1>The digital note behind your windshield wiper.</h1>
    <p class="de">Der digitale Zettel hinter dem Scheibenwischer.</p>
    <div class="plate"><span class="eu">D</span><span class="num">M-PZ 2026</span></div>
  </div>
  <img class="sticker" src="__STICKER__">
</div>`

const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {})
const vite = await createServer({ root: new URL('..', import.meta.url).pathname, server: { port: 0 }, logLevel: 'silent' })
await vite.listen()
const v = await b.newPage()
await v.goto(vite.resolvedUrls.local[0] + 'favicon.svg')
const sticker = await v.evaluate(async (site) => {
  const { stickerSvg } = await import('/src/sticker.ts')
  const svg = await stickerSvg(site, { title: 'Blocking you?', sub: 'Scan to contact the driver', domain: new URL(site).host }, ['call', 'whatsapp', 'telegram'])
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
}, SITE)
await vite.close()

const p = await b.newPage({ viewport: { width: 1200, height: 630 } })
await p.setContent(html.replace('__STICKER__', sticker))
await p.evaluate(() => document.fonts.ready)
await p.screenshot({ path: new URL('../public/og.png', import.meta.url).pathname })
await b.close()
console.log('public/og.png written')
