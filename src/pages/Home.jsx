import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import WorkGrid from '../components/WorkGrid'
import { scrollToSection } from '../components/Nav'
import { projects } from '../data/projects'

export default function Home({ onPlayReel }) {
  const location = useLocation()
  const target = location.state?.scrollTo

  // Arriving from a project page with a section in mind — scroll once painted.
  useEffect(() => {
    if (!target) return
    const id = requestAnimationFrame(() => scrollToSection(target))
    window.history.replaceState({}, '')
    return () => cancelAnimationFrame(id)
  }, [target])

  // The strip advertises the actual toolset, pulled from the work itself.
  const tools = useMemo(
    () => [...new Set(projects.flatMap((p) => p.tools))],
    [],
  )

  return (
    <main>
      <Hero onPlayReel={onPlayReel} />
      <Marquee items={tools} />
      <WorkGrid />
    </main>
  )
}
