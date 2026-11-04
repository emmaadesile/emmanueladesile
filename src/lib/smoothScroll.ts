import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";

let lenis: Lenis | null = null;

/**
 * Initializes Lenis smooth scrolling and wires it into the GSAP ticker so
 * ScrollTrigger stays in sync. Disabled when the user prefers reduced motion.
 * Call once, from the root layout.
 */
export function useSmoothScroll() {
  useEffect(() => {
    document.documentElement.classList.add("js-ready");

    if (prefersReducedMotion()) return;

    lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);
}

/** Smoothly scroll to a selector (used by nav links). */
export function scrollToAnchor(target: string) {
  const el = document.querySelector(target);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.2 });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
