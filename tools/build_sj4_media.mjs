/**
 * Builds the Solos Journey 4 page from the Behance kit in X:\FOR_BEHANCE.
 *
 * The page follows the Behance gallery's section order — Concept, Character,
 * Rigging, 2D FX, Animation — but not its plates. Those section headers are
 * plain type on a dark panel baked into a 2560x540 image; on a phone the words
 * shrink to a few pixels, so the site sets them in its own type instead.
 *
 * Deliberately left out:
 *   - SEC_* header plates      replaced by live type (see above)
 *   - CREDITS_2560x1440.png    every name on it is still a "NAME" placeholder
 *   - 06_COMPOSITING           only header plates, no content yet
 *   - COVER_808x632.png        Behance-specific thumbnail with the title baked in
 *
 * Rigging is cut from the ORIGINAL screen recordings, not from the GIFs: the
 * windows and viewport crops below are copied from video_jobs() in
 * X:\FOR_BEHANCE\_src\build_for_behance.py, so these are the same highlights
 * without the GIFs' 128-colour palette and denoise.
 *
 * Usage: node tools/build_sj4_media.mjs [--force]
 */
import sharp from 'sharp'
import { existsSync, readdirSync, writeFileSync, mkdirSync, statSync } from 'node:fs'
import { resolve, dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { converters, ensure, report, mb } from './lib/media.mjs'
import { transcode, transcodeAdaptive, hasFfmpeg } from './lib/video.mjs'
import { mp4Dimensions } from './lib/mp4.mjs'

if (!hasFfmpeg()) {
  console.error('ffmpeg not found — see tools/lib/video.mjs')
  process.exit(1)
}

const SRC = 'X:/FOR_BEHANCE'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'public', 'media', 'work', 'solos-journey-4')
const MANIFEST = join(root, 'src', 'data', 'sj4.aspects.json')
const force = process.argv.includes('--force')

const c = converters({ out: OUT, force })
ensure(OUT)

// Boards carry small figures and labels, so they keep more width and quality
// than a plain photo would need.
const BOARD = { width: 2400, quality: 86 }
const POSTER = { width: 2560, quality: 86 }
const THUMB = { width: 1600, quality: 82 }

const aspects = {}
const rel = (p) => relative(join(root, 'public'), p).split('\\').join('/')

async function still(src, dest, opts) {
  await c.jpeg(src, dest, opts)
  const m = await sharp(dest).metadata()
  aspects[rel(dest)] = +(m.width / m.height).toFixed(3)
}

function clip(label, dest, run) {
  if (existsSync(dest) && !force) {
    console.log(`skip  ${label}`)
  } else {
    try {
      const r = run()
      console.log(`h264  ${label}  ${r.label ?? mb(statSync(dest).size)}${r.crf ? ` [crf ${r.crf}]` : ''}`)
    } catch (err) {
      console.warn(`! ${label}: ${err.message}`)
      return
    }
  }
  const d = mp4Dimensions(dest)
  if (d) aspects[rel(dest)] = +(d.width / d.height).toFixed(3)
}

// ---- hero ----------------------------------------------------------------- //
const HERO = `${SRC}/00_SECTIONS/HERO_BANNERS/HERO_2560x1440_notype.png`
await still(HERO, join(OUT, 'poster.jpg'), POSTER)
await c.jpeg(HERO, join(OUT, 'thumb.jpg'), THUMB)

// ---- concept -------------------------------------------------------------- //
console.log('\nconcept')
await still(`${SRC}/01_CONCEPT/CONCEPT_board.png`, join(OUT, 'concept', '01.jpg'), BOARD)
await still(`${SRC}/01_CONCEPT/CONCEPT_vs_3D_board.png`, join(OUT, 'concept', '02.jpg'), BOARD)

// ---- character ------------------------------------------------------------ //
console.log('\ncharacter')
await still(`${SRC}/02_CHARACTER/CHARACTER_board_01_base.png`, join(OUT, 'character', '01.jpg'), BOARD)
await still(`${SRC}/02_CHARACTER/CHARACTER_board_02_cloak.png`, join(OUT, 'character', '02.jpg'), BOARD)

// ---- rigging -------------------------------------------------------------- //
// Plain transcode, not the adaptive one: these are 6 s cuts, so comparing the
// result against the whole 20 MB recording says nothing about efficiency.
console.log('\nrigging (cut from the original recordings)')
const BODY_CROP = 'crop=1152:960:261:80' // viewport + Rig Layers panel
const BUSH_CROP = 'crop=1152:864:292:84'
const RIG = [
  ['01', `${SRC}/03_RIGGING/RIGGING.mp4`, 26, BODY_CROP],
  ['02', `${SRC}/03_RIGGING/RIGGING.mp4`, 45, BODY_CROP],
  ['03', `${SRC}/03_RIGGING/RIGGING.mp4`, 95, BODY_CROP],
  ['04', `${SRC}/03_RIGGING/RIGGING.mp4`, 121, BODY_CROP],
  ['05', `${SRC}/03_RIGGING/RIGGING_02.mp4`, 9, BUSH_CROP],
]
for (const [n, src, t0, crop] of RIG) {
  const dest = join(OUT, 'rig', `${n}.mp4`)
  // Viewport UI is flat colour and fine lines — it compresses well, but the
  // wireframes smear first, so this stays a little tighter than a render.
  clip(`rig/${n}.mp4`, dest, () =>
    transcode(src, dest, { width: 1152, crf: 25, start: t0, duration: 6, vfPre: crop }),
  )
}

// ---- 2D FX ---------------------------------------------------------------- //
console.log('\n2d fx')
{
  const dest = join(OUT, 'fx', 'compare.mp4')
  clip('fx/compare.mp4', dest, () =>
    transcodeAdaptive(`${SRC}/04_2D_FX/2D_FX_compare_1920x540.mp4`, dest, { width: 1920, crf: 24 }),
  )
}

// ---- animation ------------------------------------------------------------ //
// Source names are "<shot>_шот_риг<in>-<out>.mp4". Sorted by the shot number,
// not lexically — lexical order puts 10, 11, 12 before 2.
console.log('\nanimation')
const ANIM_DIR = `${SRC}/05_ANIMATION`
const shots = readdirSync(ANIM_DIR)
  .filter((f) => /\.mp4$/i.test(f))
  .map((f) => ({ f, n: parseInt(f, 10) }))
  .filter((s) => Number.isFinite(s.n))
  .sort((a, b) => a.n - b.n)

for (const { f, n } of shots) {
  const nn = String(n).padStart(2, '0')
  const dest = join(OUT, 'anim', `${nn}.mp4`)
  clip(`anim/${nn}.mp4`, dest, () =>
    transcodeAdaptive(join(ANIM_DIR, f), dest, { width: 1280, crf: 26 }),
  )
}

mkdirSync(dirname(MANIFEST), { recursive: true })
writeFileSync(MANIFEST, `${JSON.stringify(aspects, null, 2)}\n`, 'utf8')
report(c.tally, OUT)
console.log(`aspects for ${Object.keys(aspects).length} items -> ${MANIFEST}`)
