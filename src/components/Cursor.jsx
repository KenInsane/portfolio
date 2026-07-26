import { useEffect, useRef } from 'react'

/**
 * PARKED — not rendered anywhere. To bring it back, render <Cursor /> in
 * App.jsx again; the `.cursor` rules in index.css are still in place and only
 * take effect once this component runs.
 *
 * Custom pointer: a dot that tracks exactly and a ring that lags behind it.
 *
 * Runs entirely outside React state — it writes transforms straight to the
 * nodes in a rAF loop, so pointer movement never triggers a re-render.
 * Hidden by CSS on touch devices, where a cursor makes no sense.
 */
export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return

    // Signals the stylesheet that it is safe to hide the native cursor.
    document.documentElement.dataset.cursor = 'on'

    const target = { x: innerWidth / 2, y: innerHeight / 2 }
    const eased = { ...target }
    let frame

    const onMove = (e) => {
      target.x = e.clientX
      target.y = e.clientY
      // Anything image-like gets the enlarged ring.
      const hot = e.target.closest?.('a, button, .card, .still, .bd__media')
      ring.current?.classList.toggle('is-hot', Boolean(hot))
    }

    const loop = () => {
      eased.x += (target.x - eased.x) * 0.16
      eased.y += (target.y - eased.y) * 0.16
      if (dot.current) dot.current.style.transform = `translate(${target.x}px, ${target.y}px)`
      if (ring.current) ring.current.style.transform = `translate(${eased.x}px, ${eased.y}px)`
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      delete document.documentElement.dataset.cursor
    }
  }, [])

  return (
    <>
      <div ref={ring} className="cursor cursor__ring" aria-hidden="true" />
      <div ref={dot} className="cursor cursor__dot" aria-hidden="true" />
    </>
  )
}
