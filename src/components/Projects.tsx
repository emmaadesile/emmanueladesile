import { useEffect, useRef } from "react";
import { projects } from "../data/projects";
import {
  gsap,
  ScrollTrigger,
  prefersReducedMotion,
  useIsoLayoutEffect,
} from "../lib/gsap";

export function Projects() {
  const root = useRef<HTMLElement>(null);

  // jithinrp-style: a "View Project" pill that follows the cursor over a card.
  useEffect(() => {
    if (!root.current) return;
    const cards = Array.from(
      root.current.querySelectorAll<HTMLElement>(".work__visual"),
    );
    const cleanups = cards.map((card) => {
      const pill = card.querySelector<HTMLElement>(".work__cursor");
      if (!pill) return () => {};
      let raf = 0;
      let x = 0;
      let y = 0;
      const move = (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        x = e.clientX - r.left;
        y = e.clientY - r.top;
        if (!raf)
          raf = requestAnimationFrame(() => {
            raf = 0;
            pill.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
          });
      };
      card.addEventListener("pointermove", move);
      return () => {
        card.removeEventListener("pointermove", move);
        cancelAnimationFrame(raf);
      };
    });
    return () => cleanups.forEach((c) => c());
  }, []);

  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context((self) => {
      const q = self.selector!;

      // Section heading reveal.
      q(".works__head [data-reveal]").forEach((el: Element) => {
        gsap.from(el, {
          yPercent: 110,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      // Per-project reveals + parallax.
      q(".work").forEach((workEl: Element) => {
        const el = workEl as HTMLElement;
        gsap.from(el.querySelectorAll("[data-stagger]"), {
          y: 24,
          opacity: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 78%" },
        });

        const visual = el.querySelector(".work__visual-inner");
        if (visual) {
          gsap.fromTo(
            visual,
            { clipPath: "inset(14% 6% 14% 6%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                end: "top 35%",
                scrub: true,
              },
            },
          );
          gsap.to(visual.querySelector(".work__stat"), {
            yPercent: -12,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      });

      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id="work" className="works" ref={root}>
      <div className="works__head shell">
        <div className="works__title">
          <span className="label" data-anim>
            <span data-reveal>02 — Selected Works</span>
          </span>
          <h2 className="works__h font-display">
            <span className="reveal-line">
              <span data-reveal>SELECTED</span>
            </span>
            <span className="reveal-line">
              <span data-reveal>WORKS</span>
            </span>
          </h2>
        </div>
        <p className="works__count font-mono" data-anim>
          <span data-reveal>({String(projects.length).padStart(2, "0")})</span>
        </p>
      </div>

      <div className="works__list shell">
        {projects.map((p) => (
          <article className="work" key={p.num}>
            {/* Left — meta */}
            <div className="work__meta">
              <span className="work__num font-mono" data-stagger>
                {p.num}
              </span>
              <h3 className="work__name font-display" data-stagger>
                {p.title}
              </h3>
              <p className="work__desc" data-stagger>
                {p.description}
              </p>
              <div className="work__timeline" data-stagger>
                <span className="label">Timeline</span>
                <span className="work__timeline-v">{p.timeline}</span>
              </div>
            </div>

            {/* Center — visual */}
            <div className="work__visual">
              <span className="work__cursor font-mono" aria-hidden="true">
                View Project <span aria-hidden="true">→</span>
              </span>
              <div className="work__visual-inner">
                <span className="work__visual-title font-mono">{p.title}</span>
                <div className="work__stat">
                  <span className="work__stat-num font-display">{p.stat}</span>
                  <span className="work__stat-label">{p.statLabel}</span>
                </div>
                <span className="work__visual-year font-mono">{p.year}</span>
              </div>
            </div>

            {/* Right — role + tools */}
            <div className="work__aside">
              <div data-stagger>
                <span className="label">Role</span>
                <span className="work__aside-v">{p.role}</span>
              </div>
              <div className="work__tools" data-stagger>
                <span className="label">Tools</span>
                <ul className="work__tools-list">
                  {p.tools.map((t) => (
                    <li key={t} className="font-mono">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
