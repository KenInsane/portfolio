import { useEffect, useState } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Lightbox from './components/Lightbox'
import Home from './pages/Home'
import Project from './pages/Project'
import Experiments from './pages/Experiments'
import NotFound from './pages/NotFound'
import { profile } from './data/profile'

/** New route, top of the page — unless we were sent to a specific section. */
function ScrollToTop() {
  const { pathname, state } = useLocation()
  useEffect(() => {
    if (state?.scrollTo) return
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, state])
  return null
}

function Shell() {
  const [reelOpen, setReelOpen] = useState(false)
  const openReel = () => setReelOpen(true)

  return (
    <>
      <ScrollToTop />
      <div className="grain" aria-hidden="true" />
      {/* The custom trailing cursor is parked, not deleted — render <Cursor />
          here again to bring it back. See src/components/Cursor.jsx. */}
      <Nav onPlayReel={openReel} />

      <Routes>
        <Route path="/" element={<Home onPlayReel={openReel} />} />
        <Route path="/work/:slug" element={<Project />} />
        <Route path="/experiments" element={<Experiments />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />

      {reelOpen && (
        <Lightbox
          items={[
            {
              kind: 'video',
              src: profile.reel.full,
              poster: profile.reel.poster,
              real: profile.reel.real,
              label: 'Showreel',
              seed: 'showreel-hero',
            },
          ]}
          index={0}
          onIndex={() => {}}
          onClose={() => setReelOpen(false)}
          caption="Showreel"
        />
      )}
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  )
}
