---
name: Parkzettel
description: The digital note behind your windshield wiper. A road-sign design system for QR car stickers.
colors:
  traffic-yellow: "#f7ba0b"
  traffic-black: "#1e1e1e"
  traffic-white: "#eef0f0"
  sign-white: "#ffffff"
  road-grey: "#565b60"
  rule-grey: "#cfd3d6"
  eu-plate-blue: "#003399"
  eu-star-yellow: "#ffdd00"
  signal-blue: "#005387"
  stop-red: "#b3261e"
  whatsapp-green: "#1faa53"
  telegram-blue: "#229ed9"
  plate-placeholder: "#c4c8cb"
  device-black: "#101113"
  asphalt: "#23262a"
  asphalt-raised: "#2e3236"
  asphalt-grey: "#a3a9ae"
  asphalt-rule: "#41474c"
  signal-blue-night: "#6fb3e8"
  stop-red-night: "#ff8a80"
typography:
  display:
    fontFamily: "Barlow Condensed, Roboto Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(40px, 5.5vw, 64px)"
    fontWeight: 700
    lineHeight: 1.05
  page-title:
    fontFamily: "Barlow Condensed, Roboto Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(36px, 5.5vw, 56px)"
    fontWeight: 700
    lineHeight: 1.05
  headline:
    fontFamily: "Barlow Condensed, Roboto Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(30px, 4vw, 42px)"
    fontWeight: 700
    lineHeight: 1.05
  title:
    fontFamily: "Barlow Condensed, Roboto Condensed, Arial Narrow, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.1
  plate:
    fontFamily: "Barlow Condensed, Roboto Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(40px, 12vw, 64px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.06em"
  plate-hero:
    fontFamily: "Barlow Condensed, Roboto Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(40px, 9vw, 72px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.06em"
  label-large:
    fontFamily: "Barlow Condensed, Roboto Condensed, Arial Narrow, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
  lead:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  mockup-band:
    fontFamily: "Barlow Condensed, Roboto Condensed, Arial Narrow, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1
  mockup-caption:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.35
  label:
    fontFamily: "Barlow Condensed, Roboto Condensed, Arial Narrow, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.02em"
rounded:
  marker: "6px"
  control: "8px"
  contact: "10px"
  plate: "12px"
  device: "42px"
  device-screen: "33px"
  print-cut: "9mm"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "48px"
  section: "72px"
components:
  button-primary:
    backgroundColor: "{colors.traffic-yellow}"
    textColor: "{colors.traffic-black}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
    height: "46px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.traffic-black}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
    height: "46px"
  button-contact-call:
    backgroundColor: "{colors.traffic-yellow}"
    textColor: "{colors.traffic-black}"
    rounded: "{rounded.contact}"
    height: "66px"
  button-contact-whatsapp:
    backgroundColor: "{colors.whatsapp-green}"
    textColor: "{colors.sign-white}"
    rounded: "{rounded.contact}"
    height: "66px"
  button-contact-telegram:
    backgroundColor: "{colors.telegram-blue}"
    textColor: "{colors.sign-white}"
    rounded: "{rounded.contact}"
    height: "66px"
  input:
    backgroundColor: "{colors.sign-white}"
    textColor: "{colors.traffic-black}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "11px 12px"
  license-plate:
    backgroundColor: "{colors.sign-white}"
    textColor: "{colors.traffic-black}"
    typography: "{typography.plate}"
    rounded: "{rounded.plate}"
  step-marker:
    backgroundColor: "{colors.traffic-yellow}"
    textColor: "{colors.traffic-black}"
    rounded: "{rounded.marker}"
    size: "44px"
  language-chip:
    backgroundColor: "transparent"
    textColor: "{colors.traffic-black}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
---

# Design System: Parkzettel

## Overview

**Creative North Star: "The Road Sign"**

