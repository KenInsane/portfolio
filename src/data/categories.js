import { publishedProjects } from './projects'

/**
 * How the work is divided on the home page: one panel per game, and one for
 * everything outside games. Order here is the order of the panels.
 *
 * `lead` marks the game being pushed right now — its panel is wider and fully
 * lit at rest. Move the flag and the emphasis moves with it.
 *
 * A panel shows a slice of a much wider image, so `framing` says which slice:
 * `width` is the image width as a percentage of the whole row and `shift` moves
 * it sideways as a percentage of its own width. Keep `width` at 86 or more, or
 * the image stops covering a panel that has opened on hover. `x` is the
 * horizontal object-position, for a picture wider than its box.
 *
 * `soon` swaps the project list for a Coming soon banner. Remove it once the
 * category has projects of its own.
 *
 * `subtitle` stays short on purpose: a panel gets narrow while a neighbour is
 * open, and the line is kept to one row so every title sits on the same baseline.
 *
 * `extra` is a card that is not a project, shown after the category's projects.
 */
export const categories = [
  {
    id: 'rust',
    tag: 'Games',
    title: 'Rust',
    subtitle: 'Cinematics',
    note: 'Cinematic work set in the world of Rust.',
    cover: 'media/work/solos-journey-4/poster.jpg',
    loop: 'media/work/solos-journey-4/shots/sh07.mp4',
    framing: { width: 92, shift: 4 },
  },
  {
    id: 'dota-2',
    tag: 'Games',
    title: 'Dota 2',
    subtitle: 'Short films',
    note: 'Short films set in the world of Dota 2.',
    cover: 'media/categories/dota-2.jpg',
    framing: { width: 96, shift: -1 },
  },
  {
    id: 'cod-mw4',
    tag: 'Modern Warfare 4',
    title: 'Call of Duty',
    subtitle: 'Modern Warfare 4',
    note: "Modern Warfare 4's maps, operators and guns, set up in Unreal Engine 5.",
    cover: 'media/categories/cod-mw4.jpg',
    framing: { width: 92, shift: -6, x: '100%' },
    lead: true,
    soon: {
      banner: 'media/categories/cod-mw4-banner.jpg',
      line: 'Cinematics and POV shots are in the works. A personal fan project, not affiliated with Activision.',
    },
  },
  {
    id: 'vfx-motion',
    tag: 'Beyond games',
    title: 'VFX & Motion',
    subtitle: 'Product film, R&D',
    note: 'Work outside of games: product film, motion design and effects experiments.',
    cover: 'media/work/vaio-fe/poster.jpg',
    framing: { width: 120, shift: -16 },
    extra: {
      to: '/experiments',
      title: 'Experiments',
      subtitle: 'Personal renders, tests and R&D',
      media: {
        thumb: 'media/experiments/video/explo-preview.jpg',
        loop: 'media/experiments/video/explo-preview.mp4',
      },
      real: true,
    },
  },
]

export const projectsIn = (id) => publishedProjects.filter((p) => p.category === id)

export const getCategory = (id) => categories.find((c) => c.id === id)
