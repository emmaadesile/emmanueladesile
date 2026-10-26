# Personal website: reference research and design direction

Research date: 26 October 2026. Scope: desktop browser inspection of all five references, including scrolling, plus review of the existing Astro source. These are visual observations and implementation proposals, not measured performance scores or claims about the references' underlying frameworks. Mobile behavior and production performance remain to be tested.

## Reference notes

| Reference | Observed design and behavior | Adaptation for Emmanuel |
| --- | --- | --- |
| [Nivora](https://nivora.framer.website/) | Oversized centered sans-serif headline over a lime portrait; purple accents; sparse persistent navigation; black sections; large introductory copy and framed product galleries. | Confident typographic scale, concise introduction, clear project labels and generous spacing. Use an original geometric composition in place of its photographic hero. |
| [The Obsidian Assembly](https://obsidianassembly.com/) | Large fine serif lettering around a reflective sculptural object; warm neutral background transitioning into black; fine curved linework; tilted image panels and an advancing gallery. | One signature sculptural form, restrained editorial serif accents, SVG curves, asymmetrical project composition. Keep portfolio navigation explicit and project details easy to reach. |
| [Ironhill](https://ironhill.au/) | Dark forest opening with gold serif type; cream narrative sections; text progressively darkens as scrolling advances; floating archival images and a fine wandering line. A full-screen loading sequence appeared during this visit. | A deliberate rhythm between dramatic and quiet sections; a short scroll-emphasized statement; a simple SVG line linking the story. Deliver useful content immediately while decorative assets load. |
| [Oryzo](https://oryzo.ai/) | A realistic coaster remains the focal object as the scene changes from a desk into isolated product storytelling; large typography, small technical labels, and interactive feature controls. | Give the Three.js object a narrative purpose: interface layers assemble into a coherent system. Use one small optional interaction to demonstrate craft. Avoid replicating the extensive scenes and textures. |
| [Lando Norris](https://landonorris.com/) | Strong personal branding; portrait/helmet hero treatment; dark olive and cream sections with lime highlights; contour-like background lines, large signature, mixed type styles, and a staggered personal photo collage. | A distinctive EA mark, consistent accent color, fine background linework, expressive type and an editorial work gallery. Personal content should support the professional story. |

## Proposed cohesive direction

An editorial portfolio for an engineer who cares about both interface craft and production quality. Use Nivora's hierarchy as the foundation, Obsidian's restraint for depth, Ironhill's pacing between sections, Oryzo's object continuity, and Lando's consistency of personal identity.

- Palette: warm off-white `#F3F0E8`, near-black `#171918`, muted olive-gray `#777D70`, and a single chartreuse accent `#D6F568`. These are proposed tokens; verify text contrast in implementation. Use dark text on chartreuse buttons.
- Type: reuse the existing Plus Jakarta Sans for the main headline and body; Instrument Serif for a few expressive phrases; monospace only for compact metadata. Restrict loaded subsets and weights.
- Layout: spacious desktop grid, broad project panels, fine rules, clear numbered sections, consistent corner treatments. On small screens, use a readable single column and a smaller independent scene area.
- Graphic language: one original angular EA symbol or assembly of interface planes, echoed in SVG diagrams, section dividers, and project illustrations. Avoid adding unrelated decorative motifs per section.
- Navigation: Work, About, Writing, Contact. Keep the route to work and contact visible and keyboard accessible.

Suggested hero copy:

> Emmanuel Adesile — Senior Frontend Engineer
>
> Thoughtful interfaces. Engineered to scale.
>
> I build sleek, intuitive, responsive websites and apps that scale to thousands of users. Over 7 years of frontend engineering experience.

Primary link: View selected work. Secondary link: Get in touch, pointing to the contact section until a preferred contact destination is supplied. The incomplete phrase “I'm A first” has intentionally not been interpreted as a biographical claim.

## Page sequence

1. **Introduction:** visible HTML headline and summary, compact experience label, two links, and a dedicated decorative SVG/Three.js composition.
2. **Selected work:** two or three strong cases with project name, problem, personal contribution, technologies and verified outcome. Use original SVG interface illustrations initially; label conceptual illustrations clearly. Real project screenshots are useful when they demonstrate actual shipped work.
3. **Approach:** three concise themes—interface craft, performance, and maintainable systems—supported by small SVG illustrations.
4. **About:** short personal narrative and experience. Include a portrait only if it adds something the user wants to communicate.
5. **Writing:** readable article rows using the existing Astro content collection.
6. **Contact:** large editorial closing statement and direct contact/social links.

## Motion specification

| Area | Proposed behavior | Constraint |
| --- | --- | --- |
| Hero | SVG composition is immediately visible; Three.js takes over the same reserved area once ready. A short assembly motion settles into place. | Headline, navigation and links never wait for a reveal or loading screen. |
| Three.js | A small set of beveled interface planes forms an abstract EA sculpture. Subtle pointer response and a restrained scroll rotation. | One canvas, simple procedural geometry/materials, no required external textures or 3D model. |
| Section entrances | Approximately 16–24px translation over 350–500ms, with a short stagger where useful. | Visible static fallback; prefer transform/opacity and avoid making long passages scroll-dependent. |
| Project panels | Small lift, SVG detail reveal and arrow movement on hover/focus. | Link label and essential content remain visible on touch devices. |
| Narrative | One short statement gains emphasis while scrolling; a decorative SVG path can draw alongside it. | Maintain readable baseline contrast; avoid hundreds of animated text nodes. |
| Navigation | Underline/arrow transitions and optional progress indicator. | Stable header footprint; no animated height that reflows the page. |

Use native scrolling. Support reduced motion with a static SVG composition and no parallax or pointer following. Also provide a visible motion toggle if ambient motion continues beyond the introductory sequence. Keep focus states equivalent to hover states. Prefer finite motion that settles and renders again only when relevant input changes.

## Performance plan

The production acceptance thresholds are LCP ≤ 2.5s, CLS ≤ 0.1 and INP ≤ 200ms at the 75th percentile, separately for mobile and desktop. Aim for additional development headroom: LCP around 2s or better and CLS ≤ 0.05 in representative mobile lab runs. These are targets, not results. [Core Web Vitals definitions](https://web.dev/articles/vitals)

- **LCP:** render meaningful HTML at build time; keep the headline visible from first paint; subset self-hosted fonts and preload only critical font files. Delay the optional Three.js import and initialization until essential content has rendered and the browser has an opportunity to work. Deferred code still needs profiling because shader compilation and initialization can contend with input. If a hero photograph is introduced, optimize it and do not lazy-load the LCP image. [LCP guidance](https://web.dev/articles/optimize-lcp)
- **CLS:** reserve dimensions for the canvas, SVGs, media and project previews; match font fallback metrics; keep the header's layout height stable; swap the SVG and canvas within the same container.
- **INP:** keep interaction handlers small, avoid React state updates on every pointer or scroll event, and coalesce scene updates into animation frames. Stop rendering when offscreen or the document is hidden, cap device pixel ratio, and reduce scene complexity on weaker devices.
- **Animation cost:** favor transform and opacity. Limit blur, large filters, dynamic shadows and complex animated SVG paths. SVG is useful for crisp simple graphics, but elaborate SVGs can still be expensive. [Animation guidance](https://web.dev/articles/animations-guide)
- **Three.js lifecycle:** render on demand after motion settles; retain the SVG on unsupported WebGL or initialization failure; release GPU resources, observers and event listeners when navigating away. [Three.js rendering on demand](https://threejs.org/manual/pages/rendering-on-demand.html)
- **Delivery budget:** start with a proposed ≤50KB gzip budget for public-route JavaScript excluding the separately loaded Three.js feature. Report the deferred scene bundle separately, including its execution cost. Revisit the budget using actual build output instead of silently raising it.
- **Measurement:** test a production build with repeat Lighthouse mobile runs for LCP/CLS and blocking-time diagnostics; exercise menu, theme switch, project links and any scene control while profiling input. Test low-end mobile hardware, reduced motion, disabled JavaScript and WebGL failure. Collect real-user LCP/CLS/INP after deployment; a Lighthouse score alone cannot establish field INP.

## Existing Astro implementation notes

The repository uses Astro 5, React, MDX and TinaCMS. Existing uncommitted work was present during inspection; no application files were changed for this research pass.

- `src/pages/index.astro` renders the Tina-backed homepage through `client:tina`.
- `astro-tina-directive/tina.js` hydrates only inside an iframe. Its comment mentions a first click, but that is not what the implementation does. Preserve the public page's static rendering behavior and verify the actual shipped bundle. Astro's isolated interactive components fit the proposed optional 3D enhancement. [Astro islands](https://docs.astro.build/en/concepts/islands/)
- Keep Three.js independent of Tina's iframe-only hydration so the public site gets the scene without hydrating the full homepage.
- `src/components/BaseHead.astro` already uses Astro's client router. Account for repeated navigation when mounting and disposing the scene.
- `src/styles/global.css` has theme tokens, reduced-motion rules, scroll-driven reveals and header-height animation. Audit header reflow and existing effects before layering on more motion.
- The CMS content includes placeholder projects, and the SEO title/description are generic. Replace these with confirmed work and a meaningful professional introduction before launch.

## Assets and content

No image is necessary to start the visual build. SVG and procedural Three.js geometry can cover the hero, icons, decorative linework and conceptual project illustrations. Optional later assets: a portrait, two or three authentic project screenshots, and a raster social-sharing card for link previews.

Before publication, gather real project descriptions and outcomes, preferred contact details, any desired resume link, and clarification of the incomplete biographical phrase. Do not invent employers, client logos, testimonials, project impact metrics or personal interests.

## Update: 26 October 2026 (build pass)

### Decisions from Emmanuel

- Do not use the phrase "I'm A first".
- Accent: chartreuse `#D6F568`, with paper `#F3F0E8`, ink `#171918` and olive-grey `#777D70`.
- 3D hero: the blueprint EA mark. SVG construction lines draw in first, then the Three.js form replaces the SVG form in the same box.
- Images: none for now. SVG placeholders keep fixed aspect ratios, so real images can replace them with no layout shift.

### More observations and how the site uses them

| Site | Observation | Technique on this site | Cost |
| --- | --- | --- | --- |
| Nivora | Line-art service drawings, "+" corner marks, a marquee of names, dark framed cards. | Line-art SVG for each approach item, CSS "+" marks, CSS marquee of the specialties. | Very low |
| Obsidian | Staggered-panel preloader, serif display letters. | Instrument Serif for accent words only. No loader. | Low |
| Ironhill | "100" counter loader, text that fills with ink as you scroll, a fine line. | One inline element with `background-clip: text` and a scroll-driven gradient, plus one SVG line that draws with scroll. | Low |
| Oryzo | Blueprint intro with dimension handles, then the real object. Letters roll on hover. | SVG blueprint with `pathLength` and `stroke-dashoffset`, then the canvas. CSS text roll on nav links and buttons. | Low |
| Lando | Topographic contour lines, lime pill button, strong personal mark. | Contour SVG made at build time in the approach and contact sections. EA mark as the logo. | Very low |

Rule: three references use a full-screen loader. This site does not. The headline and the navigation paint first.

### Measured results (production build, `astro preview`, Lighthouse 13.5 headless)

| Run | LCP | CLS | TBT |
| --- | --- | --- | --- |
| Mobile (6 runs) | 1.7 s | 0 | 0–40 ms |
| Desktop (3 runs) | 0.4 s | 0 | 0 ms |

- Public JS on the home page: about 7 KB gzip (router and page script). React loads only inside the Tina editor.
- Deferred Three.js chunk: 138 KB gzip. It loads after the `load` event, when the hero is near the viewport and the browser is idle.
- Shaders compile with `compileAsync` before the first frame. This changed the largest scene task on mobile from 291 ms to 60–90 ms.
- Lab INP (visible browser pane, no CPU throttling): the slowest click was 32 ms. The test used the theme toggle (also during the 3D load), the motion toggle, a nav link and the "Explore my work" link.
- These are lab results. Field INP needs real-user data after deployment (for example Vercel Speed Insights or the `web-vitals` library).

## Update: Dawn Saunders layout

- Top bar: wordmark left, links centred, "Let's talk" pill right. Phones show the EA logo in place of the wordmark.
- Hero: a large "emmanuel." across the full width. The 3D EA initials stand in front of it on a dark arch. Headline on the left, intro on the right.
- A version with a background-free portrait in place of the initials was tried and removed: the result was not good enough. A sharper source photo (at least 2000 px tall) can make it possible again.
- Lighthouse with the initials hero, mobile (3 runs): LCP 1.7 s, CLS 0, TBT 10–30 ms. Desktop: LCP 0.4 s, CLS 0.
