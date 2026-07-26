import { useEffect, useRef, useState } from 'react'

/** Nothing stays hidden longer than this, whatever the observer does. */
const SAFETY_MS = 1500

/**
 * Fades its children up the first time they enter the viewport.
 *
 * The animation is strictly an enhancement: anything already on screen shows
 * straight away, and a safety timer reveals everything regardless. That matters
 * because IntersectionObserver does not fire in a page the browser is not
 * compositing (background tab, hidden pane, print, some embedded webviews) —
 * without the fallback the whole site would render blank.
 */
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (shown) return
    const el = ref.current
    if (!el) return

    let io
    const timer = setTimeout(() => setShown(true), SAFETY_MS)
    const reveal = () => {
      clearTimeout(timer)
      io?.disconnect()
      setShown(true)
    }

    // Already in view at mount (or observers unavailable) — no need to wait.
    const rect = el.getBoundingClientRect()
    if (!('IntersectionObserver' in window) || rect.top < window.innerHeight) {
      reveal()
      return () => clearTimeout(timer)
    }

    io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) reveal()
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    )
    io.observe(el)

    return () => {
      clearTimeout(timer)
      io?.disconnect()
    }
  }, [shown])

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? 'is-in' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
