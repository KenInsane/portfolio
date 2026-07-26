/**
 * Tiny local sink for canvas captures.
 *
 * The Browser pane in this setup cannot take screenshots (it does not composite
 * frames unless it is visible), so the page rasterises itself to a canvas and
 * POSTs the bytes here instead of shuttling base64 back through the tooling.
 *
 *   node tools/shot_sink.mjs
 *   fetch('http://127.0.0.1:5199/shot?name=cards', { method:'POST', body: base64 })
 *
 * Writes to tools/_shots/<name>.jpg. Dev-only, binds to loopback.
 */
import { createServer } from 'node:http'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '_shots')
mkdirSync(OUT, { recursive: true })

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
}

createServer((req, res) => {
  if (req.method === 'OPTIONS') return res.writeHead(204, cors).end()
  if (req.method !== 'POST') return res.writeHead(405, cors).end()

  const url = new URL(req.url, 'http://localhost')
  // Keep the name a bare filename — never let a request escape the out dir.
  const name = (url.searchParams.get('name') || 'shot').replace(/[^a-z0-9_-]/gi, '') || 'shot'

  let body = ''
  req.on('data', (c) => (body += c))
  req.on('end', () => {
    try {
      const file = join(OUT, `${name}.jpg`)
      writeFileSync(file, Buffer.from(body.split(',').pop(), 'base64'))
      console.log(`wrote ${file} (${(body.length / 1024).toFixed(0)} KB b64)`)
      res.writeHead(200, cors).end(file)
    } catch (err) {
      console.error(err)
      res.writeHead(500, cors).end(String(err))
    }
  })
}).listen(5199, '127.0.0.1', () => console.log('shot sink on http://127.0.0.1:5199'))
