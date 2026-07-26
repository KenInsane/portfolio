/**
 * Builds a labelled contact sheet from a list of images so the content can be
 * eyeballed in one look.
 *
 * Browser screenshots are unreliable in this setup, but writing a JPEG to disk
 * and reading it back works — so this is the way to actually see what a folder
 * of stills and GIFs contains before wiring any of it into a page. GIFs are
 * read without `animated`, which yields frame one.
 *
 * Usage: node tools/contact_sheet.mjs <listFile.json> <out.jpg>
 *   listFile.json: [{ "file": "abs/path.png", "label": "shown on tile" }, ...]
 */
import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const [listPath, outPath, colsArg, tileArg] = process.argv.slice(2)
if (!listPath || !outPath) {
  console.error('usage: node tools/contact_sheet.mjs <list.json> <out.jpg> [cols] [tileWidth]')
  process.exit(1)
}

// PowerShell's `Out-File -Encoding utf8` writes a BOM, which JSON.parse rejects.
const items = JSON.parse(readFileSync(resolve(listPath), 'utf8').replace(/^﻿/, ''))
const COLS = Number(colsArg) || 4
const TW = Number(tileArg) || 460
const TH = Math.round((TW * 9) / 16) // wide sources letterbox inside, fine here
const PAD = 24 // room for the label strip under each tile

const rows = Math.ceil(items.length / COLS)
const W = COLS * TW
const H = rows * (TH + PAD)

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const layers = []
for (let i = 0; i < items.length; i++) {
  const { file, label } = items[i]
  const col = i % COLS
  const row = Math.floor(i / COLS)
  const x = col * TW
  const y = row * (TH + PAD)

  try {
    // Middle frame, not the first: effects clips usually open on black, so a
    // sheet built from frame 0 shows a grid of empty boxes.
    let page = 0
    try {
      const total = (await sharp(file).metadata()).pages ?? 1
      page = Math.floor((total - 1) / 2)
    } catch {
      /* single-page input */
    }

    const buf = await sharp(file, page ? { page } : undefined)
      .resize({ width: TW - 4, height: TH - 4, fit: 'contain', background: '#000' })
      .toBuffer()
    layers.push({ input: buf, left: x + 2, top: y + 2 })
  } catch (err) {
    console.warn(`! ${label}: ${err.message}`)
  }

  const svg = Buffer.from(
    `<svg width="${TW}" height="${PAD}" xmlns="http://www.w3.org/2000/svg">
       <rect width="100%" height="100%" fill="#101010"/>
       <text x="8" y="18" font-family="monospace" font-size="15" fill="#39ff5f">${i + 1}</text>
       <text x="34" y="18" font-family="monospace" font-size="15" fill="#e8e8e8">${esc(label)}</text>
     </svg>`,
  )
  layers.push({ input: svg, left: x, top: y + TH })
}

mkdirSync(dirname(resolve(outPath)), { recursive: true })
await sharp({ create: { width: W, height: H, channels: 3, background: '#000' } })
  .composite(layers)
  .jpeg({ quality: 76 })
  .toFile(resolve(outPath))

console.log(`${items.length} tiles -> ${outPath} (${W}x${H})`)
items.forEach((it, i) => console.log(`${String(i + 1).padStart(2, '0')}  ${it.label}`))