Parkzettel looks and behaves like traffic signage. Its job is to be understood at a glance by a stranger standing next to a car, often outdoors, in a hurry, possibly in a language that isn't the owner's. So every element says one thing, in regulated colors, at a size and contrast that survive glare. Nothing is there for decoration that a road sign wouldn't carry.

The mood is direct, legible, utilitarian and official without being stern: it has the authority of a sign, not the tone of a parking fine. Type is condensed and heavy where it reads as signage (plate, headings, buttons) and calm and open where people read (body text). Controls are flat plates with thick outlines and generous targets. Surfaces are separated by hard rules, not containers. Depth exists only where the screen depicts a real object: the printed sticker, the plate, the phone.

Light mode sits on Traffic White; dark mode on Asphalt. Both keep the same yellow, plate blue and messenger colors, because those are recognized by their color in the real world.

**Key Characteristics:**
- One signal color, Traffic Yellow, marks the thing to do; everything else is black, white and grey.
- Two faces: Barlow Condensed for anything that reads as a sign, Barlow for reading.
- Flat, hard-edged controls with 2px outlines and 8px corners; big tap targets.
- Sections divided by 3px black rules, never by cards or shadows.
- Real objects (sticker, plate, phone) are the only things with shadows.
- Built for a phone held next to a car: 360px and up, dark mode, outdoor contrast.

## Colors

A regulated traffic palette: black and white ground, one yellow signal, and real-world colors that must stay true (EU plate, WhatsApp, Telegram).

### Primary
- **Traffic Yellow** (RAL 1023): the signal. Primary buttons, the Call button, numbered step markers, the sticker's header band, and the accent beside the owner's note. It always carries Traffic Black text and a Traffic Black outline, never white.

### Secondary
- **EU Plate Blue**: the blue band of the license plate, with **EU Star Yellow** for its ring of twelve stars. Used nowhere else.

### Tertiary
- **WhatsApp Green** and **Telegram Blue**: only on their own contact buttons and sticker badges, so people recognize the messenger by color.

### Neutral
- **Traffic Black** (RAL 9017): text, outlines, 3px section rules, plate border; dark ground for the sticker's QR modules.
- **Traffic White**: the page ground in light mode; also the ink in dark mode.
- **Sign White**: raised surfaces (inputs, the note, the plate face, the sticker body).
- **Road Grey**: secondary text, hints, the footer.
- **Rule Grey**: input borders, light dividers, the plate's offset ledge.
- **Asphalt / Asphalt Raised / Asphalt Grey / Asphalt Rule**: the dark-mode ground, raised surfaces, secondary text and borders.
- **Signal Blue** (night: **Signal Blue Night**): focus rings only.
- **Stop Red** (night: **Stop Red Night**): errors and destructive actions (delete).

### Named Rules
**The One Signal Rule.** Traffic Yellow marks the action or the thing to notice. It is never a background wash for whole sections, and a screen never has two competing yellow calls to action of equal weight.

**The Plate Blue Rule.** EU Plate Blue appears only on the license plate. It is not a brand or link color.

**The True Colors Rule.** Messenger and plate colors are not restyled, tinted or used elsewhere; their meaning comes from matching the real world.

## Typography

**Display Font:** Barlow Condensed (with Roboto Condensed for Cyrillic, then Arial Narrow)
**Body Font:** Barlow (with system-ui)

**Character:** A DIN-descended road-signage pairing: the condensed cut speaks in sign voice (short, heavy, unmistakable), the regular cut stays quiet and readable for explanations. Fonts are bundled; nothing loads from a font CDN.

