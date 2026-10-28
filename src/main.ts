import { mountChrome } from './chrome'
import { renderContact } from './contact'
import { renderGenerator } from './generator'

const view = mountChrome()

const token = location.hash.slice(1)
if (token) {
  // Contact pages carry personal data; keep them out of search indexes.
  const robots = document.createElement('meta')
  robots.name = 'robots'
  robots.content = 'noindex'
  document.head.append(robots)
  renderContact(view, token)
} else {
  renderGenerator(view)
}

// The app is one page: a different fragment means a different mode or contact, so start fresh.
window.addEventListener('hashchange', () => location.reload())
