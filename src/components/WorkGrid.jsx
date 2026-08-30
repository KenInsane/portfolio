import { Link } from 'react-router-dom'
import Media from './Media'
import Reveal from './Reveal'
import { publishedProjects } from '../data/projects'

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 12L12 4M12 4H5.5M12 4v6.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function Card({ project, index }) {
  const { slug, title, subtitle, year, status, media } = project

  return (
    /* --i drives the sticky offset so buried cards leave a visible sliver. */
    <div className="stack__item" style={{ '--i': index }}>
      <Link to={`/work/${slug}`} className="card">
        <div className="card__frame">
          <Media
            kind={media.loop ? 'video' : 'image'}
            src={media.loop || media.thumb}
            poster={media.thumb}
            real={project.real}
            seed={slug}
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
            <span className="card__year">{year}</span>
            <span className="card__go">
              <ArrowIcon />
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default function WorkGrid() {
  return (
    <section className="section" id="work">
      <div className="shell">
        <Reveal className="section__head">
          <div>
            <span className="tag">Selected work</span>
            <h2 className="section__title">Work</h2>
          </div>
          <p className="section__note">
            Short films, real-time environments and effects research. Each project opens
            into a breakdown of how the shots were built.
          </p>
        </Reveal>

        <div className="stack">
          {publishedProjects.map((project, i) => (
            <Card key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
