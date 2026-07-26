/**
 * Turns the Behance delivery folder for The Sphere Master into web assets.
 *
 * The source files are mastering-weight: 5–12 MB PNG stills and GIFs up to
 * 17 MB. Everything here is delivered 2.35 ultrawide, so unlike Divine Rampage
 * nothing needs letterboxing — one ratio fits the whole project.
 *
 * Usage: node tools/build_sphere_media.mjs [--force]
 */
import { resolve, dirname, join, parse } from 'node:path'
import { fileURLToPath } from 'node:url'
import { converters, list, listNumeric, ensure, report, existsSync } from './lib/media.mjs'

const SRC = 'X:\\DOTA-2_SHORTFLIM_BEHANCE'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'public', 'media', 'work', 'sphere-master')
const force = process.argv.includes('--force')

// Animated frames get a lower width and quality than the stills — motion hides
// compression that a held frame would reveal.
const STILL = { width: 1920, quality: 82 }
const ANIM = { width: 1280, quality: 68 }
const POSTER = { width: 2560, quality: 86 }
const THUMB = { width: 1600, quality: 82 }

const c = converters({ out: OUT, force })
ensure(OUT)

// ---- cover -------------------------------------------------------------- //
const preview = join(SRC, 'PREVIEW_IMAGE_01100.png')
if (existsSync(preview)) {
  await c.jpeg(preview, join(OUT, 'poster.jpg'), POSTER)
  await c.jpeg(preview, join(OUT, 'thumb.jpg'), THUMB)
} else {
  console.warn('! PREVIEW_IMAGE_01100.png missing — no poster built')
}

// ---- stills ------------------------------------------------------------- //
const stills = listNumeric(join(SRC, 'STILLS'), /\.png$/i)
console.log(`\n${stills.length} stills`)
let n = 0
for (const f of stills) {
  n += 1
  await c.jpeg(join(SRC, 'STILLS', f), join(OUT, 'stills', `${String(n).padStart(2, '0')}.jpg`), STILL)
}

// ---- gallery animations ------------------------------------------------- //
const gifs = list(join(SRC, 'GIFS'), /\.gif$/i)
console.log(`\n${gifs.length} gallery gifs`)
for (const f of gifs) {
  const base = parse(f).name
  await c.animWebp(join(SRC, 'GIFS', f), join(OUT, 'anim', `${base}.webp`), ANIM)
  // Mid-animation rather than frame one, which is often a fade from black.
  await c.frame(join(SRC, 'GIFS', f), join(OUT, 'anim', `${base}.jpg`), { ...THUMB, at: 0.5 })
}

// ---- breakdown animations ---------------------------------------------- //
const bd = list(join(SRC, 'BREAKDOWN_GIFS'), /\.gif$/i)
console.log(`\n${bd.length} breakdown gifs`)
for (const f of bd) {
  await c.animWebp(join(SRC, 'BREAKDOWN_GIFS', f), join(OUT, 'bd', `${parse(f).name}.webp`), ANIM)
}

report(c.tally, OUT)
