export { PRESETS } from "./gradientPresets";
import { isRecord, normalizeHexColor } from "./validation";
import { downloadCanvasPNG } from "./downloads";

// Gradient utilities: build CSS strings and export to PNG via Gradient

export interface ColorStop {
  id: string;
  color: string;
  position: number;
  opacity?: number;
}

export interface GradientConfig {
  type: "linear" | "radial" | "conic";
  angle: number;
  pos_x: number;
  pos_y: number;
  shape: "circle" | "ellipse";
  size: string;
  stops: ColorStop[];
  chaos?: number;
  grain?: number;
  seed?: number;
  blur?: number;
  pattern?: string;
}

export interface GradientPreset {
  id: string;
  name: string;
  config: GradientConfig;
}

export const DEFAULT_GRADIENT: GradientConfig = {
  type: "radial",
  angle: 135,
  pos_x: 50,
  pos_y: 50,
  shape: "circle",
  size: "farthest-corner",
  stops: [
    { id: "1", color: "#7BD7FF", position: 0, opacity: 100 },
    { id: "2", color: "#1F8FE3", position: 28, opacity: 100 },
    { id: "3", color: "#0B4FA0", position: 62, opacity: 100 },
    { id: "4", color: "#03132B", position: 100, opacity: 100 },
  ],
  chaos: 0.5,
  grain: 0.3,
  seed: 1,
  blur: 150,
  pattern: "fine",
};

const sortStops = (stops: ColorStop[]): ColorStop[] => [...stops].sort((a, b) => a.position - b.position);

export const getRGBAColor = (hex: string, opacityPercent = 100): string => {
  const parsed = normalizeHexColor(hex);
  if (!parsed) throw new Error("Invalid gradient color");
  const { r, g, b } = hexToRgb(parsed.color);
  const alpha = Math.max(0, Math.min(100, opacityPercent)) / 100 * parsed.alpha;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
};

export const buildGradientCSS = (g: GradientConfig, format?: string): string => {
  const stops = sortStops(g.stops)
    .map((s) => `${format ? formatColor(s.color, s.opacity, format === "HSB" ? "RGB" : format) : getRGBAColor(s.color, s.opacity)} ${s.position.toFixed(1)}%`)
    .join(", ");
  if (g.type === "linear") return `linear-gradient(${g.angle}deg, ${stops})`;
  if (g.type === "conic") return `conic-gradient(from ${g.angle}deg at ${g.pos_x}% ${g.pos_y}%, ${stops})`;
  return `radial-gradient(${g.shape} ${g.size} at ${g.pos_x}% ${g.pos_y}%, ${stops})`;
};

function linearEndpoints(angle: number, width: number, height: number) {
  const radians = angle * Math.PI / 180;
  const dx = Math.sin(radians);
  const dy = -Math.cos(radians);
  const halfLength = (Math.abs(width * dx) + Math.abs(height * dy)) / 2;
  return [width / 2 - dx * halfLength, height / 2 - dy * halfLength,
    width / 2 + dx * halfLength, height / 2 + dy * halfLength] as const;
}

function radialGeometry(g: GradientConfig, width: number, height: number) {
  const cx = g.pos_x / 100 * width;
  const cy = g.pos_y / 100 * height;
  const xs = [cx, width - cx];
  const ys = [cy, height - cy];
  const select = g.size.startsWith("closest") ? Math.min : Math.max;
  let rx: number;
  let ry: number;
  if (g.shape === "circle") {
    rx = ry = g.size.endsWith("side") ? select(...xs, ...ys)
      : select(...xs.flatMap(x => ys.map(y => Math.hypot(x, y))));
  } else {
    rx = select(...xs);
    ry = select(...ys);
    if (g.size.endsWith("corner") && rx > 0 && ry > 0) {
      const factor = select(...xs.flatMap(x => ys.map(y => Math.hypot(x / rx, y / ry))));
      rx *= factor;
      ry *= factor;
    }
  }
  // A zero-radius ending shape paints the final color; an epsilon keeps transforms invertible.
  return { cx, cy, rx: Math.max(0.000001, rx), ry: Math.max(0.000001, ry) };
}

