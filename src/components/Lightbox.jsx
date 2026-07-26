import { useCallback, useEffect } from 'react'
import Placeholder from './Placeholder'
import { USE_PLACEHOLDERS } from '../data/config'

const Arrow = ({ dir }) => (
  <svg viewBox="0 0 16 12" aria-hidden="true">
    <path
      d={dir === 'prev' ? 'M6 0L0 6l6 6V7h10V5H6z' : 'M10 0l6 6-6 6V7H0V5h10z'}
    />
  </svg>
)

/**
 * Fullscreen viewer for stills and for the reel.
 *
 * `items` is a list of { kind, src, poster, label, seed, controls }. The caller
 * owns the index so the same component covers a single-item reel and a gallery.
 */
export default function Lightbox({ items, index, onIndex, onClose, caption }) {
  const item = items[index]
  const many = items.length > 1

  const go = useCallback(
    (step) => {
      if (!many) return
      onIndex((index + step + items.length) % items.length)
    },
    [index, items.length, many, onIndex],
  )

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)

    // Lock the page behind the overlay without letting the layout jump.
    const { overflow, paddingRight } = document.body.style
    const bar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (bar > 0) document.body.style.paddingRight = `${bar}px`

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [go, onClose])

  if (!item) return null

  // `real` marks a file that actually exists and so overrides the global
  // placeholder switch — same rule as <Media>.
  const showPlaceholder = !item.src || (USE_PLACEHOLDERS && !item.real)

  return (
    <div
      className="lb"
      role="dialog"
      aria-modal="true"
      aria-label={item.label || 'Media viewer'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="lb__bar">
        <span className="label">
          {caption || item.label}
          {many && ` — ${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`}
        </span>
        <button type="button" className="lb__close" onClick={onClose}>
          Close (Esc)
        </button>
      </div>

      <div className="lb__stage">
        {showPlaceholder ? (
          <Placeholder
            className="lb__ph"
            seed={item.seed || item.label || 'lightbox'}
            label={item.label || 'Placeholder'}
            motion={item.kind === 'video'}
          />
        ) : item.kind === 'video' ? (
          <video
            src={item.src}
            poster={item.poster}
            controls={item.controls !== false}
            autoPlay
            playsInline
            loop={item.controls === false}
          />
        ) : (
          <img src={item.src} alt={item.label || ''} />
        )}
      </div>

      <div className="lb__nav">
        {many && (
          <>
            <button
              type="button"
              className="lb__btn"
              onClick={() => go(-1)}
              aria-label="Previous"
            >
              <Arrow dir="prev" />
            </button>
            <button type="button" className="lb__btn" onClick={() => go(1)} aria-label="Next">
              <Arrow dir="next" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
