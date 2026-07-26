/**
 * Dev-only screen capture.
 *
 * The Browser pane cannot screenshot (it only composites while visible), which
 * makes it impossible to actually look at the design while building it. This
 * rasterises the live DOM — real fonts, real layout — and POSTs the bytes to
 * `tools/shot_sink.mjs`, which writes them to `tools/_shots/`.
 *
 * Loaded only under `import.meta.env.DEV`, so none of it reaches a build.
 *
 *   window.__shot('body', 'home')              full page
 *   window.__shot('.work', 'grid', { scale: 2 })
 */
const SINK = 'http://127.0.0.1:5199/shot'

async function shot(target = 'body', name = 'shot', opts = {}) {
  const { domToJpeg } = await import('modern-screenshot')
  const node = typeof target === 'string' ? document.querySelector(target) : target
  if (!node) throw new Error(`no element for ${target}`)

  // Scroll-reveal leaves elements at opacity 0 until observed; force them all
  // visible so a capture of the whole page is not mostly blank.
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'))
  await new Promise((r) => requestAnimationFrame(r))

  const dataUrl = await domToJpeg(node, {
    quality: opts.quality ?? 0.86,
    scale: opts.scale ?? 1,
    backgroundColor: opts.backgroundColor ?? '#08090a',
    width: opts.width,
    height: opts.height,
    style: opts.style,
  })

  const res = await fetch(`${SINK}?name=${encodeURIComponent(name)}`, {
    method: 'POST',
    body: dataUrl,
  })
  if (!res.ok) throw new Error(`sink ${res.status}`)
  return res.text()
}

window.__shot = shot
