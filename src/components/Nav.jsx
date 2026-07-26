import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { profile } from '../data/profile'

/** Scrolls to a section, allowing for the floating header. */
export function scrollToSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 96
  window.scrollTo({ top, behavior: 'smooth' })
}

export default function Nav({ onPlayReel }) {
  const [stuck, setStuck] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const onHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // From a project page we have to land on the home route first; Home picks the
  // target up out of the navigation state and scrolls once it has rendered.
  const goToSection = useCallback(
    (id) => (e) => {
      e.preventDefault()
      if (onHome) scrollToSection(id)
      else navigate('/', { state: { scrollTo: id } })
    },
    [onHome, navigate],
  )

  return (
    <header className={`nav ${stuck ? 'is-stuck' : ''}`}>
      <div className="nav__inner">
        <Link to="/" className="nav__brand" aria-label={`${profile.name} — home`}>
          {profile.name}
        </Link>

        <nav className="nav__links" aria-label="Main">
          <a href="/" className="nav__link" onClick={goToSection('work')}>
            Work
          </a>
          {/* Also in the nav, not just the hero — otherwise the page is
              unreachable from anywhere but the home screen. */}
          <NavLink
            to="/experiments"
            className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
          >
            Experiments
          </NavLink>
          <button type="button" className="nav__link" onClick={onPlayReel}>
            Reel
          </button>
          <a href="/" className="nav__link" onClick={goToSection('contact')}>
            Contact
          </a>
        </nav>
      </div>
    </header>
  )
}
