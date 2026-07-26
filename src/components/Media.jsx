import { useEffect, useRef } from 'react'
import Placeholder from './Placeholder'
import { USE_PLACEHOLDERS } from '../data/config'

/**
 * One component for every frame on the site.
 *
 * It renders a placeholder when placeholders are switched on globally, or
 * whenever the entry simply has no file yet — so a half-populated project
 * still lays out correctly instead of leaving a hole.
 */
export default function Media({
  kind = 'image',
  src,
  poster,
  seed,
  label = 'Placeholder',
  alt,
  motion,
  /** Play only while the pointer is over the card. Ignored for images. */
  hoverPlay = false,
  /**
   * Marks `src` as a file that genuinely exists, so it beats the global
   * placeholder switch. This is how real media gets added one slot at a time
   * while the not-yet-shot projects keep their placeholders.
   */
  real = false,
  /** Skip an intro by looping from this timestamp instead of from zero. */
  loopStart = 0,
  className = '',
}) {
  const usePlaceholder = !src || (USE_PLACEHOLDERS && !real)

  if (usePlaceholder) {
    return (
      <Placeholder
        seed={seed || label}
        label={label}
        motion={motion ?? kind === 'video'}
        className={className}
      />
    )
  }

  if (kind === 'video') {
    return (
      <Video
        src={src}
        poster={poster}
        hoverPlay={hoverPlay}
        loopStart={loopStart}
        label={label}
        className={className}
      />
    )
  }

  return <img src={src} alt={alt || label} loading="lazy" decoding="async" className={className} />
}

function Video({ src, poster, hoverPlay, label, className, loopStart = 0 }) {
  const ref = useRef(null)

  // Hover-played clips start paused; everything else loops on its own.
  useEffect(() => {
    const el = ref.current
    if (!el || !hoverPlay) return
    const card = el.closest('.card, .still, .bd__media') || el.parentElement
    if (!card) return

    const play = () => {
      el.currentTime = 0
      el.play().catch(() => {}) // autoplay can be refused; the poster still shows
    }
    const stop = () => el.pause()

    card.addEventListener('pointerenter', play)
    card.addEventListener('pointerleave', stop)
    return () => {
      card.removeEventListener('pointerenter', play)
      card.removeEventListener('pointerleave', stop)
    }
  }, [hoverPlay])

  // The autoplay attribute alone is not enough for a background clip: muted
  // autoplay never starts while the tab is hidden, and can be refused outright
  // under data saver or low power mode. Nudge it on mount, once it has enough
  // data, and whenever the page comes back into view — otherwise the hero can
  // sit on a dead frame with no way to recover.
  useEffect(() => {
    const el = ref.current
    if (!el || hoverPlay) return

    const nudge = () => {
      if (el.paused && !document.hidden) el.play().catch(() => {})
    }
    nudge()

    el.addEventListener('canplay', nudge)
    document.addEventListener('visibilitychange', nudge)
    return () => {
      el.removeEventListener('canplay', nudge)
      document.removeEventListener('visibilitychange', nudge)
    }
  }, [hoverPlay])

  // The native `loop` attribute always restarts at zero, which would replay the
  // intro this is meant to skip — so when a start point is set, looping is done
  // by hand off the `ended` event instead.
  useEffect(() => {
    const el = ref.current
    if (!el || !loopStart) return

    const toStart = () => {
      el.currentTime = loopStart
    }
    const restart = () => {
      toStart()
      el.play().catch(() => {})
    }

    // A seek before metadata lands is discarded, so wait for it if needed.
    if (el.readyState >= 1) toStart()
    else el.addEventListener('loadedmetadata', toStart, { once: true })

    el.addEventListener('ended', restart)
    return () => {
      el.removeEventListener('loadedmetadata', toStart)
      el.removeEventListener('ended', restart)
    }
  }, [loopStart])

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop={!loopStart}
      playsInline
      preload="metadata"
      autoPlay={!hoverPlay}
      aria-label={label}
    />
  )
}
