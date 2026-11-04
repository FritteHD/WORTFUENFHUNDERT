import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves the site under /WORTFUENFHUNDERT/; the dev server stays at /
  base: process.env.GITHUB_PAGES ? '/WORTFUENFHUNDERT/' : '/',
})
