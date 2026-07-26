/**
 * Proves the standalone build can run from a file:// path.
 *
 * The only thing file:// actually forbids is *fetching* — external scripts,
 * stylesheets, fonts and ES modules. So the check is simply: does anything in
 * this document still point outside itself? Zero external references means
 * zero fetches, which means it renders the same from disk as from a server.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const file = resolve(process.argv[2] ?? 'portfolio_standalone.html')
const html = readFileSync(file, 'utf8')

const isLocal = (v) => /^(data:|#|about:|%23)/i.test(v)

// Script bodies are full of minified string-building like href="`+i+`", which
// is not a reference to anything. Only real markup attributes count, so drop
// the script contents before scanning for them.
const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '<script></script>')

const refs = [...markup.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)]
  .map((m) => m[1])
  .filter((v) => !isLocal(v))

const cssUrls = [...html.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)]
  .map((m) => m[1])
  .filter((v) => !isLocal(v))

// A literal dynamic import is a real fetch; React Router's import(e.module) is
// dead code without lazy routes, so only string literals count.
const dynImports = [...html.matchAll(/\bimport\s*\(\s*["']([^"']+)["']/g)].map((m) => m[1])

const checks = [
  ['inline module script', /<script type="module">/.test(html)],
  ['root mount point', /<div id="root">/.test(html)],
  ['fonts embedded', (html.match(/data:font\/woff2;base64/g) || []).length >= 8],
  ['no external src/href', refs.length === 0],
  ['no external css url()', cssUrls.length === 0],
  ['no literal dynamic import', dynImports.length === 0],
]

for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
if (refs.length) console.log('  external refs:', refs.slice(0, 8).join(' | '))
if (cssUrls.length) console.log('  external url():', cssUrls.slice(0, 8).join(' | '))
if (dynImports.length) console.log('  dynamic imports:', dynImports.join(' | '))

const woff2 = (html.match(/data:font\/woff2;base64/g) || []).length
console.log(`\nsize ${(html.length / 1024).toFixed(1)} kB, ${woff2} embedded fonts`)

process.exit(checks.every(([, ok]) => ok) ? 0 : 1)
