/**
 * Renders the favicon set from a single glyph.
 *
 * Why a PNG set and not an SVG favicon: an SVG would have to carry the glyph as
 * <text>, and would fall back to tofu on any machine without a Japanese font.
 * Rendering here — where those fonts exist — bakes the shape in, so it looks the
 * same everywhere.
 *
 * Two decisions came out of looking at the candidates at real tab size:
 *   - One glyph, not two. "ケン" at 16px is an unreadable smudge; "ケ" holds.
 *   - Light plate, dark glyph. A dark icon disappears into a dark browser
 *     chrome, which is exactly where the old one was getting lost.
 *
 * Usage: node tools/build_favicon.mjs
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'public')
mkdirSync(OUT, { recursive: true })

const FONT = "'Yu Gothic','Yu Gothic UI','Meiryo','MS Gothic','Noto Sans JP',sans-serif"
const PLATE = '#f4f4f4' // --txt
const INK = '#0a0a0a' // --bg

const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="${PLATE}"/>
  <text x="50" y="50" text-anchor="middle" dominant-baseline="central"
        font-family="${FONT}" font-weight="700" font-size="62" fill="${INK}">ケ</text>
</svg>`

// 32 covers the tab (16 is downscaled from it and stays crisp), 180 is the iOS
// touch icon, 512 is what large surfaces and manifests reach for.
const SIZES = [
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
  ['favicon-512.png', 512],
]

for (const [name, size] of SIZES) {
  // High density so the glyph is rasterised from the vector, not upscaled.
  const info = await sharp(Buffer.from(SVG), { density: 600 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, name))
  console.log(`${name.padEnd(22)} ${size}x${size}  ${(info.size / 1024).toFixed(1)} KB`)
}

console.log(`out: ${OUT}`)