### Hierarchy
- **Display** (700, clamp 40–64px, 1.05): the landing headline. It is a full sentence, so it stops short of poster size: three lines at most on a laptop, and "Scheibenwischer." still fits a 320px phone.
- **Page title** (700, clamp 36–56px, 1.05): the h1 of the generator and the account page.
- **Headline** (700, clamp 30–42px, 1.05): section headings.
- **Title** (700, 24–26px, 1.1): step titles, contact-button labels, status headlines on the relay page.
- **Plate** (600, clamp 40–64px, 1, +0.06em): the license plate number, always uppercase as typed on a plate. The generator's editable hero plate runs larger (clamp 40–72px).
- **Lead** (400, 19px, 1.5): the pitch under a headline, the landing's statement paragraphs, and the driver's quoted reply. Capped at 34em (about 75 characters).
- **Body** (400, 17px, 1.5): explanations, form text.
- **Body Small** (400, 15px) and **Caption** (400, 14px): hints, footers, field help.
- **Label** (700, 15–18px, +0.02em): buttons, the language picker, chips. **Label Large** (700, 22px) for hero buttons and FAQ questions.

### Named Rules
**The Sign Voice Rule.** If it should be read from a step away (plate, headings, buttons, sticker text), it is Barlow Condensed. If it should be read up close, it is Barlow. No third family.

**The No Shouting Rule.** Emphasis comes from the condensed face and weight, not from all-caps labels or tracked-out eyebrow text. Only the plate is uppercase.

**The Even Lines Rule.** Headings use `text-wrap: balance`; paragraphs and list items use `text-wrap: pretty`, so no line ends on a single orphaned word.

## Layout

