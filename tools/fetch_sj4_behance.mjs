/**
 * Pulls modules from the Solos Journey 4 Behance gallery — the user's own
 * page, fetched at his request to put his shot breakdowns on the site.
 *
 * The module list comes from the rendered page (most modules, including every
 * GIF, load by script and never appear in the server HTML, so a plain fetch of
 * the page sees 9 of 44). Behance serves each module at several sizes under
 * .../project_modules/<size>/; the biggest that exists is taken.
 *
 * Usage: node tools/fetch_sj4_behance.mjs <index> [<index> ...]
 *   indices refer to the MODULES list below (1-based, page order)
 */
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'tools', '_dl', 'sj4')
mkdirSync(OUT, { recursive: true })

const CDN = 'https://mir-s3-cdn-cf.behance.net/project_modules/'

// Page order, as collected from the rendered gallery on 2026-09-16.
const MODULES = [
  'max_3840_webp/a32eb4255470741.6aa5a9e15be8d.png',
  '1400_webp/d0c4e6255470741.6aa177d9e7815.png',
  '1400_webp/0eef19255470741.6aa177d2985df.png',
  '1400_webp/bffdf1255470741.6aa177d298209.png',
  'disp/649420255470741.6aa177d298934.gif',
  '1400/50dc3c255470741.6aa177d33726e.gif',
  'disp/542c69255470741.6aa177d492225.gif',
  '1400_webp/0b2506255470741.6aa177d491df5.png',
  '1400_webp/64e6de255470741.6aa177d492749.png',
  '1400/876210255470741.6aa177d50936d.gif',
  '1400_webp/5aa004255470741.6aa177d656bca.png',
  '1400_webp/b451d0255470741.6aa177d6570f0.png',
  'disp/b232d4255470741.6aa177d657603.gif',
  '1400/51e706255470741.6aa177d6cdd89.gif',
  '1400_webp/7ac652255470741.6aa177d9e7ccc.png',
  '1400/875dbd255470741.6aa177d7d41c3.gif',
  '1400/bfb9b0255470741.6aa177d7d4948.gif',
  '1400_webp/da1370255470741.6aa59d86e96a4.png',
]

// Biggest first; `source` is the untouched upload.
const SIZES = ['source', 'max_3840', 'max_3840_webp', '1400', '1400_webp', 'disp']

const kb = (n) => `${(n / 1024).toFixed(0)} KB`

async function get(url) {
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': 'Mozilla/5.0', referer: 'https://www.behance.net/' },
    })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    return buf.length > 1024 ? buf : null
  } catch {
    return null
  }
}

const wanted = process.argv.slice(2).map(Number).filter((n) => n >= 1 && n <= MODULES.length)
if (!wanted.length) {
  console.error(`usage: node tools/fetch_sj4_behance.mjs <1..${MODULES.length}> ...`)
  process.exit(1)
}

for (const n of wanted) {
  const listed = MODULES[n - 1]
  const [, file] = listed.split('/')
  const ext = file.split('.').pop()
  const dest = join(OUT, `${String(n).padStart(2, '0')}.${ext}`)
  if (existsSync(dest)) {
    console.log(`skip ${String(n).padStart(2)}  ${kb(statSync(dest).size)}`)
    continue
  }
  let buf = null
  let used = null
  for (const size of SIZES) {
    buf = await get(CDN + size + '/' + file)
    if (buf) {
      used = size
      break
    }
  }
  if (!buf) {
    buf = await get(CDN + listed)
    used = 'as-listed'
  }
  if (!buf) {
    console.warn(`! FAILED ${n}  ${listed}`)
    continue
  }
  writeFileSync(dest, buf)
  console.log(`get  ${String(n).padStart(2)}  ${ext.padEnd(4)} ${kb(buf.length).padStart(9)}  [${used}]`)
}
console.log(`out: ${OUT}`)
