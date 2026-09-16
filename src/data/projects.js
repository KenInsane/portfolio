/**
 * The work. Order here is the order on the page — the first entry gets the
 * wide featured slot.
 *
 * Every `src` is ignored while `USE_PLACEHOLDERS` is true in config.js, but
 * the paths are already wired to what `tools/build_media.py` produces, so
 * flipping the switch is all it takes to go live.
 *
 * Copy below is a first draft written from the project files — read it once
 * and make it sound like you.
 */
import sj4Aspects from './sj4.aspects.json'

/** Solos Journey 4 media: path relative to its folder, plus the aspect the build
 *  measured, so the section layout knows every shape before anything loads. */
const SJ4 = 'media/work/solos-journey-4'
const sj4 = (path, caption, extra) => ({
  src: `${SJ4}/${path}`,
  caption,
  aspect: sj4Aspects[`${SJ4}/${path}`],
  ...extra,
})

export const projects = [
  {
    // Title is SOLOS with an S on purpose — only the "JORNEY" spelling was a typo.
    slug: 'solos-journey-4',
    title: 'Solos Journey 4',
    subtitle: 'Opening intro',
    year: '2026',
    client: 'Blooprint',
    status: null,
    summary: "An opening intro made for Blooprint's Rust series.",
    // A team film; this page shows only the user's part of it, in his words.
    // The rest of the breakdown is on Behance, linked below.
    roles: ['SH07, SH08, SH10', 'VFX'],
    tools: ['Unreal Engine 5', 'Nuke', 'Blender', 'Houdini'],
    aspect: 1.778,
    real: true,
    // The project's own copy, from the credits page of the Behance kit.
    description: [
      'A cinematic built in the world of Rust, in a visual style set by the brief.',
      'Every scene mirrors a moment from the episode it opens — the one that closed the series.',
      'My part was shots SH07, SH08 and SH10 — Launch Site, the boat to the Oil Rig and ' +
        'the closing rocket raid — and their VFX. The full breakdown, with the ' +
        "rest of the team's work, is on Behance.",
    ],
    links: [
      {
        label: 'View on Behance',
        href: 'https://www.behance.net/gallery/255470741/Solos-Journey-4',
      },
    ],
    media: {
      poster: `${SJ4}/poster.jpg`,
      thumb: `${SJ4}/thumb.jpg`,
      loop: '',
    },
    // Only the user's own part. Concept, character, rigging, animation, 2D FX
    // and the other shots are the team's, and live on the Behance page instead.
    sections: [
      {
        title: 'Shots',
        tag: 'sh07 / sh08 / sh10',
        // Three clips would strand one in a two-up grid, and these are the work
        // itself, so each gets the full width.
        layout: 'stack',
        items: [
          sj4('shots/sh07.mp4', 'SH07 — Launch Site'),
          sj4('shots/sh08.mp4', 'SH08 — Oil Rig'),
          sj4('shots/sh10.mp4', 'SH10 — Rocket raid'),
        ],
      },
      {
        // The first two GIFs of the Behance BREAKDOWN section — the user's own.
        title: 'Breakdown',
        tag: 'shot by shot',
        layout: 'stack',
        items: [
          sj4('breakdown/sh07.mp4', 'SH07 breakdown'),
          sj4('breakdown/sh08.mp4', 'SH08 breakdown'),
        ],
      },
    ],
  },

  {
    slug: 'divine-rampage',
    title: 'Divine Rampage',
    subtitle: 'Dota 2 short film',
    year: '2025',
    client: 'Personal project',
    status: null,
    summary: 'A Dota 2 short film made solo — idea, 3D, effects and comp.',
    // Straight from the Behance credit block: "Idea | ケンInsane / 3D Artist,
    // Compositor, VFX | ケンInsane". No collaborators listed, so no credits row.
    roles: ['Idea', '3D', 'VFX', 'Compositing'],
    tools: [
      'Unreal Engine 5',
      'Houdini',
      'Cinema 4D',
      'Octane',
      'ZBrush',
      'Substance 3D Painter',
      'Nuke',
      'After Effects',
    ],
    // The finished shots are all 952x532, so the hero and the plates sit at
    // 16:9. The breakdown material is a different animal — ratios run from
    // square sculpt turntables to 2.39 blockouts — so it gets its own ratio and
    // is letterboxed rather than cropped. Cropping a turntable to a wide box
    // would cut the character in half.
    aspect: 1.79,
    stillsAspect: 1.5,
    mediaFit: 'contain',
    stillsTag: 'Process',
    stillsTitle: 'Breakdown frames',
    real: true,
    description: [
      'A Dota 2 short film made on my own — the idea, the 3D work, the effects and the ' +
        'comp. Built across Unreal Engine 5, Houdini and Cinema 4D, finished in Nuke and ' +
        'After Effects.',
      'Most of what follows is the film taken apart: the water simulation running through ' +
        'the river, the tower coming down, the spell effects, and the sculpt and lookdev ' +
        'work sitting underneath all of it.',
    ],
    links: [
      {
        label: 'View on Behance',
        href: 'https://www.behance.net/gallery/231517543/Divine-Rampage',
      },
    ],
    // The film itself, embedded at the top of the page. Nothing is requested
    // from the host until a visitor presses play — see VideoEmbed.
    video: { provider: 'youtube', id: 'j9GB2K8imP8' },
    media: {
      poster: 'media/work/divine-rampage/poster.jpg',
      thumb: 'media/work/divine-rampage/thumb.jpg',
      loop: '',
    },
    plates: [
      { src: 'media/work/divine-rampage/shots/01.mp4', caption: 'Shot 01' },
      { src: 'media/work/divine-rampage/shots/02.mp4', caption: 'Shot 02' },
      { src: 'media/work/divine-rampage/shots/03.mp4', caption: 'Shot 03' },
      { src: 'media/work/divine-rampage/shots/04.mp4', caption: 'Shot 04' },
      { src: 'media/work/divine-rampage/shots/05.mp4', caption: 'Shot 05' },
    ],
    stills: Array.from({ length: 16 }, (_, i) => ({
      src: `media/work/divine-rampage/frames/${String(i + 1).padStart(2, '0')}.jpg`,
      caption: `Breakdown ${String(i + 1).padStart(2, '0')}`,
    })),
    breakdown: {
      intro:
        'Nine passes from the film. Captions describe what each clip shows — the technical ' +
        'detail behind them is mine to fill in.',
      steps: [
        {
          title: 'River water simulation',
          body: 'Water running through the greyboxed river, before any lighting or lookdev.',
          media: { type: 'video', src: 'media/work/divine-rampage/bd/river-sim.mp4' },
        },
        {
          title: 'Mid-river fight',
          body: 'The fight blocked out against the simulated water.',
          media: { type: 'video', src: 'media/work/divine-rampage/bd/river-fight.mp4' },
        },
        {
          title: 'Hook impact',
          body: 'The burst where the hook lands on the temple steps.',
          media: { type: 'video', src: 'media/work/divine-rampage/bd/hook-impact.mp4' },
        },
        {
          title: 'Tower destruction',
          body: 'Rigid-body breakup of the tower.',
          media: { type: 'video', src: 'media/work/divine-rampage/bd/tower-destruction.mp4' },
        },
        {
          title: 'Requiem of Souls',
          body: 'The radial burst of the ultimate.',
          media: { type: 'video', src: 'media/work/divine-rampage/bd/requiem.mp4' },
        },
        {
          title: 'Shadowraze',
          body: 'The close-range flame burst.',
          media: { type: 'video', src: 'media/work/divine-rampage/bd/shadowraze.mp4' },
        },
        {
          title: 'Shackles',
          body: 'The binding strands.',
          media: { type: 'video', src: 'media/work/divine-rampage/bd/shackles.mp4' },
        },
        {
          title: 'Desolator arms',
          body: 'The Desolator arms setup.',
          media: { type: 'video', src: 'media/work/divine-rampage/bd/desolator.mp4' },
        },
        {
          title: 'Shadow Fiend sculpt',
          body: 'Turntable of the character sculpt.',
          media: { type: 'video', src: 'media/work/divine-rampage/bd/fiend-sculpt.mp4' },
        },
      ],
    },
  },

  {
    slug: 'sphere-master',
    title: 'The Sphere Master',
    subtitle: 'Dota 2 short film',
    year: '2024',
    client: 'Dota 2 Short Film Contest 2024',
    status: null, // null = finished; a string renders as a badge on the card
    summary:
      "Invoker defending the base — a contest short built in Unreal Engine 5 and Houdini.",
    // Only the credit that is actually mine. The film was directed by someone
    // else; see `credits` for the rest.
    roles: ['VFX'],
    credits: [
      { role: 'Director', name: 'Mikhail Pakhomov' },
      { role: 'VFX', name: 'Insane ケン' },
    ],
    tools: ['Unreal Engine 5', 'Houdini', 'Nuke', 'After Effects'],
    // Every frame delivered for this film is 2.35 ultrawide, so the page uses
    // that ratio instead of cropping to 16:9.
    aspect: 2.37,
    // The files exist, so they win over the global placeholder switch.
    real: true,
    description: [
      "In The Sphere Master short film, we brought Dota 2's Invoker hero to life using " +
        'Unreal Engine and Houdini. This short film showcases the hero defending the base ' +
        "with his full range of spells. The project involved intense art direction, VFX, and " +
        "technical work, capturing the power and complexity of Invoker's magic in a visually " +
        'striking cinematic experience.',
      'Made for the Dota 2 Short Film Contest 2024. My contribution was the effects work — ' +
        "the cloth on Invoker's costume, the magic gathering in his hands, the charge that " +
        'holds before release, the meteor and the Sun Strike. Those five setups are broken ' +
        'down below.',
    ],
    links: [
      {
        label: 'View on Behance',
        href: 'https://www.behance.net/gallery/205951281/The-Sphere-Master',
      },
    ],
    video: { provider: 'youtube', id: 'LJ6CoMgr2U8' },
    media: {
      poster: 'media/work/sphere-master/poster.jpg',
      thumb: 'media/work/sphere-master/thumb.jpg',
      // No video loop for the card — the ultrawide key frame carries it, and it
      // keeps the home page light.
      loop: '',
    },
    // Full-width animated plates, the way the gallery presents them. These are
    // animated WebP, which plays in a plain <img>.
    plates: [
      { src: 'media/work/sphere-master/anim/01.mp4', caption: 'Sequence 01' },
      { src: 'media/work/sphere-master/anim/02.mp4', caption: 'Sequence 02' },
      { src: 'media/work/sphere-master/anim/03.mp4', caption: 'Sequence 03' },
    ],
    stills: Array.from({ length: 20 }, (_, i) => ({
      src: `media/work/sphere-master/stills/${String(i + 1).padStart(2, '0')}.jpg`,
      caption: `Frame ${String(i + 1).padStart(2, '0')}`,
    })),
    breakdown: {
      intro:
        'Five effects setups carried the spell beats. Each clip below is the pass as it was ' +
        'delivered into the edit.',
      steps: [
        {
          title: 'Cloth simulation',
          body: "Cloth on Invoker's robe and cape, simulated over the animation cache.",
          media: { type: 'video', src: 'media/work/sphere-master/bd/cloth.mp4' },
        },
        {
          title: 'Hand effects',
          body: 'The magic gathering in the hands as the spheres are summoned.',
          media: { type: 'video', src: 'media/work/sphere-master/bd/hand.mp4' },
        },
        {
          title: 'Charge build-up',
          body: 'The longer hold before release, building on the same setup.',
          media: { type: 'video', src: 'media/work/sphere-master/bd/hand_02.mp4' },
        },
        {
          title: 'Meteor',
          body: 'The meteor — trail, flight and impact.',
          media: { type: 'video', src: 'media/work/sphere-master/bd/meteor.mp4' },
        },
        {
          title: 'Sun Strike',
          body: 'The Sun Strike beam and its build-up.',
          media: { type: 'video', src: 'media/work/sphere-master/bd/sunstrike.mp4' },
        },
      ],
    },
  },

  {
    slug: 'vaio-fe',
    title: 'The New VAIO FE',
    subtitle: 'Product film',
    year: '2023',
    client: 'VAIO',
    status: null,
    // The tagline from the gallery. "distingushed" is a typo there; corrected
    // here rather than reproduced.
    summary:
      "A story that links distinguished product craftsmanship with Earth's finest resources.",
    roles: ['Particle FX'],
    // NOT RENDERED — the meta rail no longer shows a credits block. Kept
    // because it was transcribed from the credits module in the gallery image
    // and is more accurate than the page metadata, which gave "Patrick Kizny"
    // and "Andrii Nasibnov". Restore by putting the row back in Project.jsx.
    credits: [
      { role: 'Agency', name: 'Lucid Theory' },
      { role: 'Agency ECD', name: 'Anthony Pietromonaco' },
      { role: 'Production', name: 'Kizny Visuals' },
      { role: 'Director / EP', name: 'Patryk Kizny' },
      { role: 'Producer', name: 'Anastasia Lytovka' },
      { role: 'CG Lead', name: 'Riley Schmidt' },
      { role: 'CG Artists', name: 'Riley Schmidt, Insane, Denis Yarets, Andrii Naidonov' },
      { role: 'Sound Design', name: 'Coupe Studios' },
    ],
    tools: ['Cinema 4D', 'Redshift', 'Nuke'],
    // Finished frames are all 16:9; the two process boards are 3.56, so the
    // breakdown carries its own ratio rather than being cropped to the stills.
    aspect: 1.78,
    bdAspect: 3.56,
    mediaFit: 'contain',
    real: true,
    // The first two paragraphs are the film's own copy, taken from the title
    // card in the gallery.
    description: [
      'The new VAIO FE is a revival of the legendary Japanese computer brand, and it’s packed ' +
        'with distinguished craftsmanship and materials.',
      'Our main challenge was to deliver this essence with grace. We did it by weaving a story ' +
        'that links the product qualities to the wealth of Earth’s finest resources.',
      'My part was the first half of the film — the particle effects.',
    ],
    links: [
      {
        label: 'View on Behance',
        href: 'https://www.behance.net/gallery/160498189/The-New-VAIO-FE',
      },
    ],
    video: { provider: 'vimeo', id: '786272917' },
    media: {
      poster: 'media/work/vaio-fe/poster.jpg',
      thumb: 'media/work/vaio-fe/thumb.jpg',
      loop: '',
    },
    stills: Array.from({ length: 4 }, (_, i) => ({
      src: `media/work/vaio-fe/stills/${String(i + 1).padStart(2, '0')}.jpg`,
      caption: `Frame ${String(i + 1).padStart(2, '0')}`,
    })),
    stillsTag: 'Frames',
    stillsTitle: 'Stills',
    breakdown: {
      intro: 'Process and development.',
      steps: [
        {
          title: 'Scene and lookdev',
          body: 'The product scene assembled, lit and laid out in Cinema 4D.',
          media: { type: 'image', src: 'media/work/vaio-fe/bd/01.jpg' },
        },
        {
          title: 'Comp',
          body: 'The Nuke graph, with the particle build-up around the chip.',
          media: { type: 'image', src: 'media/work/vaio-fe/bd/02.jpg' },
        },
      ],
    },
  },

  {
    slug: 'short-film-2026',
    title: 'Untitled Short Film',
    subtitle: 'Short film',
    year: '2026',
    client: 'Personal project',
    status: 'In production',
    summary: 'A follow-up short in ultrawide — larger cast, heavier effects, in progress.',
    roles: ['FX', 'Lookdev', 'Lighting', 'Compositing'],
    tools: ['Houdini', 'Cinema 4D', 'Octane', 'Nuke'],
    description: [
      'The next short film, currently in production. Shot in 2.35 ultrawide and built around ' +
        'a larger cast, which meant rebuilding the character pipeline: custom textures and ' +
        'groom for every hero, and a shared shading setup so the cast holds up under one ' +
        'lighting rig.',
      'The effects brief is heavier than the last film — more destruction, more interaction ' +
        'between characters and simulation. Shots are cached out as ProRes and assembled in ' +
        'comp as they land.',
    ],
    links: [],
    media: {
      poster: 'media/work/short-film-2026/poster.jpg',
      thumb: 'media/work/short-film-2026/thumb.jpg',
      loop: 'media/work/short-film-2026/loop.mp4',
    },
    stills: [],
    breakdown: {
      intro: 'Three shots from the current cut.',
      steps: [
        {
          title: 'Shot 01',
          body: 'Opening establishing beat — environment lookdev and atmospheric pass.',
          media: { type: 'video', src: 'media/work/short-film-2026/bd/sh_01.mp4' },
        },
        {
          title: 'Shot 02',
          body: 'Character-driven beat with interaction FX driven off the animation cache.',
          media: { type: 'video', src: 'media/work/short-film-2026/bd/sh_02.mp4' },
        },
        {
          title: 'Shot 03',
          body: 'Effects-heavy beat — simulation layers comped over the rendered plate.',
          media: { type: 'video', src: 'media/work/short-film-2026/bd/sh_03.mp4' },
        },
      ],
    },
  },

  {
    slug: 'shanghai',
    title: 'Shanghai',
    subtitle: 'Real-time environment',
    year: '2026',
    client: 'Personal project',
    status: 'In progress',
    summary: 'A photoreal Shanghai built for an aerial flythrough in Unreal Engine 5.',
    roles: ['Environment', 'Layout', 'Lighting'],
    tools: ['Unreal Engine 5', 'KitBash3D', 'PCG', 'Lumen'],
    description: [
      'A city environment assembled for an aerial camera move — the Huangpu horseshoe, a ' +
        'supertall cluster on the Pudong side and low-rise blocks across Puxi, laid out to ' +
        'real proportions so the flythrough reads as the actual skyline.',
      'The city is built from kits rather than modelled: districts are zoned first, then ' +
        'filled procedurally so density, height and lighting follow the zoning instead of ' +
        'being placed by hand. That keeps the layout editable — moving a district boundary ' +
        're-populates the blocks instead of breaking them.',
      'Lighting is fully dynamic, which is what makes the night pass work: every window and ' +
        'sign is emissive, and the bounce is doing the heavy lifting rather than a baked pass.',
    ],
    links: [],
    media: {
      poster: 'media/work/shanghai/poster.jpg',
      thumb: 'media/work/shanghai/thumb.jpg',
      loop: '',
    },
    stills: Array.from({ length: 8 }, (_, i) => ({
      src: `media/work/shanghai/stills/${String(i + 1).padStart(2, '0')}.jpg`,
      caption: `View ${String(i + 1).padStart(2, '0')}`,
    })),
    breakdown: {
      intro:
        'The environment was built in passes, each one fully art-directable before the next ' +
        'went on top.',
      steps: [
        {
          title: 'Massing blockout',
          body:
            'Grey-box volumes at true scale first. Nothing photoreal until the silhouette of ' +
            'the skyline works from the camera path.',
          media: { type: 'image', src: 'media/work/shanghai/bd/01.jpg' },
        },
        {
          title: 'Road network',
          body:
            'Arterials and expressways drawn as splines, which later drive both the street ' +
            'furniture and the block subdivision.',
          media: { type: 'image', src: 'media/work/shanghai/bd/02.jpg' },
        },
        {
          title: 'Kit population',
          body:
            'Blocks swapped from grey-box to kit buildings procedurally, keyed to the district ' +
            'zoning so heights and styles stay coherent.',
          media: { type: 'image', src: 'media/work/shanghai/bd/03.jpg' },
        },
        {
          title: 'Vegetation and props',
          body:
            'Street trees, promenade furniture and waterfront detail scattered along the same ' +
            'splines that define the roads.',
          media: { type: 'image', src: 'media/work/shanghai/bd/04.jpg' },
        },
        {
          title: 'Emissive lighting',
          body:
            'The night pass. Windows, signage and street lamps drive the look almost entirely ' +
            'through emissive materials and dynamic bounce.',
          media: { type: 'image', src: 'media/work/shanghai/bd/05.jpg' },
        },
        {
          title: 'Final grade',
          body:
            'Exposure, colour and atmospheric depth tuned for the camera altitude the ' +
            'flythrough actually uses.',
          media: { type: 'image', src: 'media/work/shanghai/bd/06.jpg' },
        },
      ],
    },
  },

  {
    slug: 'ink-sumi',
    title: 'Ink & Water',
    subtitle: 'FX research',
    year: '2026',
    client: 'R&D',
    status: null,
    summary: 'Sumi-e ink dispersing in water — a filament solver built for stylised transitions.',
    roles: ['FX', 'Lookdev'],
    tools: ['Houdini', 'Karma', 'Copernicus'],
    description: [
      'A study in getting ink to behave like ink. A straight smoke sim reads as smoke no ' +
        'matter how you grade it, so the setup drives millions of points through a guided ' +
        'velocity field instead — curl and directional forces plus a divergence term pull the ' +
        'cloud into fibrous filaments that hold their edge.',
      'Rendered as an absorption medium rather than emission, which is what gives the ink its ' +
        'weight against a white ground.',
      'Built as a reusable transition element: the same setup drives wipes and reveals by ' +
        'changing the guide field rather than re-authoring the effect.',
    ],
    links: [],
    media: {
      poster: 'media/work/ink-sumi/poster.jpg',
      thumb: 'media/work/ink-sumi/thumb.jpg',
      loop: 'media/work/ink-sumi/loop.mp4',
    },
    stills: [],
    breakdown: {
      intro: 'Two variants of the same solver.',
      steps: [
        {
          title: 'Filament dispersion',
          body:
            'The base setup — points advected through the guided field, rendered as absorption. ' +
            'Density falls off along the filament so the tips stay translucent.',
          media: { type: 'video', src: 'media/work/ink-sumi/loop.mp4' },
        },
        {
          title: 'Brush-stroke variant',
          body:
            'The same solver seeded from a stroke instead of a point source, which turns the ' +
            'effect into a calligraphic reveal.',
          media: { type: 'video', src: 'media/work/ink-sumi/bd/sequence.mp4' },
        },
      ],
    },
  },

  {
    slug: 'statue-collapse',
    title: 'Statue Collapse',
    subtitle: 'Destruction and comp',
    year: '2025',
    client: 'Personal project',
    status: null,
    summary: 'A monument coming apart — rigid-body destruction finished through to final comp.',
    roles: ['FX', 'Compositing'],
    tools: ['Houdini', 'Nuke'],
    description: [
      'A rigid-body destruction shot taken all the way to a finished comp rather than stopping ' +
        'at the sim. Fracturing is layered — large structural chunks first, then secondary ' +
        'debris and dust driven off the impact points.',
      'Most of the work is in the comp: the dust layers, the depth cueing that separates the ' +
        'debris from the background, and a grain pass matched to the plate. The ungraded ' +
        'version is included in the breakdown for comparison.',
    ],
    links: [],
    media: {
      poster: 'media/work/statue-collapse/poster.jpg',
      thumb: 'media/work/statue-collapse/thumb.jpg',
      loop: 'media/work/statue-collapse/loop.mp4',
    },
    stills: [],
    breakdown: {
      intro: 'Graded against ungraded, to show what the comp is actually doing.',
      steps: [
        {
          title: 'Final comp',
          body: 'Dust, depth cueing and grain, graded to the intended look.',
          media: { type: 'video', src: 'media/work/statue-collapse/loop.mp4' },
        },
        {
          title: 'Before grain and grade',
          body:
            'The same shot with the finishing layers switched off — the raw render plus ' +
            'simulation passes.',
          media: { type: 'video', src: 'media/work/statue-collapse/bd/no-grain.mp4' },
        },
      ],
    },
  },
]

export const getProject = (slug) => projects.find((p) => p.slug === slug)

/**
 * Only the projects that actually have media behind them.
 *
 * The rest are scaffolding: real entries with copy but no files yet, kept so
 * that dropping media in is all it takes to publish one. Nothing user-facing
 * may link to those, or the site advertises pages with nothing on them.
 */
export const publishedProjects = projects.filter((p) => p.real)

export const getNextProject = (slug) => {
  const i = publishedProjects.findIndex((p) => p.slug === slug)
  return i === -1 ? null : publishedProjects[(i + 1) % publishedProjects.length]
}