A single centered column with a 1080px maximum and 16px side gutters. Generator and landing hero use two columns on wide screens (content plus a 340–360px sticky preview) and collapse to one `minmax(0, 1fr)` column below 820px, so no fixed-width child can push the page wider than the screen. Fixed-size compositions (the landing's phone mockup) shrink with `zoom`, which, unlike `transform: scale()`, shrinks their layout box too. Every page must fit 320px without horizontal scrolling. Scanner pages (contact and relay) are a narrow 460px column centered on the screen, built for one hand and a thumb, and must stay usable at 360px.

Rhythm comes from a short spacing scale (8, 12, 16, 24, 48, 72px): 8–12px inside controls and between buttons, 16–24px between fields, 48–72px between landing sections. Major sections are separated by a 3px Traffic Black rule with 32px above the content. Content order on scanner pages is fixed: plate, note, plate check, actions, then help text.

## Elevation & Depth

The interface is flat. Surfaces, controls and sections never float; they are separated by rules and outlines. Depth is reserved for depictions of physical objects, so the screen reads as "here is the actual thing".

### Shadow Vocabulary
- **Plate ledge** (`box-shadow: 0 10px 0 -4px` in Rule Grey): a hard, offset ledge under the license plate, like a plate mounted on a car.
- **Sticker drop** (`filter: drop-shadow(0 1px 1px rgb(0 0 0 / 0.25)) drop-shadow(0 14px 18px rgb(0 0 0 / 0.16))`): the printed sticker in previews, tilted 2–6° like a real sticker.
- **Device shadow** (`box-shadow: 0 24px 50px rgb(0 0 0 / 0.25)`, plus a 2px Asphalt Rule outline in dark mode): the phone mockup on the landing page.

### Named Rules
**The Real Objects Rule.** Only things that exist in the physical world (sticker, plate, phone) cast shadows. Buttons, inputs, notes, menus and sections stay flat.

## Shapes

Hard, plate-like geometry. Controls have gently rounded 8px corners and 2px solid outlines; the big contact buttons step up to 10px, the license plate to 12px with a 5px black border, and step markers sit at 6px. The printed sticker is a rounded rectangle (28px corners in its 400px drawing) with an 8px black border and a yellow header band. Circles appear only as messenger badges on the sticker.

## Components

### Buttons
Flat signage plates: thick outline, big target, one clear verb.
- **Shape:** gently rounded (8px), 2px solid outline, at least 46px tall.
- **Primary:** Traffic Yellow fill, Traffic Black text and outline, Label type (Barlow Condensed 700, 18px).
- **Secondary:** transparent with a Traffic Black outline and text (inverts to Traffic White in dark mode).
- **Danger:** Stop Red outline and text, for delete actions only.
- **Hero call to action:** same styles at 56px tall and 22px type.
- **Disabled:** 35% opacity, not clickable.
- **Focus:** 3px Signal Blue outline with 2px offset, on every interactive element.

### Contact buttons (signature)
The scanner's whole job, so they are the largest controls in the system: full width, 66px tall, 10px corners, a 28px stroke icon and a Title-size label. Call is Traffic Yellow with a black outline; WhatsApp and Telegram use their true colors with white text. Pressing scales to 98% for 0.1s, only when the visitor has not asked for reduced motion.

### License plate (signature)
White plate face, 5px Traffic Black border, 12px corners, the plate ledge shadow. EU countries get the EU Plate Blue band with twelve EU Star Yellow stars and the country code; non-EU countries get a plain white plate with the code in an oval, like a country sticker. On the generator the plate is itself the input field.

### Inputs / Fields
- **Style:** Sign White fill (Asphalt Raised in dark mode), 2px Rule Grey border, 8px corners, 11px 12px padding, Body type.
- **Focus:** the border turns Traffic Black (Traffic White in dark mode).
- **Error:** a Stop Red message under the form, written as an instruction.
- **Choices:** relay message presets are full-width 52px option rows with a 2px border that turns black when selected.

### Navigation
A minimal header: the logo mark and wordmark on the left, the language picker on the right (a select styled as a 2px outlined plate with a drawn chevron, native language names). Footer is one line of Body Small text with a single link. Dropdown options always render dark on white, whatever the theme.

### Sticker (signature)
The printed product, drawn as a self-contained SVG: a yellow header band with a two-line sign headline, the QR code, round messenger badges, and the site's domain in grey at the bottom. Shown slightly tilted with the sticker drop shadow, faded to 12% while the form is incomplete.

### Questions (FAQ)
Native `details` rows separated by 2px Rule Grey lines. The whole row is the target (at least 52px tall), the question is Label Large, and a drawn chevron (the same 2.5px stroke as the language picker's) points right when closed and down when open.

### Phone mockup (landing)
The landing hero shows the contact page inside a drawn phone with the printed sticker in front of it. It is a depiction of a real object, so it has its own miniature scale: a Device Black body with device corners (42px, screen 33px), the device shadow, and mockup type (Mockup Band 13px, Mockup Caption 12px) that is never used for real interface text. Its sticker is drawn by the real sticker template with a QR code made at build time.

### Step markers and chips
Numbered steps use 44px Traffic Yellow squares with a black outline and a Title-size numeral; language chips are 2px outlined plates with Barlow Condensed labels.

## Do's and Don'ts

### Do:
- **Do** keep one Traffic Yellow call to action per view and give it black text.
- **Do** separate sections with a 3px Traffic Black rule instead of containers.
- **Do** use Barlow Condensed for plates, headings, buttons and sticker text, Barlow for reading text.
- **Do** keep every tap target at least 44px tall (46px for buttons), and scanner-page actions at 66px.
- **Do** check every page at 320px wide: nothing may scroll sideways.
- **Do** show a 3px Signal Blue focus ring with a 2px offset on every interactive element.
- **Do** keep messenger and EU plate colors true to the real world.
- **Do** respect reduced motion: the only motion is a short press feedback.

### Don't:
- **Don't** wrap content in generic cards with soft shadows; the system is flat.
- **Don't** give interface surfaces shadows; only the sticker, plate and phone cast them.
- **Don't** use all-caps tracked eyebrow labels above headings.
- **Don't** use EU Plate Blue, WhatsApp Green or Telegram Blue as general accents.
- **Don't** add decorative motion, gradients or illustrations; a road sign has none.
- **Don't** load fonts, icons or images from third-party hosts.
- **Don't** mark a statement or callout with a thick colored side border; use the 3px black section rule or type instead.
