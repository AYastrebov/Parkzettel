// EU member-state codes as they appear under the stars on a license plate.
export const COUNTRIES = [
  'D', 'A', 'I', 'F', 'NL', 'B', 'L', 'E', 'P', 'IRL', 'DK', 'S', 'FIN', 'PL', 'CZ', 'SK',
  'SLO', 'H', 'HR', 'RO', 'BG', 'GR', 'CY', 'M', 'EST', 'LV', 'LT',
]

const STARS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2
  return `<circle cx="${(10 + Math.sin(a) * 6.5).toFixed(2)}" cy="${(10 - Math.cos(a) * 6.5).toFixed(2)}" r="1.1"/>`
}).join('')

export const EU_STARS_SVG = `<svg class="plate-stars" viewBox="0 0 20 20" aria-hidden="true">${STARS}</svg>`
