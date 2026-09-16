/**
 * Builds the Solos Journey 4 page from the Behance kit in X:\FOR_BEHANCE.
 *
 * The site shows only the user's own part of this collaboration: the VFX, and
 * shots SH07, SH08 and SH10. Everything else — concept, character, rigging, the
 * other nine shots — belongs to the rest of the team and is reachable through
 * the Behance link on the page instead. Output for any of those is pruned, so a
 * build never ships media that the page no longer shows.
 *
 * The cover is a frame of the final VFX comp rather than the kit's hero image:
 * the hero is a shot the user did not work on, and the cover is also the card
 * on the home page.
 *
 * Usage: node tools/build_sj4_media.mjs [--force]
 */
import sharp from 'sharp'
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, writeFileSync, mkdirSync, unlinkSync, rmSync, statSync } from 'node:fs'
import { resolve, dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { converters, ensure, report, mb } from './lib/media.mjs'
import { transcodeAdaptive, hasFfmpeg } from './lib/video.mjs'
import { mp4Dimensions } from './lib/mp4.mjs'

if (!hasFfmpeg()) {
  console.error('ffmpeg not found — see tools/lib/video.mjs')
  process.exit(1)
}

const FFMPEG = 'X:\\tools\\ffmpeg\\bin\\ffmpeg.exe'
const SRC = 'X:/FOR_BEHANCE'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'public', 'media', 'work', 'solos-journey-4')
const MANIFEST = join(root, 'src', 'data', 'sj4.aspects.json')
const force = process.argv.includes('--force')

// The user's shots, by the number the playblast files lead with.
const MY_SHOTS = [7, 8, 10]

// The one moment in the final comp where "THE TRUTH WILL BE KNOWN" is fully
// drawn — a second earlier "KNOWN" is still being written, a second later the
// lettering has swapped for the grinning-face doodles.
const COVER_SOURCE = `${SRC}/04_2D_FX/2D_FX_02.mp4`
const COVER_AT = 2.0

const c = converters({ out: OUT, force })
ensure(OUT)

const aspects = {}
const rel = (p) => relative(join(root, 'public'), p).split('\\').join('/')
const expected = new Set()

function clip(label, dest, run) {
  expected.add(rel(dest))
  if (existsSync(dest) && !force) {
    console.log(`skip  ${label}`)
  } else {
    try {
      const r = run()
      console.log(`h264  ${label}  ${r.label}${r.crf ? ` [crf ${r.crf}]` : ''}`)
    } catch (err) {
      console.warn(`! ${label}: ${err.message}`)
      return
    }
  }
  const d = mp4Dimensions(dest)
  if (d) aspects[rel(dest)] = +(d.width / d.height).toFixed(3)
}

// ---- cover: a frame of the user's own VFX comp ---------------------------- //
{
  const frame = join(OUT, '_cover_frame.png')
  const poster = join(OUT, 'poster.jpg')
  const thumb = join(OUT, 'thumb.jpg')
  expected.add(rel(poster))
  expected.add(rel(thumb))

  if (force || !existsSync(poster) || !existsSync(thumb)) {
    // Lossless grab first, so the JPEG encode is the only compression step.
    const r = spawnSync(
      FFMPEG,
      ['-y', '-loglevel', 'error', '-ss', String(COVER_AT), '-i', COVER_SOURCE, '-frames:v', '1', frame],
      { encoding: 'utf8' },
    )
    if (r.status !== 0) throw new Error(`cover frame: ${r.stderr}`)
    // The comp is 1920 wide; never upscale it for the poster.
    await c.jpeg(frame, poster, { width: 1920, quality: 88 })
    await c.jpeg(frame, thumb, { width: 1600, quality: 84 })
    unlinkSync(frame)
  } else {
    console.log('skip  cover')
  }
  const m = await sharp(poster).metadata()
  aspects[rel(poster)] = +(m.width / m.height).toFixed(3)
}

// ---- VFX ------------------------------------------------------------------ //
console.log('\nvfx')
{
  const dest = join(OUT, 'fx', 'compare.mp4')
  clip('fx/compare.mp4', dest, () =>
    transcodeAdaptive(`${SRC}/04_2D_FX/2D_FX_compare_1920x540.mp4`, dest, { width: 1920, crf: 24 }),
  )
}

// ---- the user's shots ----------------------------------------------------- //
// Source names are "<shot>_шот_риг<in>-<out>.mp4"; matched on the leading number.
console.log('\nshots')
const ANIM_DIR = `${SRC}/05_ANIMATION`
const sources = new Map(
  readdirSync(ANIM_DIR)
    .filter((f) => /\.mp4$/i.test(f))
    .map((f) => [parseInt(f, 10), f])
    .filter(([n]) => Number.isFinite(n)),
)

for (const n of MY_SHOTS) {
  const f = sources.get(n)
  const nn = String(n).padStart(2, '0')
  if (!f) {
    console.warn(`! no source for SH${nn}`)
    continue
  }
  const dest = join(OUT, 'shots', `sh${nn}.mp4`)
  clip(`shots/sh${nn}.mp4`, dest, () =>
    // Shown one per row at full width, so these get more pixels than a grid clip.
    transcodeAdaptive(join(ANIM_DIR, f), dest, { width: 1600, crf: 24 }),
  )
}

// ---- prune ---------------------------------------------------------------- //
// Anything from an earlier, fuller version of this page (concept, character,
// rigging, the other shots) must not keep shipping in dist.
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
report(c.tally, OUT)
console.log(`aspects for ${Object.keys(aspects).length} items -> ${MANIFEST}`)
