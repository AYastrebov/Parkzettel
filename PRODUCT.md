# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Parkzettel has two users who never meet on purpose.

- **Owners:** drivers in Germany, Austria, Switzerland and Italy who sometimes park where they block someone (a courtyard, a double-parked street, a tight garage) and want to be reachable without writing their phone number on the windshield. They create a sticker once, at home or on a phone, print it and forget about it. They use the site in German, English or Italian.
- **Scanners:** whoever is blocked in. A stranger of any nationality, standing next to the car with a phone, usually in a hurry and annoyed, often outdoors (glare, rain, night). They have never heard of Parkzettel, have no account and install nothing. The pages they see come in ten languages (DE, EN, IT plus FR, ES, NL, PL, TR, UK, RU), chosen from the phone's language.

The product is public and aimed at growth in the DACH region and Italy.

## Product Purpose

Give a parked car's driver a way to be reached by the person they block, so the problem is solved in minutes instead of with honking, waiting or a tow truck. Success is a scanner reaching the driver from a cold scan, in their own language, within seconds, and the owner never having had to publish a phone number.

## Positioning

A free, privacy-first contact sticker with no app on either side, in two forms:

- **Private sticker:** the owner's contact options are AES-GCM encrypted into the QR link itself. No server is involved and nothing is stored anywhere.
- **Relay sticker:** the QR holds a short link; scanners message the owner through the Telegram bot @ParkzettelBot, the owner answers with one tap or their own text, and neither side sees the other's number. It can be edited, switched off or deleted without reprinting.

Commercial alternatives (for example hiddencontact.com) are paid and server-based. Parkzettel's "stores nothing" private sticker and a free relay over Telegram are claims they cannot truthfully copy.

## Operating Context

- The sticker is printed at home (an A4 sheet with two 8 cm stickers, or a PNG/SVG for a print shop) and stuck inside the windshield, facing out. It shows the site's domain under the code so people can see where it leads before scanning.
- Scanning happens with the phone's camera app; the scanner lands on a web page at `parkzettel.fyi`. Private stickers open `/#<token>`, relay stickers `/s/<id>`.
- Private stickers offer call, WhatsApp (prefilled message naming the plate) and Telegram. Relay stickers offer preset messages ("You are blocking me in", "Your lights are on") or free text, and show the owner's reply live on the page.
- Owners manage relay stickers at `/account`, logged in with Telegram.
- The site is shared through a landing page at `/` with link previews; the generator lives at `/create`.

## Capabilities and Constraints

- Static Vite + TypeScript site on Netlify; relay stickers use Netlify Functions and Netlify Blobs. Netlify's free plan pauses the site when monthly credits run out, which would break every printed sticker.
- **Printed stickers are permanent:** both link formats (`/#1…` and `/s/<id>`) must stay supported forever; a format change means a new version prefix alongside the old one.
- **Private stickers never touch the server.** Relay storage is limited to numeric Telegram IDs, plates, country codes, notes and 24-hour messages; never names, usernames, phone numbers or raw IP addresses.
- No third-party code on pages scanners see; Telegram's login script loads only on the account page.
- Plates: the 27 EU countries plus 14 non-EU European countries.
- Printed sticker text exists only in German, English and Italian (the embedded font covers basic Latin only).
- Terminology: "private sticker", "relay sticker", "owner"/"driver", "scanner"/"the person blocked in". German UI uses formal *Sie*, Italian informal *tu*; copy avoids em dashes.
- Undecided: none recorded beyond the above.

## Brand Commitments

- Name: **Parkzettel** (a "Parkzettel" is the note left behind a windshield wiper). Tagline: "The digital note behind your windshield wiper." / "Der digitale Zettel hinter dem Scheibenwischer." / "Il biglietto digitale sotto il tergicristallo."
- Domain `parkzettel.fyi`; Telegram bot @ParkzettelBot with its avatar (`docs/bot-avatar.png`).
- **Free forever, no ads, no tracking cookies.** These are permanent commitments, not launch offers. The code is public on GitHub.
- Honest about limits: the site says plainly who can see what (a private sticker's contact options are visible to anyone with the link or a photo of it; encryption does not prove who made a sticker).

## Evidence on Hand

- Real product screenshots in `docs/` (generator, landing page, account page, contact and relay pages), the link-preview card `public/og.png`, and stickers rendered by the real generator.
- **No users, testimonials, usage numbers, ratings or press exist yet.** Future pages must not invent or imply any (no "trusted by", counters, quotes or logos).

## Product Principles

1. **Never strand a printed sticker.** Anything already on a windshield keeps working, through format changes, redesigns and moves.
2. **Private by default, minimal by design.** The private sticker stays the default and stores nothing; relay stickers store the least that makes them work.
3. **Design for the stranger in a hurry.** A cold scan by someone stressed, outdoors, in any of ten languages, on any phone, with no app or account, must reach the driver in seconds.
4. **Free means free.** No ads, no paywalls, no dark patterns; nothing that turns a parking problem into a funnel.
5. **Say exactly what is true.** Privacy and security claims match the implementation, including their limits.
