# VFX Portfolio

Dark, minimal one-page portfolio with per-project breakdown pages.
Vite + React, no backend, deploys as static files.

---

## Run it

```bash
npm install
npm run dev
```

Opens on <http://localhost:5180>.

Node lives at `X:\tools\node` (portable install, already on your `PATH`).
If `npm` is not found in a fresh terminal, open a new one — `PATH` changes only
apply to newly launched shells.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run media` | Rebuild web media from the original project files |

---

## Still to fill in

`src/data/profile.js` holds everything personal. The name is set to
**ケンInsane**; what is still a placeholder is the **social links** — they all
point at `#`. Delete the rows you do not use, the footer renders whatever is
left. Email and the discipline list are in the same file.

Kana is not in Archivo or Inter. Rather than ship a 5 MB CJK webfont for two
characters, `--font-jp` in `index.css` lists the system Japanese faces and the
browser falls back per glyph — so ケン sets in Yu Gothic / Hiragino while
"Insane" stays in Archivo.

---

## Artwork: placeholders vs. real footage

The site currently renders **generated placeholders** everywhere — no image or
video files are loaded at all. They are deterministic per project, so each card
keeps its own look and nothing reshuffles between visits.

Real media has already been rendered out of your project files and is waiting in
`media_staged/` (64 MB). To switch over:

1. Move `media_staged/` to `public/media/`
2. Set `USE_PLACEHOLDERS = false` in `src/data/config.js`

That is the whole switch — every path in `src/data/projects.js` is already
pointing at the right file. Individual projects still fall back to a placeholder
if their path is empty, so you can go live one project at a time.

### Regenerating media

`tools/build_media.py` reads the originals straight off `X:` and writes
web-sized versions into `public/media/`. It needs Python with `Pillow` and
`imageio-ffmpeg` (both already installed) — no system ffmpeg required.

```bash
python tools/build_media.py            # skip anything already built
python tools/build_media.py --force    # rebuild everything
python tools/build_media.py --only shanghai
```

Source paths are the `SPHERE` / `SHANGHAI` / `INK` / `STATUE` / `D2_2026`
constants in the middle of that file. It never writes to your project folders —
it only reads.

---

## Adding a project

Append an entry to `src/data/projects.js`. The first entry in the array gets the
wide featured slot on the grid; the rest go two-up.

```js
{
  slug: 'my-project',            // the URL: /#/work/my-project
  title: 'My Project',
  subtitle: 'Short film',
  year: '2026',
  client: 'Studio name',
  status: 'In production',       // null for finished work
  summary: 'One line for the card.',
  roles: ['FX', 'Compositing'],
  tools: ['Houdini', 'Nuke'],
  description: ['Paragraph one.', 'Paragraph two.'],
  media: { poster: '', thumb: '', loop: '' },
  stills: [],
  breakdown: {
    intro: 'Optional line above the steps.',
    steps: [{ title: 'Step', body: 'What you did.', media: { type: 'video', src: '' } }],
  },
}
```

Leave any `src` empty and that slot renders a placeholder.

---

## Deploying

`npm run build` produces a fully static `dist/`. `base` is set to `./` in
`vite.config.js`, so it works from a sub-folder or straight off disk. Routing
uses hash URLs (`/#/work/slug`), which means no server rewrite rules are needed
on Netlify, GitHub Pages, or plain shared hosting.

Watch the payload if you enable real media — the full-quality reel alone is
~40 MB. For a public site, host the reel on Vimeo or YouTube and point
`profile.reel.full` at the embed instead.

---

## Layout

```
src/
  data/
    config.js      placeholder switch
    profile.js     name, contact, socials, reel paths
    projects.js    all project content
  components/
    Nav Hero WorkGrid Footer
    Media          picks real file vs. placeholder
    Placeholder    the generated stand-in artwork
    Lightbox       stills viewer + reel player
    Reveal         scroll-in animation
  pages/
    Home Project NotFound
  index.css        the whole design system
tools/
  build_media.py   media pipeline
```

Colours, type and spacing are all CSS custom properties at the top of
`src/index.css`. The accent red is `--red`.

### Seeing the design

The Browser pane here cannot take screenshots — it only composites frames while
it is visible, so captures time out. `tools/shot_sink.mjs` works around that:
start it, and the page can rasterise itself to a canvas and POST the bytes to
disk.

```bash
node tools/shot_sink.mjs
```

Then from the page console (or a driven browser):

```js
fetch('http://127.0.0.1:5199/shot?name=cards', { method: 'POST', body: canvas.toDataURL('image/jpeg', 0.85) })
```

Files land in `tools/_shots/`. It binds to loopback and is dev-only.

Note that this rasterises SVG and canvas content, not arbitrary DOM — it was
built to check the generated placeholder artwork.
