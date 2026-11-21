import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { scrollToSection } from '../components/Nav'
import { hire } from '../data/hire'
import { profile, SITE_TITLE } from '../data/profile'
import { getProject, publishedProjects } from '../data/projects'

const BackArrow = () => (
  <svg viewBox="0 0 14 10" aria-hidden="true">
    <path d="M5 0L0 5l5 5V6h9V4H5z" />
  </svg>
)

/** One block of the page: heading on the left, content on the right. */
function Section({ title, children, id }) {
  return (
    <section className="hire__sec" id={id}>
      <Reveal>
        <h2 className="hire__h2">{title}</h2>
      </Reveal>
      <Reveal delay={80}>{children}</Reveal>
    </section>
  )
}

/** Title + text pairs: services as ruled rows, formats and steps as a grid. */
function Items({ items, layout }) {
  return (
    <ul className={`hire__items hire__items--${layout}`}>
      {items.map((it) => (
        <li key={it.title} className="hire__item">
          <h3 className="hire__item-title">{it.title}</h3>
          <div>
            <p className="hire__item-text">{it.text}</p>
            {it.link && (
              <Link to={it.link.to} className="more-link">
                {it.link.label}
              </Link>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * "Work with me": what I do, how a job can be shaped, proof, price, and what to
 * send. The page a cold email points to, so it has to answer the questions a
 * producer has before they reply.
 */
export default function Hire({ onPlayReel }) {
  useEffect(() => {
    document.title = `${hire.title} — ${SITE_TITLE.split(' — ')[0]}`
    return () => {
      document.title = SITE_TITLE
    }
  }, [])

  const credits = hire.credits.map(getProject).filter((p) => p?.real)

  // Same source as the home marquee: the toolset is whatever the work used.
  const software = useMemo(
    () => [...new Set(publishedProjects.flatMap((p) => p.tools))],
    [],
  )

  const contacts = [
    ...(profile.email ? [{ label: 'Email', href: `mailto:${profile.email}` }] : []),
    ...hire.contact
      .map((label) => profile.socials.find((s) => s.label === label))
      .filter((s) => s?.href),
  ]

  return (
    <main className="proj hire-page">
      <div className="shell">
        <Link to="/" className="back">
          <BackArrow />
          <span>All work</span>
        </Link>

        <div className="exp__ambient" aria-hidden="true" />

        <Reveal>
          <span className="tag">Hire</span>
          <h1 className="proj__title" style={{ marginTop: '1.25rem' }}>
            {hire.title}
          </h1>
          <p className="proj__sub">{hire.lead}</p>

          {/* A button, not href="#brief": the router owns the hash. */}
          <div className="hire__actions">
            <button
              type="button"
              className="btn btn--solid"
              onClick={() => scrollToSection('brief')}
            >
              <span>Start a project</span>
            </button>
            <button type="button" className="btn" onClick={onPlayReel}>
              <span>Play reel</span>
            </button>
          </div>
        </Reveal>

        <Section title="What I do">
          <Items items={hire.services} layout="rows" />
          <p className="hire__software">
            <span className="label">Software</span>
            {software.join(', ')}
          </p>
        </Section>

        <Section title="How we can work">
          <Items items={hire.formats} layout="grid" />
        </Section>

        <Section title="Process">
          <Items items={hire.process} layout="steps" />
        </Section>

        {credits.length > 0 && (
          <Section title="Selected credits">
            <ul className="hire__credits">
              {credits.map((p) => (
                <li key={p.slug}>
                  <Link to={`/work/${p.slug}`} className="hire__credit">
                    <span className="hire__credit-title">{p.title}</span>
                    <span className="hire__credit-meta">
                      {p.award ? `${p.award.label}, ${p.award.event}` : `${p.client}, ${p.year}`}
                      {p.roles?.length > 0 && <span>{p.roles.join(', ')}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="Rates">
          {hire.rate && <p className="hire__rate">{hire.rate}</p>}
          <p className="hire__item-text hire__rate-note">{hire.rateNote}</p>
        </Section>

        <section className="hire__brief" id="brief">
          <Reveal>
            <span className="tag">Brief</span>
            <h2 className="hire__brief-title">Start a project</h2>
            <p className="hire__brief-lead">
              A few lines are enough to quote. Tell me:
            </p>
            <ul className="hire__checklist">
              {hire.brief.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>

            {contacts.length > 0 && (
              <div className="hire__actions">
                {contacts.map((c, i) => (
                  <a
                    key={c.label}
                    className={`btn ${i === 0 ? 'btn--solid' : ''}`}
                    href={c.href}
                    target={c.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noreferrer noopener"
                  >
                    <span>
                      {i > 0 ? c.label : c.label === 'Email' ? 'Email me' : `Write on ${c.label}`}
                    </span>
                  </a>
                ))}
              </div>
            )}
            {profile.email && <p className="hire__email">{profile.email}</p>}
          </Reveal>
        </section>
      </div>
    </main>
  )
}
