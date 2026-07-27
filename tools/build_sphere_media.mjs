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
import { transcodeAdaptive, hasFfmpeg } from './lib/video.mjs'

if (!hasFfmpeg()) {
  console.error('ffmpeg not found — see tools/lib/video.mjs')
  process.exit(1)
}

// Animated modules ship as H.264 rather than animated WebP: about half the
// bytes at a comparable look, and a <video> can be paused when it scrolls out
// of view where an animated <img> decodes forever. Plates run full width, so
// they get more pixels than the breakdown clips beside a text column.
const PLATE_MP4 = { width: 1280, crf: 26, audio: false }
const BD_MP4 = { width: 1000, crf: 28, audio: false }

function toMp4(src, dest, opts, label) {
  if (existsSync(dest) && !force) return console.log(`skip  ${label}`)
  try {
    const r = transcodeAdaptive(src, dest, opts)
    console.log(`h264  ${label}  ${r.label}${r.crf ? ` [crf ${r.crf}]` : ''}`)
  } catch (err) {
    console.warn(`! ${label}: ${err.message}`)
  }
}

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
console.log(`\n${gifs.length} gallery gifs -> h264`)
for (const f of gifs) {
  const base = parse(f).name
  toMp4(join(SRC, 'GIFS', f), join(OUT, 'anim', `${base}.mp4`), PLATE_MP4, `anim/${base}.mp4`)
  // Mid-animation rather than frame one, which is often a fade from black.
  // Doubles as the video's poster, so the frame is up before the file lands.
  await c.frame(join(SRC, 'GIFS', f), join(OUT, 'anim', `${base}.jpg`), { ...THUMB, at: 0.5 })
}

// ---- breakdown animations ---------------------------------------------- //
const bd = list(join(SRC, 'BREAKDOWN_GIFS'), /\.gif$/i)
console.log(`\n${bd.length} breakdown gifs -> h264`)
for (const f of bd) {
  const base = parse(f).name
  toMp4(join(SRC, 'BREAKDOWN_GIFS', f), join(OUT, 'bd', `${base}.mp4`), BD_MP4, `bd/${base}.mp4`)
}

report(c.tally, OUT)
