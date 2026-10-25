import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Media from '../components/Media'
import Reveal from '../components/Reveal'
import Lightbox from '../components/Lightbox'
import { assets } from '../data/assets'
import { SITE_TITLE } from '../data/profile'

const BackArrow = () => (
  <svg viewBox="0 0 14 10" aria-hidden="true">
    <path d="M5 0L0 5l5 5V6h9V4H5z" />
  </svg>
)

const DownloadIcon = () => (
  <svg className="btn__icon" viewBox="0 0 9 11" aria-hidden="true">
    <path d="M3.6 0h1.8v5.2l2-2 1.2 1.3L4.5 8.6.9 4.5l1.2-1.3 1.5 1.5V0zM0 9.4h9V11H0z" />
  </svg>
)

/**
 * The give-away half of the site: packaged rigs and tools rather than shots.
 *
 * One real asset and three placeholders is an awkward shape for a catalogue, so
 * the page does not pretend to be one — the asset gets a full spread, and what
 * is still coming sits underneath as plain tiles with nothing to click.
 */
export default function Assets() {
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    document.title = `Assets — ${SITE_TITLE.split(' — ')[0]}`
    return () => {
      document.title = SITE_TITLE
    }
  }, [])

  const available = assets.filter((a) => a.status === 'available')
  const soon = assets.filter((a) => a.status === 'soon')

  return (
    <main className="proj assets-page">
      <div className="shell">
        <Link to="/" className="back">
          <BackArrow />
          <span>All work</span>
        </Link>

        {/* Same ambient bloom as Experiments — these two pages are siblings. */}
        <div className="exp__ambient" aria-hidden="true" />

        <Reveal>
          <span className="tag">Downloads</span>
          <h1 className="proj__title" style={{ marginTop: '1.25rem' }}>
            Assets
          </h1>
          <p className="proj__sub">
            Rigs, tools and setups built for my own shots, packaged up so they can be used
            somewhere else. Free unless it says otherwise.
          </p>
        </Reveal>

        {available.map((a) => {
          const clips = a.media?.clips ?? []
          const items = clips.map((c) => ({
            kind: 'video',
            src: c.src,
            poster: c.poster,
            label: `${a.title} — ${c.caption}`,
            seed: `${a.slug}-${c.caption}`,
            real: true,
          }))

          return (
            <article className="asset" key={a.slug}>
              <Reveal className="asset__frame">
                <button
                  type="button"
                  className="asset__preview"
                  onClick={() => setLightbox(0)}
                  aria-label={`Open ${a.title} walkaround`}
                >
                  <Media
                    kind="video"
                    src={clips[0]?.src}
                    poster={clips[0]?.poster}
                    real
                    seed={a.slug}
                    label={a.title}
                    alt={a.title}
                    motion
                  />
                </button>
              </Reveal>

              <div className="asset__cols">
                <Reveal className="asset__head">
                  <p className="asset__eyebrow">
                    <span>{a.kind}</span>
                    <span className="asset__price">{a.price}</span>
                    <span>{a.size}</span>
                  </p>
                  <h2 className="asset__title">{a.title}</h2>
                  <p className="asset__sub">{a.subtitle}</p>
                  <div className="prose">
                    <p>{a.summary}</p>
                  </div>

                  {/* Disabled rather than hidden while the archive is being
                      shared — the page should still read as finished. */}
                  {a.href ? (
                    <a
                      className="btn btn--solid asset__get"
                      href={a.href}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <DownloadIcon />
                      <span>Download — {a.size}</span>
                    </a>
                  ) : (
                    <span className="btn asset__get is-disabled" aria-disabled="true">
                      <span>Link coming shortly</span>
                    </span>
                  )}
                  {a.hosting && <span className="label asset__hosting">{a.hosting}</span>}
                </Reveal>

                <Reveal className="asset__detail" delay={80}>
                  <h3 className="label">In the archive</h3>
                  <dl className="asset__list">
                    {a.includes.map(([term, desc]) => (
                      <div className="asset__row" key={term}>
                        <dt>{term}</dt>
                        <dd>{desc}</dd>
                      </div>
                    ))}
                  </dl>

                  {a.specs?.length > 0 && (
                    <>
                      <h3 className="label">Specs</h3>
                      <dl className="asset__list">
                        {a.specs.map(([term, desc]) => (
                          <div className="asset__row" key={term}>
                            <dt>{term}</dt>
                            <dd>{desc}</dd>
                          </div>
                        ))}
                      </dl>
                    </>
                  )}

                  {a.caveats?.length > 0 && (
                    <ul className="asset__caveats">
                      {a.caveats.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  )}
                </Reveal>
              </div>

              {clips.length > 1 && (
                <div className="asset__clips">
                  {clips.slice(1).map((c, i) => (
                    <Reveal key={c.src} className="asset__clip" delay={(i % 2) * 60}>
                      <button
                        type="button"
                        className="asset__frame-btn"
                        style={c.aspect ? { '--asset-aspect': String(c.aspect) } : undefined}
                        onClick={() => setLightbox(i + 1)}
                        aria-label={`Open ${c.caption}`}
                      >
                        <Media
                          kind="video"
                          src={c.src}
                          poster={c.poster}
                          real
                          seed={`${a.slug}-${i}`}
                          label={c.caption}
                          alt={c.caption}
                          motion
                        />
                      </button>
                      <p className="asset__caption">{c.caption}</p>
                    </Reveal>
                  ))}
                </div>
              )}

              {lightbox !== null && (
                <Lightbox
                  items={items}
                  index={lightbox}
                  onIndex={setLightbox}
                  onClose={() => setLightbox(null)}
                  caption={a.title}
                />
              )}
            </article>
          )
        })}

        <section className="soon">
          <Reveal className="section__head">
            <div>
              <span className="tag">In progress</span>
              <h2 className="section__title">Coming soon</h2>
            </div>
          </Reveal>

          <div className="soon__grid">
            {soon.map((s, i) => (
              <Reveal key={s.slug} className="soon__tile" delay={(i % 3) * 60}>
                <span className="label">{s.kind}</span>
                <h3 className="soon__title">{s.title}</h3>
                <p className="soon__note">{s.summary}</p>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
