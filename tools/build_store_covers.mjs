/**
 * Builds the two store cards on the /assets page from the product covers made
 * for the listings themselves (X:\_CLOUDE\DivineRampage_Market\_design).
 *
 * Those covers carry the product name in huge type along the bottom, which
 * would fight the card's own title, so each is cut to a 16:9 window above it.
 *
 * Usage: node tools/build_store_covers.mjs [--force]
 */
import { existsSync, statSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { ensure, mb } from './lib/media.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'public', 'media', 'stores')
const DESIGN = 'X:/_CLOUDE/DivineRampage_Market/_design'
const force = process.argv.includes('--force')

const JOBS = [
  // Title starts at y≈870 on this cover.
  {
    name: 'shopify.jpg',
    src: join(DESIGN, 'out_red', 'cover_1920x1080.jpg'),
    extract: { left: 213, top: 0, width: 1493, height: 840 },
  },
  // Title starts at y≈895; both hands sit between x 530 and 1470.
  {
    name: 'gumroad.jpg',
    src: join(DESIGN, 'desolation', 'out', 'cover_1920x1080.jpg'),
    extract: { left: 196, top: 0, width: 1529, height: 860 },
  },
]

ensure(OUT)

for (const { name, src, extract } of JOBS) {
  const dest = join(OUT, name)
  if (existsSync(dest) && !force) {
    console.log(`skip  ${name}`)
    continue
  }
  await sharp(src)
    .extract(extract)
    .resize({ width: 1400, withoutEnlargement: true })
    .jpeg({ quality: 86, mozjpeg: true, progressive: true })
    .toFile(dest)
  console.log(`jpeg  ${name}  ${mb(statSync(dest).size)}`)
}
