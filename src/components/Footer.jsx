import Reveal from './Reveal'
import { profile } from '../data/profile'

export default function Footer() {
  const socials = profile.socials.filter((s) => s.label && s.href)
  const year = new Date().getFullYear()

  return (
    <footer className="footer" id="contact">
      <div className="footer__glow" aria-hidden="true" />
      <div className="shell">
        <Reveal>
          <span className="tag">Contact</span>

          <p className="footer__note">
            Open to freelance and studio work — Effects, Scene creation, Look Development,
            Rendering and Compositing.
          </p>

          {/* These carry the footer now that there is no email address, so they
              are set as a list of statements rather than small chips. */}
          {socials.length > 0 && (
            <ul className="footer__links">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    className="footer__link"
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="footer__base">
            <span className="label">
              {profile.name} — {profile.role}
            </span>
            <span className="label">{profile.location}</span>
            <span className="label">&copy; {year}</span>
          </div>
        </Reveal>
      </div>
    </footer>
  )
}
