import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Media from '../components/Media'
import Reveal from '../components/Reveal'
import Lightbox from '../components/Lightbox'
import { experiments } from '../data/experiments'
import { SITE_TITLE } from '../data/profile'

const BackArrow = () => (
  <svg viewBox="0 0 14 10" aria-hidden="true">
    <path d="M5 0L0 5l5 5V6h9V4H5z" />
  </svg>
)

/**
 * The loose half of the portfolio: renders, tests and personal work that never
 * became a project. Presented as a sketchbook — one grid, no case studies — so
 * it reads differently from /work on purpose.
 */
export default function Experiments() {
  const [index, setIndex] = useState(null)

  useEffect(() => {
    document.title = `Experiments — ${SITE_TITLE.split(' — ')[0]}`
    return () => {
      document.title = SITE_TITLE
    }
  }, [])

  const items = experiments.map((e) => ({
    kind: e.media?.kind ?? 'image',
    src: e.media?.src,
    label: e.title,
    seed: e.id,
    real: e.real,
  }))

  return (
    <main className="proj exp-page">
      <div className="shell">
        <Link to="/" className="back">
          <BackArrow />
          <span>All work</span>
        </Link>

        {/* Soft ambient light behind the header — the page's only atmosphere,
            since the palette has no colour to lean on. */}
        <div className="exp__ambient" aria-hidden="true" />

        <Reveal>
          <span className="tag">Personal</span>
          <h1 className="proj__title" style={{ marginTop: '1.25rem' }}>
            Experiments
          </h1>
          <p className="proj__sub">
            Renders, tests and things made for no reason other than wanting to see them.
            Nothing here is a finished project.
          </p>
        </Reveal>

        <div className="exp">
          {experiments.map((e, i) => (
            <Reveal key={e.id} className="exp__cell" delay={(i % 3) * 60}>
              <button
                type="button"
                className="exp__item"
                /* Declared up front so the masonry never reflows as clips load. */
                style={{ '--exp-aspect': String(e.aspect) }}
                onClick={() => setIndex(i)}
                aria-label={`Open ${e.title}`}
              >
                {/* Everything here plays by itself, but only while it is on
                    screen — see the observer in Media.jsx. Hover-to-play was
                    the old workaround for <video> not lazy-loading; with
                    `preload="none"` a clip costs nothing until it scrolls in,
                    so the page can just be alive. */}
                <Media
                  kind={e.media?.kind ?? 'image'}
                  src={e.media?.src}
                  poster={e.media?.poster}
                  real={e.real}
                  seed={e.id}
                  label={e.title}
                  alt={e.title}
                  motion={e.media?.kind === 'video'}
                />
                {/* No caption on the frame by request — the work is left to
                    speak. The title still reaches screen readers through the
                    button's aria-label, and the lightbox shows it on open. */}
              </button>

              {e.note && <p className="exp__note">{e.note}</p>}
            </Reveal>
          ))}
        </div>
      </div>

      {index !== null && (
        <Lightbox
          items={items}
          index={index}
          onIndex={setIndex}
          onClose={() => setIndex(null)}
          caption="Experiments"
        />
      )}
    </main>
  )
}
