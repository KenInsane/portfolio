import Media from './Media'
import Reveal from './Reveal'

/**
 * A project told as named sections, the way a Behance gallery runs:
 * Concept, then Character, then Rigging, and so on, each with its own media.
 *
 * The fixed plates / stills / breakdown slots cannot express that order, so a
 * project that has `sections` is laid out by them instead. Headers are set in
 * the site's own type rather than as the gallery's baked-in header images,
 * which shrink to unreadable on a phone.
 *
 * Every item has a declared `aspect` so the layout never reflows while media
 * arrives, and every item opens in the shared lightbox. Captions are not shown
 * on the page — they carry the lightbox label and the accessible name.
 */
const kindOf = (src) => (/\.(mp4|webm|mov)$/i.test(src || '') ? 'video' : 'image')

export default function Sections({ sections, slug, real, onOpen, offset = 0 }) {
  // Gallery index where each section's first item lands, fixed up front so the
  // render stays a pure function of its props.
  const starts = []
  sections.reduce((at, s) => {
    starts.push(at)
    return at + s.items.length
  }, offset)

  return sections.map((section, si) => (
    <section className="section" key={section.title}>
      <div className="shell">
        <Reveal className="section__head">
          <div>
            {section.tag && <span className="tag">{section.tag}</span>}
            <h2 className="section__title">{section.title}</h2>
          </div>
          {section.note && <p className="section__note">{section.note}</p>}
        </Reveal>

        <div className={`sec sec--${section.layout ?? 'stack'}`}>
          {section.items.map((item, ii) => {
            const kind = kindOf(item.src)
            const label = item.caption || `${section.title} ${ii + 1}`
            return (
              <Reveal
                key={item.src}
                className={`sec__cell ${item.wide ? 'sec__cell--wide' : ''}`}
                delay={(ii % 2) * 60}
              >
                <button
                  type="button"
                  className="sec__item"
                  style={item.aspect ? { '--sec-aspect': String(item.aspect) } : undefined}
                  onClick={() => onOpen(starts[si] + ii)}
                  aria-label={`Open ${label}`}
                >
                  <Media
                    kind={kind}
                    src={item.src}
                    real={real}
                    seed={`${slug}-${si}-${ii}`}
                    label={label}
                    alt={label}
                    motion={kind === 'video'}
                  />
                </button>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  ))
}
