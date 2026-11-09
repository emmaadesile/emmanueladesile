import { useRef } from "react";
import { site } from "../data/site";
import { projects } from "../data/projects";
import { gsap, prefersReducedMotion, useIsoLayoutEffect } from "../lib/gsap";
import { scrollToAnchor } from "../lib/smoothScroll";

const legal = ["Privacy Policy", "Legal Notice", "Imprint"];

export function Footer() {
  const root = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context((self) => {
      const el = self.selector!(".footer__word");
      gsap.from(el, {
        yPercent: 108,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <footer id="footer" className="footer dot-grid" ref={root}>
      <div className="footer__brand shell">
        <h2 className="footer__big font-name" aria-label={site.fullName}>
          <span className="reveal-line">
            <span className="footer__word">{site.firstName}</span>
          </span>
          <span className="reveal-line">
            <span className="footer__word">{site.lastName}</span>
          </span>
        </h2>
      </div>

      <div className="footer__grid shell">
        <nav className="footer__col" aria-label="Work">
          <span className="label">01 Work</span>
          <ul>
            {projects.map((p) => (
              <li key={p.num}>
                <a href="#work" onClick={(e) => { e.preventDefault(); scrollToAnchor("#work"); }}>
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer__col" aria-label="Social">
          <span className="label">02 Social</span>
          <ul>
            {site.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  {s.label} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer__col" aria-label="Legal">
          <span className="label">03 Legal</span>
          <ul>
            {legal.map((l) => (
              <li key={l}>
                <a href="#">{l}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__col footer__col--loc">
          <span className="label">04 {site.region}</span>
          <ul>
            <li>{site.location}</li>
            <li className="font-mono footer__coords">{site.coords}</li>
          </ul>
        </div>
      </div>

      <div className="footer__bar shell">
        <span className="font-mono">
          © {site.year} {site.fullName.toUpperCase()}. ALL RIGHTS RESERVED
        </span>
        <span className="font-mono footer__credit">
          DESIGN & CODE — BIG SHOULDERS DISPLAY, GEIST · REACT, GSAP, WEBGL
        </span>
        <button
          type="button"
          className="footer__top font-mono"
          onClick={() => scrollToAnchor("#top")}
        >
          Back to top <span aria-hidden="true">↑</span>
        </button>
      </div>
    </footer>
  );
}
