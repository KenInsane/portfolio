/**
 * Prints dimensions and aspect ratios for a folder of images, plus the spread,
 * so a page can be laid out for what the assets actually are instead of
 * assuming they all share one ratio.
 *
 * Usage: node tools/probe_sizes.mjs <dir> [ext]
 */
import sharp from 'sharp'
import { readdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const dir = resolve(process.argv[2])
const ext = new RegExp(`\\.(${(process.argv[3] ?? 'png|jpg|jpeg|gif|webp').replace(/\./g, '')})$`, 'i')
if (!existsSync(dir)) {
  console.error(`missing: ${dir}`)
  process.exit(1)
}

const files = readdirSync(dir).filter((f) => ext.test(f)).sort()
const ratios = []

for (const f of files) {
  try {
    const m = await sharp(join(dir, f)).metadata()
    const r = m.width / m.height
    ratios.push(r)
    console.log(`${f.padEnd(34)} ${m.width}x${m.height}  ${r.toFixed(2)}  pages=${m.pages ?? 1}`)
  } catch (err) {
    console.warn(`! ${f}: ${err.message}`)
  }
}

if (ratios.length) {
  const min = Math.min(...ratios)
  const max = Math.max(...ratios)
  const uniform = max - min < 0.06
  console.log(
    `\n${ratios.length} files, ratio ${min.toFixed(2)}–${max.toFixed(2)} => ` +
      (uniform ? 'UNIFORM (safe to crop to one ratio)' : 'MIXED (cropping would lose content)'),
  )
}
