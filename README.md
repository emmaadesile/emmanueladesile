# Emmanuel Adesile — Portfolio

A fast, bold personal portfolio built with **TanStack Start + React 19**, with a
WebGL glitch-dither portrait, GSAP text/scroll animations, smooth scrolling, and
a dark-only theme.

## Requirements

**Node ≥ 22.12** (Vite 8 / Rolldown ships a native binary that refuses to install
on older 22.x). This repo pins `22.23.1` in `.nvmrc`:

```bash
nvm use
```

If dependencies were installed on an older Node, the dev server will fail with
"Cannot find native binding". Fix:

```bash
nvm use && rm -rf node_modules package-lock.json && npm install
```

## Commands

```bash
npm run dev      # dev server at http://localhost:3000
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Tech

- **TanStack Start + Router** (SSR, file-based routing) · **React 19** · **Vite 8**
- **Tailwind v4** for layout utilities + custom CSS design tokens
- **GSAP + ScrollTrigger** — headline/name reveals, scroll-triggered work reveals
- **Lenis** — smooth scrolling (synced to the GSAP ticker)
- **Raw WebGL2** — the portrait's ordered-dither + glitch effect (no Three.js)
- Self-hosted fonts: **Archivo Expanded** (the big name — a ~12KB A–Z subset),
  **Big Shoulders Display** (section headings), **Geist** / **Geist Mono** (UI)

### The name font (subset)

The giant name uses Archivo's variable font at weight 800 / width 125. To keep it
tiny it's subset to A–Z + space and committed at `src/assets/archivo-name.woff2`
(declared via `@font-face` in `src/styles.css`). The full Archivo package is **not**
a dependency. To regenerate (e.g. after changing the subset), with `fonttools`
installed:

```bash
npm i -D @fontsource-variable/archivo
python3 -m fontTools.subset \
  node_modules/@fontsource-variable/archivo/files/archivo-latin-standard-normal.woff2 \
  --text="ABCDEFGHIJKLMNOPQRSTUVWXYZ " --flavor=woff2 \
  --output-file=src/assets/archivo-name.woff2
npm uninstall @fontsource-variable/archivo
```

## Where to edit things

| What | File |
| --- | --- |
| Name, role, bio, location, email, socials, nav | `src/data/site.ts` |
| Projects (titles, stats, tools) | `src/data/projects.ts` |
| Your portrait | `public/emmanuel.webp` |
| Colors, fonts, design tokens | `src/styles.css` (`:root`) |
| Glitch/dither look | `src/components/DitherPortrait.tsx` (the GLSL `FRAG` shader) |

Values marked `PLACEHOLDER` in `src/data/site.ts` are safe stand-ins — swap them
for your real details (email, socials, location/coordinates).

## Structure

```
src/
  routes/__root.tsx   # document shell, fonts, meta
  routes/index.tsx    # page: Nav + Hero + Projects + Footer
  components/         # Nav, Hero, DitherPortrait, ParticleField, Projects, Footer, LocalClock
  lib/                # gsap, smoothScroll (Lenis)
  data/               # site + projects content
```

## Accessibility & performance

- Honors `prefers-reduced-motion` (animations and the glitch are disabled).
- The WebGL canvas pauses when offscreen or the tab is hidden; DPR capped at 2.
- Fonts are subset by `unicode-range` and loaded with `font-display: swap`.
