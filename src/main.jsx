import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Self-hosted variable fonts — no external requests, so the site works offline.
// Kana in the name falls through to the system Japanese face (see --font-jp).
import '@fontsource-variable/archivo'
import '@fontsource-variable/inter'

import './index.css'
import App from './App'

// Dev-only DOM capture helper (window.__shot). Tree-shaken out of builds.
if (import.meta.env.DEV) import('./dev/capture')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
