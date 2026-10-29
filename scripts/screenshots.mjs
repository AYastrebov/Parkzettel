// Regenerates docs/*.png for the README. Needs `netlify dev` on :8888 with TELEGRAM_DRY_RUN=1
// (see README "Run locally") and a Playwright Chromium (`npx playwright install chromium`).
// Phone screenshots are wrapped in a device frame by frame.mjs.
import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const out = new URL('../docs/', import.meta.url).pathname
const base = 'http://localhost:8888'
const hook = { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': process.env.TELEGRAM_WEBHOOK_SECRET ?? 'dev' }
const phone = { width: 390, height: 844 }
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {})

// Owner creates a relay sticker; account page (desktop, EN).
const en = await b.newContext({ locale: 'en-US', viewport: { width: 1180, height: 1040 }, deviceScaleFactor: 2 })
const a = await en.newPage()
await a.goto(base + '/account')
await a.click('.dev-login')
await a.waitForSelector('.acc-in:not([hidden])')
await a.selectOption('.new-sticker [name=country]', 'D')
await a.fill('.new-sticker [name=plate]', 'M-PZ 2026')
await a.fill('.new-sticker [name=note]', 'Parked in the courtyard, I come quickly')
await a.click('.new-sticker button[type=submit]')
await a.waitForSelector('.sticker-item')
const relayUrl = await a.getAttribute('.sticker-item [data-act=open]', 'href')
await a.evaluate(() => scrollTo(0, 0))
await a.screenshot({ path: out + 'account.png' })

// Generator (desktop, EN), private sticker URL and PNG.
const g = await en.newPage()
await g.goto(base + '/create')
await g.selectOption('[name=country]', 'D')
await g.fill('[name=plate]', 'M-PZ 2026')
await g.fill('[name=phone]', '+49 170 1234567')
await g.fill('[name=telegram]', 'parkzettel_demo')
await g.fill('[name=note]', 'I work in the building next door')
await g.waitForSelector('.sticker:not(.draft) svg')
await g.evaluate(() => scrollTo(0, 0))
await g.waitForTimeout(300)
await g.screenshot({ path: out + 'generator.png' })
const privateUrl = await g.getAttribute('[data-act=test]', 'href')
// The README sticker shows the production domain, not localhost; it is drawn by the same module.
const png = await g.evaluate(async () => {
  const { stickerSvg, svgToPngBlob } = await import('/src/sticker.ts')
  const site = 'https://parkzettel.fyi/'
  const svg = await stickerSvg(site, { title: 'Blocking you?', sub: 'Scan to contact the driver', domain: new URL(site).host }, ['call', 'whatsapp', 'telegram'])
  const bytes = new Uint8Array(await (await svgToPngBlob(svg)).arrayBuffer())
  return btoa(Array.from(bytes, (x) => String.fromCharCode(x)).join(''))
})
writeFileSync(out + 'sticker-en.png', Buffer.from(png, 'base64'))

// Landing page (desktop, EN), above the fold.
const l = await en.newPage()
await l.goto(base + '/')
await l.waitForSelector('.l-sticker svg')
await l.waitForTimeout(300)
await l.screenshot({ path: out + 'landing.png' })

// Phone pages (DE): private contact page, and relay page after a text reply from the owner.
const tmp = mkdtempSync(join(tmpdir(), 'pz-shots-'))
const de = await b.newContext({ locale: 'de-DE', viewport: phone, deviceScaleFactor: 2 })
const c = await de.newPage()
await c.goto(privateUrl)
await c.waitForSelector('.plate-num:not(:empty)')
await c.waitForTimeout(200)
await c.screenshot({ path: join(tmp, 'contact-de.png') })

const r = await de.newPage()
await r.goto(relayUrl)
await r.waitForSelector('.plate-num:not(:empty)')
await r.click('.relay-form button')
await r.waitForSelector('.relay-status:not([hidden])')
// In dry-run mode every bot message gets Telegram message_id 1, which is what the reply refers to.
await a.request.post(base + '/api/telegram', {
  headers: hook,
  data: { message: { message_id: 9, chat: { id: 1, type: 'private' }, text: 'Bin im Café gegenüber, 2 Minuten', reply_to_message: { message_id: 1 } } },
})
await r.waitForSelector('.status-quote:not([hidden])', { timeout: 10000 })
await r.waitForTimeout(200)
await r.screenshot({ path: join(tmp, 'relay-reply.png') })
await b.close()

for (const name of ['contact-de', 'relay-reply']) {
  execFileSync('node', [new URL('./frame.mjs', import.meta.url).pathname, join(tmp, name + '.png'), out + name + '.png'], { stdio: 'inherit' })
}
console.log('screenshots written to', out)
