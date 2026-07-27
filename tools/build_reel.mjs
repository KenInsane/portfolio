/**
 * Re-encodes the showreel for the hero background and the reel lightbox.
 *
 * Unlike the experiment clips this one keeps its audio — it is the only video
 * on the site a visitor actually opens to listen to — and stays wider, since it
 * plays full-bleed behind the hero rather than in a grid cell.
 *
 * Usage: node tools/build_reel.mjs [--force]
 */
import { existsSync, statSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { transcode, transcodeAdaptive, hasFfmpeg } from './lib/video.mjs'

const SRC = 'C:\\Insane\\REEL_2025\\reel_2025 (2).mp4'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEST = join(root, 'public', 'videos', 'reel-2025.mp4')
const LOOP = join(root, 'public', 'videos', 'reel-loop.mp4')
const force = process.argv.includes('--force')

// The hero used to autoplay the whole 21 MB reel just to have something moving
// behind the name — the single heaviest thing on the landing page. It now gets
// a short silent excerpt instead, and the full reel is fetched only when
// someone actually presses Play reel.
const LOOP_START = 6 // past the "FX REEL 2025" title card
const LOOP_SECONDS = 14

if (!hasFfmpeg()) {
  console.error('ffmpeg not found — see tools/lib/video.mjs')
  process.exit(1)
}
if (!existsSync(SRC)) {
  console.error(`missing source: ${SRC}`)
  process.exit(1)
}
const mb = (p) => `${(statSync(p).size / 1024 / 1024).toFixed(1)} MB`

// Full reel: opened deliberately from the lightbox, so it keeps its audio and
// its resolution.
if (existsSync(DEST) && !force) {
  console.log(`skip  reel-2025.mp4 (${mb(DEST)})`)
} else {
  const r = transcodeAdaptive(SRC, DEST, { width: 1920, crf: 23, audio: true })
  console.log(`full  reel-2025.mp4  ${r.label}${r.crf ? ` [crf ${r.crf}]` : ''}`)
}

// Hero background: silent, short and small. It sits under a scrim, a mesh and
// a large headline, so detail here buys nothing a visitor can see.
if (existsSync(LOOP) && !force) {
  console.log(`skip  reel-loop.mp4 (${mb(LOOP)})`)
} else {
  transcode(SRC, LOOP, {
    width: 1280,
    crf: 27,
    audio: false,
    start: LOOP_START,
    duration: LOOP_SECONDS,
  })
  console.log(`loop  reel-loop.mp4  ${LOOP_SECONDS}s from ${LOOP_START}s -> ${mb(LOOP)}`)
}
