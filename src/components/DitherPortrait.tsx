import { useEffect, useRef } from "react";

// A port of mega.dev's key-visual portrait: a fine 4×4 Bayer dither at device
// resolution, a knockout silhouette that hides whatever sits behind it, and
// short bursts of cell-snapped slice displacement, some rendered as negatives.
// It renders on demand, only when a glitch frame changes or the canvas resizes.

const VERT = `#version 300 es
in vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2  uRes;
uniform vec2  uImg;
uniform float uCell;
uniform vec4  uGlitchRects[4];
uniform vec2  uGlitchOffsets[4];
uniform float uGlitchInverts[4];
uniform vec3  uLight;   // color of "lit" dither cells
uniform vec3  uPaper;   // page background: unlit cells and the knockout halo
out vec4 frag;

// Tone settings (mega.dev's defaults, on a 0–255 scale).
const float ALPHA_THRESHOLD = 17.0;
const float BLACK_POINT = 14.0;
const float WHITE_POINT = 255.0;
const float EXPOSURE = 0.25;
const float CONTRAST = 1.3;
const float BRIGHTNESS = 55.0;
const float GAMMA = 0.75;
const float DITHER_STRENGTH = 0.95;
const float THRESHOLD = 106.0;
const vec3  LUMA = vec3(0.2126, 0.7152, 0.0722);

const float BAYER4[16] = float[16](
  0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0,
  3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0
);
// Dark-biased: keeps near-black regions from turning artificially bright.
float bayer4Dark(vec2 cell){
  ivec2 q = ivec2(mod(cell, 4.0));
  return 1.0 - BAYER4[q.y * 4 + q.x] / 16.0;
}

vec3 srgbToLinear(vec3 c){
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

// Image is cover-fit into the canvas. Mip level matches one dither cell's
// footprint so each cell averages the source instead of aliasing it.
vec4 portrait(vec2 uv){
  vec2 scale = uRes / uImg;
  float s = max(scale.x, scale.y);
  vec2 local = (uv - 0.5) * (uRes / (uImg * s)) + 0.5;
  if (any(lessThan(local, vec2(0.0))) || any(greaterThan(local, vec2(1.0)))) {
    return vec4(0.0);
  }
  return textureLod(uTex, local, log2(max(1.0, uCell / s)));
}

float insideRect(vec2 uv, vec4 r){
  float valid = step(0.0001, r.z) * step(0.0001, r.w);
  return valid
    * step(r.x, uv.x) * step(uv.x, r.x + r.z)
    * step(r.y, uv.y) * step(uv.y, r.y + r.w);
}

vec2 distort(vec2 uv){
  vec2 d = uv;
  for (int i = 0; i < 4; i++) {
    // Snap offsets to whole cells so displaced slices stay on the dither grid.
    vec2 snapped = round(uGlitchOffsets[i] * uRes / uCell) * uCell / uRes;
    d += snapped * insideRect(uv, uGlitchRects[i]);
  }
  return d;
}

float maskAt(vec2 uv){
  return step(ALPHA_THRESHOLD / 255.0, portrait(distort(uv)).a);
}

void main(){
  vec2 cell = floor(gl_FragCoord.xy / uCell);
  vec2 pos = (cell + 0.5) * uCell;
  vec2 uv = vec2(pos.x / uRes.x, 1.0 - pos.y / uRes.y);

  vec4 src = portrait(distort(uv));
  float mask = step(ALPHA_THRESHOLD / 255.0, src.a);

  // One-cell knockout halo around the figure.
  float silhouette = mask;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      silhouette = max(silhouette, maskAt(uv + vec2(float(x), -float(y)) * uCell / uRes));
    }
  }
  if (silhouette < 0.5) { frag = vec4(0.0); return; }
  if (mask < 0.5) { frag = vec4(uPaper, 1.0); return; }

  float luma = dot(srgbToLinear(src.rgb), LUMA) * 255.0;
  float v = (luma - BLACK_POINT) / max(1.0, WHITE_POINT - BLACK_POINT) * 255.0;
  v *= exp2(EXPOSURE);
  v = (v - 127.5) * CONTRAST + 127.5 + BRIGHTNESS;
  float tone = pow(clamp(v / 255.0, 0.0, 1.0), 1.0 / GAMMA);

  float lightLuma = dot(srgbToLinear(uLight), LUMA);
  float paletteTone = clamp(tone / max(0.001, lightLuma), 0.0, 1.0);
  float bayer = bayer4Dark(vec2(cell.x, -cell.y));
  float cutoff = clamp(
    0.5 + (bayer - 0.5) * DITHER_STRENGTH + THRESHOLD / 255.0 - 0.5,
    0.0, 1.0
  );
  float lit = step(cutoff, paletteTone * src.a);

  // Inverted slices re-threshold the negated tone through the same Bayer map:
  // a film negative that stays dithered. The 0.85 ceiling keeps pure blacks
  // from inverting into solid slabs. Judged in undistorted space so it hugs
  // the displaced slice exactly.
  float invert = 0.0;
  for (int i = 0; i < 4; i++) {
    invert = max(invert, insideRect(uv, uGlitchRects[i]) * uGlitchInverts[i]);
  }
  float negative = step(cutoff, (1.0 - paletteTone) * src.a * 0.85);
  lit = mix(lit, negative, invert);

  frag = vec4(mix(uPaper, uLight, lit), 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

type Rgb = [number, number, number];

function readRgb(varName: string, fallback: Rgb): Rgb {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  const parts = raw.split(",").map((n) => parseFloat(n));
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
  }
  return fallback;
}

// Glitch slices are sized in "portrait pixels" against mega.dev's desktop
// portraits (~375×513 stage px), then normalized to our frame.
const REF_W = 375;
const REF_H = 513;
const MAX_SLICES = 4;

type Slice = {
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
  invert: boolean;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function makeSlices(): Slice[] {
  return Array.from({ length: Math.floor(rand(2, 5)) }, () => {
    const w = rand(0.38, 0.92);
    const h = Math.min(rand(10, 54) / REF_H, 0.16);
    return {
      x: rand(0, 1 - w),
      y: 0.06 + rand(0, Math.max(0, 0.62 - h)),
      w,
      h,
      dx: (Math.random() < 0.5 ? -1 : 1) * (rand(20, 72) / REF_W),
      dy: Math.random() < 0.2 ? rand(-10, 10) / REF_H : 0,
      invert: Math.random() < 0.6,
    };
  });
}

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export function DitherPortrait({ src, alt, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      premultipliedAlpha: false,
      alpha: true,
    });
    // No WebGL2 → leave the <img> fallback visible.
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      gl.deleteProgram(prog);
      return;
    }
    gl.useProgram(prog);

    // Full-screen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.disable(gl.BLEND);

    const u = {
      tex: gl.getUniformLocation(prog, "uTex"),
      res: gl.getUniformLocation(prog, "uRes"),
      img: gl.getUniformLocation(prog, "uImg"),
      cell: gl.getUniformLocation(prog, "uCell"),
      rects: gl.getUniformLocation(prog, "uGlitchRects"),
      offsets: gl.getUniformLocation(prog, "uGlitchOffsets"),
      inverts: gl.getUniformLocation(prog, "uGlitchInverts"),
      light: gl.getUniformLocation(prog, "uLight"),
      paper: gl.getUniformLocation(prog, "uPaper"),
    };

    // Light ink on paper: lit cells take the ink, unlit cells the page color.
    const light = readRgb("--ink-rgb", [0.92, 0.91, 0.88]);
    const paper = readRgb("--paper-rgb", [0.04, 0.04, 0.04]);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const rects = new Float32Array(MAX_SLICES * 4);
    const offsets = new Float32Array(MAX_SLICES * 2);
    const inverts = new Float32Array(MAX_SLICES);
    let slices: Slice[] = [];
    let imgW = 1;
    let imgH = 1;
    let ready = false;
    let disposed = false;

    function draw() {
      if (!ready) return;
      const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      const r = wrap!.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
      }

      rects.fill(0);
      offsets.fill(0);
      inverts.fill(0);
      slices.forEach((s, i) => {
        rects.set([s.x, s.y, s.w, s.h], i * 4);
        offsets.set([s.dx, s.dy], i * 2);
        inverts[i] = s.invert ? 1 : 0;
      });

      gl!.viewport(0, 0, w, h);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.uniform1i(u.tex, 0);
      gl!.uniform2f(u.res, w, h);
      gl!.uniform2f(u.img, imgW, imgH);
      // Half a CSS pixel per cell → one device pixel on retina screens.
      gl!.uniform1f(u.cell, Math.max(1, Math.round(0.5 * dpr)));
      gl!.uniform4fv(u.rects, rects);
      gl!.uniform2fv(u.offsets, offsets);
      gl!.uniform1fv(u.inverts, inverts);
      gl!.uniform3f(u.light, light[0], light[1], light[2]);
      gl!.uniform3f(u.paper, paper[0], paper[1], paper[2]);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    let raf = 0;
    const requestDraw = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          draw();
        });
    };

    const image = new Image();
    image.decoding = "async";
    image.src = src;
    image
      .decode()
      .then(() => {
        if (disposed) return;
        imgW = image.naturalWidth;
        imgH = image.naturalHeight;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image,
        );
        gl.generateMipmap(gl.TEXTURE_2D);
        ready = true;
        draw();
        // Dither is on screen: hide the <img> fallback.
        wrap.dataset.webgl = "ok";
      })
      .catch(() => {});

    const ro = new ResizeObserver(requestDraw);
    ro.observe(wrap);

    let visible = true;
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { threshold: 0.01 },
    );
    io.observe(wrap);

    // Glitch scheduler: idle for 1.8–4.8s, then a burst of 2–4 frames, each
    // holding a fresh set of slices for 55–105ms.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer = 0;
    let bursting = false;

    const reset = () => {
      clearTimeout(timer);
      slices = [];
      bursting = false;
      requestDraw();
    };

    const schedule = (delay = rand(1800, 4800)) => {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (disposed) return;
        if (document.hidden || !visible || reduce.matches) {
          schedule(1000);
          return;
        }
        let frames = Math.floor(rand(2, 5));
        bursting = true;
        const step = () => {
          if (disposed) return;
          if (frames <= 0) {
            slices = [];
            bursting = false;
            requestDraw();
            schedule();
            return;
          }
          slices = makeSlices();
          requestDraw();
          frames -= 1;
          timer = window.setTimeout(step, rand(55, 105));
        };
        step();
      }, delay);
    };

    const onMotionChange = () => {
      reset();
      if (!reduce.matches) schedule(650);
    };
    const onVisibility = () => {
      reset();
      if (!document.hidden && !reduce.matches) schedule(650);
    };
    // Hover fires a burst right away.
    const onEnter = () => {
      if (!reduce.matches && !bursting) schedule(0);
    };

    reduce.addEventListener("change", onMotionChange);
    document.addEventListener("visibilitychange", onVisibility);
    wrap.addEventListener("pointerenter", onEnter);
    if (!reduce.matches) schedule(650);

    return () => {
      disposed = true;
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      reduce.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibility);
      wrap.removeEventListener("pointerenter", onEnter);
      delete wrap.dataset.webgl;
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
      gl.deleteTexture(tex);
    };
  }, [src]);

  return (
    <div ref={wrapRef} className={className}>
      {/* Fallback for no-JS / no-WebGL2: a toned portrait. */}
      <img
        src={src}
        alt={alt}
        className="dither-fallback"
        loading="eager"
        decoding="async"
      />
      <canvas ref={canvasRef} aria-hidden="true" className="dither-canvas" />
    </div>
  );
}
