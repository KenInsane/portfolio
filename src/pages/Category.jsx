import { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Media from '../components/Media'
import ProjectStack from '../components/ProjectStack'
import Reveal from '../components/Reveal'
import { categories, projectsIn } from '../data/categories'
import { SITE_TITLE } from '../data/profile'

const BackArrow = () => (
  <svg viewBox="0 0 14 10" aria-hidden="true">
    <path d="M5 0L0 5l5 5V6h9V4H5z" />
  </svg>
)

/** Holds a category's place until it has projects to show. */
function ComingSoon({ title, banner, line }) {
  return (
    <Reveal className="cat-soon">
      <Media src={banner} real label={title} alt="" className="cat-soon__media" />
      <div className="cat-soon__body">
        <h2 className="cat-soon__title">Coming soon</h2>
        <p className="cat-soon__line">{line}</p>
      </div>
    </Reveal>
  )
}

/** One panel from the home page, opened: its projects, as the sticky stack. */
export default function Category({ category }) {
  const { id, tag, title, note, extra, soon } = category

  useEffect(() => {
    document.title = `${title} — ${SITE_TITLE.split(' — ')[0]}`
    return () => {
      document.title = SITE_TITLE
    }
  }, [title])

  return (
    <main className="proj cat-page">
      <div className="shell">
        <Link to="/" state={{ scrollTo: 'work' }} className="back">
          <BackArrow />
          <span>All work</span>
        </Link>

        <Reveal>
          <span className="tag">{tag}</span>
          <h1 className="proj__title" style={{ marginTop: '1.25rem' }}>
            {title}
          </h1>
          <p className="proj__sub">{note}</p>
        </Reveal>

        {/* Lets a visitor move sideways between categories without going back
            through the home page each time. */}
        <nav className="cat-nav" aria-label="Categories">
          {categories.map((c) => (
            <NavLink
              key={c.id}
              to={`/work/${c.id}`}
              className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
            >
              {c.title}
            </NavLink>
          ))}
        </nav>

        {soon ? (
          <ComingSoon title={title} {...soon} />
        ) : (
          <ProjectStack items={[...projectsIn(id), ...(extra ? [extra] : [])]} />
        )}
      </div>
    </main>
  )
}
