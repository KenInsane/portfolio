/**
 * Builds The New VAIO FE page media from the gallery modules downloaded by
 * `tools/fetch_vaio.mjs`.
 *
 * The gallery mixes three kinds of module and only two of them belong on the
 * page: the finished frames (all 16:9) and the two process boards (5760x1620).
 * The rest are page furniture — a title card, an animated "PROCESS AND
 * DEVELOPMENT" divider and a credits block — whose content lives in the site's
 * own copy and meta rail instead.
 *
 * Usage: node tools/build_vaio_media.mjs [--force]
 */
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { converters, ensure, report, existsSync } from './lib/media.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(root, 'tools', '_dl', 'vaio')
const OUT = join(root, 'public', 'media', 'work', 'vaio-fe')
const force = process.argv.includes('--force')

const POSTER = { width: 2560, quality: 86 }
const THUMB = { width: 1600, quality: 82 }
const STILL = { width: 1920, quality: 84 }
// The process boards are 5760 wide; at 2400 the UI text is still legible.
const BOARD = { width: 2400, quality: 82 }

const HERO = '02.png'
const STILLS = ['02.png', '03.jpg', '04.jpg', '05.jpg']
const BOARDS = ['07.png', '08.png']

const c = converters({ out: OUT, force })
ensure(OUT)

if (!existsSync(join(SRC, HERO))) {
  console.error(`missing ${join(SRC, HERO)} — run tools/fetch_vaio.mjs first`)
  process.exit(1)
}

await c.jpeg(join(SRC, HERO), join(OUT, 'poster.jpg'), POSTER)
await c.jpeg(join(SRC, HERO), join(OUT, 'thumb.jpg'), THUMB)

console.log(`\n${STILLS.length} stills`)
let n = 0
for (const f of STILLS) {
  n += 1
  await c.jpeg(join(SRC, f), join(OUT, 'stills', `${String(n).padStart(2, '0')}.jpg`), STILL)
}

console.log(`\n${BOARDS.length} process boards`)
n = 0
for (const f of BOARDS) {
  n += 1
  await c.jpeg(join(SRC, f), join(OUT, 'bd', `${String(n).padStart(2, '0')}.jpg`), BOARD)
}

report(c.tally, OUT)

/* Left out on purpose:
 *   01.png  title card — its text is the page's own description now
 *   06.gif  "PROCESS AND DEVELOPMENT" divider, 1920x300 banner
 *   09.png  credits block — those credits are in the meta rail instead
 */
