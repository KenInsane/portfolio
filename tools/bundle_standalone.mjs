/**
 * Folds `dist/` into one self-contained .html that runs from a file:// path.
 *
 * Why this exists: a plain `dist/index.html` opened as a file cannot load its
 * own bundle, because browsers refuse to fetch ES modules over file:// (CORS
 * applies, and a file has no origin). Inlining sidesteps it entirely — an
 * inline module never gets fetched, so it just runs. Fonts have the same
 * problem and become data: URIs.
 *
 * Usage: node tools/bundle_standalone.mjs [outFile]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const assets = join(dist, 'assets')
// Defaults into dist/ on purpose: project media is referenced by relative path
// ('media/work/...', 'videos/...'), which only resolves if the page sits beside
// the folders Vite copies out of public/.
const out = resolve(root, process.argv[2] ?? 'dist/portfolio_standalone.html')

const MIME = {
  woff2: 'font/woff2',
  woff: 'font/woff',
  ttf: 'font/ttf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
}

const files = readdirSync(assets)
const pick = (ext) => {
  const hit = files.find((f) => f.endsWith(ext))
  if (!hit) throw new Error(`no ${ext} in dist/assets — run the build first`)
  return hit
}

const dataUri = (name) => {
  const ext = name.split('.').pop().toLowerCase()
  const mime = MIME[ext]
  if (!mime) return null
  return `data:${mime};base64,${readFileSync(join(assets, name)).toString('base64')}`
}

/**
 * Rewrites every local url(...) in the stylesheet to an inline data: URI.
 *
 * The built CSS lives in dist/assets/ alongside its fonts, so its references
 * are bare siblings — url(./inter-xxx.woff2), with no assets/ prefix. Match on
 * the basename and look it up in the assets dir rather than trusting the path.
 */
function inlineUrls(css) {
  let done = 0
  let missed = 0

  const next = css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (whole, _q, ref) => {
    // Absolute, already-inline and fragment-only references are not ours.
    // %23 covers fragments nested inside an encoded SVG data: URI (url(%23n)).
    if (/^(data:|https?:|\/\/|#|%23)/i.test(ref)) return whole

    const name = ref.split(/[?#]/)[0].split('/').pop()
    if (!files.includes(name)) {
      missed += 1
      console.warn(`! not in dist/assets, left as-is: ${ref}`)
      return whole
    }

    const uri = dataUri(name)
    if (!uri) {
      missed += 1
      console.warn(`! unknown media type, left as-is: ${name}`)
      return whole
    }

    done += 1
    return `url(${uri})`
  })

  console.log(`fonts/assets inlined: ${done}${missed ? `, left alone: ${missed}` : ''}`)
  return next
}

const cssName = pick('.css')
const jsName = pick('.js')

const css = inlineUrls(readFileSync(join(assets, cssName), 'utf8'))
const js = readFileSync(join(assets, jsName), 'utf8')

// A *reachable* dynamic import would fetch over the wire and fail under
// file://. React Router ships one inside its lazy-route loader, which is dead
// code unless routes actually use `lazy`, so only flag imports of real paths.
const liveImports = [...js.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
if (liveImports.length) {
  console.warn(`! literal dynamic import(s) will fail from file://: ${liveImports.join(', ')}`)
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VFX Artist — Portfolio</title>
<style>
${css}
</style>
</head>
<body>
<div id="root"></div>
<script type="module">
${js}
</script>
</body>
</html>
`

writeFileSync(out, html, 'utf8')

// Media stays on disk rather than inlined — a 28 MB reel has no business in a
// data: URI. Warn if the folders it points at are not sitting alongside.
for (const dir of ['media', 'videos']) {
  if (!existsSync(join(dirname(out), dir))) {
    console.warn(`! ${dir}/ missing next to the output — those references will 404`)
  }
}

const kb = (n) => `${(n / 1024).toFixed(1)} kB`
console.log(`css   ${cssName} -> ${kb(css.length)} (fonts inlined)`)
console.log(`js    ${jsName} -> ${kb(js.length)}`)
console.log(`wrote ${out} (${kb(html.length)})`)
