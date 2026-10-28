import { defineConfig } from 'vite'

// Two pages: the public app (generator + contact page) and the owner account page, which is the only
// one allowed to load Telegram's login widget (see the CSP meta tags in each HTML file).
export default defineConfig({
  build: {
    rollupOptions: {
      input: { main: 'index.html', account: 'account.html' },
    },
  },
})
