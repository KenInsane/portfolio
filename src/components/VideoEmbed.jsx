import { useState } from 'react'

/**
 * Click-to-load embed for YouTube and Vimeo.
 *
 * A plain <iframe> would pull one to two megabytes of player code and set
 * third-party cookies on every project page the moment it opened — more than
 * the entire rest of the page now costs. So nothing third-party is requested
 * until someone actually asks to watch: until then this is the project's own
 * poster and a play button.
 *
 * Both players letterbox inside whatever box they are given, so the frame is
 * 16:9 and the poster is contained rather than cropped — an ultrawide film
 * shows its full frame with bars, exactly as the player will.
 */
const SRC = {
  // -nocookie is the tracking-free host; rel=0 keeps other channels' videos out
  // of the end screen.
  youtube: (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
  // dnt=1 asks Vimeo not to track the session.
  vimeo: (id) => `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`,
}

export default function VideoEmbed({ provider, id, poster, title, className = '' }) {
  const [playing, setPlaying] = useState(false)
  const make = SRC[provider]
  if (!make || !id) return null

  if (playing) {
    return (
      <div className={`embed ${className}`.trim()}>
        <iframe
          className="embed__frame"
          src={make(id)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      className={`embed embed__facade ${className}`.trim()}
      onClick={() => setPlaying(true)}
      aria-label={`Play ${title}`}
    >
      {poster && <img className="embed__poster" src={poster} alt="" loading="lazy" decoding="async" />}
      <span className="embed__play" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M8 5l12 7-12 7z" />
        </svg>
      </span>
      <span className="embed__hint">Watch the film</span>
    </button>
  )
}
