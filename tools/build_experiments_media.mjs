/**
 * Builds the Experiments page media from the loose clips on the Desktop.
 *
 * Two sources, two treatments:
 *   *.gif  -> animated WebP (sharp). Tighter than the project pages, because
 *             this page carries ~20 animations at once rather than five.
 *   *.mp4  -> copied as-is. There is no ffmpeg here, and re-encoding is not
 *             needed: they are already small and <video> plays them directly.
 *
 * The list is curated by hand on purpose — see NOTES at the bottom for what was
 * left out and why. Anything client-branded or not the user's own footage stays
 * off a page titled "Personal Experiments".
 *
 * Usage: node tools/build_experiments_media.mjs [--force]
 */
import sharp from 'sharp'
import {
  copyFileSync,
  statSync,
  existsSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { converters, ensure, report, mb } from './lib/media.mjs'
import { mp4Dimensions } from './lib/mp4.mjs'
import { transcodeAdaptive, hasFfmpeg } from './lib/video.mjs'

if (!hasFfmpeg()) {
  console.error('ffmpeg not found — see tools/lib/video.mjs for the expected path')
  process.exit(1)
}

// Grid previews, not hero plates. 1000 is still above the ~617 CSS px they
// render at, they play muted so the audio track is dead weight, and every clip
// on this page now uses the same target — there is no reason for a clip that
// started life as an MP4 to be heavier than one that started as a GIF.
const VIDEO_ENCODE = { width: 1000, crf: 28, audio: false }

/**
 * Animated sources ship as H.264, not animated WebP.
 *
 * Measured on four of the heaviest clips: the WebP builds totalled 10.1 MB and
 * the same content at 1000px/CRF 28 came to 4.7 MB — 54% less at a comparable
 * look. (A first attempt at CRF 24 came out *larger* than the WebP; the codec
 * only wins once the quality targets actually match.) The second, bigger win is
 * behavioural: a <video> can be paused off-screen, while an animated WebP in an
 * <img> decodes forever whether or not anyone is looking at it.
 */
const ANIM_ENCODE = { width: 1000, crf: 28, audio: false }

const DESK = join(process.env.USERPROFILE ?? '', 'Desktop')
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'public', 'media', 'experiments')
const force = process.argv.includes('--force')

// Many animations on one page, so these are leaner than the project settings.
const ANIM = { width: 900, quality: 55 }
// A few carry fine filament detail that falls apart when squeezed this hard.
const ANIM_HI = { width: 1000, quality: 62 }

/**
 * The list is exactly what the user asked for, name for name — no additions.
 * Two entries needed a choice because the name was not unique on disk:
 *   "marci fx" -> marci_fx_v005.gif (v001/v002/v004 are earlier passes)
 *   "beam fx"  -> beam_fx_v001.gif  (beam_fx.gif is a near-empty first pass)
 */
const GIFS = [
  ['marci_fx_v005.gif', 'marci'],
  ['beam_fx_v001.gif', 'beam'],
  ['explosion_fonbet_preview_v002.gif', 'explosion-preview'],
  ['cryptosucks.gif', 'cryptosucks'],
  ['rbd_ct.gif', 'rbd-ct'],
  ['rbd_preview.gif', 'rbd-preview'],
  ['smk.gif', 'smoke'],
  ['trail_fx.gif', 'trail'],
  ['transition_fx_v004.gif', 'transition-filaments', ANIM_HI],
  ['sh4fx_v2.gif', 'sh4fx-v2'],
  ['sosal.gif', 'ruins'],
  ['sh2fx.gif', 'sh2fx'],
  ['portal_fx_test_v002.gif', 'portal-test'],
  ['office.gif', 'office'],
]

// Added later, and these live in X:\downloads rather than on the Desktop — the
// source folder is per-entry so both can feed the same page.
const DOWNLOADS = 'X:\\downloads'
const ANTIMAGE = 'X:/_CLOUDE/AntiMage_Assembly'

// Everything here is re-encoded to H.264 (see lib/video.mjs), so the source
// container and codec no longer matter — a QuickTime .mov and an undecodable
// `mp4v` file both come out as ordinary web-playable MP4.
const VIDEOS = [
  ['Bird_SH_01_FX_Preview.mp4', 'bird-fx', DOWNLOADS],
  ['-5890093276378573703.mov', 'clip-mov', DOWNLOADS],
  ['Marci_FX_v001.mp4', 'marci-v001', DOWNLOADS],
  ['terrorblade_fx_v002.mp4', 'terrorblade-v002'],
  ['terrorblade_fx_v004.mp4', 'terrorblade-v004'],
  ['terrorblade_fx_v005.mp4', 'terrorblade-v005'],
  ['trails.mp4', 'trails'],
  ['transition_another.mp4', 'transition-another'],
  ['Untitled.mp4', 'untitled'],
  ['ship_fx.mp4', 'ship'],
  ['portal_v001.mp4', 'portal-v001'],
  ['portal_v002.mp4', 'portal-v002'],
  ['roshan_ice_v2.mp4', 'roshan-ice-v2'],
  ['explo_preview.mp4', 'explo-preview'],
  ['beach_water_rnd.mp4', 'beach-water'],
  ['beach_water_rnd_v2.mp4', 'beach-water-v2'],
  ['Am_rndr.mov', 'antimage-aura', ANTIMAGE, { width: 720, crf: 32 }],
]

