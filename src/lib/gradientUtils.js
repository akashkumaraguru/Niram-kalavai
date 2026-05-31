// Gradient utilities: build CSS strings and export to PNG via canvas
export const DEFAULT_GRADIENT = {
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
};

const sortStops = (stops) => [...stops].sort((a, b) => a.position - b.position);

export const getRGBAColor = (hex, opacityPercent) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  if (!result) return hex;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  const a = ((opacityPercent ?? 100) / 100).toFixed(2);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export const buildGradientCSS = (g) => {
  const stops = sortStops(g.stops)
    .map((s) => `${getRGBAColor(s.color, s.opacity ?? 100)} ${s.position.toFixed(1)}%`)
    .join(", ");
  if (g.type === "linear") {
    return `linear-gradient(${g.angle}deg, ${stops})`;
  }
  if (g.type === "conic") {
    return `conic-gradient(from ${g.angle}deg at ${g.pos_x}% ${g.pos_y}%, ${stops})`;
  }
  // radial
  return `radial-gradient(${g.shape} farthest-corner at ${g.pos_x}% ${g.pos_y}%, ${stops})`;
};

export const buildGradientSVG = (g) => {
  const stops = sortStops(g.stops);
  const stopTags = stops
    .map((s) => `<stop offset="${s.position}%" stop-color="${s.color}" stop-opacity="${((s.opacity ?? 100) / 100).toFixed(2)}" />`)
    .join("\n    ");

  let gradDef = "";
  if (g.type === "linear") {
    const rad = (g.angle * Math.PI) / 180;
    const x1 = (50 - Math.sin(rad) * 50).toFixed(1);
    const y1 = (50 + Math.cos(rad) * 50).toFixed(1);
    const x2 = (50 + Math.sin(rad) * 50).toFixed(1);
    const y2 = (50 - Math.cos(rad) * 50).toFixed(1);
    gradDef = `<linearGradient id="grad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">\n    ${stopTags}\n  </linearGradient>`;
  } else if (g.type === "radial") {
    const cx = g.pos_x.toFixed(1);
    const cy = g.pos_y.toFixed(1);
    gradDef = `<radialGradient id="grad" cx="${cx}%" cy="${cy}%" r="70%" fx="${cx}%" fy="${cy}%">\n    ${stopTags}\n  </radialGradient>`;
  } else {
    // Conic fallback to linear in standard SVG
    const rad = (g.angle * Math.PI) / 180;
    const x1 = (50 - Math.sin(rad) * 50).toFixed(1);
    const y1 = (50 + Math.cos(rad) * 50).toFixed(1);
    const x2 = (50 + Math.sin(rad) * 50).toFixed(1);
    const y2 = (50 - Math.cos(rad) * 50).toFixed(1);
    gradDef = `<linearGradient id="grad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">\n    ${stopTags}\n  </linearGradient>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    ${gradDef}
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" />
</svg>`;
};

// Export current gradient to a PNG by drawing on an offscreen canvas
export const exportGradientPNG = (g, width = 1920, height = 1080, filename = "gradient.png") => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const stops = sortStops(g.stops);

  if (g.type === "linear") {
    const rad = ((g.angle - 90) * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;
    const len = Math.max(width, height);
    const x1 = cx - Math.cos(rad) * len;
    const y1 = cy - Math.sin(rad) * len;
    const x2 = cx + Math.cos(rad) * len;
    const y2 = cy + Math.sin(rad) * len;
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    stops.forEach((s) => grad.addColorStop(s.position / 100, getRGBAColor(s.color, s.opacity ?? 100)));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (g.type === "radial") {
    const cx = (g.pos_x / 100) * width;
    const cy = (g.pos_y / 100) * height;
    const corners = [
      Math.hypot(cx, cy),
      Math.hypot(width - cx, cy),
      Math.hypot(cx, height - cy),
      Math.hypot(width - cx, height - cy),
    ];
    const sides = [cx, cy, width - cx, height - cy];
    let r;
    if (g.size === "farthest-corner") r = Math.max(...corners);
    else if (g.size === "closest-corner") r = Math.min(...corners);
    else if (g.size === "farthest-side") r = Math.max(...sides);
    else r = Math.min(...sides);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    stops.forEach((s) => grad.addColorStop(Math.min(1, Math.max(0, s.position / 100)), getRGBAColor(s.color, s.opacity ?? 100)));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else {
    // conic — manual paint
    const cx = (g.pos_x / 100) * width;
    const cy = (g.pos_y / 100) * height;
    const grad = ctx.createConicGradient
      ? ctx.createConicGradient(((g.angle) * Math.PI) / 180, cx, cy)
      : null;
    if (grad) {
      stops.forEach((s) => grad.addColorStop(s.position / 100, getRGBAColor(s.color, s.opacity ?? 100)));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = getRGBAColor(stops[0]?.color || "#000", stops[0]?.opacity || 100);
      ctx.fillRect(0, 0, width, height);
    }
  }

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, "image/png");
};

export const PRESETS = [
  {
    name: "Deep Ocean",
    config: {
      type: "radial",
      pos_x: 50, pos_y: 50, shape: "circle", size: "farthest-corner", angle: 135,
      stops: [
        { id: "p1_1", color: "#7BD7FF", position: 0, opacity: 100 },
        { id: "p1_2", color: "#1F8FE3", position: 28, opacity: 100 },
        { id: "p1_3", color: "#0B4FA0", position: 62, opacity: 100 },
        { id: "p1_4", color: "#03132B", position: 100, opacity: 100 },
      ],
    },
  },
  {
    name: "Sunset Drift",
    config: {
      type: "linear", angle: 135, pos_x: 50, pos_y: 50, shape: "circle", size: "farthest-corner",
      stops: [
        { id: "p2_1", color: "#FFB36B", position: 0, opacity: 100 },
        { id: "p2_2", color: "#FF5E62", position: 45, opacity: 100 },
        { id: "p2_3", color: "#7A1F8A", position: 100, opacity: 100 },
      ],
    },
  },
  {
    name: "Citrus Pop",
    config: {
      type: "radial", pos_x: 70, pos_y: 30, shape: "circle", size: "farthest-corner", angle: 0,
      stops: [
        { id: "p3_1", color: "#FFEE7A", position: 0, opacity: 100 },
        { id: "p3_2", color: "#FFA62B", position: 50, opacity: 100 },
        { id: "p3_3", color: "#D9261C", position: 100, opacity: 100 },
      ],
    },
  },
  {
    name: "Forest Glow",
    config: {
      type: "radial", pos_x: 50, pos_y: 50, shape: "ellipse", size: "farthest-corner", angle: 0,
      stops: [
        { id: "p4_1", color: "#A8FFAF", position: 0, opacity: 100 },
        { id: "p4_2", color: "#178F5B", position: 50, opacity: 100 },
        { id: "p4_3", color: "#022C19", position: 100, opacity: 100 },
      ],
    },
  },
  {
    name: "Aurora",
    config: {
      type: "conic", pos_x: 50, pos_y: 50, shape: "circle", size: "farthest-corner", angle: 220,
      stops: [
        { id: "p5_1", color: "#8AE7FF", position: 0, opacity: 100 },
        { id: "p5_2", color: "#7B61FF", position: 30, opacity: 100 },
        { id: "p5_3", color: "#FF6FB1", position: 60, opacity: 100 },
        { id: "p5_4", color: "#FFD56F", position: 100, opacity: 100 },
      ],
    },
  },
  {
    name: "Monochrome",
    config: {
      type: "linear", angle: 180, pos_x: 50, pos_y: 50, shape: "circle", size: "farthest-corner",
      stops: [
        { id: "p6_1", color: "#F5F5F5", position: 0, opacity: 100 },
        { id: "p6_2", color: "#1A1A1A", position: 100, opacity: 100 },
      ],
    },
  },
];

export const hexToRgb = (hexStr) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hexStr.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

export const randomHex = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0").toUpperCase();
};

export const formatColor = (hex, opacity, format) => {
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
export const validateGradientPreset = (preset) => {
  if (!preset || typeof preset !== "object") return null;
  if (typeof preset.id !== "string" || typeof preset.name !== "string") return null;
  
  const config = preset.config;
  if (!config || typeof config !== "object") return null;
  if (!["linear", "radial", "conic"].includes(config.type)) return null;
  
  const angle = Number(config.angle);
  const posX = Number(config.pos_x);
  const posY = Number(config.pos_y);
  if (isNaN(angle) || isNaN(posX) || isNaN(posY)) return null;
  
  if (!Array.isArray(config.stops) || config.stops.length < 2) return null;
  
  const validatedStops = [];
  for (const stop of config.stops) {
    if (!stop || typeof stop !== "object") return null;
    const pos = Number(stop.position);
    const op = Number(stop.opacity ?? 100);
    if (isNaN(pos) || isNaN(op)) return null;
    
    // Clean and validate hex color format
    let color = String(stop.color || "#000000").trim();
    if (!color.startsWith("#")) color = `#${color}`;
    if (!/^#[0-9A-Fa-f]{3,8}$/.test(color)) return null;
    
    validatedStops.push({
      id: String(stop.id || Math.random()),
      color,
      position: Math.max(0, Math.min(100, pos)),
      opacity: Math.max(0, Math.min(100, op)),
    });
  }
  
  return {
    id: preset.id,
    name: preset.name.replace(/[<>]/g, "").slice(0, 32).trim(), // Strip HTML tags and restrict size
    config: {
      type: config.type,
      angle: Math.max(0, Math.min(360, angle)),
      pos_x: Math.max(0, Math.min(100, posX)),
      pos_y: Math.max(0, Math.min(100, posY)),
      shape: ["circle", "ellipse"].includes(config.shape) ? config.shape : "circle",
      size: config.size || "farthest-corner",
      stops: validatedStops
    }
  };
};


