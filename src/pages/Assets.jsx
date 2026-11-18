import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { ArrowIcon } from '../components/ProjectStack'
import { stores } from '../data/stores'
import { SITE_TITLE } from '../data/profile'

const BackArrow = () => (
  <svg viewBox="0 0 14 10" aria-hidden="true">
    <path d="M5 0L0 5l5 5V6h9V4H5z" />
  </svg>
)

/**
 * The assets are sold through Shopify and Gumroad, so this page points there
 * instead of hosting anything: one card per store, the whole card a link out.
 */
export default function Assets() {
  useEffect(() => {
    document.title = `Assets — ${SITE_TITLE.split(' — ')[0]}`
    return () => {
      document.title = SITE_TITLE
    }
  }, [])

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
          <span className="tag">Store</span>
          <h1 className="proj__title" style={{ marginTop: '1.25rem' }}>
            Assets
          </h1>
          <p className="proj__sub">
            Tools, FX setups and render scenes from my own work. They are sold through two
            stores, Shopify and Gumroad.
          </p>
        </Reveal>

        <div className="stores">
          {stores.map((s, i) => (
            <Reveal key={s.id} delay={i * 80}>
              <a className="store" href={s.href} target="_blank" rel="noreferrer noopener">
                <div className="store__frame">
                  <svg className="store__icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={s.icon} />
                  </svg>
                </div>

                <div className="store__body">
                  <div>
                    <span className="label">{s.platform}</span>
                    <h2 className="store__title">{s.title}</h2>
                    <p className="store__note">{s.note}</p>
                    {/* Says where the click goes before it leaves the site. */}
                    <span className="store__host">{new URL(s.href).host}</span>
                  </div>
                  <span className="card__go">
                    <ArrowIcon />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  )
}