const c = converters({ out: OUT, force })
ensure(join(OUT, 'anim'))
ensure(join(OUT, 'video'))

// Every clip's true aspect, written out for the page to declare up front. A
// masonry column layout has to know each frame's shape before the file loads,
// or the whole grid reflows as things arrive.
const aspects = {}

console.log(`${GIFS.length} gifs -> h264`)
for (const [file, slug] of GIFS) {
  const src = join(DESK, file)
  if (!existsSync(src)) {
    console.warn(`! missing ${file}`)
    continue
  }
  const dest = join(OUT, 'anim', `${slug}.mp4`)
  if (existsSync(dest) && !force) {
    console.log(`skip  anim/${slug}.mp4`)
  } else {
    try {
      const r = transcodeAdaptive(src, dest, ANIM_ENCODE)
      console.log(`h264  anim/${slug}.mp4  ${r.label}${r.crf ? ` [crf ${r.crf}]` : ''}`)
    } catch (err) {
      console.warn(`! ${slug}: ${err.message}`)
      continue
    }
  }
  const d = mp4Dimensions(dest)
  if (d) aspects[slug] = +(d.width / d.height).toFixed(3)
  else console.warn(`! no aspect for ${slug}`)
}

console.log(`\n${VIDEOS.length} videos -> copied as-is`)
let vBytes = 0
for (const [file, slug, from, encode] of VIDEOS) {
  const src = join(from ?? DESK, file)
  if (!existsSync(src)) {
    console.warn(`! missing ${src}`)
    continue
  }
  const dest = join(OUT, 'video', `${slug}.mp4`)
  if (existsSync(dest) && !force) {
    console.log(`skip  video/${slug}.mp4`)
    vBytes += statSync(dest).size
    continue
  }
  try {
    const r = transcodeAdaptive(src, dest, { ...VIDEO_ENCODE, ...encode })
    vBytes += r.to
    console.log(`${r.kept ? 'copy' : 'h264'}  video/${slug}.mp4  ${r.label}${r.crf ? ` [crf ${r.crf}]` : ''}`)
  } catch (err) {
    console.warn(`! ${slug}: ${err.message}`)
  }
}

/** Output filename for a video entry — everything lands as .mp4 now. */
const videoName = ([, slug]) => `${slug}.mp4`

// Dimensions come straight from the container — see lib/mp4.mjs. QuickTime
// (.mov) shares the same box layout, so the same walker reads both.
for (const entry of VIDEOS) {
  const name = videoName(entry)
  const dest = join(OUT, 'video', name)
  if (!existsSync(dest)) continue
  const d = mp4Dimensions(dest)
  if (d) {
    aspects[entry[1]] = +(d.width / d.height).toFixed(3)
    if (d.width < 640) console.warn(`! ${name} is only ${d.width}x${d.height} — will look soft`)
  } else {
    console.warn(`! could not read dimensions from ${name}`)
  }
}

// ---- prune ------------------------------------------------------------- //
// Output from an earlier, different list would otherwise sit in public/ and
// keep shipping in dist/ — megabytes for clips that are no longer on the page.
// Everything here is regenerated from the Desktop, so removal is cheap.
const expected = {
  anim: new Set(GIFS.map(([, slug]) => `${slug}.mp4`)),
  video: new Set(VIDEOS.map(videoName)),
}
let pruned = 0
for (const [dir, keep] of Object.entries(expected)) {
  const d = join(OUT, dir)
  if (!existsSync(d)) continue
  for (const f of readdirSync(d)) {
    if (keep.has(f)) continue
    const p = join(d, f)
    const size = statSync(p).size
    unlinkSync(p)
    pruned += size
    console.log(`prune ${dir}/${f}  ${mb(size)}`)
  }
}
if (pruned) console.log(`pruned ${mb(pruned)} of stale output`)

report(c.tally, OUT)
console.log(`video total ${mb(vBytes)}`)

// Written next to the data so `experiments.js` can attach a shape to each entry
// without anyone maintaining the numbers by hand.
const manifest = join(root, 'src', 'data', 'experiments.aspects.json')
const sorted = Object.fromEntries(Object.keys(aspects).sort().map((k) => [k, aspects[k]]))
writeFileSync(manifest, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8')

const vals = Object.values(aspects)
console.log(`\naspects for ${vals.length} clips, ${Math.min(...vals)}–${Math.max(...vals)}`)
console.log(`wrote ${manifest}`)

/* NOTES
 *   The list above is the user's own, chosen after they were shown what the
 *   clips contain — so it is the spec, not a suggestion. Two things they should
 *   keep in mind rather than have quietly filtered out:
 *     - explosion_fonbet_preview_v002 comes from Fonbet client work.
 *     - office.gif and cryptosucks.gif are screen captures, not rendered work.
 *   sosal.gif ships as 'ruins' — the clip is a greybox ruin, and the filename
 *   is not something to print under a frame in a portfolio.
 *
 *   X:\downloads\Bird_SH_01_FX_Preview.mp4 is EXCLUDED: its video track is
 *   `mp4v` (MPEG-4 Part 2), which Chrome dropped — it fails with
 *   DEMUXER_ERROR_NO_SUPPORTED_STREAMS. There is no ffmpeg here to re-encode
 *   it, so it needs an H.264 export before it can go on the page.
 *
 *   X:\downloads\-5890093276378573703.mov is only 320x172 — it will look soft
 *   at any real size on the page.
 */
