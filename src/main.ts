import { mountChrome } from './chrome'
import { renderContact } from './contact'
import { renderGenerator } from './generator'
import { renderLanding } from './landing'
import { renderRelay } from './relay'

const view = mountChrome()

// Contact pages carry personal data; keep them out of search indexes.
function noindex() {
  const robots = document.createElement('meta')
  robots.name = 'robots'
  robots.content = 'noindex'
  document.head.append(robots)
}

const token = location.hash.slice(1)
const relayId = location.pathname.match(/^\/s\/([A-Za-z0-9]+)\/?$/)?.[1]
if (relayId) {
  noindex()
  renderRelay(view, relayId)
} else if (token) {
  // Printed private stickers point at "/#<token>", so the root must keep opening the contact page.
  noindex()
  renderContact(view, token)
} else if (/^\/create\/?$/.test(location.pathname)) {
  renderGenerator(view)
} else {
  renderLanding(view)
}

// The app is one page: a different fragment means a different mode or contact, so start fresh.
window.addEventListener('hashchange', () => location.reload())
