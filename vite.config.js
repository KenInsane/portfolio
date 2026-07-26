import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative base so the built site also works from a file path or a sub-folder
  // (GitHub Pages project sites, /portfolio/ on a shared host, etc.).
  base: './',
  server: {
    port: 5180,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // The videos in public/ are already compressed; don't let Vite inline anything big.
    assetsInlineLimit: 4096,
  },
})
