/**
 * Shared image/animation conversion for the per-project media scripts.
 *
 * There is no ffmpeg on this machine, so sharp does everything. The important
 * trick is GIF -> animated WebP: it plays in a plain <img>, weighs roughly a
 * tenth of the GIF, and is the only route to animation available here.
 */
import sharp from 'sharp'
import { mkdirSync, readdirSync, statSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

export const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`

export const ensure = (dir) => mkdirSync(dir, { recursive: true })

export const list = (dir, re) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => re.test(f)).sort() : []

/** Numeric sort, so 9.png lands before 10.png instead of after it. */
export const listNumeric = (dir, re) =>
  list(dir, re).sort((a, b) => {
    const n = (s) => parseInt(s.match(/\d+/)?.[0] ?? '0', 10)
    return n(a) - n(b)
  })

export function makeCounter() {
  return { in: 0, out: 0 }
}

/**
 * Builds one conversion suite bound to an output root, a force flag and a
 * byte counter, so the per-project scripts stay declarative.
 */
export function converters({ out, force = false, tally = makeCounter() }) {
  const rel = (p) => p.replace(out, '')

  const skip = (dest) => {
    if (existsSync(dest) && !force) {
      console.log(`skip  ${rel(dest)}`)
      return true
    }
    ensure(dirname(dest))
    return false
  }

  return {
    tally,

    /** Still image -> progressive JPEG. */
    async jpeg(src, dest, { width, quality }) {
      if (skip(dest)) return
      const from = statSync(src).size
      const info = await sharp(src)
        .resize({ width, withoutEnlargement: true })
        .jpeg({ quality, mozjpeg: true, progressive: true })
        .toFile(dest)
      tally.in += from
      tally.out += info.size
      console.log(`jpeg  ${rel(dest)}  ${mb(from)} -> ${mb(info.size)}`)
    },

    /** Animated GIF -> animated WebP, every frame preserved. */
    async animWebp(src, dest, { width, quality }) {
      if (skip(dest)) return
      const from = statSync(src).size
      // Without `animated: true` sharp silently keeps only the first frame.
      const info = await sharp(src, { animated: true })
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 4 })
        .toFile(dest)
      tally.in += from
      tally.out += info.size
      console.log(`webp  ${rel(dest)}  ${mb(from)} -> ${mb(info.size)}  (${await pages(src)} frames)`)
    },

    /**
     * One frame out of an animation, as a JPEG. `at` is a 0..1 position — the
     * middle beats the first frame, which is often a fade from black.
     */
    async frame(src, dest, { width, quality, at = 0.5 }) {
      if (skip(dest)) return
      const total = await pages(src)
      const page = Math.max(0, Math.min(total - 1, Math.round((total - 1) * at)))
      // `page` picks a single frame; no `animated`, so output is a still.
      const info = await sharp(src, { page })
        .resize({ width, withoutEnlargement: true })
        .jpeg({ quality, mozjpeg: true, progressive: true })
        .toFile(dest)
      tally.out += info.size
      console.log(`frame ${rel(dest)}  page ${page}/${total - 1} -> ${mb(info.size)}`)
    },
  }
}

export async function pages(src) {
  try {
    return (await sharp(src).metadata()).pages ?? 1
  } catch {
    return 1
  }
}

export function report(tally, out) {
  console.log(`\ntotal ${mb(tally.in)} -> ${mb(tally.out)}`)
  console.log(`out: ${out}`)
}

export { join, existsSync }
