/**
 * Things to take away, rather than things to look at: rigs, plugins and setups
 * built for my own work and packaged up.
 *
 * One entry per asset. `status: 'soon'` is a placeholder — no link, no date, and
 * the page renders it as a quiet tile instead of a card with a button.
 *
 * Downloads are hosted off-site: the files run to hundreds of megabytes, which
 * a static host will not take, so `href` is always an external link.
 */
import assetAspects from './assets.aspects.json'

const BMW = 'media/assets/bmw-m3-gtr'
/** Every clip ships with a poster of the same name — see build_assets_media.mjs.
 *  Without it a frame is an empty box until `preload="none"` lets go. */
const clip = (path, caption) => ({
  src: `${BMW}/${path}`,
  poster: `${BMW}/${path.replace(/\.mp4$/, '.jpg')}`,
  caption,
  aspect: assetAspects[`${BMW}/${path}`],
})

export const assets = [
  {
    slug: 'bmw-m3-gtr',
    title: 'BMW M3 GTR',
    subtitle: 'E46 — rigged for Cinema 4D and Blender',
    price: 'Free',
    size: '596 MB',
    // Shown as the card's own eyebrow, next to the price.
    kind: 'Vehicle rig',
    status: 'available',
    // Filled in once the archive is shared — an empty href renders the button
    // disabled rather than linking nowhere.
    href: '',
    summary:
      'The car from my Most Wanted shots, packaged twice over: a Cinema 4D scene with ' +
      'Octane materials on the C4D car rig, and the same car in Blender on a Rigacar ' +
      'rig with every shader rebuilt for Cycles.',
    // What a 596 MB download actually contains, so nobody has to guess first.
    includes: [
      ['Cinema 4D 2025', 'Octane materials, C4D Car Template rig, 43 textures linked from the folder'],
      ['Blender 5.2', 'Rigacar rig, all 15 materials rebuilt as Cycles nodes, every texture packed in the .blend'],
      ['Rigacar 7.1', 'patched for Blender 4.4–5.2 — bone collections, slotted actions, Blender 5 bake (GPL-3)'],
      ['README', 'rig controls, hierarchy and render notes, EN and RU'],
    ],
    specs: [
      ['Scale', 'Metres, 4.67 × 1.93 × 1.35 m, wheels on Z = 0, nose to −Y'],
      ['Rig', 'Steering, drift, suspension height and roll, per-wheel dampers and brakes'],
      ['Wheels', 'Spin from the root control; bake rotation and steering for curved paths'],
      ['Shading', 'Cycles dust and edge masks run on AO nodes, mirroring the Octane setup'],
    ],
    // Said plainly rather than discovered after the download.
    caveats: [
      'The car only — no environment, lighting or camera setup.',
      'The steering wheel is part of the interior mesh, so it does not turn.',
    ],
    // Said under the button, not only on it: a Drive link this size opens
    // Google's "can't scan this file" page, which reads as a trap unless the
    // visitor was told where they are going.
    hosting: '596 MB zip on Google Drive. No sign-up.',
    media: {
      clips: [
        clip('turntable.mp4', 'Walkaround'),
        clip('steering.mp4', 'Steering and wheel spin, baked by Rigacar'),
        clip('suspension.mp4', 'Suspension on the Cinema 4D rig'),
      ],
    },
  },

  {
    slug: 'c4d-plugins',
    title: 'Cinema 4D plugins',
    kind: 'Tools',
    status: 'soon',
    summary:
      'The panels I use daily: scene organiser, texture downscaler, and receivers that ' +
      'turn Fab, Megascans, Substance and Unreal folders into Octane materials.',
  },
  {
    slug: 'houdini-setups',
    title: 'Houdini HDAs and setups',
    kind: 'Tools',
    status: 'soon',
    summary:
      'Digital assets pulled out of shot work — guided whitewater, ink and smoke setups, ' +
      'and the attractor graph tool.',
  },
  {
    slug: 'more-rigs',
    title: 'More assets and rigs',
    kind: 'Assets',
    status: 'soon',
    summary: 'The next car, and whatever else turns out to be worth packaging.',
  },
]

export const freeAssets = assets.filter((a) => a.status === 'available')
