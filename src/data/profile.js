/**
 * Everything personal lives here. This is the only file you must edit before
 * showing the site to anyone.
 */
export const profile = {
  name: 'ケンInsane',

  role: 'VFX Artist',
  // Shown next to the role in the hero, separated by red dots.
  disciplines: ['VFX', 'Scene Assembly and Lookdev', 'Compositing'],
  location: 'Available worldwide — remote',

  // No email on the site by choice — the socials below are the way in.

  // Two or three sentences. Keep it about the work, not the résumé.
  intro:
    'I build effects, light and comp shots for short films, game cinematics and broadcast. ' +
    'Most of my work starts in Houdini and ends in Nuke — simulation, lookdev and the ' +
    'grunt work in between.',

  // The footer renders these in order, and they are the only contact route on
  // the site — add or remove rows and the list adapts.
  socials: [
    { label: 'YouTube', href: 'https://www.youtube.com/@kxxinsane' },
    { label: 'Instagram', href: 'https://www.instagram.com/ins4neken/' },
    { label: 'Behance', href: 'https://www.behance.net/insane1' },
  ],

  // Hero background + the file the PLAY REEL button opens.
  //
  // Paths are relative on purpose: with `base: './'` a leading slash would
  // break both the standalone build opened over file:// and any deploy that
  // is not at a domain root. HashRouter keeps the document URL at the root,
  // so relative paths stay correct on project pages too.
  //
  // `real: true` means these files exist, which overrides USE_PLACEHOLDERS.
  reel: {
    // No poster yet: the only frame available is the reel's own "FX REEL 2025"
    // title card, which would fight the hero heading. The dark hero reads as
    // intentional until the clip starts.
    poster: undefined,
    loop: 'videos/reel-2025.mp4',
    full: 'videos/reel-2025.mp4',
    real: true,
    // The reel opens on a title card. As a background it would put a second
    // large piece of type behind the name, so the hero starts past it.
    loopStart: 6,
  },
}
