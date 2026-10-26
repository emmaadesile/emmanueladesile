import {
  AmbientLight, DirectionalLight, ExtrudeGeometry, Group, Mesh,
  MeshStandardMaterial, OrthographicCamera, Path, Scene, Shape, SRGBColorSpace,
  Vector2, WebGLRenderer,
} from 'three';

/** One texture-free scene, rendered only while its pose is changing. */
export function createHeroScene(host: HTMLElement) {
  const viewport = host.querySelector<HTMLElement>('[data-scene-viewport]')!;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const camera = new OrthographicCamera(-3.7, 3.7, 3.7, -3.7, .1, 40);
  camera.position.set(0, 0, 12);
  const assembly = new Group();
  scene.add(assembly);
  scene.add(new AmbientLight(0xffffff, 2.5));
  const key = new DirectionalLight(0xfff7df, 4.5);
  key.position.set(-3, 5, 7);
  scene.add(key);
  const rim = new DirectionalLight(0xd6f568, 2);
  rim.position.set(4, -2, 2);
  scene.add(rim);

  // The EA mark from the header logo (SVG units, y down), repeated into an architectural assembly.
  // The A moves 3 units to the right, so the two letters do not overlap when extruded.
  const toPoint = ([x, y]: number[]) => new Vector2((x - 22) * .13, (21.5 - y) * .13);
  const polygon = (points: number[][]) => new Shape(points.map(toPoint));
  const letterE = polygon([[4, 10], [19, 10], [19, 15], [9, 15], [9, 19], [18, 19], [18, 24], [9, 24], [9, 28], [19, 28], [19, 33], [4, 33]]);
  const letterA = polygon([[26, 10], [31, 10], [40, 33], [34, 33], [32, 27], [25, 27], [23, 33], [18, 33]]);
  letterA.holes.push(new Path([[27, 22], [29, 15], [31, 22]].map(toPoint)));
  const geometry = new ExtrudeGeometry([letterE, letterA], { depth: .2, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .05, bevelThickness: .055, curveSegments: 1 });
  geometry.center();
  const materials = [
    new MeshStandardMaterial({ color: 0x35402e, metalness: .55, roughness: .35 }),
    new MeshStandardMaterial({ color: 0xa9c844, metalness: .3, roughness: .32 }),
    new MeshStandardMaterial({ color: 0xd6f568, metalness: .25, roughness: .3 }),
  ];
  const layers = materials.map((material, index) => {
    const mesh = new Mesh(geometry, material);
    mesh.position.z = (index - 1) * .8;
    assembly.add(mesh);
    return mesh;
  });
  viewport.append(canvas);

  let disposed = false;
  // The first render waits for the shaders. Synchronous compilation can block input for hundreds of ms on slow phones.
  let ready = false;
  let enabled = true;
  let visible = false;
  let frame = 0;
  let entrance = 0;
  let previousTime = 0;
  let width = 0;
  let height = 0;
  let targetX = -.52;
  let targetY = -.65;
  let currentX = targetX;
  let currentY = targetY;
  assembly.rotation.z = -.28;

  function requestRender() {
    if (!frame && ready && !disposed && visible && !document.hidden && enabled) frame = requestAnimationFrame(render);
  }
  function render(time: number) {
    frame = 0;
    if (disposed || !visible || document.hidden || !enabled) return;
    const dt = Math.min(previousTime ? time - previousTime : 16, 40);
    previousTime = time;
    entrance = Math.min(1, entrance + dt / 1050);
    const progress = 1 - Math.pow(1 - entrance, 3);
    const damping = 1 - Math.exp(-dt / 100);
    currentX += (targetX - currentX) * damping;
    currentY += (targetY - currentY) * damping;
    assembly.rotation.x = currentX;
    assembly.rotation.y = currentY + scrollTurn;
    assembly.position.y = -.12 + (1 - progress) * .3;
    layers.forEach((layer, index) => { layer.position.z = (index - 1) * (.8 + (1 - progress) * .65); });
    renderer.render(scene, camera);
    host.setAttribute('data-rendered', '');
    if (entrance < 1 || Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > .001) requestRender();
  }
  function resize() {
    const bounds = viewport.getBoundingClientRect();
    const nextWidth = Math.round(bounds.width);
    const nextHeight = Math.round(bounds.height);
    if (!nextWidth || !nextHeight || (width === nextWidth && height === nextHeight)) return;
    width = nextWidth;
    height = nextHeight;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    camera.left = -3.7 * aspect;
    camera.right = 3.7 * aspect;
    camera.updateProjectionMatrix();
    requestRender();
  }
  const abort = new AbortController();
  viewport.addEventListener('pointermove', event => {
    if (!enabled || event.pointerType !== 'mouse') return;
    const bounds = viewport.getBoundingClientRect();
    targetX = -.52 + ((event.clientY - bounds.top) / bounds.height - .5) * .2;
    targetY = -.65 + ((event.clientX - bounds.left) / bounds.width - .5) * .3;
    requestRender();
  }, { passive: true, signal: abort.signal });
  viewport.addEventListener('pointerleave', () => { targetX = -.52; targetY = -.65; requestRender(); }, { signal: abort.signal });
  // Scroll only stores a value; the turn is applied in the next frame.
  let scrollTurn = 0;
  window.addEventListener('scroll', () => {
    if (!visible || !enabled) return;
    const bounds = viewport.getBoundingClientRect();
    // Progress through the viewport, from entering at the bottom (0) to leaving at the top (1).
    const progress = (innerHeight - bounds.top) / (innerHeight + bounds.height);
    scrollTurn = (Math.min(1, Math.max(0, progress)) - .5) * .5;
    requestRender();
  }, { passive: true, signal: abort.signal });
  document.addEventListener('visibilitychange', () => {
    previousTime = 0;
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else requestRender();
  }, { signal: abort.signal });
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    previousTime = 0;
    if (visible) requestRender();
    else { cancelAnimationFrame(frame); frame = 0; }
  });
  observer.observe(viewport);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(viewport);
  resize();
  renderer.compileAsync(scene, camera).catch(() => { /* render() compiles on demand */ }).finally(() => {
    ready = true;
    requestRender();
  });

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    abort.abort();
    geometry.dispose();
    materials.forEach(material => material.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
    host.removeAttribute('data-rendered');
  }
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    dispose();
    host.dispatchEvent(new Event('scene-unavailable'));
  }, { signal: abort.signal });

  return {
    dispose,
    setEnabled(value: boolean) {
      enabled = value;
      previousTime = 0;
      if (value) requestRender();
      else { cancelAnimationFrame(frame); frame = 0; }
    },
  };
}
