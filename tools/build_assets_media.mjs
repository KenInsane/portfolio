/**
 * Builds the preview media for the /assets page.
 *
 * Sources are the viewport test clips shot for the BMW package
 * (X:\NFS_MW_2005_SHOTS\BMW_M3_GTR_VIEWPORT_TESTS\videos): 1080x1920 verticals
 * cut for TikTok. The site wants landscape, and the car only ever occupies the
 * middle band of those frames, so each clip is centre-cropped to 16:9 — nothing
 * is lost but empty sky and floor.
 *
 * Usage: node tools/build_assets_media.mjs [--force]
 */
import { existsSync, readdirSync, writeFileSync, mkdirSync, unlinkSync, rmSync, statSync } from 'node:fs'
import { resolve, dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ensure, mb } from './lib/media.mjs'
import { transcodeAdaptive, posterFrame, hasFfmpeg } from './lib/video.mjs'
import { mp4Dimensions } from './lib/mp4.mjs'

if (!hasFfmpeg()) {
  console.error('ffmpeg not found — see tools/lib/video.mjs')
  process.exit(1)
}

const SRC = 'X:/NFS_MW_2005_SHOTS/BMW_M3_GTR_VIEWPORT_TESTS/videos'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'public', 'media', 'assets', 'bmw-m3-gtr')
const MANIFEST = join(root, 'src', 'data', 'assets.aspects.json')
const force = process.argv.includes('--force')

// 1080x1920 -> 1080x608 (16:9). `top` is per clip: the dark turntable sits a
// little lower in frame than the two road clips, which carry a horizon.
const CROP = (top) => `crop=1080:608:0:${top}`

// Every clip gets a poster. With `preload="none"` nothing is fetched until the
// clip scrolls in, so without one the frame is an empty box until it plays.
const CLIPS = [
  // The hero preview: dark studio, so it sits on the page without fighting it.
  { name: 'turntable', src: 'BLENDER_03_360.mp4', top: 640 },
  { name: 'steering', src: 'BLENDER_02_slalom_steering.mp4', top: 760 },
  { name: 'suspension', src: 'C4D_01_suspension_road.mp4', top: 760 },
]

ensure(OUT)
const aspects = {}
const rel = (p) => relative(join(root, 'public'), p).split('\\').join('/')
const expected = new Set()

for (const c of CLIPS) {
  const dest = join(OUT, `${c.name}.mp4`)
  expected.add(rel(dest))
  if (existsSync(dest) && !force) {
    console.log(`skip  ${c.name}`)
  } else {
    try {
      const r = transcodeAdaptive(join(SRC, c.src), dest, {
        width: 1280,
        crf: 24,
        vfPre: CROP(c.top),
      })
      console.log(`h264  ${c.name}  ${r.label}${r.crf ? ` [crf ${r.crf}]` : ''}`)
    } catch (err) {
      console.warn(`! ${c.name}: ${err.message}`)
      continue
    }
  }
  const d = mp4Dimensions(dest)
  if (d) aspects[rel(dest)] = +(d.width / d.height).toFixed(3)

  const poster = join(OUT, `${c.name}.jpg`)
  expected.add(rel(poster))
  if (force || !existsSync(poster)) {
    // `at` is a fraction of the clip, `quality` is ffmpeg's -q:v (2 is best).
    posterFrame(dest, poster, { width: 1280, at: 0.25, quality: 3 })
    console.log(`jpeg  ${c.name}.jpg`)
  } else {
    console.log(`skip  ${c.name}.jpg`)
  }
}

let pruned = 0
function sweep(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      sweep(p)
      if (readdirSync(p).length === 0) rmSync(p, { recursive: true })
      continue
    }
    if (expected.has(rel(p))) continue
    pruned += statSync(p).size
    console.log(`prune ${rel(p)}`)
    unlinkSync(p)
  }
}
sweep(OUT)
if (pruned) console.log(`pruned ${mb(pruned)}`)

mkdirSync(dirname(MANIFEST), { recursive: true })
writeFileSync(MANIFEST, `${JSON.stringify(aspects, null, 2)}\n`, 'utf8')
console.log(`aspects for ${Object.keys(aspects).length} items -> ${MANIFEST}`)
