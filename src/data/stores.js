/**
 * Where the assets are sold. The /assets page is only a signpost now: one card
 * per store, each a single link out, so the catalogue itself lives in one place
 * per store and never has to be kept in sync here.
 *
 * Keep `note` at the level of what kind of thing is sold, not a product list —
 * a list would go stale the first time something is added to a store.
 *
 * `icon` is the platform's mark as a 24x24 SVG path, from Simple Icons
 * (simpleicons.org, CC0), drawn by the card in the site's own white.
 */
export const stores = [
  {
    id: 'shopify',
    platform: 'Shopify',
    title: 'ケンInsane Store',
    note: 'Houdini FX setups from my Dota 2 film Divine Rampage, starting with Shadowraze and Desolation Arms.',
    href: 'https://kxxinsane.myshopify.com/',
    icon:
      'M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.057-.121-.074l-.914 21.104h.023zM11.71 11.305s-.81-.424-1.774-.424c-1.447 0-1.504.906-1.504 1.141 0 1.232 3.24 1.715 3.24 4.629 0 2.295-1.44 3.76-3.406 3.76-2.354 0-3.54-1.465-3.54-1.465l.646-2.086s1.245 1.066 2.28 1.066c.675 0 .975-.545.975-.932 0-1.619-2.654-1.694-2.654-4.359-.034-2.237 1.571-4.416 4.827-4.416 1.257 0 1.875.361 1.875.361l-.945 2.715-.02.01zM11.17.83c.136 0 .271.038.405.135-.984.465-2.064 1.639-2.508 3.992-.656.213-1.293.405-1.889.578C7.697 3.75 8.951.84 11.17.84V.83zm1.235 2.949v.135c-.754.232-1.583.484-2.394.736.466-1.777 1.333-2.645 2.085-2.971.193.501.309 1.176.309 2.1zm.539-2.234c.694.074 1.141.867 1.429 1.755-.349.114-.735.231-1.158.366v-.252c0-.752-.096-1.371-.271-1.871v.002zm2.992 1.289c-.02 0-.06.021-.078.021s-.289.075-.714.21c-.423-1.233-1.176-2.37-2.508-2.37h-.115C12.135.209 11.669 0 11.265 0 8.159 0 6.675 3.877 6.21 5.846c-1.194.365-2.063.636-2.16.674-.675.213-.694.232-.772.87-.075.462-1.83 14.063-1.83 14.063L15.009 24l.927-21.166z',
  },
  {
    id: 'gumroad',
    platform: 'Gumroad',
    title: 'ケンInsane on Gumroad',
    note: 'Cinema 4D plugins, Houdini FX setups, Unreal Engine packs and Octane render scenes.',
    href: 'https://ins4ne.gumroad.com/',
    icon:
      'M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0Zm-.007 5.12c4.48 0 5.995 3.025 6.064 4.744h-3.239c-.069-.962-.897-2.406-2.896-2.406-2.136 0-3.514 1.857-3.514 4.126 0 2.27 1.378 4.125 3.514 4.125 1.93 0 2.758-1.512 3.103-3.025h-3.103v-1.238h6.509v6.327h-2.855v-3.989c-.207 1.444-1.102 4.264-4.617 4.264-3.516 0-5.584-2.82-5.584-6.326 0-3.645 2.276-6.602 6.618-6.602z',
  },
]
