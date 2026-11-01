/**
 * Builds the pictures that belong to a home-page category rather than to one
 * project: the panel covers, and the Coming soon banner.
 *
 * - Dota 2 is a frame from the Divine Rampage master. The site's own clips were
 *   made from 952px GIFs, far too soft for a panel 720px tall.
 * - Call of Duty comes from X:\COD_RENDERS, which holds 1280px previews, not
 *   final renders. The cover source is a viewport grab, so the editor toolbar
 *   across the top is cropped off.
 *
 * Usage: node tools/build_category_covers.mjs [--force]
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { ensure, mb } from './lib/media.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'public', 'media', 'categories')
const FFMPEG = process.env.FFMPEG_PATH ?? 'X:\\tools\\ffmpeg\\bin\\ffmpeg.exe'
const force = process.argv.includes('--force')

const RENDERS = 'X:/COD_RENDERS'
const RAMPAGE = 'X:/DOTA-2-SHORTFILM_2025/FULL_OUTPUTS/Test_version_003.mp4'
const RAMPAGE_AT = 34.0
// The master is 2560x1440 with the 2560x1080 picture letterboxed inside it.
const RAMPAGE_CROP = 'crop=2560:1080:0:180'

const COVER = { width: 2200, quality: 86 }
// These two are already small; re-encoding them harder only adds artefacts.
const PREVIEW = { width: 1280, quality: 90 }

const JOBS = [
  { name: 'dota-2.jpg', frame: true, ...COVER },
  {
    name: 'call-of-duty.jpg',
    src: join(RENDERS, 'photo_2026-10-27_18-36-04 (2).jpg'),
    extract: { left: 0, top: 15, width: 1280, height: 587 },
    ...PREVIEW,
  },
  { name: 'call-of-duty-banner.jpg', src: join(RENDERS, 'photo_2026-10-28_23-18-47.jpg'), ...PREVIEW },
]

/** One frame of the master as a lossless temp file, so sharp does the only encode. */
function rampageFrame(dir) {
  const dest = join(dir, 'frame.png')
  const res = spawnSync(FFMPEG, [
    '-y', '-loglevel', 'error',
    '-ss', String(RAMPAGE_AT),
    '-i', RAMPAGE,
    '-frames:v', '1',
    '-vf', RAMPAGE_CROP,
    dest,
  ])
  if (res.status !== 0) throw new Error(`ffmpeg: ${res.stderr}`)
  return dest
}

ensure(OUT)
const tmp = mkdtempSync(join(tmpdir(), 'covers-'))

for (const { name, src, frame, extract, width, quality } of JOBS) {
  const dest = join(OUT, name)
  if (existsSync(dest) && !force) {
    console.log(`skip  ${name}`)
    continue
  }
  const from = frame ? rampageFrame(tmp) : src
  let img = sharp(from)
  if (extract) img = img.extract(extract)
  await img
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true, progressive: true })
    .toFile(dest)
  console.log(`jpeg  ${name}  ${mb(statSync(dest).size)}`)
}

rmSync(tmp, { recursive: true, force: true })
