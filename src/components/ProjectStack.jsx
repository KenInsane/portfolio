import { Link } from 'react-router-dom'
import Media from './Media'

export const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 12L12 4M12 4H5.5M12 4v6.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function Card({ item, index }) {
  const { slug, to = `/work/${slug}`, title, subtitle, year, status, media } = item

  return (
    /* --i drives the sticky offset so buried cards leave a visible sliver. */
    <div className="stack__item" style={{ '--i': index }}>
      <Link to={to} className="card">
        <div className="card__frame">
          <Media
            kind={media.loop ? 'video' : 'image'}
            src={media.loop || media.thumb}
            poster={media.thumb}
            real={item.real}
            seed={slug || title}
            label={title}
            alt={`${title} — ${subtitle}`}
            hoverPlay
            motion
          />
        </div>

        {status && <span className="tag card__badge">{status}</span>}

        <div className="card__overlay">
          <div>
            <h3 className="card__title">{title}</h3>
            <p className="card__sub">{subtitle}</p>
          </div>

          <div className="card__side">
            {year && <span className="card__year">{year}</span>}
            <span className="card__go">
              <ArrowIcon />
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default function ProjectStack({ items }) {
  return (
    <div className="stack">
      {items.map((item, i) => (
        <Card key={item.slug || item.to} item={item} index={i} />
      ))}
    </div>
  )
}
