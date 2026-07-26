/**
 * Turns the Divine Rampage delivery folders into web assets.
 *
 * The material splits three ways, and each part gets different treatment:
 *   Gifs/01–05           finished graded shots, all 952x532 -> full-width plates
 *   BREAKDOWN/IMG_READY_2USE   the images posted as the breakdown, ratios
 *                              1.00–1.85 -> never cropped, letterboxed instead
 *   BREAKDOWN/IMG/<named>.gif  technical clips whose filenames say what they
 *                              are, which is what makes honest captions possible
 *
 * Gifs/07 is deliberately excluded: it is a grey blockout at a different ratio,
 * not a finished shot, so it does not belong beside the graded ones.
 *
 * Usage: node tools/build_rampage_media.mjs [--force]
 */
import { resolve, dirname, join, parse } from 'node:path'
import { fileURLToPath } from 'node:url'
import { converters, listNumeric, ensure, report, existsSync } from './lib/media.mjs'

const SRC = 'X:\\DOTA-2-SHORTFILM_2025'
const BD = join(SRC, 'BREAKDOWN')
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'public', 'media', 'work', 'divine-rampage')
const force = process.argv.includes('--force')

const PLATE = { width: 1280, quality: 70 }
const ANIM = { width: 1100, quality: 68 }
const STILL = { width: 1600, quality: 84 }
const POSTER = { width: 2000, quality: 86 }
const THUMB = { width: 1600, quality: 82 }

// Filenames are the only reliable description of these clips, so the mapping to
// a human caption is written out explicitly rather than derived.
//
// The third element tightens encoding per clip. Noisy simulation footage barely
// compresses at the default setting — the river sim came out at 7.3 MB, which
// is unacceptable for one clip on a page — so those get smaller and softer.
const BREAKDOWN = [
  ['river_mid.gif', 'river-sim', { width: 840, quality: 46 }],
  ['river_mid_fight.gif', 'river-fight', { width: 900, quality: 52 }],
  ['hookdatshit.gif', 'hook-impact'],
  ['tower_rbd.gif', 'tower-destruction'],
  ['fiend_requiem_v3.gif', 'requiem', { width: 1000, quality: 58 }],
  ['shadowraze.gif', 'shadowraze'],
  ['shacklesz.gif', 'shackles'],
  ['desolator_arms.gif', 'desolator', { width: 940, quality: 56 }],
  ['sf.gif', 'fiend-sculpt'],
]

const c = converters({ out: OUT, force })
ensure(OUT)

// ---- cover, taken from the middle of a finished shot --------------------- //
const coverSrc = join(BD, 'Gifs', '04.gif')
if (existsSync(coverSrc)) {
  await c.frame(coverSrc, join(OUT, 'poster.jpg'), { ...POSTER, at: 0.5 })
  await c.frame(coverSrc, join(OUT, 'thumb.jpg'), { ...THUMB, at: 0.5 })
} else {
  console.warn(`! ${coverSrc} missing — no poster built`)
}

// ---- finished shots ----------------------------------------------------- //
console.log('\nfinished shots')
for (const f of ['01.gif', '02.gif', '03.gif', '04.gif', '05.gif']) {
  const src = join(BD, 'Gifs', f)
  if (!existsSync(src)) {
    console.warn(`! missing ${src}`)
    continue
  }
  await c.animWebp(src, join(OUT, 'shots', `${parse(f).name}.webp`), PLATE)
}

// ---- breakdown frames --------------------------------------------------- //
const ready = listNumeric(join(BD, 'IMG_READY_2USE'), /\.png$/i)
console.log(`\n${ready.length} breakdown frames`)
let n = 0
for (const f of ready) {
  n += 1
  await c.jpeg(join(BD, 'IMG_READY_2USE', f), join(OUT, 'frames', `${String(n).padStart(2, '0')}.jpg`), STILL)
}

// ---- breakdown clips ---------------------------------------------------- //
console.log(`\n${BREAKDOWN.length} breakdown clips`)
for (const [file, slug, tighter] of BREAKDOWN) {
  const src = join(BD, 'IMG', file)
  if (!existsSync(src)) {
    console.warn(`! missing ${src}`)
    continue
  }
  await c.animWebp(src, join(OUT, 'bd', `${slug}.webp`), { ...ANIM, ...tighter })
}

report(c.tally, OUT)
