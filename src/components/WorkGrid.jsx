import { Link } from 'react-router-dom'
import Media from './Media'
import Reveal from './Reveal'
import { ArrowIcon } from './ProjectStack'
import { categories } from '../data/categories'

function Panel({ category }) {
  const { id, title, subtitle, cover, loop, framing, lead } = category

  return (
    <Link
      to={`/work/${id}`}
      className={`cat ${lead ? 'cat--lead' : ''}`}
      style={{
        '--media-w': `${framing.width}cqw`,
        '--media-shift': `${framing.shift}%`,
        '--media-x': framing.x,
      }}
    >
      <div className="cat__media">
        <Media
          kind={loop ? 'video' : 'image'}
          src={loop || cover}
          poster={cover}
          real
          seed={id}
          label={title}
          alt=""
          hoverPlay
        />
      </div>

      <div className="cat__body">
        <div>
          <h3 className="cat__title">{title}</h3>
          <p className="cat__sub">{subtitle}</p>
        </div>
        <span className="card__go cat__go">
          <ArrowIcon />
        </span>
      </div>
    </Link>
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
            Mostly game worlds, sorted by game: cinematics, real-time scenes and effects,
            with a look at how the shots were built.
          </p>
        </Reveal>

        <Reveal>
          <nav className="cats" aria-label="Work by category">
            <div className="cats__track">
              {categories.map((category) => (
                <Panel key={category.id} category={category} />
              ))}
            </div>
          </nav>
        </Reveal>
      </div>
    </section>
  )
}
