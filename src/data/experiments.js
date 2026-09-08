import aspects from './experiments.aspects.json'

/**
 * Personal experiments — renders, FX tests and R&D that never became projects.
 *
 * This is the user's own hand-picked list, name for name. Media is built by
 * `tools/build_experiments_media.mjs` (GIF -> animated WebP, MP4 copied as-is),
 * which also writes `experiments.aspects.json` — every clip's true shape, read
 * from the WebP header or straight out of the MP4 container.
 *
 * The page lays these out as masonry, so each frame is rendered at its own
 * aspect. That is why there is no `wide` flag any more: the clips are already
 * 1.0 to 2.45, and forcing them into two fixed cell shapes was what left the
 * uneven black margins.
 */
// Animations are H.264 too, not animated WebP: about half the bytes, and a
// <video> can be paused off-screen where an animated <img> never stops.
const anim = (slug) => ({ kind: 'video', src: `media/experiments/anim/${slug}.mp4` })
// Extension is explicit because one source is a QuickTime .mov, and renaming it
// to .mp4 would only get it served with the wrong content type.
const clip =
  (ext = 'mp4') =>
  (slug) => ({ kind: 'video', src: `media/experiments/video/${slug}.${ext}` })
const mp4 = clip('mp4')

const list = [
  // Turntable of the Anti-Mage persona print, with its aura passes. Source is
  // a 495 MB ProRes shot 1440x2560 — see the build script for why this one
  // carries its own encode settings.
  ['antimage-aura', 'Anti-Mage aura FX', mp4],
  ['transition-filaments', 'Transition FX v004', anim],
  // Two Marci passes now, so both carry their version.
  ['marci', 'Marci FX v005', anim],
  ['marci-v001', 'Marci FX v001', mp4],
  // Its source was MPEG-4 Part 2, which browsers no longer decode; the H.264
  // re-encode in the build script is what makes it playable at all.
  ['bird-fx', 'Bird SH01 FX preview', mp4],
  // Titled from the frames: two vehicles colliding inside a sim bounds box.
  ['clip-mov', 'Car crash sim', mp4],
  ['terrorblade-v005', 'Terrorblade FX v005', mp4],
  ['smoke', 'Smoke', anim],
  ['sh2fx', 'SH2 FX', anim],
  ['portal-v002', 'Portal v002', mp4],
  ['rbd-ct', 'RBD CT', anim],
  ['rbd-preview', 'RBD preview', anim],
  ['beam', 'Beam FX', anim],
  ['roshan-ice-v2', 'Roshan ice v2', mp4],
  ['trail', 'Trail FX', anim],
  ['terrorblade-v002', 'Terrorblade FX v002', mp4],
  ['portal-test', 'Portal FX test', anim],
  ['ship', 'Ship FX', mp4],
  ['explosion-preview', 'Explosion', anim],
  ['explo-preview', 'Explosion preview', mp4],
  ['sh4fx-v2', 'SH4 FX v2', anim],
  ['beach-water', 'Beach water R&D', mp4],
  ['beach-water-v2', 'Beach water R&D v2', mp4],
  ['trails', 'Trails', mp4],
  // Filename was not usable as a caption; titled from what the clip shows.
  ['ruins', 'Ruins', anim],
  ['portal-v001', 'Portal v001', mp4],
  ['terrorblade-v004', 'Terrorblade FX v004', mp4],
  ['transition-another', 'Transition', mp4],
  ['office', 'Office', anim],
  ['cryptosucks', 'Cryptosucks', anim],
  ['untitled', 'Untitled', mp4],
]

export const experiments = list.map(([id, title, make]) => ({
  id,
  title,
  media: make(id),
  // 16/9 is only a fallback for a clip whose shape could not be read.
  aspect: aspects[id] ?? 1.778,
  real: true,
}))