function gradientCanvas(g: GradientConfig, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");
  let fill: CanvasGradient;
  let radial: ReturnType<typeof radialGeometry> | undefined;
  if (g.type === "linear") {
    fill = ctx.createLinearGradient(...linearEndpoints(g.angle, width, height));
  } else if (g.type === "radial") {
    radial = radialGeometry(g, width, height);
    const { cx, cy, rx, ry } = radial;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(rx, ry);
    fill = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  } else {
    if (!ctx.createConicGradient) throw new Error("This browser cannot export conic gradients");
    fill = ctx.createConicGradient((g.angle - 90) * Math.PI / 180, g.pos_x / 100 * width, g.pos_y / 100 * height);
  }
  sortStops(g.stops).forEach(s => fill.addColorStop(s.position / 100, getRGBAColor(s.color, s.opacity)));
  ctx.fillStyle = fill;
  if (radial) {
    ctx.fillRect(-radial.cx / radial.rx, -radial.cy / radial.ry, width / radial.rx, height / radial.ry);
    ctx.restore();
  } else {
    ctx.fillRect(0, 0, width, height);
  }
  return canvas;
}

export const buildGradientSVG = (g: GradientConfig, width = 800, height = 600): string => {
  const start = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  // SVG has no native conic paint server. Embed the correctly rendered image instead of changing the gradient type.
  if (g.type === "conic") {
    return `${start}<image width="${width}" height="${height}" href="${gradientCanvas(g, width, height).toDataURL("image/png")}" /></svg>`;
  }
  const stops = sortStops(g.stops).map(s => `<stop offset="${s.position}%" stop-color="${getRGBAColor(s.color, s.opacity)}" />`).join("\n");
  let definition: string;
  if (g.type === "linear") {
    const [x1, y1, x2, y2] = linearEndpoints(g.angle, width, height);
    definition = `<linearGradient id="grad" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops}</linearGradient>`;
  } else {
    const { cx, cy, rx, ry } = radialGeometry(g, width, height);
    definition = `<radialGradient id="grad" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(${cx} ${cy}) scale(${rx} ${ry})">${stops}</radialGradient>`;
  }
  return `${start}<defs>${definition}</defs><rect width="100%" height="100%" fill="url(#grad)" /></svg>`;
};

export const exportGradientPNG = async (g: GradientConfig, width = 1920, height = 1080, filename = "gradient.png"): Promise<void> => {
  await downloadCanvasPNG(gradientCanvas(g, width, height), filename);
};

export const hexToRgb = (hexStr: string): { r: number; g: number; b: number } => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hexStr.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

export const randomHex = (): string => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0").toUpperCase();
};

