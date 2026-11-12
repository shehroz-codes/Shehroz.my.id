'use client';

/**
 * HalftonePortrait — adapted for this portfolio from the "HalftoneReveal"
 * WebGL2 effect (react-bits, shadcn-style single-file component).
 *
 * Adaptation for the My Interests section:
 *  - The base layer is a plain <img> (the real portrait).
 *  - The canvas renders the halftone of the ANIME portrait with
 *    alpha = mask × dot coverage, so unrevealed pixels stay fully
 *    transparent and the real portrait shows through underneath.
 *  - Pointer leave lets the trail fade (linger) back to the real portrait.
 *  - Touch devices: tap to toggle. Keyboard: Enter / Space to toggle.
 *  - prefers-reduced-motion or no WebGL2 → CSS crossfade fallback.
 */

import { useEffect, useRef, type CSSProperties } from 'react';

export type HalftonePortraitMode = 'mono' | 'duotone';

export type HalftonePortraitShape = 'dot' | 'ellipse' | 'square' | 'diamond';

export interface HalftonePortraitProps {
  realSrc: string;
  animeSrc: string;
  alt: string;
  mode?: HalftonePortraitMode;
  shape?: HalftonePortraitShape;
  cellSize?: number;
  angle?: number;
  dotScale?: number;
  inkColor?: string;
  accentColor?: string;
  paperColor?: string;
  contrast?: number;
  brightness?: number;
  invert?: boolean;
  roughness?: number;
  misregistration?: number;
  revealRadius?: number;
  softness?: number;
  linger?: number;
  reverse?: boolean;
  wander?: boolean;
  clickBurst?: boolean;
  intro?: boolean;
  className?: string;
  style?: CSSProperties;
}

type Settings = {
  mode: number;
  shape: number;
  cellSize: number;
  angle: number;
  dotScale: number;
  inkColor: string;
  accentColor: string;
  paperColor: string;
  contrast: number;
  brightness: number;
  invert: boolean;
  roughness: number;
  misregistration: number;
  revealRadius: number;
  softness: number;
  linger: number;
  reverse: boolean;
  wander: boolean;
  clickBurst: boolean;
  intro: boolean;
};

type MaskTarget = {
  texture: WebGLTexture | null;
  framebuffer: WebGLFramebuffer | null;
  width: number;
  height: number;
};

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const MASK = `#version 300 es
precision highp float;
uniform sampler2D uPrevious;
uniform vec2 uTexture;
uniform vec2 uView;
uniform vec2 uFrom;
uniform vec2 uTo;
uniform float uRadius;
uniform float uSoftness;
uniform float uStrength;
uniform float uFade;
out vec4 outColor;

float segment(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float h = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0);
  return length(p - a - ab * h);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uTexture;
  vec2 p = vec2(uv.x, 1.0 - uv.y) * uView;
  float trail = max(texture(uPrevious, uv).r - uFade, 0.0);
  float band = max(uRadius * uSoftness, 1.0);
  float brush = clamp((uRadius - segment(p, uFrom, uTo)) / band, 0.0, 1.0);
  brush = brush * brush * (3.0 - 2.0 * brush);
  outColor = vec4(max(trail, brush * uStrength), 0.0, 0.0, 1.0);
}`;

/**
 * View shader — identical structure to the original HalftoneReveal shader,
 * with the CMYK/RGB separation modes removed (only mono + duotone are used)
 * and the final composite changed so the halftone layer is alpha-blended
 * over the real portrait instead of painting an opaque print.
 */
