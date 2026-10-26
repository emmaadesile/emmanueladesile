type HeroScene = ReturnType<typeof import('./hero-scene').createHeroScene>;
let cleanup: (() => void) | undefined;

/** Works across Astro navigation and independently of Tina's editor hydration. */
export function initPortfolio() {
  cleanup?.();
  cleanup = undefined;
  const page = document.querySelector<HTMLElement>('.portfolio');
  if (!page) return;
  const abort = new AbortController();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const host = page.querySelector<HTMLElement>('[data-hero-scene]');
  const toggle = host?.querySelector<HTMLButtonElement>('[data-motion-toggle]');
  const label = host?.querySelector<HTMLElement>('[data-motion-label]');
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  let savedOff = false;
  try { savedOff = sessionStorage.getItem('portfolio-motion') === 'off'; } catch { /* Storage is optional. */ }
  let enabled = !reducedMotion.matches && !savedOff && !connection?.saveData;
  let scene: HeroScene | undefined;
  let loading = false;
  let disposed = false;
  let failed = false;
  let nearViewport = false;
  let idleId: number | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let sceneObserver: IntersectionObserver | undefined;

  const reveals = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!reducedMotion.matches) entry.target.classList.add('is-arriving');
      reveals.unobserve(entry.target);
    }
  }, { threshold: .12 });
  page.querySelectorAll<HTMLElement>('[data-reveal]').forEach(element => {
    // Never animate already-visible text on initial load or history restoration.
    if (element.getBoundingClientRect().top >= window.innerHeight) reveals.observe(element);
  });

  function updateControl() {
    // CSS reads this to pause ambient motion, such as the marquee.
    document.documentElement.dataset.motion = enabled ? 'on' : 'off';
    if (!toggle || !label) return;
    toggle.hidden = false;
    toggle.disabled = reducedMotion.matches || failed;
    toggle.setAttribute('aria-pressed', String(enabled && !failed));
    label.textContent = failed ? 'Static view' : reducedMotion.matches ? 'Reduced motion' : enabled ? 'Motion on' : 'Motion off';
    toggle.setAttribute('aria-label', failed ? '3D unavailable. Static illustration shown.' : reducedMotion.matches ? 'Motion disabled by your system preference' : enabled ? 'Turn off scene motion' : 'Turn on scene motion');
  }
  async function loadScene() {
    if (!host || !enabled || !nearViewport || scene || loading || disposed || failed || document.hidden) return;
    loading = true;
    try {
      const { createHeroScene } = await import('./hero-scene');
      if (disposed || !host.isConnected || !enabled) return;
      scene = createHeroScene(host);
      scene.setEnabled(enabled);
    } catch {
      // A complete SVG is already present; failed WebGL never hides content.
      failed = true;
      host.removeAttribute('data-rendered');
      updateControl();
    } finally { loading = false; }
  }
  function scheduleScene() {
    if (!enabled || disposed || !nearViewport || scene || loading || failed) return;
    if (idleId !== undefined) window.cancelIdleCallback(idleId);
    if (timer !== undefined) clearTimeout(timer);
    // Leave fonts, layout and the first interaction ahead of optional 3D work.
    timer = setTimeout(() => {
      if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(() => { void loadScene(); }, { timeout: 2500 });
      else void loadScene();
    }, 400);
  }
  if (host && toggle) {
    updateControl();
    sceneObserver = new IntersectionObserver(([entry]) => {
      nearViewport = entry.isIntersecting;
      if (nearViewport && document.readyState === 'complete') scheduleScene();
    }, { rootMargin: '300px 0px' }); // Start a little before the scene scrolls into view.
    sceneObserver.observe(host);
    toggle.addEventListener('click', () => {
      enabled = !enabled;
      try { sessionStorage.setItem('portfolio-motion', enabled ? 'on' : 'off'); } catch { /* Optional preference. */ }
      scene?.setEnabled(enabled);
      updateControl();
      if (enabled) scheduleScene();
    }, { signal: abort.signal });
    reducedMotion.addEventListener('change', () => {
      enabled = !reducedMotion.matches;
      if (reducedMotion.matches) { scene?.dispose(); scene = undefined; }
      updateControl();
      if (enabled) scheduleScene();
    }, { signal: abort.signal });
    host.addEventListener('scene-unavailable', () => { failed = true; scene = undefined; updateControl(); }, { signal: abort.signal });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleScene(); }, { signal: abort.signal });
    if (document.readyState === 'complete') scheduleScene();
    else window.addEventListener('load', scheduleScene, { once: true, signal: abort.signal });
  }
  cleanup = () => {
    disposed = true;
    reveals.disconnect();
    sceneObserver?.disconnect();
    abort.abort();
    if (idleId !== undefined) window.cancelIdleCallback(idleId);
    if (timer !== undefined) clearTimeout(timer);
    scene?.dispose();
  };
}

document.addEventListener('astro:before-swap', () => { cleanup?.(); cleanup = undefined; });
