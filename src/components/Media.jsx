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

  /**
   * Looping clips play only while they are on screen.
   *
   * This is what makes a page of thirty animations affordable. With
   * `preload="none"` nothing is fetched until the observer calls play(), so a
   * visitor downloads the clips they actually scroll to and no others — and
   * anything scrolled past stops decoding instead of burning CPU off-screen.
   * It also replaces the plain `autoplay` attribute, which cannot be revoked
   * once the browser has started pulling the file.
   *
   * The visibilitychange handler covers the case autoplay always trips over:
   * muted playback never starts while the tab is hidden, so it has to be
   * retried when the tab comes back.
   */
  useEffect(() => {
    const el = ref.current
    if (!el || hoverPlay) return

    let onScreen = false
    const sync = () => {
      if (onScreen && !document.hidden) el.play().catch(() => {})
      else el.pause()
    }

    // Starts loading slightly before the clip scrolls in, so it is already
    // moving by the time it is actually visible.
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        sync()
      },
      { rootMargin: '250px 0px' },
    )
    io.observe(el)
    document.addEventListener('visibilitychange', sync)

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
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
      /* Nothing is fetched until something calls play() — the observer above
         for looping clips, a pointer for hover ones. `autoplay` is deliberately
         absent: it starts a download that cannot be called back. */
      preload="none"
      aria-label={label}
    />
  )
}
