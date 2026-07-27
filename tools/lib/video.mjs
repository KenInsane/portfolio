/**
 * H.264 transcode for anything that ships as <video>.
 *
 * Sources here are masters: 2560-wide previews at whatever bitrate the export
 * used, and in one case an `mp4v` (MPEG-4 Part 2) track that browsers no longer
 * decode at all. Re-encoding fixes both the weight and the compatibility.
 *
 * ffmpeg lives at X:\tools\ffmpeg (installed there rather than system-wide
 * because the C: drive is full).
 */
import { spawnSync } from 'node:child_process'
import {
  existsSync,
  statSync,
  renameSync,
  unlinkSync,
  mkdirSync,
  readFileSync,
  copyFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'

const FFMPEG = process.env.FFMPEG_PATH ?? 'X:\\tools\\ffmpeg\\bin\\ffmpeg.exe'

export const hasFfmpeg = () => existsSync(FFMPEG)

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`

/**
 * @param src  source file
 * @param dest .mp4 to write
 * @param opts width  cap on the long edge (height follows, kept even)
 *             crf    quality, lower is better; 23–26 is the sane band
 *             audio  keep the audio track (off by default: these play muted)
 */
export function transcode(src, dest, { width = 1440, crf = 24, audio = false, start, duration } = {}) {
  mkdirSync(dirname(dest), { recursive: true })
  const tmp = `${dest}.tmp.mp4`

  const args = [
    '-y',
    '-loglevel', 'error',
    // -ss before -i seeks by keyframe, which is fast and accurate enough here.
    ...(start ? ['-ss', String(start)] : []),
    ...(duration ? ['-t', String(duration)] : []),
    '-i', src,
    // Never upscale: `min(iw,W)` leaves smaller sources alone. Both axes must
    // come out even or libx264 refuses — `-2` handles the height, and trunc()
    // handles the width, which otherwise passes an odd source size straight
    // through (a 923px-wide GIF failed exactly this way).
    '-vf', `scale='trunc(min(iw,${width})/2)*2':-2:flags=lanczos`,
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', String(crf),
    // 4:2:0 + High profile is what every browser and phone can decode.
    '-pix_fmt', 'yuv420p',
    '-profile:v', 'high',
    // Puts the index at the front so playback can start before the full file
    // has arrived — the difference between instant and stalled on the web.
    '-movflags', '+faststart',
    ...(audio ? ['-c:a', 'aac', '-b:a', '128k'] : ['-an']),
    tmp,
  ]

  const res = spawnSync(FFMPEG, args, { encoding: 'utf8' })
  if (res.status !== 0) {
    if (existsSync(tmp)) unlinkSync(tmp)
    throw new Error(`ffmpeg failed on ${src}: ${(res.stderr || '').trim().slice(0, 300)}`)
  }

  const from = statSync(src).size
  renameSync(tmp, dest)
  const to = statSync(dest).size
  return { from, to, label: `${mb(from)} -> ${mb(to)}` }
}

/** True if the container already holds a codec every browser can decode. */
export function isWebCodec(src) {
  const head = readFileSync(src).subarray(0, 3_000_000).toString('latin1')
  return head.includes('avc1') || head.includes('avc3')
}

/**
 * Transcodes, but refuses to make a file bigger.
 *
 * Some sources are already tightly encoded, and a fixed CRF can easily spend
 * more bits than the original — one 6.7 MB clip came back at 13 MB. So quality
 * is stepped down until the result is actually smaller, and if even the last
 * step loses, the original is kept whenever it is already web-playable.
 */
export function transcodeAdaptive(src, dest, { crfs, crf, ...rest } = {}) {
  // A caller passing `crf` means "start here", not "ignore me" — the ladder is
  // built from it. Passing `crfs` explicitly still wins.
  const ladder = crfs ?? (crf ? [crf, crf + 4, crf + 8] : [24, 28, 32])
  const srcSize = statSync(src).size
  let best = null

  for (const step of ladder) {
    const r = transcode(src, dest, { ...rest, crf: step })
    // 0.9 rather than 1.0: a 5% saving is not worth a re-encode's quality cost.
    if (r.to <= srcSize * 0.9) return { ...r, crf: step, kept: false }
    best = { ...r, crf: step }
  }

  if (isWebCodec(src)) {
    copyFileSync(src, dest)
    return { from: srcSize, to: srcSize, crf: null, kept: true, label: `${mb(srcSize)} kept as-is` }
  }

  // Not web-playable, so the bigger re-encode is still the only usable option.
  return { ...best, kept: false, label: `${best.label} (grew, but source is not web-playable)` }
}

export { join }
