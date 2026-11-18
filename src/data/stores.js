/**
 * Where the assets are sold. The /assets page is only a signpost now: one card
 * per store, each a single link out, so the catalogue itself lives in one place
 * per store and never has to be kept in sync here.
 *
 * Keep `note` at the level of what kind of thing is sold, not a product list —
 * a list would go stale the first time something is added to a store.
 * Covers are built by tools/build_store_covers.mjs.
 */
export const stores = [
  {
    id: 'shopify',
    platform: 'Shopify',
    title: 'ケンInsane Store',
    note: 'Houdini FX setups from my Dota 2 film Divine Rampage, starting with Shadowraze and Desolation Arms.',
    href: 'https://kxxinsane.myshopify.com/',
    cover: 'media/stores/shopify.jpg',
  },
  {
    id: 'gumroad',
    platform: 'Gumroad',
    title: 'ケンInsane on Gumroad',
    note: 'Cinema 4D plugins, Houdini FX setups, Unreal Engine packs and Octane render scenes.',
    href: 'https://ins4ne.gumroad.com/',
    cover: 'media/stores/gumroad.jpg',
  },
]
