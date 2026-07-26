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
import { transcodeAdaptive, hasFfmpeg } from './lib/video.mjs'

const SRC = 'C:\\Insane\\REEL_2025\\reel_2025 (2).mp4'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEST = join(root, 'public', 'videos', 'reel-2025.mp4')
const force = process.argv.includes('--force')

if (!hasFfmpeg()) {
  console.error('ffmpeg not found — see tools/lib/video.mjs')
  process.exit(1)
}
if (!existsSync(SRC)) {
  console.error(`missing source: ${SRC}`)
  process.exit(1)
}
if (existsSync(DEST) && !force) {
  console.log(`skip (exists): ${DEST} — pass --force to rebuild`)
  process.exit(0)
}

// Full-bleed behind the hero, so it gets more width and a tighter CRF than the
// grid clips; audio matters because the lightbox plays it with controls.
const r = transcodeAdaptive(SRC, DEST, { width: 1920, crf: 23, audio: true })
console.log(`reel  ${r.label}${r.crf ? ` [crf ${r.crf}]` : ''}`)
console.log(`out: ${DEST} (${(statSync(DEST).size / 1024 / 1024).toFixed(1)} MB)`)
