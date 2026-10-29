// EU member-state codes as they appear under the stars on a license plate.
export const COUNTRIES = [
  'D', 'A', 'I', 'F', 'NL', 'B', 'L', 'E', 'P', 'IRL', 'DK', 'S', 'FIN', 'PL', 'CZ', 'SK',
  'SLO', 'H', 'HR', 'RO', 'BG', 'GR', 'CY', 'M', 'EST', 'LV', 'LT',
]

// Non-EU European codes (international distinguishing signs). These plates have no EU band, so they are drawn
// plain, with the code in an oval like the country sticker on the back of a car.
export const NON_EU = ['CH', 'FL', 'UK', 'N', 'IS', 'AL', 'BIH', 'MK', 'MNE', 'SRB', 'MD', 'UA', 'TR']

export const isNonEu = (country?: string) => !!country && NON_EU.includes(country)

export const COUNTRY_OPTIONS = `<option value="">–</option>${[...COUNTRIES, ...NON_EU].map((c) => `<option>${c}</option>`).join('')}`

// Shows a decoded or stored country on a .plate. The value is untrusted, so it goes in as text.
export function showCountry(plate: Element, country?: string) {
  plate.querySelector('.plate-country')!.textContent = country ?? ''
  plate.classList.toggle('non-eu', isNonEu(country))
}

const STARS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2
  return `<circle cx="${(10 + Math.sin(a) * 6.5).toFixed(2)}" cy="${(10 - Math.cos(a) * 6.5).toFixed(2)}" r="1.1"/>`
}).join('')

export const EU_STARS_SVG = `<svg class="plate-stars" viewBox="0 0 20 20" aria-hidden="true">${STARS}</svg>`
