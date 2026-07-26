/**
 * Master switch for artwork.
 *
 *   true  — every frame on the site is a generated placeholder (no media files).
 *   false — the site loads the real files from `public/media/...`.
 *
 * To go live with real footage:
 *   1. move `media_staged/` back to `public/media/`
 *   2. flip this to `false`
 *
 * Individual projects can still fall back to a placeholder just by leaving a
 * path empty in `projects.js`.
 */
export const USE_PLACEHOLDERS = true
