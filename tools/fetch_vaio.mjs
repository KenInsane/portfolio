/**
 * Downloads The New VAIO FE gallery modules from Behance.
 *
 * Run with the user's explicit go-ahead — it reaches out to a CDN.
 *
 * Behance serves each module at several sizes under .../project_modules/<size>/,
 * and the URLs a page hands out are usually the 1400px display variant. Larger
 * keys normally exist for the same asset, so each is tried biggest-first and
 * falls back to whatever the page gave us.
 *
 * Usage: node tools/fetch_vaio.mjs
 */
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'tools', '_dl', 'vaio')
mkdirSync(OUT, { recursive: true })

const URLS = [
  'https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/bde8ca160498189.63bffabb85719.png',
  'https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/33ff52160498189.63be84f0dde89.png',
  'https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/e4b06f160498189.63c0166fa4d98.jpg',
  'https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/13da88160498189.63c0171d9382c.jpg',
  'https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/9e372a160498189.63c017c54f563.jpg',
  'https://mir-s3-cdn-cf.behance.net/project_modules/1400/e07511160498189.63b85ce5c5d72.gif',
  'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200_webp/d2d1e0160498189.63b702b6058fd.png',
  'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200_webp/abe111160498189.63bbe2f184007.png',
  'https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/95523c160498189.63be9237ee454.png',
]

// Biggest first. `source` is the untouched upload; the rest are rendered sizes.
const SIZES = ['source', 'max_3840_webp', 'max_3840', '2800_webp', '1400_webp', '1400', 'max_1200_webp']

const swapSize = (url, size) =>
  url.replace(/\/project_modules\/[^/]+\//, `/project_modules/${size}/`)

const kb = (n) => `${(n / 1024).toFixed(0)} KB`

async function tryFetch(url) {
  try {
    const res = await fetch(url, {
      headers: {
        // Behance rejects a bare programmatic request for CDN assets.
        'user-agent': 'Mozilla/5.0',
        referer: 'https://www.behance.net/',
      },
    })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    return buf.length > 1024 ? buf : null
  } catch {
    return null
  }
}

let n = 0
for (const original of URLS) {
  n += 1
  const ext = original.split('.').pop().split('?')[0]
  const name = `${String(n).padStart(2, '0')}.${ext}`
  const dest = join(OUT, name)

  if (existsSync(dest)) {
    console.log(`skip  ${name}  ${kb(statSync(dest).size)}`)
    continue
  }

  let got = null
  let usedSize = null
  for (const size of SIZES) {
    const candidate = swapSize(original, size)
    got = await tryFetch(candidate)
    if (got) {
      usedSize = size
      break
    }
  }
  if (!got) {
    got = await tryFetch(original)
    usedSize = 'as-listed'
  }

  if (!got) {
    console.warn(`! FAILED ${name} — ${original}`)
    continue
  }

  writeFileSync(dest, got)
  console.log(`get   ${name}  ${kb(got.length)}  [${usedSize}]`)
}

console.log(`\nout: ${OUT}`)
