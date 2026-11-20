/**
 * Builds the Lamborghini Temerario page media.
 *
 * Sources are the comped shots in Z:\RNDR (ProRes 4:2:2 HQ, 2560x1440, plus a
 * PNG still of each) and the two viewport grabs saved for the breakdown, of the
 * Cinema 4D scene and the Nuke comp.
 *
 * The shots are nearly all black with soft falloffs, which is where banding
 * shows first, so they are encoded gentler than the site default and with
 * stronger adaptive quantisation.
 *
 * Usage: node tools/build_lambo_media.mjs [--force]
 */
import sharp from 'sharp'
import { existsSync, statSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { converters, ensure, report, mb } from './lib/media.mjs'
import { transcodeAdaptive, hasFfmpeg } from './lib/video.mjs'

if (!hasFfmpeg()) {
  console.error('ffmpeg not found — see tools/lib/video.mjs')
  process.exit(1)
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const RNDR = 'Z:/RNDR'
const VIEWPORTS = 'Z:/DOWNLOADS2/123/2025-lamborghini-temerario'
const OUT = join(root, 'public', 'media', 'work', 'lamborghini-temerario')
const force = process.argv.includes('--force')

const POSTER = { width: 2560, quality: 88 }
const THUMB = { width: 1600, quality: 84 }
const SHOT = { width: 1920, crf: 20, x264Params: 'aq-mode=3:aq-strength=1.1' }
// Viewport grabs: wide enough that the node graph and outliner stay legible.
const BOARD = { width: 2400, quality: 84 }

const SHOTS = ['01', '02', '03']
const BOARDS = [
  ['C4D_VIEWPORT.png', 'c4d.jpg'],
  ['NUKE_VIEWPORT.png', 'nuke.jpg'],
]

const c = converters({ out: OUT, force })
ensure(OUT)

// The opening shot doubles as the card and the poster under the film embed.
await c.jpeg(join(RNDR, '01.png'), join(OUT, 'poster.jpg'), POSTER)
await c.jpeg(join(RNDR, '01.png'), join(OUT, 'thumb.jpg'), THUMB)

console.log(`\n${SHOTS.length} shots`)
for (const s of SHOTS) {
  const dest = join(OUT, 'shots', `${s}.mp4`)
  if (existsSync(dest) && !force) {
    console.log(`skip  shots/${s}.mp4`)
    continue
  }
  const r = transcodeAdaptive(join(RNDR, `${s}.mov`), dest, SHOT)
  console.log(`h264  shots/${s}.mp4  ${r.label}${r.crf ? ` [crf ${r.crf}]` : ''}`)
}

console.log(`\n${BOARDS.length} breakdown boards`)
for (const [src, name] of BOARDS) {
  const dest = join(OUT, 'bd', name)
  if (existsSync(dest) && !force) {
    console.log(`skip  bd/${name}`)
    continue
  }
  ensure(dirname(dest))
  // The grabs are RGBA; flattened onto black so no edge turns white in a JPEG.
  await sharp(join(VIEWPORTS, src))
    .flatten({ background: '#000' })
    .resize({ width: BOARD.width, withoutEnlargement: true })
    .jpeg({ quality: BOARD.quality, mozjpeg: true, progressive: true })
    .toFile(dest)
  console.log(`jpeg  bd/${name}  ${mb(statSync(dest).size)}`)
}

report(c.tally, OUT)