const VIEW = `#version 300 es
precision highp float;
uniform sampler2D uImage;
uniform sampler2D uMask;
uniform vec2 uResolution;
uniform vec2 uView;
uniform float uDpr;
uniform vec4 uFrame;
uniform float uTexels;
uniform float uMode;
uniform float uShape;
uniform float uCell;
uniform float uAngle;
uniform float uScale;
uniform vec3 uInk;
uniform vec3 uAccent;
uniform vec3 uPaper;
uniform float uContrast;
uniform float uBrightness;
uniform float uInvert;
uniform float uRough;
uniform float uShift;
uniform float uReverse;
uniform float uIntro;
uniform vec4 uBursts[4];
uniform float uBurstWidth;
out vec4 outColor;

const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

mat2 rotate(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec4 photo(vec2 p, float lod, float margin) {
  vec2 uv = (p - uFrame.xy) / uFrame.zw;
  vec4 c = textureLod(uImage, clamp(uv, 0.0, 1.0), lod);
  vec2 slack = margin * uCell / uFrame.zw;
  vec2 inside = step(-slack, uv) * step(uv, 1.0 + slack);
  float keep = inside.x * inside.y * c.a;
  return vec4(c.rgb, keep);
}

float grade(float v) {
  v = clamp((v - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0);
  return mix(v, 1.0 - v, uInvert);
}

vec3 gradeColor(vec3 c) {
  return vec3(grade(c.r), grade(c.g), grade(c.b));
}

vec3 tone(vec3 c) {
  return pow(max(c, 0.0), vec3(1.5));
}

float press(float t, float alpha) {
  return (0.05 + clamp(t, 0.0, 1.0) * 0.89) * alpha;
}

float metric(vec2 f) {
  if (uShape < 0.5) return length(f);
  if (uShape < 1.5) return length(f * vec2(0.8, 1.15));
  if (uShape < 2.5) return max(abs(f.x), abs(f.y));
  return abs(f.x) + abs(f.y);
}

float reach(float t) {
  t = clamp(t, 0.0, 1.0);
  if (uShape < 0.5) return t < 0.785 ? sqrt(t / 3.14159) : mix(0.5, 0.72, (t - 0.785) / 0.215);
  if (uShape < 1.5) return t < 0.7 ? sqrt(t * 0.92 / 3.14159) : mix(0.4497, 0.72, (t - 0.7) / 0.3);
  if (uShape < 2.5) return 0.5 * sqrt(t) + 0.02 * t;
  return t < 0.5 ? sqrt(t * 0.5) : 1.0 - sqrt((1.0 - t) * 0.5);
}

vec2 center(vec2 p, float angle) {
  vec2 q = rotate(angle) * p / uCell;
  vec2 c = floor(q) + 0.5;
  return rotate(-angle) * c * uCell;
}

float dots(vec2 p, float angle, float t, float seed, float grow) {
  vec2 q = rotate(angle) * p / uCell;
  float d = metric(fract(q) - 0.5);
  d += (noise(p * 0.42 + seed * 17.0) - 0.5) * uRough * 0.18;
  float r = reach(t) * uScale * grow;
  float w = max(fwidth(d), 0.0001) * 0.75;
  return smoothstep(r + w, r - w, d) * clamp(r / (w * 2.0), 0.0, 1.0);
}

float coverage(vec4 image) {
  float shade = dot(tone(gradeColor(image.rgb)), LUMA);
  float paper = dot(tone(uPaper), LUMA);
  float span = dot(tone(uInk), LUMA) - paper;
  float t = abs(span) < 0.02 ? 1.0 - shade : (shade - paper) / span;
  return press(t, image.a);
}

float burst(vec2 p) {
  float value = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 b = uBursts[i];
    if (b.w <= 0.0) continue;
    float offset = distance(p, b.xy) - b.z;
    float edge = offset > 0.0 ? offset / (uBurstWidth * 0.35) : -offset / uBurstWidth;
    value = max(value, clamp(1.0 - edge, 0.0, 1.0) * b.w);
  }
  return value;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uDpr;

  // Brush mask (trail + click bursts) -> 0..1 "how revealed is this pixel".
  vec2 maskUv = vec2(p.x / uView.x, 1.0 - p.y / uView.y);
  float shown = max(texture(uMask, maskUv).r, burst(p));
  shown = mix(shown, 1.0 - shown, uReverse);
  shown = shown * shown * (3.0 - 2.0 * shown);

  // Halftone transition: dot radius grows with the mask. At the brush core the
  // dots merge (full coverage); on the feathered edge only dots remain.
  vec2 q = rotate(uAngle) * p / uCell;
  float d = metric(fract(q) - 0.5);
  float r = reach(1.0) * 1.08 * shown;
  float w = max(fwidth(d), 0.0001) * 0.75;
  float k = smoothstep(r + w, r - w, d) * clamp(r / (w * 2.0), 0.0, 1.0);

  // The dots reveal the REAL anime artwork in full colour. Alpha is zero
  // outside the brush and wherever the anime PNG itself is transparent, so
  // the real photograph underneath is never covered.
  vec4 sharp = photo(p, 0.0, 0.0);
  outColor = vec4(sharp.rgb, sharp.a * k);
}`;