export const formatColor = (hex: string, opacity: number | undefined, format: string): string => {
  const rgb = hexToRgb(hex);
  const alpha = opacity !== undefined ? opacity / 100 : 1;
  const isAlpha = alpha < 1;

  if (format === "RGB") {
    return isAlpha
      ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${parseFloat(alpha.toFixed(2))})`
      : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  if (format === "HSL") {
    const l = (max + min) / 2;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    return isAlpha
      ? `hsla(${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${parseFloat(alpha.toFixed(2))})`
      : `hsl(${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }

  if (format === "HSB") {
    const v = max;
    const s = max === 0 ? 0 : d / max;
    return isAlpha
      ? `hsba(${h}, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%, ${parseFloat(alpha.toFixed(2))})`
      : `hsb(${h}, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)`;
  }

  // HEX format
  if (isAlpha) {
    const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, "0").toUpperCase();
    return `${hex}${alphaHex}`;
  }
  return hex;
};

// Validate and sanitize preset configurations loaded from external storage (localStorage)
export const validateGradientPreset = (preset: unknown): GradientPreset | null => {
  if (!isRecord(preset) || typeof preset.id !== "string" || !preset.id || typeof preset.name !== "string") return null;
  const name = preset.name.replace(/[<>]/g, "").slice(0, 32).trim();
  const config = preset.config;
  if (!name || !isRecord(config)) return null;
  if (config.type !== "linear" && config.type !== "radial" && config.type !== "conic") return null;
  const { angle, pos_x, pos_y } = config;
  if (typeof angle !== "number" || !Number.isFinite(angle) || typeof pos_x !== "number" || !Number.isFinite(pos_x) || typeof pos_y !== "number" || !Number.isFinite(pos_y)) return null;
  if (!Array.isArray(config.stops) || config.stops.length < 2) return null;
  const stops: ColorStop[] = [];
  const ids = new Set<string>();
  for (const [index, stop] of config.stops.entries()) {
    if (!isRecord(stop) || typeof stop.color !== "string" || typeof stop.position !== "number" || !Number.isFinite(stop.position)) return null;
    const parsed = normalizeHexColor(stop.color);
    const opacity = stop.opacity ?? 100;
    if (!parsed || typeof opacity !== "number" || !Number.isFinite(opacity)) return null;
    let id = typeof stop.id === "string" && stop.id ? stop.id : `stop-${index}`;
    while (ids.has(id)) id += `-${index}`;
    ids.add(id);
    stops.push({ id, color: parsed.color, position: Math.max(0, Math.min(100, stop.position)), opacity: Math.max(0, Math.min(100, opacity)) * parsed.alpha });
  }
  const bounded = (value: unknown, fallback: number, min: number, max: number) => typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
  return { id: preset.id, name, config: {
    type: config.type, angle: bounded(angle, 0, 0, 360), pos_x: bounded(pos_x, 50, 0, 100), pos_y: bounded(pos_y, 50, 0, 100),
    shape: config.shape === "ellipse" ? "ellipse" : "circle",
    size: typeof config.size === "string" && ["closest-side", "closest-corner", "farthest-side", "farthest-corner"].includes(config.size) ? config.size : "farthest-corner",
    stops, chaos: bounded(config.chaos, 0.5, 0, 1), grain: bounded(config.grain, 0.3, 0, 1),
    seed: bounded(config.seed, 1, 0, Number.MAX_SAFE_INTEGER), blur: bounded(config.blur, 150, 10, 300),
    pattern: PATTERNS.some(p => p.id === config.pattern) ? String(config.pattern) : "fine",
  } };
};

export interface PatternConfig {
  id: string;
  label: string;
  type: string;
  frequency: number;
}

export const PATTERNS: PatternConfig[] = [
  { id: "fine", label: "Fine Grain", type: "fractalNoise", frequency: 0.75 },
  { id: "coarse", label: "Coarse Grain", type: "fractalNoise", frequency: 0.35 },
  { id: "sand", label: "Soft Sand", type: "fractalNoise", frequency: 0.5 },
  { id: "velvet", label: "Washed Velvet", type: "fractalNoise", frequency: 0.2 },
  { id: "clouds", label: "Cloudy Waves", type: "fractalNoise", frequency: 0.01 },
  { id: "silk", label: "Wavy Silk", type: "turbulence", frequency: 0.008 },
  { id: "waves", label: "Waves & Marble", type: "turbulence", frequency: 0.015 },
  { id: "ripples", label: "Liquid Ripples", type: "turbulence", frequency: 0.04 },
  { id: "topographic", label: "Topographic Lines", type: "turbulence", frequency: 0.005 },
  { id: "turbulent", label: "Turbulent Flow", type: "turbulence", frequency: 0.07 },
];

// Generates a self-contained SVG for the noisy gradient
export const buildNoisySVG = (g: GradientConfig, ratio = "fluid"): string => {
  const stops = g.stops.length ? g.stops : DEFAULT_GRADIENT.stops;
  const chaos = g.chaos ?? 0.5;
  const grain = g.grain ?? 0.3;
  const seed = g.seed ?? 1;
  const blurVal = g.blur ?? 150;
  const patternId = g.pattern ?? "fine";

  const baseColor = stops[0]?.color || "#ffffff";

  // Deterministic pseudo-random number generator
  const pseudoRandom = (s: number, index: number, offset: number): number => {
    const x = Math.sin(s * 13.1 + index * 37.7 + offset * 97.3) * 10000;
    return x - Math.floor(x);
  };

  // Resolve pattern settings
  const pattern = PATTERNS.find(p => p.id === patternId) || PATTERNS[0];
  const noiseType = pattern.type;
  const baseFreq = pattern.frequency;

  // Determine viewBox dimensions based on aspect ratio
  let viewWidth = 1000;
  let viewHeight = 1000;

  if (ratio !== "fluid") {
    const parts = ratio.split(":");
    const w = Number(parts[0]);
    const h = Number(parts[1]);
    if (w > h) {
      viewWidth = 1000;
      viewHeight = Math.round((h / w) * 1000);
    } else {
      viewHeight = 1000;
      viewWidth = Math.round((w / h) * 1000);
    }
  }

  const blobCount = Math.max(6, stops.length * 2);
  interface BlobObj {
    cx: number;
    cy: number;
    r: number;
    color: string;
    opacity: number;
  }
  const blobs: BlobObj[] = [];

  for (let i = 0; i < blobCount; i++) {
    const stop = stops[i % stops.length];
    const color = stop.color;

    // Distribute base positions evenly in a circle around the center
    const angle = (i / blobCount) * Math.PI * 2;
    const baseDist = Math.min(viewWidth, viewHeight) * 0.25;
    const baseCx = viewWidth / 2 + Math.cos(angle) * baseDist;
    const baseCy = viewHeight / 2 + Math.sin(angle) * baseDist;
    const baseR = Math.min(viewWidth, viewHeight) * 0.35;

    const r1 = pseudoRandom(seed, i, 1);
    const r2 = pseudoRandom(seed, i, 2);
    const r3 = pseudoRandom(seed, i, 3);

    const randX = r1 * 2 - 1;
    const randY = r2 * 2 - 1;
    const randR = r3 * 2 - 1;

    const cx = baseCx + randX * (viewWidth * 0.35) * chaos;
    const cy = baseCy + randY * (viewHeight * 0.35) * chaos;
    const r = baseR + randR * (baseR * 0.45) * chaos;
    const opacity = (0.7 + (r3 * 0.25)) * (stop.opacity ?? 100) / 100; // 0.7 to 0.95

    blobs.push({
      cx: Math.max(-viewWidth * 0.2, Math.min(viewWidth * 1.2, cx)),
      cy: Math.max(-viewHeight * 0.2, Math.min(viewHeight * 1.2, cy)),
      r: Math.max(100, r),
      color,
      opacity
    });
  }

  const blobElements = blobs.map((b) =>
    `<circle cx="${b.cx.toFixed(0)}" cy="${b.cy.toFixed(0)}" r="${b.r.toFixed(0)}" fill="${b.color}" opacity="${b.opacity.toFixed(2)}" filter="url(#blur)" />`
  ).join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewWidth} ${viewHeight}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
  <defs>
    <filter id="blur" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="${blurVal}" />
    </filter>
    <filter id="whiteNoise">
      <feTurbulence type="${noiseType}" baseFrequency="${baseFreq}" numOctaves="3" result="noise" />
      <feColorMatrix type="matrix" in="noise" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1 0 0 0 -0.45" />
    </filter>
    <filter id="darkNoise">
      <feTurbulence type="${noiseType}" baseFrequency="${baseFreq}" numOctaves="3" result="noise" />
      <feColorMatrix type="matrix" in="noise" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1 0 0 0 0.55" />
    </filter>
  </defs>
  <rect width="${viewWidth}" height="${viewHeight}" fill="${baseColor}" opacity="${(stops[0].opacity ?? 100) / 100}" />
  <g>
    ${blobElements}
  </g>
  <rect width="${viewWidth}" height="${viewHeight}" fill="transparent" filter="url(#whiteNoise)" opacity="${(grain * 1.1).toFixed(2)}" />
  <rect width="${viewWidth}" height="${viewHeight}" fill="transparent" filter="url(#darkNoise)" opacity="${(grain * 1.1).toFixed(2)}" />
</svg>`;
};

// URL-encodes an SVG string for use as a background-image URI
export const encodeSVGForCSS = (svgString: string): string => encodeURIComponent(svgString).replace(/'/g, "%27");

export const exportNoisyGradientPNG = async (svgString: string, width = 1920, height = 1080, filename = "noisy-gradient.png"): Promise<void> => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");
  const img = new Image();
  // Explicit dimensions avoid zero-sized SVG images in browsers when rasterizing.
  const sizedSVG = svgString.replace('width="100%" height="100%"', `width="${width}" height="${height}"`);
  const url = URL.createObjectURL(new Blob([sizedSVG], { type: "image/svg+xml;charset=utf-8" }));
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Unable to render the gradient image"));
      img.src = url;
    });
    ctx.drawImage(img, 0, 0, width, height);
    await downloadCanvasPNG(canvas, filename);
  } finally {
    URL.revokeObjectURL(url);
  }
};
