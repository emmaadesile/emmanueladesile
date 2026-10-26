/** Decorative, texture-free illustrations. These render without client hydration. */
export function AssemblyArtwork() {
  return (
    <div className="assembly" data-hero-scene>
      <div className="assembly__caption"><span>FIG. 01</span><span>THE ASSEMBLY</span></div>
      <div className="assembly__viewport" data-scene-viewport aria-hidden="true">
        {/* Blueprint: construction and dimension lines draw in with CSS before the 3D form arrives. */}
        <svg className="assembly__orbits" viewBox="0 0 600 600" fill="none">
          <circle className="draw" pathLength={1} cx="300" cy="300" r="246" />
          <ellipse className="draw draw--2" pathLength={1} cx="300" cy="300" rx="278" ry="108" transform="rotate(-35 300 300)" />
          <path className="draw" pathLength={1} d="M300 35v20m0 490v20M35 300h20m490 0h20" />
          <path className="draw draw--3 assembly__guide" pathLength={1} d="M120 120 480 480M480 120 120 480M300 54v492M54 300h492" />
          <g className="assembly__dimension">
            <path className="draw draw--3" pathLength={1} d="M188 26h224M188 18v16m224-16v16" />
            <path className="draw draw--3" pathLength={1} d="M574 188v224M566 188h16m-16 224h16" />
            <text x="300" y="16" textAnchor="middle">340</text>
            <text x="590" y="300" textAnchor="middle" transform="rotate(90 590 300)">340</text>
          </g>
          <g className="assembly__handles">
            <rect x="184" y="22" width="8" height="8" /><rect x="408" y="22" width="8" height="8" />
            <rect x="570" y="184" width="8" height="8" /><rect x="570" y="408" width="8" height="8" />
            <circle cx="98" cy="440" r="4" fill="currentColor" />
            <circle cx="505" cy="159" r="3" fill="currentColor" />
          </g>
        </svg>
        {/* Static EA assembly: the same letter shapes and layer order as the 3D scene, seen from the front. */}
        <svg className="assembly__fallback" viewBox="0 0 600 600" fill="none">
          <defs>
            <g id="ea-plate">
              <path d="M4 10h15v5H9v4h9v5H9v4h10v5H4Z" />
              <path fillRule="evenodd" d="M26 10h5l9 23h-6l-2-6h-7l-2 6h-5Z M27 22h4l-2-7Z" />
            </g>
          </defs>
          {[{ d: 44, top: '#3a4535', side: '#1f251c' }, { d: 22, top: '#a9c844', side: '#6b7d2d' }, { d: 0, top: '#d6f568', side: '#8ea63a' }].map(layer => <g key={layer.d} transform={`translate(${290 + layer.d} ${285 + layer.d * .8}) rotate(-8) skewX(-5) scale(8) translate(-22 -21.5)`}>
            {[1.2, .8, .4].map(depth => <use key={depth} href="#ea-plate" fill={layer.side} transform={`translate(${depth} ${depth})`} />)}
            <use href="#ea-plate" fill={layer.top} />
          </g>)}
        </svg>
      </div>
      <div className="assembly__footer">
        <span data-scene-label>FORM MEETS FUNCTION</span>
        {/* portfolio.ts shows this button before the Tina editor hydrates, so the attributes can differ. */}
        <button type="button" className="motion-toggle" data-motion-toggle aria-pressed="true" hidden suppressHydrationWarning>
          <span className="motion-toggle__dot" aria-hidden="true" />
          <span data-motion-label>Motion on</span>
        </button>
      </div>
    </div>
  );
}

