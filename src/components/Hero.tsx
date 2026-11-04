import { useEffect, useRef } from "react";
import { site } from "../data/site";
import { gsap, prefersReducedMotion, useIsoLayoutEffect } from "../lib/gsap";
import { scrollToAnchor } from "../lib/smoothScroll";
import { DitherPortrait } from "./DitherPortrait";
import { ParticleField } from "./ParticleField";
import { LocalClock } from "./LocalClock";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);

  // Cursor-proximity wave on the big name (Anton isn't variable, so we lift +
  // tint each letter toward the primary based on distance to the cursor).
  useEffect(() => {
    const nameEl = nameRef.current;
    if (!nameEl || prefersReducedMotion()) return;
    const chars = Array.from(
      nameEl.querySelectorAll<HTMLElement>(".hero__name-char"),
    );
    let raf = 0;
    let mx = -99999;
    let my = -99999;
    const R = 230;
    const apply = () => {
      raf = 0;
      for (const c of chars) {
        const r = c.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(mx - cx, my - cy);
        const p = Math.max(0, 1 - d / R);
        c.style.setProperty("--p", (p * p).toFixed(3));
      }
    };
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      mx = my = -99999;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    nameEl.addEventListener("pointermove", onMove);
    nameEl.addEventListener("pointerleave", onLeave);
    return () => {
      nameEl.removeEventListener("pointermove", onMove);
      nameEl.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context((self) => {
      const q = self.selector!;
      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        delay: 0.15,
      });

      tl.from(q("[data-fade]"), {
        y: 14,
        opacity: 0,
        duration: 0.9,
        stagger: 0.05,
      })
        .from(
          q(".hero__headline .line > span"),
          { yPercent: 115, duration: 1.1, stagger: 0.09 },
          0.1,
        )
        .from(
          q(".hero__name-char"),
          {
            yPercent: 120,
            duration: 1.2,
            stagger: { each: 0.03, from: "start" },
            clearProps: "transform",
          },
          0.35,
        )
        .from(
          q(".hero__name-last, .hero__tagline > *"),
          { opacity: 0, y: 18, duration: 0.9, stagger: 0.08 },
          0.8,
        );
    }, root);

    return () => ctx.revert();
  }, []);

  const first = site.firstName.toUpperCase();

  return (
    <section id="top" className="hero" ref={root}>
      <ParticleField className="hero__bg" />

      {/* Meta strip */}
      <div className="hero__meta shell" data-anim>
        <div className="hero__meta-cell" data-fade>
          <span className="label">{site.firstName}</span>
          <span className="label">{site.lastName}</span>
        </div>
        <div className="hero__meta-cell" data-fade>
          <span className="hero__meta-k label">Based in</span>
          <span className="hero__meta-v">{site.location}</span>
        </div>
        <div className="hero__meta-cell" data-fade>
          <span className="hero__meta-k label">Focus</span>
          <span className="hero__meta-v">{site.discipline}</span>
        </div>
        <div className="hero__meta-cell hero__meta-cell--time" data-fade>
          <span className="hero__meta-k label">Local time</span>
          <span className="hero__meta-v">
            <LocalClock />
          </span>
        </div>
      </div>

      {/* Main */}
      <div className="hero__main shell">
        <div className="hero__lead">
          <p className="hero__status font-mono" data-anim data-fade>
            <span className="hero__status-dot" />[ {site.year} ] ·{" "}
            {site.status}
          </p>

          <h1 className="hero__headline font-display">
            {site.headline.map((line, i) => (
              <span className="line reveal-line" key={i}>
                <span>{line}</span>
              </span>
            ))}
          </h1>

          <div className="hero__detail">
            <p className="hero__intro" data-anim data-fade>
              {site.intro}
            </p>
            <div className="hero__cta" data-anim data-fade>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => scrollToAnchor("#work")}
              >
                See Work
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => scrollToAnchor("#footer")}
              >
                Get in Touch <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>

        <div className="hero__portrait" data-anim data-fade>
          <div className="hero__portrait-frame">
            <DitherPortrait
              src="/emmanuel-cutout.webp"
              alt={`Portrait of ${site.fullName}`}
              className="dither"
            />
          </div>
        </div>
      </div>

      {/* Giant name */}
      <div className="hero__name shell">
        <div className="hero__name-row">
          <h2
            className="hero__name-full font-name"
            aria-label={site.fullName}
            ref={nameRef}
          >
            {first.split("").map((ch, i) => (
              <span className="hero__name-char" key={i} aria-hidden="true">
                {ch}
              </span>
            ))}
          </h2>
          <span className="hero__name-last font-mono" aria-hidden="true">
            {site.lastName}
          </span>
        </div>
        <div className="hero__tagline">
          <span className="label">{site.role}</span>
          <span className="label">— {site.year}</span>
        </div>
      </div>
    </section>
  );
}
