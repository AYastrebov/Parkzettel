# AGENTS.md

Parkzettel is a static web app (Vite + vanilla TypeScript, no framework) that makes QR car stickers.
It has two modes, chosen in `src/main.ts` by the URL fragment:

- `/`: landing page (`src/landing.ts`), the page people share.
- `/create`: generator (`src/generator.ts`). The owner enters plate and contact channels and downloads a sticker.
- `/#<token>`: private sticker contact page (`src/contact.ts`). Printed stickers point here, so `/` with a
  fragment must always open the contact page, and the generator always encodes the root URL.
- `/s/<id>`: relay sticker page (`src/relay.ts`); `/account`: owner page (`account.html`).

There is no backend. Contact data lives only in the encrypted token inside the QR code.

## Commands

- Install: `npm install`
- Dev server: `npm run dev` (http://localhost:5173), frontend only
- With functions: `npx netlify-cli dev` (http://localhost:8888). Set `SESSION_SECRET`, `TELEGRAM_BOT_TOKEN`
  and `TELEGRAM_WEBHOOK_SECRET` to dummy values in the shell. The account page shows a "Dev login" button on
  localhost, because Telegram's widget only works on the registered domain. Add `TELEGRAM_DRY_RUN=1` to log
  bot calls instead of sending them.
- Type-check and build: `npm run build`. Run it after every change; it must pass with zero errors.
- Preview the production build: `npm run preview`

There is no automated test suite. Check changes in a browser: create a sticker in the generator, open
the "Test the page" link, and confirm the buttons' `href`s. Do this in at least one non-English language.

## Hard rules

1. **Never break printed stickers.** Tokens produced by `seal()` in `src/codec.ts` are printed on cars and
   cannot be updated. `open()` must keep decoding every token version that was ever released. To change
   the format, add a new version prefix (`'2'`, …) and keep the old decoder. Never change the meaning of
   the short payload keys (`p`, `c`, `w`, `t`, `n`, and `w: '='`).
2. **Private stickers never touch the server.** The `#token` flow (generator → contact page) must keep working
   with no backend call and send nothing off the device. Server code (`netlify/functions/`) exists only for the
   opt-in relay stickers and Telegram login. It stores the minimum: numeric Telegram IDs, never names, usernames,
   phone numbers or raw IPs. Use `store()` from `netlify/lib/stores.ts`, which keeps non-production deploys out
   of production data. No analytics or error reporting services of our own. Netlify injects its Real User
   Monitoring script (performance timings, no cookies, no URL) and the two HTML `<meta>` CSPs allow its collector
   in `connect-src`; keep it that way unless the owner turns RUM off in Netlify.
3. **No external requests at runtime,** with one exception: the account page (`account.html`) loads Telegram's
   login widget. Scanner and generator pages load nothing from third parties: no CDNs, Google Fonts or remote
   images. Bundle fonts through `@fontsource/*`. Each HTML page sets its own CSP in a `<meta>` tag; keep the
   one in `index.html` strict, and only widen `account.html` for Telegram.
4. **Treat decoded data as untrusted.** Anyone can craft a token. Insert user values with `textContent`
   or `esc()` in `src/sticker.ts`, never by building `innerHTML` from them. Build links only from validated
   values: E.164 phone numbers and Telegram usernames matching `^[a-zA-Z][a-zA-Z0-9_]{4,31}$`.
5. **Keep the languages in sync.** Every user-visible string goes through `t()` / `data-i18n` in `src/i18n.ts`.
   Two tiers: full languages (DE, EN, IT: every key, `Dict`) and scanner languages (FR, ES, NL, PL, TR, UK, RU:
   only `ScannerKey`, i.e. `c.*`, `r.*`, `bad.*`, `foot`, `nav.account`; everything else falls back to EN). Both
   types make a missing key a build error. A new scanner-facing key therefore needs ten translations. Write
   German with formal *Sie*, Italian with informal *tu* (matching the existing strings), formal address in the
   scanner languages, and avoid em dashes in copy. Bot texts (`netlify/lib/bot-text.ts`) stay DE/EN/IT.
6. **Sticker SVG must stay self-contained.** `stickerSvg()` output is rasterized via `<img>`, which cannot load
   external resources. Use inline shapes only; the font is embedded as a `?inline` data URL.

7. **Relay stickers never reveal the owner.** Scanner-facing endpoints (`/api/s/*`, `/api/m/*`) return plate,
   country, note, active flag and reply only, never the Telegram ID. Bot replies are accepted only from the
   sticker's owner, including free-text replies (routed via `tg|<chat>|<telegram message id>` refs in the
   `messages` store) and the switch-off button. Owner-facing bot texts live in `netlify/lib/bot-text.ts`
   (DE/EN/IT, same tone rules).

## Code style

- TypeScript strict mode; `noUnusedLocals` and `noUnusedParameters` are on.
- Two-space indent, single quotes, no semicolons, trailing commas in multi-line literals.
- Plain DOM APIs and template strings; no UI framework. Keep dependencies minimal (currently only
  `qrcode` and a bundled font). Ask before adding one.
- Comments explain *why*, sparingly. Match the density of the surrounding code.
- Styling lives in `src/style.css` with CSS custom properties on `:root` and a `prefers-color-scheme: dark`
  override. Keep the contact page usable at 360 px wide.
- Visual language is German road signage: RAL traffic yellow/black, Barlow Condensed for anything that reads
  as a sign (plate, headings, buttons), Barlow for body text. EU blue appears only on the plate. Avoid generic
  card layouts, all-caps eyebrow labels and decorative motion.

## Project layout

```
src/chrome.ts      shared header, language switcher, footer
src/main.ts        public app entry: routing (/s/<id>, /#token, /create, / → landing)
src/landing.ts     landing page
src/account.ts     owner account page: Telegram login, relay sticker management
src/relay.ts       relay scan page (/s/<id>): message the owner, poll for the reply
netlify/functions/ API: login, session (/api/me), stickers, relay (/api/s, /api/m), webhook, cleanup
netlify/lib/       server helpers: crypto, session cookie, Blobs stores + types, validation, rate limit,
                   Telegram API, owner-facing bot texts (bot-text.ts)
src/generator.ts   create mode: form, validation, preview, downloads
src/contact.ts     scan mode
src/codec.ts       payload packing + AES-GCM seal/open (token format lives here)
src/sticker.ts     sticker SVG and PNG export
src/i18n.ts        full (DE/EN/IT) and scanner-tier dictionaries, language detection, picker names
src/icons.ts       Lucide-derived icon paths (ISC)
src/share.ts       print sheet (two 80 mm copies, print CSS in style.css) and Web Share of the PNG
src/plate.ts       EU plate stars and country codes
docs/              README screenshots
netlify.toml       Netlify build + headers (production: parkzettel.fyi)
```

## Gotchas

- Web Crypto (`crypto.subtle`) exists only on HTTPS or `localhost`. Over a plain-HTTP LAN address the contact
  page fails to decrypt and shows the error view.
- The QR encodes the full URL of the page the generator runs on, so stickers made on `localhost` only work
  on that machine.
- Vite builds two pages (`index.html`, `account.html`); `/account` is routed to `account.html` in `netlify.toml`.
- Secrets (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `SESSION_SECRET`) live only in Netlify environment
  variables scoped to Functions. Never expose them to the Vite build (`import.meta.env`).
- Open Graph tags in `index.html` use absolute `https://parkzettel.fyi/` URLs; update them (and
  `SITE` in `scripts/og-image.mjs`, then `npm run og-image`) if the domain changes.
- The domain is registered at Cloudflare; its DNS records point to Netlify with the proxy off (grey cloud).
  Proxying would hide visitors' IPs from `context.ip` (relay rate limit) and put a third party in the path.
- Stickers printed before the move encode `https://parkzettel.netlify.app/`. Netlify redirects that host to
  the primary domain, keeping the path and the `#token` fragment. Never delete the site or rename the
  `parkzettel` subdomain.
- The Telegram webhook is registered by `POST /api/telegram/setup` on production; rerun it if the URL changes,
  because Telegram does not follow redirects. The Login Widget needs the domain set in BotFather (`/setdomain`).
- Token length drives QR density. Don't add payload fields or long defaults without a good reason.

## Commits and PRs

- Imperative, concise subject lines (`Add Spanish translation`, `Fix WhatsApp link for numbers with spaces`).
- When the UI changes, regenerate the screenshots: start `netlify dev` as described under Commands (with
  `TELEGRAM_DRY_RUN=1`), run `npx playwright install chromium` once, then `npm run screenshots`. Phone shots get
  a device frame from `scripts/frame.mjs`. Mention it in the PR.
- If a change touches `src/codec.ts`, state in the PR how existing tokens stay decodable.

## Deploys

Netlify deploys `main` to https://parkzettel.fyi/ and builds a preview for every PR. The account is on
Netlify's credit-based free plan: each production deploy costs 15 of 300 monthly credits, and the site is paused
when they run out. Batch changes into one PR rather than pushing many small commits to `main`.