/** Topographic lines: closed rings from a fixed sum of sines, so the server output is always the same. */
function ring(cx: number, cy: number, radius: number, seed: number) {
  const steps = 20;
  const points = Array.from({ length: steps }, (_, i) => {
    const angle = (i / steps) * Math.PI * 2;
    const r = radius * (1 + .14 * Math.sin(angle * 3 + seed) + .07 * Math.sin(angle * 5 - seed * 1.7));
    return [cx + Math.cos(angle) * r * 1.45, cy + Math.sin(angle) * r];
  });
  // Quadratic curves through the midpoints give a smooth closed shape.
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(points[steps - 1], points[0]);
  return `M${start.map(n => n.toFixed(1)).join(' ')}` + points.map((point, i) => {
    const end = mid(point, points[(i + 1) % steps]);
    return `Q${point[0].toFixed(1)} ${point[1].toFixed(1)} ${end[0].toFixed(1)} ${end[1].toFixed(1)}`;
  }).join('') + 'Z';
}
const contourPaths = [
  ...[60, 110, 160, 210, 260, 310].map((r, i) => ring(1080, 140, r, i * .55)),
  ...[50, 95, 140].map((r, i) => ring(210, 560, r, 2 + i * .6)),
];

export function Contours({ className = '' }: { className?: string }) {
  return (
    <svg className={`contours ${className}`} viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
      {contourPaths.map(d => <path key={d} d={d} />)}
    </svg>
  );
}

export function ProjectArtwork({ variant }: { variant: number }) {
  return (
    <svg className="project-art" viewBox="0 0 640 420" fill="none" aria-hidden="true">
      {variant % 2 === 0 ? <>
        <circle cx="320" cy="210" r="166" stroke="currentColor" opacity=".14" />
        <circle cx="320" cy="210" r="128" stroke="currentColor" opacity=".14" />
        <g className="project-art__float" transform="translate(107 68) rotate(-7 213 142)">
          <rect width="426" height="284" rx="9" fill="#f3f0e8" stroke="#171918" strokeWidth="1.5" />
          <path d="M0 34h426M101 34v250" stroke="#171918" strokeOpacity=".2" />
          <circle cx="16" cy="17" r="3" fill="#171918" /><circle cx="28" cy="17" r="3" fill="#171918" opacity=".3" /><circle cx="40" cy="17" r="3" fill="#171918" opacity=".3" />
          <path d="M18 63h58m-58 22h37m-37 22h46m-46 22h32" stroke="#171918" strokeWidth="5" strokeLinecap="round" opacity=".35" />
          <rect x="120" y="53" width="284" height="104" rx="4" fill="#242b23" />
          <path d="m139 135 39-24 36 9 47-37 31 15 43-27 49-2" stroke="#d6f568" strokeWidth="3" />
          <rect x="120" y="173" width="135" height="91" rx="4" fill="#d6f568" />
          <rect x="270" y="173" width="134" height="91" rx="4" fill="#e1dfd6" />
          <path d="M137 192h48m-48 20h80m70-20h48m-48 20h80" stroke="#171918" strokeWidth="5" opacity=".35" />
          <path d="M137 244h29m121 0h46" stroke="#171918" strokeWidth="9" />
        </g>
      </> : <>
        <path d="M80 110h480M80 210h480M80 310h480M170 40v340M320 40v340M470 40v340" stroke="currentColor" opacity=".12" />
        <g className="project-art__float" transform="translate(112 94) rotate(-8 120 120)">
          <rect width="222" height="239" rx="12" fill="#f3f0e8" />
          <rect x="17" y="17" width="188" height="137" rx="5" fill="#d6f568" />
          <circle cx="111" cy="85" r="42" stroke="#263322" strokeWidth="19" />
          <path d="M22 179h137M22 198h93" stroke="#171918" strokeWidth="8" />
          <path d="M22 218h58" stroke="#171918" strokeWidth="4" opacity=".35" />
        </g>
        <g transform="translate(324 71) rotate(9 101 140)">
          <rect width="193" height="270" rx="12" fill="#d6f568" />
          <path d="M23 33h95M23 54h62" stroke="#253020" strokeWidth="7" />
          <rect x="22" y="84" width="149" height="104" rx="6" fill="#253020" />
          <path d="m42 163 28-42 24 29 24-48 31 61" stroke="#d6f568" strokeWidth="2" />
          <rect x="22" y="211" width="149" height="37" rx="18" fill="#253020" />
          <path d="M62 230h67" stroke="#d6f568" strokeWidth="4" />
        </g>
      </>}
      <path d="M24 35V24h11m570 0h11v11M24 385v11h11m570 0h11v-11" stroke="currentColor" opacity=".5" />
    </svg>
  );
}
