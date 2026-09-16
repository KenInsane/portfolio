import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Media from '../components/Media'
import VideoEmbed from '../components/VideoEmbed'
import Sections from '../components/Sections'
import Reveal from '../components/Reveal'
import Lightbox from '../components/Lightbox'
import NotFound from './NotFound'
import { getNextProject, getProject } from '../data/projects'
import { SITE_TITLE } from '../data/profile'

const BackArrow = () => (
  <svg viewBox="0 0 14 10" aria-hidden="true">
    <path d="M5 0L0 5l5 5V6h9V4H5z" />
  </svg>
)

function MetaRow({ label, children }) {
  if (!children) return null
  return (
    <div className="meta__row">
      <span className="label">{label}</span>
      {children}
    </div>
  )
}

export default function Project() {
  const { slug } = useParams()
  const project = getProject(slug)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    if (project) document.title = `${project.title} — ${SITE_TITLE.split(' — ')[0]}`
    return () => {
      document.title = SITE_TITLE
    }
  }, [project])

  if (!project) return <NotFound />

  const {
    title,
    subtitle,
    summary,
    year,
    client,
    status,
    roles,
    tools,
    links,
    description,
    video,
    media,
    plates = [],
    stills = [],
    sections = [],
    breakdown,
    aspect,
    stillsAspect,
    bdAspect,
    mediaFit,
    platesTag = 'From the film',
    platesTitle = 'Sequences',
    stillsTag = 'Frames',
    stillsTitle = 'Stills',
    real,
  } = project
  const next = getNextProject(slug)

  // Derived from the file rather than declared per entry — the two drifted apart
  // once the animated plates moved from WebP to MP4, and the markup kept
  // rendering <img> at files that were now video.
  const kindOf = (src) => (/\.(mp4|webm|mov)$/i.test(src || '') ? 'video' : 'image')

  const toItem = (m, i, prefix) => ({
    kind: kindOf(m.src),
    src: m.src,
    label: m.caption || `${title} — ${prefix} ${i + 1}`,
    seed: `${slug}-${prefix}-${i}`,
    real,
  })

  // One list so the lightbox arrows walk the whole gallery; the stills section
  // offsets its clicks past the plates.
  const plateItems = plates.map((m, i) => toItem(m, i, 'plate'))
  const stillItems = stills.map((m, i) => toItem(m, i, 'still'))

  /**
   * Breakdown stills join the gallery too. A 3.5:1 process board is 95px tall
   * on a phone — legible only once it can be opened full screen.
   */
  const bdSteps = breakdown?.steps ?? []
  const bdOpenable = bdSteps.map((s) => s.media?.type === 'image' && Boolean(s.media?.src))
  const bdItems = bdSteps
    .map((s, i) => (bdOpenable[i] ? toItem({ src: s.media.src, caption: s.title }, i, 'bd') : null))
    .filter(Boolean)

  // Section items join the same gallery, after everything above them.
  const sectionOffset = plateItems.length + stillItems.length + bdItems.length
  const sectionItems = sections.flatMap((s) =>
    s.items.map((it, i) => toItem({ src: it.src, caption: it.caption }, i, s.title)),
  )

  const galleryItems = [...plateItems, ...stillItems, ...bdItems, ...sectionItems]
  const bdIndex = (i) =>
    plateItems.length + stillItems.length + bdOpenable.slice(0, i).filter(Boolean).length

  // Wide film frames keep their real ratio. The row threshold is tuned so a
  // 2.35 frame lands two-up on a desktop and one-up on a phone: twenty
  // full-width frames would otherwise make the page absurdly long, and the
  // lightbox is there for viewing one properly.
  const wide = aspect && aspect > 2
  // A handful of frames looks broken in a three-up grid — the last one is left
  // stranded on its own row. Below five, go two-up.
  const fewStills = stills.length > 0 && stills.length <= 4
  // Process boards can be far wider than the film; beside a text column they
  // collapse into an unreadable sliver, so those breakdowns stack instead.
  const stackBreakdown = bdAspect && bdAspect > 2.5

  const styleVars = {
    ...(aspect ? { '--media-aspect': String(aspect) } : null),
    // Breakdown material often has nothing to do with the film's ratio, so it
    // can carry its own box and be letterboxed instead of cropped.
    ...(stillsAspect ? { '--stills-aspect': String(stillsAspect) } : null),
    // Breakdown material can be a different shape again — process boards are
    // far wider than the film's own frames.
    ...(bdAspect ? { '--bd-aspect': String(bdAspect) } : null),
    ...(mediaFit ? { '--media-fit': mediaFit } : null),
    ...(wide ? { '--stills-min': '520px' } : fewStills ? { '--stills-min': '560px' } : null),
  }

  return (
    <main className="proj" style={styleVars}>
      <div className="shell">
        <Link to="/" className="back">
          <BackArrow />
          <span>All work</span>
        </Link>

        <Reveal>
          <span className="tag">{subtitle}</span>
          <h1 className="proj__title" style={{ marginTop: '1.25rem' }}>
            {title}
          </h1>
          {summary && <p className="proj__sub">{summary}</p>}
        </Reveal>

        {/* When there is a film to watch it takes the top slot outright — the
            embed already uses the key frame as its poster, so showing that
            frame again above it would just be the same image twice. */}
        {video ? (
          <Reveal>
            <VideoEmbed
              provider={video.provider}
              id={video.id}
              poster={real ? media.poster : undefined}
              title={title}
            />
          </Reveal>
        ) : (
          <Reveal className="proj__hero">
            <Media
              kind={media.loop ? 'video' : 'image'}
              src={media.loop || media.poster}
              poster={media.poster}
              real={real}
              seed={`${slug}-hero`}
              label={title}
              alt={`${title} — key frame`}
              motion
            />
          </Reveal>
        )}

        <div className="proj__cols">
          <Reveal as="aside" className="meta">
            <MetaRow label="Year">
              <p className="meta__val">{year}</p>
            </MetaRow>
            <MetaRow label="Client">
              <p className="meta__val">{client}</p>
            </MetaRow>
            {/* With no accent colour left to mark it, status earns its emphasis
                from the pill instead. */}
            {status && (
              <MetaRow label="Status">
                <span className="tag">{status}</span>
              </MetaRow>
            )}
            {/* Guarded on length, not on the element: MetaRow only sees the
                <p>, which is truthy even when the list inside it is empty. */}
            {roles?.length > 0 && (
              <MetaRow label="My role">
                <p className="meta__val meta__val--list">{roles.join(', ')}</p>
              </MetaRow>
            )}
            {tools?.length > 0 && (
              <MetaRow label="Tools">
                <p className="meta__val meta__val--list">{tools.join(', ')}</p>
              </MetaRow>
            )}

            {links?.length > 0 && (
              <MetaRow label="Links">
                <ul className="meta__links">
                  {links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} target="_blank" rel="noreferrer noopener">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </MetaRow>
            )}
          </Reveal>

          <Reveal className="prose" delay={80}>
            {description.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>
        </div>
      </div>

      {plateItems.length > 0 && (
        <section className="section">
          <div className="shell">
            <Reveal className="section__head">
              <div>
                <span className="tag">{platesTag}</span>
                <h2 className="section__title">{platesTitle}</h2>
              </div>
            </Reveal>

            <div className="plates">
              {plateItems.map((item, i) => (
                <Reveal key={item.seed}>
                  <button
                    type="button"
                    className="plate"
                    onClick={() => setLightbox({ index: i })}
                    aria-label={`Open ${item.label}`}
                  >
                    <Media
                      kind={item.kind}
                      src={item.src}
                      real={real}
                      seed={item.seed}
                      label={item.label}
                      alt={item.label}
                      motion={item.kind === 'video'}
                    />
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {stillItems.length > 0 && (
        <section className="section">
          <div className="shell">
            <Reveal className="section__head">
              <div>
                <span className="tag">{stillsTag}</span>
                <h2 className="section__title">{stillsTitle}</h2>
              </div>
            </Reveal>

            <div className="stills">
              {stillItems.map((item, i) => (
                <Reveal key={item.seed} delay={(i % 2) * 70}>
                  <button
                    type="button"
                    className="still"
                    onClick={() => setLightbox({ index: plateItems.length + i })}
                    aria-label={`Open ${item.label}`}
                    style={{ width: '100%' }}
                  >
                    <Media
                      kind="image"
                      src={item.src}
                      real={real}
                      seed={item.seed}
                      label={item.label}
                      alt={item.label}
                    />
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {breakdown?.steps?.length > 0 && (
        <section className="section">
          <div className="shell">
            <Reveal className="section__head">
              <div>
                <span className="tag">How it was made</span>
                <h2 className="section__title">Breakdown</h2>
              </div>
              {breakdown.intro && <p className="section__note">{breakdown.intro}</p>}
            </Reveal>

            <div className={`bd ${stackBreakdown ? 'bd--stacked' : ''}`}>
              {breakdown.steps.map((step, i) => (
                <Reveal as="article" className="bd__item" key={step.title}>
                  {(() => {
                    const inner = (
                      <Media
                        kind={step.media?.type === 'image' ? 'image' : 'video'}
                        src={step.media?.src}
                        poster={media.thumb}
                        real={real}
                        seed={`${slug}-bd-${i}`}
                        label={step.title}
                        alt={`${title} — ${step.title}`}
                        motion={step.media?.type !== 'image'}
                      />
                    )
                    // Only stills open; a clip is already playing in place.
                    return bdOpenable[i] ? (
                      <button
                        type="button"
                        className="bd__media bd__media--open"
                        onClick={() => setLightbox({ index: bdIndex(i) })}
                        aria-label={`Open ${step.title}`}
                      >
                        {inner}
                      </button>
                    ) : (
                      <div className="bd__media">{inner}</div>
                    )
                  })()}
                  <div>
                    <span className="tag bd__step">
                      {String(i + 1).padStart(2, '0')} / {String(breakdown.steps.length).padStart(2, '0')}
                    </span>
                    <h3 className="bd__title">{step.title}</h3>
                    <p className="bd__body">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {sections.length > 0 && (
        <Sections
          sections={sections}
          slug={slug}
          real={real}
          offset={sectionOffset}
          onOpen={(index) => setLightbox({ index })}
        />
      )}

      {next && (
        <Link to={`/work/${next.slug}`} className="next">
          <div className="next__inner">
            <span className="tag">Next project</span>
            <h2 className="next__title">{next.title}</h2>
          </div>
        </Link>
      )}

      {lightbox && (
        <Lightbox
          items={galleryItems}
          index={lightbox.index}
          onIndex={(i) => setLightbox({ index: i })}
          onClose={() => setLightbox(null)}
          caption={title}
        />
      )}
    </main>
  )
}