const MODES: Record<string, number> = { mono: 0, duotone: 1 };
const SHAPES: Record<string, number> = { dot: 0, ellipse: 1, square: 2, diamond: 3 };
const MAX_BURSTS = 4;
const BURST_SECONDS = 1.3;
const INTRO_SECONDS = 1.4;
const MASK_SCALE = 0.5;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
};

const link = (gl: WebGL2RenderingContext, fragmentSource: string) => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, 'aPosition');
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
};

const locate = (gl: WebGL2RenderingContext, program: WebGLProgram, names: string[]) => {
  const result: Record<string, WebGLUniformLocation | null> = {};
  for (const name of names) result[name] = gl.getUniformLocation(program, name);
  return result;
};

const wanderAt = (t: number, w: number, h: number): [number, number] => [
  w * (0.5 + 0.32 * Math.sin(t * 0.53) + 0.08 * Math.sin(t * 1.31 + 0.6)),
  h * (0.5 + 0.27 * Math.sin(t * 0.71 + 1.1) + 0.07 * Math.cos(t * 1.57)),
];

const HalftonePortrait = ({
  realSrc,
  animeSrc,
  alt,
  mode = 'duotone',
  shape = 'dot',
  cellSize = 7,
  angle = 45,
  dotScale = 1,
  inkColor = '#e9d5ff',
  accentColor = '#7c3aed',
  paperColor = '#120f17',
  contrast = 1.1,
  brightness = 0,
  invert = false,
  roughness = 0,
  misregistration = 0,
  revealRadius = 150,
  softness = 0.6,
  linger = 1.2,
  reverse = false,
  wander = false,
  clickBurst = true,
  intro = false,
  className = '',
  style,
}: HalftonePortraitProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animeImgRef = useRef<HTMLImageElement>(null);
  const settings: Settings = {
    mode: MODES[mode] ?? 1,
    shape: SHAPES[shape] ?? 0,
    cellSize: clamp(cellSize, 2, 80),
    angle,
    dotScale: clamp(dotScale, 0.2, 2),
    inkColor: String(inkColor),
    accentColor: String(accentColor),
    paperColor: String(paperColor),
    contrast,
    brightness,
    invert,
    roughness: clamp(roughness, 0, 1),
    misregistration: clamp(misregistration, 0, 1),
    revealRadius: Math.max(0, revealRadius),
    softness: clamp(softness, 0, 1),
    linger: Math.max(0, linger),
    reverse,
    wander,
    clickBurst,
    intro,
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const animeImg = animeImgRef.current;
    if (!container || !canvas || !animeImg) return undefined;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const gl = reduce
      ? null
      : canvas.getContext('webgl2', {
          alpha: true,
          premultipliedAlpha: false,
          antialias: false,
          depth: false,
          stencil: false,
          preserveDrawingBuffer: false,
        });

    /* -------------------------------------------------------------- */
    /* Fallback: reduced motion or no WebGL2 → CSS crossfade toggle.  */
    /* -------------------------------------------------------------- */
    // Also used when shaders fail to compile or the GL context is lost, so the
    // real portrait is never left blank and the interaction still works.
    const setupFallback = () => {
      let revealed = false;
      let touchStart: { x: number; y: number } | null = null;
      canvas.classList.add('is-hidden');
      const setRevealed = (value: boolean) => {
        revealed = value;
        animeImg.classList.toggle('is-visible', value);
      };
      const onEnter = (event: PointerEvent) => {
        if (event.pointerType === 'mouse' || event.pointerType === 'pen') setRevealed(true);
      };
      const onLeave = (event: PointerEvent) => {
        if (event.pointerType === 'mouse' || event.pointerType === 'pen') setRevealed(false);
      };
      const onDown = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') touchStart = { x: event.clientX, y: event.clientY };
      };
      const onUp = (event: PointerEvent) => {
        // Touch: a tap toggles, a scroll gesture does not.
        if (event.pointerType === 'mouse' || !touchStart) return;
        const moved = Math.hypot(event.clientX - touchStart.x, event.clientY - touchStart.y);
        touchStart = null;
        if (moved < 10) setRevealed(!revealed);
      };
      const onFocus = () => setRevealed(true);
      const onBlur = () => setRevealed(false);
      const onToggle = (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setRevealed(!revealed);
        }
      };
      container.addEventListener('pointerenter', onEnter);
      container.addEventListener('pointerleave', onLeave);
      container.addEventListener('pointerdown', onDown, { passive: true });
      container.addEventListener('pointerup', onUp, { passive: true });
      container.addEventListener('focus', onFocus);
      container.addEventListener('blur', onBlur);
      container.addEventListener('keydown', onToggle);
      return () => {
        container.removeEventListener('pointerenter', onEnter);
        container.removeEventListener('pointerleave', onLeave);
        container.removeEventListener('pointerdown', onDown);
        container.removeEventListener('pointerup', onUp);
        container.removeEventListener('focus', onFocus);
        container.removeEventListener('blur', onBlur);
        container.removeEventListener('keydown', onToggle);
      };
    };

    if (!gl) return setupFallback();

    const maskProgram = link(gl, MASK);
    const viewProgram = link(gl, VIEW);
    if (!maskProgram || !viewProgram) return setupFallback();
    const maskUniforms = locate(gl, maskProgram, [
      'uPrevious',
      'uTexture',
      'uView',
      'uFrom',
      'uTo',
      'uRadius',
      'uSoftness',
      'uStrength',
      'uFade',
    ]);
    const viewUniforms = locate(gl, viewProgram, [
      'uImage',
      'uMask',
      'uResolution',
      'uView',
      'uDpr',
      'uFrame',
      'uTexels',
      'uMode',
      'uShape',
      'uCell',
      'uAngle',
      'uScale',
      'uInk',
      'uAccent',
      'uPaper',
      'uContrast',
      'uBrightness',
      'uInvert',
      'uRough',
      'uShift',
      'uReverse',
      'uIntro',
      'uBursts',
      'uBurstWidth',
    ]);

    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    const floatMask = !!gl.getExtension('EXT_color_buffer_float');
    const imageTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const createMask = (width: number, height: number): MaskTarget => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      if (floatMask) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { texture, framebuffer, width, height };
    };
    const destroyMask = (target: MaskTarget) => {
      gl.deleteFramebuffer(target.framebuffer);
      gl.deleteTexture(target.texture);
    };
    let masks = [createMask(2, 2), createMask(2, 2)];

    const colorCache = new Map<string, number[]>();
    const bursts: { x: number; y: number; start: number }[] = [];
    const burstData = new Float32Array(MAX_BURSTS * 4);
    const pointer = { x: 0, y: 0, inside: false, fresh: true, placed: false };
    const brush = { x: 0, y: 0, px: 0, py: 0 };
    const toggle = { active: false };
    const state = {
      width: 1,
      height: 1,
      dpr: 1,
      image: null as HTMLImageElement | null,
      introStart: 0,
      presence: 0,
      drift: 0,
      trailUntil: 0,
    };
    let raf = 0;
    let last = 0;
    let visible = true;
    let alive = true;

    const toRgb = (value: string): number[] => {
      const cached = colorCache.get(value);
      if (cached) return cached;
      const hex = value.replace('#', '');
      const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
      const n = parseInt(full.slice(0, 6), 16);
      const rgb = [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
      colorCache.set(value, rgb);
      return rgb;
    };

    const frameRect = () => {
      const { image, width, height } = state;
      if (!image) return [0, 0, width, height];
      const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
      const w = image.naturalWidth * scale;
      const h = image.naturalHeight * scale;
      return [(width - w) / 2, (height - h) / 2, w, h];
    };

    let resizePending = false;
    const applyResize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.width = width;
      state.height = height;
      state.dpr = dpr;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      const mw = Math.max(2, Math.round(width * MASK_SCALE));
      const mh = Math.max(2, Math.round(height * MASK_SCALE));
      if (mw !== masks[0].width || mh !== masks[0].height) {
        const previous = masks;
        masks = [createMask(mw, mh), createMask(mw, mh)];
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, previous[0].framebuffer);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, masks[0].framebuffer);
        gl.blitFramebuffer(0, 0, previous[0].width, previous[0].height, 0, 0, mw, mh, gl.COLOR_BUFFER_BIT, gl.NEAREST);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        previous.forEach(destroyMask);
      }
      if (!pointer.placed) {
        pointer.x = width / 2;
        pointer.y = height / 2;
      }
    };

    const resize = () => {
      resizePending = true;
      wake();
    };

    const drawMask = (s: Settings, dt: number) => {
      const minimum = floatMask ? 0 : 1.5 / 255;
      gl.bindFramebuffer(gl.FRAMEBUFFER, masks[1].framebuffer);
      gl.viewport(0, 0, masks[1].width, masks[1].height);
      gl.useProgram(maskProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, masks[0].texture);
      gl.uniform1i(maskUniforms.uPrevious, 0);
      gl.uniform2f(maskUniforms.uTexture, masks[1].width, masks[1].height);
      gl.uniform2f(maskUniforms.uView, state.width, state.height);
      gl.uniform2f(maskUniforms.uFrom, brush.px, brush.py);
      gl.uniform2f(maskUniforms.uTo, brush.x, brush.y);
      gl.uniform1f(maskUniforms.uRadius, s.revealRadius * (0.45 + 0.55 * state.presence));
      gl.uniform1f(maskUniforms.uSoftness, s.softness);
      gl.uniform1f(maskUniforms.uStrength, state.presence);
      gl.uniform1f(maskUniforms.uFade, Math.max(s.linger > 0 ? dt / s.linger : 1, minimum));
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      masks.reverse();
    };

    const drawView = (s: Settings, now: number) => {
      const [fx, fy, fw, fh] = frameRect();
      const image = state.image;
      const intro = !image ? 0 : !s.intro ? 1 : Math.min(1, (now - state.introStart) / 1000 / INTRO_SECONDS);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(viewProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.uniform1i(viewUniforms.uImage, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, masks[0].texture);
      gl.uniform1i(viewUniforms.uMask, 1);
      gl.uniform2f(viewUniforms.uResolution, canvas.width, canvas.height);
      gl.uniform2f(viewUniforms.uView, state.width, state.height);
      gl.uniform1f(viewUniforms.uDpr, canvas.width / state.width);
      gl.uniform4f(viewUniforms.uFrame, fx, fy, fw, fh);
      gl.uniform1f(viewUniforms.uTexels, image ? image.naturalWidth / fw : 1);
      gl.uniform1f(viewUniforms.uMode, s.mode);
      gl.uniform1f(viewUniforms.uShape, s.shape);
      gl.uniform1f(viewUniforms.uCell, s.cellSize);
      gl.uniform1f(viewUniforms.uAngle, (s.angle * Math.PI) / 180);
      gl.uniform1f(viewUniforms.uScale, s.dotScale);
      gl.uniform3fv(viewUniforms.uInk, toRgb(s.inkColor));
      gl.uniform3fv(viewUniforms.uAccent, toRgb(s.accentColor));
      gl.uniform3fv(viewUniforms.uPaper, toRgb(s.paperColor));
      gl.uniform1f(viewUniforms.uContrast, s.contrast);
      gl.uniform1f(viewUniforms.uBrightness, s.brightness);
      gl.uniform1f(viewUniforms.uInvert, s.invert ? 1 : 0);
      gl.uniform1f(viewUniforms.uRough, s.roughness);
      gl.uniform1f(viewUniforms.uShift, s.misregistration * s.cellSize * 0.35);
      gl.uniform1f(viewUniforms.uReverse, s.reverse ? 1 : 0);
      gl.uniform1f(viewUniforms.uIntro, 1 - (1 - intro) * (1 - intro));
      gl.uniform4fv(viewUniforms.uBursts, burstData);
      gl.uniform1f(viewUniforms.uBurstWidth, Math.max(60, s.revealRadius * 0.9));
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
      return intro;
    };

    const frame = (now: number) => {
      raf = 0;
      if (resizePending) {
        resizePending = false;
        applyResize();
      }
      if (!alive || !visible || document.hidden) return;
      const s = settingsRef.current;
      const dt = last ? Math.min(0.05, Math.max(0, (now - last) / 1000)) : 1 / 60;
      last = now;

      const wandering = s.wander && !toggle.active;
      let targetX = pointer.x;
      let targetY = pointer.y;
      if (!pointer.inside && wandering) {
        state.drift = Math.min(1, state.drift + dt / 1.2);
        const [wx, wy] = wanderAt(now / 1000, state.width, state.height);
        const k = state.drift * state.drift * (3 - 2 * state.drift);
        targetX += (wx - targetX) * k;
        targetY += (wy - targetY) * k;
      } else {
        state.drift = 0;
      }
      const engaged = pointer.inside || wandering;
      state.presence += ((engaged ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / 0.16));
      if (pointer.fresh) {
        brush.x = brush.px = targetX;
        brush.y = brush.py = targetY;
        pointer.fresh = false;
      } else {
        const follow = 1 - Math.exp(-dt / 0.035);
        brush.x += (targetX - brush.x) * follow;
        brush.y += (targetY - brush.y) * follow;
      }

      burstData.fill(0);
      for (let i = bursts.length - 1; i >= 0; i--) {
        if ((now - bursts[i].start) / 1000 >= BURST_SECONDS) bursts.splice(i, 1);
      }
      bursts.forEach((b, i) => {
        const k = Math.max(0, (now - b.start) / 1000 / BURST_SECONDS);
        const reach = Math.hypot(Math.max(b.x, state.width - b.x), Math.max(b.y, state.height - b.y)) + 80;
        burstData[i * 4] = b.x;
        burstData[i * 4 + 1] = b.y;
        burstData[i * 4 + 2] = reach * Math.sin((k * Math.PI) / 2);
        burstData[i * 4 + 3] = 1 - k * k * k;
      });

      if (state.presence > 0.002) state.trailUntil = now + s.linger * 1000 + 200;
      drawMask(s, dt);
      brush.px = brush.x;
      brush.py = brush.y;
      const intro = drawView(s, now);

      const busy =
        engaged || state.presence > 0.002 || bursts.length > 0 || now < state.trailUntil || (state.image && intro < 1);
      if (busy) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const wake = () => {
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      if (!alive) return;
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      state.image = image;
      state.introStart = performance.now();
      wake();
    };
    image.src = animeSrc;

    const locatePointer = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.placed = true;
    };
    const onMove = (event: PointerEvent) => {
      // Touch only reveals after a deliberate tap (toggle), never on a scroll.
      if (event.pointerType === 'touch' && !toggle.active) return;
      locatePointer(event);
      if (!pointer.inside) {
        pointer.inside = true;
        pointer.fresh = true;
      }
      wake();
    };
    const onLeave = () => {
      if (!toggle.active) pointer.inside = false;
      wake();
    };
    let tapStart: { x: number; y: number } | null = null;
    const onUp = (event: PointerEvent) => {
      // Touch: a tap toggles the reveal (tap again to return); a scroll doesn't.
      if (event.pointerType !== 'touch' || !tapStart) return;
      const moved = Math.hypot(event.clientX - tapStart.x, event.clientY - tapStart.y);
      tapStart = null;
      if (moved >= 10) return;
      toggle.active = !toggle.active;
      if (toggle.active) {
        locatePointer(event);
        pointer.inside = true;
        pointer.fresh = true;
      } else {
        pointer.inside = false;
      }
      wake();
    };
    const onCancel = () => {
      tapStart = null;
      onLeave();
    };
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        tapStart = { x: event.clientX, y: event.clientY };
        return;
      }
      onMove(event);
      if (!settingsRef.current.clickBurst || event.button !== 0) return;
      bursts.push({ x: pointer.x, y: pointer.y, start: performance.now() });
      if (bursts.length > MAX_BURSTS) bursts.shift();
    };
    const onFocus = () => {
      toggle.active = true;
      pointer.inside = true;
      pointer.x = state.width / 2;
      pointer.y = state.height / 2;
      pointer.fresh = true;
      wake();
    };
    const onBlur = () => {
      toggle.active = false;
      pointer.inside = false;
      wake();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (toggle.active) onBlur();
        else onFocus();
      }
    };
    const onVisibility = () => {
      last = 0;
      wake();
    };

    container.addEventListener('pointermove', onMove, { passive: true });
    container.addEventListener('pointerenter', onMove, { passive: true });
    container.addEventListener('pointerdown', onDown, { passive: true });
    container.addEventListener('pointerleave', onLeave, { passive: true });
    container.addEventListener('pointercancel', onCancel, { passive: true });
    container.addEventListener('pointerup', onUp, { passive: true });
    container.addEventListener('focus', onFocus);
    container.addEventListener('blur', onBlur);
    container.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVisibility);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersection = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) {
        last = 0;
        wake();
      }
    });
    intersection.observe(container);
    resize();

    let teardownFallback: (() => void) | undefined;
    const onContextLost = (event: Event) => {
      event.preventDefault();
      alive = false;
      cancelAnimationFrame(raf);
      teardownFallback = setupFallback();
    };
    canvas.addEventListener('webglcontextlost', onContextLost);

    return () => {
      teardownFallback?.();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      alive = false;
      cancelAnimationFrame(raf);
      image.onload = null;
      resizeObserver.disconnect();
      intersection.disconnect();
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerenter', onMove);
      container.removeEventListener('pointerdown', onDown);
      container.removeEventListener('pointerleave', onLeave);
      container.removeEventListener('pointercancel', onCancel);
      container.removeEventListener('pointerup', onUp);
      container.removeEventListener('focus', onFocus);
      container.removeEventListener('blur', onBlur);
      container.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVisibility);
      masks.forEach(destroyMask);
      gl.deleteTexture(imageTexture);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(maskProgram);
      gl.deleteProgram(viewProgram);
    };
  }, [animeSrc]);

  return (
    <div
      ref={containerRef}
      className={`hp${className ? ` ${className}` : ''}`}
      style={style}
      tabIndex={0}
      role="img"
      aria-label={alt}
    >
      <span className="hp-halo" aria-hidden="true" />
      {/* One shared clip shape for the real photo, the fallback image and the
          WebGL reveal canvas, so all three layers always have identical edges. */}
      <div className="hp-stage">
        <img className="hp-img hp-real" src={realSrc} alt="" draggable={false} />
        <img
          ref={animeImgRef}
          className="hp-img hp-anime"
          src={animeSrc}
          alt=""
          draggable={false}
          aria-hidden="true"
        />
        <canvas ref={canvasRef} className="hp-canvas" aria-hidden="true" />
      </div>
    </div>
  );
};

export default HalftonePortrait;
