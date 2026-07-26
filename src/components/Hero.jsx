import { Link } from 'react-router-dom'
import Media from './Media'
import { profile } from '../data/profile'
import { scrollToSection } from './Nav'

const PlayIcon = () => (
  <svg className="btn__icon" viewBox="0 0 9 11" aria-hidden="true">
    <path d="M0 0l9 5.5L0 11z" />
  </svg>
)

export default function Hero({ onPlayReel }) {
  return (
    <section className="hero" id="top">
      <div className="hero__bg">
        <Media
          kind="video"
          src={profile.reel.loop}
          poster={profile.reel.poster}
          real={profile.reel.real}
          loopStart={profile.reel.loopStart}
          seed="showreel-hero"
          label="Showreel"
          motion
        />
      </div>
      {/* Sits on the footage but under the scrim and the type, so the frame
          reads as a screen while the heading stays clean. */}
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__scrim" aria-hidden="true" />
      <div className="hero__glow" aria-hidden="true" />

      <div className="hero__inner">
        <span className="tag">{profile.role}</span>

        <h1 className="hero__name">{profile.name}</h1>

        <div className="hero__meta">
          {/* Rendered per item rather than as one joined string so a long
              discipline can never be split across lines mid-phrase. */}
          <span className="hero__disciplines">
            {profile.disciplines.map((d) => (
              <span className="hero__discipline" key={d}>
                {d}
              </span>
            ))}
          </span>
          <span className="label">{profile.location}</span>
        </div>

        <div className="hero__actions">
          <button type="button" className="btn btn--solid" onClick={onPlayReel}>
            <PlayIcon />
            <span>Play reel</span>
          </button>

          <button type="button" className="btn" onClick={() => scrollToSection('work')}>
            <span>Selected work</span>
          </button>

          <Link to="/experiments" className="btn">
            <span>Personal Experiments</span>
          </Link>
        </div>
      </div>

      <div className="hero__cue" aria-hidden="true">
        <span className="label">Scroll</span>
      </div>
    </section>
  )
}
