/**
 * Builds the Solos Journey 4 page.
 *
 * The site shows only the user's own part of this collaboration: shots SH07
 * (Launch Site), SH08 (the boat to the Oil Rig) and SH10 (the rocket raid that
 * closes the film) and his two shot breakdowns. Everything else — concept,
 * character, rigging, animation, 2D FX, the other shots — belongs to the rest
 * of the team and is reachable through the Behance link on the page instead.
 * Output for anything not listed here is pruned, so a build never ships media
 * that the page no longer shows.
 *
 * Sources:
 *   shots      cut from the final film at frame-exact in/out points (the film
 *              itself is not shipped — only these three shots)
 *   breakdowns the two GIFs that open the BREAKDOWN section of the Behance page;
 *              fetch them first with `node tools/fetch_sj4_behance.mjs 16 17`
 *   cover      the clean Launch Site plate the kit's hero was built from (the
 *              hero itself is darkened to sit under type)
 *
 * Usage: node tools/build_sj4_media.mjs [--force]
 */
import sharp from 'sharp'
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

const KIT = 'X:/FOR_BEHANCE'
const FILM = 'C:/Users/Otsutsukinsane.Insane/Downloads/Telegram Desktop/FINAL_1920X1080.mp4'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DL = join(root, 'tools', '_dl', 'sj4')
const OUT = join(root, 'public', 'media', 'work', 'solos-journey-4')
const MANIFEST = join(root, 'src', 'data', 'sj4.aspects.json')
const force = process.argv.includes('--force')

// The film is 30 fps CFR from pts 0. Frame numbers were read off frame strips
// around each cut; `out` is the first frame of the NEXT shot.
const FPS = 30
const SHOTS = [
  // Fades in from black after the whip pan; starts once the fire is readable.
  { name: 'sh07', in: 1195, out: 1355 },
  // Opens and closes on the white lightning flash that bridges the cuts.
  { name: 'sh08', in: 1355, out: 1515 },
  // The last shot before the title card, which cuts to black at 68.9 s.
  { name: 'sh10', in: 1857, out: 2067 },
]

// Behance module index -> page file. 16 is the Launch Site breakdown, 17 the
// Oil Rig one.
const BREAKDOWNS = [
  { module: 16, name: 'sh07' },
  { module: 17, name: 'sh08' },
]

const COVER = `${KIT}/_src/plate_launch_f1310.png`

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

// ---- cover ---------------------------------------------------------------- //
{
  const poster = join(OUT, 'poster.jpg')
  const thumb = join(OUT, 'thumb.jpg')
  expected.add(rel(poster))
  expected.add(rel(thumb))
  if (force || !existsSync(poster) || !existsSync(thumb)) {
    await c.jpeg(COVER, poster, { width: 1920, quality: 88 })
    await c.jpeg(COVER, thumb, { width: 1600, quality: 84 })
  } else {
    console.log('skip  cover')
  }
  const m = await sharp(poster).metadata()
  aspects[rel(poster)] = +(m.width / m.height).toFixed(3)
}

// ---- the user's shots ----------------------------------------------------- //
console.log('\nshots')
for (const s of SHOTS) {
  const dest = join(OUT, 'shots', `${s.name}.mp4`)
  clip(`shots/${s.name}.mp4`, dest, () => {
    if (!existsSync(FILM)) throw new Error(`final film not found at ${FILM}`)
    return transcodeAdaptive(FILM, dest, {
      width: 1600,
      crf: 24,
      // Seek half a frame early: a rounded `in / FPS` can land a hair past the
      // frame's pts, and ffmpeg then starts one frame late (and ends one late).
      start: ((s.in - 0.5) / FPS).toFixed(4),
      // Half a frame short, so the first frame of the next shot never sneaks in.
      duration: ((s.out - s.in - 0.5) / FPS).toFixed(4),
    })
  })
}

// ---- breakdowns ----------------------------------------------------------- //
console.log('\nbreakdowns')
for (const b of BREAKDOWNS) {
  const dest = join(OUT, 'breakdown', `${b.name}.mp4`)
  const src = join(DL, `${String(b.module).padStart(2, '0')}.gif`)
  clip(`breakdown/${b.name}.mp4`, dest, () => {
    if (!existsSync(src)) throw new Error(`run: node tools/fetch_sj4_behance.mjs ${b.module}`)
    // The GIFs are already palette-reduced; CRF 28 is indistinguishable from 24
    // at 1:1 on these flat clay renders and ~40% lighter.
    return transcodeAdaptive(src, dest, { width: 1600, crf: 28 })
  })
}

// ---- prune ---------------------------------------------------------------- //
// Anything from an earlier version of this page (concept, character, rigging,
// the animation playblasts) must not keep shipping in dist.
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
