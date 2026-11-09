import { useEffect, useState } from "react";
import { site } from "../data/site";
import { scrollToAnchor } from "../lib/smoothScroll";

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function go(href: string) {
    setOpen(false);
    // Let the overlay close before scrolling.
    requestAnimationFrame(() => scrollToAnchor(href));
  }

  return (
    <>
      <header className="nav" data-anim>
      <div className="nav__inner shell">
        <a
          className="nav__logo font-mono"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            go("#top");
          }}
        >
          <span className="nav__logo-mark">EA</span>
          <span className="nav__logo-text">
            EMMANUEL<span className="nav__dot">.</span>ADESILE
          </span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="nav__link font-mono"
              onClick={(e) => {
                e.preventDefault();
                go(item.href);
              }}
            >
              <span className="nav__link-num">{item.num}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav__right">
          <button
            type="button"
            className="nav__burger"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span data-open={open} />
            <span data-open={open} />
          </button>
        </div>
      </div>
      </header>

      {/* Mobile overlay — kept outside <header> so its position:fixed is
          relative to the viewport (the nav's backdrop-filter would otherwise
          trap it inside the bar). */}
      <div className="nav__overlay" data-open={open} aria-hidden={!open}>
        <nav className="nav__overlay-links">
          {site.nav.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              style={{ transitionDelay: `${0.06 * i + 0.1}s` }}
              onClick={(e) => {
                e.preventDefault();
                go(item.href);
              }}
            >
              <span className="label">{item.num}</span>
              <span className="font-display">{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="nav__overlay-foot">
          {site.socials.map((s) => (
            <a key={s.label} href={s.href} className="font-mono">
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
