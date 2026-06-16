import chroma from "chroma-js";

export interface PaletteShade {
  level: string; // "50", "100", ..., "950"
  hex: string;
  rgb: string;
  hsl: string;
  contrastOnWhite: number;
  contrastOnBlack: number;
}

export interface FullPalette {
  name: string;
  description: string;
  createdDate: string;
  baseColor: string;
  shades: PaletteShade[];
  secondaryColor?: string;
  secondary?: PaletteShade[];
  neutralType: string;
  neutrals: PaletteShade[];
  success: PaletteShade[];
  warning: PaletteShade[];
  error: PaletteShade[];
  harmonyMode: string;
  headingFont: string;
  bodyFont: string;
  lockedShades: string[]; // e.g. ["500"]
  neutralColor?: string;
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
}

const PRESET_PALETTES: Record<string, string[]> = {
  "#F44336": ["#ffebee", "#ffcdd2", "#ef9a9a", "#e57373", "#ef5350", "#f44336", "#e53935", "#d32f2f", "#c62828", "#b71c1c", "#7d0000"], // Red
  "#E91E63": ["#fce4ec", "#f8bbd0", "#f48fb1", "#f06292", "#ec407a", "#e91e63", "#d81b60", "#c2185b", "#ad1457", "#880e4f", "#4a0e23"], // Pink
  "#9C27B0": ["#f3e5f5", "#e1bee7", "#ce93d8", "#ba68c8", "#ab47bc", "#9c27b0", "#8e24aa", "#7b1fa2", "#6a1b9a", "#4a148c", "#2a0845"], // Purple
  "#673AB7": ["#ede7f6", "#d1c4e9", "#b39ddb", "#9575cd", "#7e57c2", "#673ab7", "#5e35b1", "#512da8", "#4527a0", "#311b92", "#1a0d3a"], // Deep Purple
  "#3F51B5": ["#e8eaf6", "#c5cae9", "#9fa8da", "#7986cb", "#5c6bc0", "#3f51b5", "#3949ab", "#303f9f", "#283593", "#1a237e", "#0f1249"], // Indigo
  "#2196F3": ["#e3f2fd", "#bbdefb", "#90caf9", "#64b5f6", "#42a5f5", "#2196f3", "#1e88e5", "#1976d2", "#1565c0", "#0d47a1", "#051a7a"], // Blue
  "#03A9F4": ["#e1f5fe", "#b3e5fc", "#81d4fa", "#4fc3f7", "#29b6f6", "#03a9f4", "#039be5", "#0288d1", "#0277bd", "#01579b", "#003d8c"], // Light Blue
  "#00BCD4": ["#e0f7fa", "#b2ebf2", "#80deea", "#4dd0e1", "#26c6da", "#00bcd4", "#00acc1", "#0097a7", "#00838f", "#006064", "#003a42"], // Cyan
  "#009688": ["#e0f2f1", "#b2dfdb", "#80cbc4", "#4db6ac", "#26a69a", "#009688", "#00897b", "#00796b", "#00695c", "#004d40", "#002b26"], // Teal
  "#4CAF50": ["#e8f5e9", "#c8e6c9", "#a5d6a7", "#81c784", "#66bb6a", "#4caf50", "#43a047", "#388e3c", "#2e7d32", "#1b5e20", "#0e3a1a"], // Green
  "#8BC34A": ["#f1f8e9", "#dcedc8", "#c5e1a5", "#aed581", "#9ccc65", "#8bc34a", "#7cb342", "#689f38", "#558b2f", "#33691e", "#1a2e0a"], // Light Green
  "#CDDC39": ["#f9fbe7", "#f0f4c3", "#e6ee9c", "#dce775", "#d4e157", "#cddc39", "#c0ca33", "#afb42b", "#9e9d24", "#827717", "#3a3800"], // Lime
  "#FFEB3B": ["#fffde7", "#fff9c4", "#fff59d", "#fff176", "#ffee58", "#ffeb3b", "#fdd835", "#fbc02d", "#f9a825", "#f57f17", "#4a3f00"], // Yellow
  "#FFC107": ["#fff8e1", "#ffecb3", "#ffe082", "#ffd54f", "#ffca28", "#ffc107", "#ffb300", "#ffa000", "#ff8f00", "#ff6f00", "#4a3600"], // Amber
  "#FF9800": ["#fff3e0", "#ffe0b2", "#ffcc80", "#ffb74d", "#ffa726", "#ff9800", "#fb8c00", "#f57c00", "#ef6c00", "#e65100", "#3a2a00"], // Orange
  "#FF5722": ["#fbe9e7", "#ffccbc", "#ffab91", "#ff8a65", "#ff7043", "#ff5722", "#f4511e", "#e64a19", "#d84315", "#bf360c", "#5a1a08"], // Deep Orange
  "#795548": ["#efebe9", "#d7ccc8", "#bcaaa4", "#a1887f", "#8d6e63", "#795548", "#6d4c41", "#5d4037", "#4e342e", "#3e2723", "#2a1a10"], // Brown
  "#9E9E9E": ["#fafafa", "#f5f5f5", "#eeeeee", "#e0e0e0", "#bdbdbd", "#9e9e9e", "#757575", "#616161", "#424242", "#212121", "#121212"], // Grey
  "#607D8B": ["#eceff1", "#cfd8dc", "#b0bec5", "#90a4ae", "#78909c", "#607d8b", "#546e7a", "#455a64", "#37474f", "#263238", "#0f1419"]  // Blue Grey
};

// Generate 11 shades using LCH interpolation
export const generateShades = (
  baseHex: string,
  lightnessModifier = 0,
  saturationModifier = 0
): PaletteShade[] => {
  const key = baseHex.toUpperCase();
  if (lightnessModifier === 0 && saturationModifier === 0 && PRESET_PALETTES[key]) {
    const levels = ["50", "100", "200", "300", "400", "500-Base", "600", "700", "800", "900", "950"];
    const shades: PaletteShade[] = [];
    const hexList = PRESET_PALETTES[key];
    levels.forEach((lvl, idx) => {
      const hexVal = hexList[idx].toUpperCase();
      const c = chroma(hexVal);
      const rgbArray = c.rgb();
      const rgbVal = `rgb(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]})`;
      
      const hslArray = c.hsl();
      const hslVal = `hsl(${Math.round(isNaN(hslArray[0]) ? 0 : hslArray[0])}, ${Math.round(hslArray[1] * 100)}%, ${Math.round(hslArray[2] * 100)}%)`;
      
      const contrWhite = chroma.contrast(hexVal, "#ffffff");
      const contrBlack = chroma.contrast(hexVal, "#000000");

      shades.push({
        level: lvl,
        hex: hexVal,
        rgb: rgbVal,
        hsl: hslVal,
        contrastOnWhite: Number(contrWhite.toFixed(2)),
        contrastOnBlack: Number(contrBlack.toFixed(2)),
      });
    });
    return shades;
  }

  let color = chroma(baseHex);

  // Apply modifiers
  if (saturationModifier !== 0 || lightnessModifier !== 0) {
    const lch = color.lch(); // [L, C, H]
    const newL = Math.max(0, Math.min(100, lch[0] + lightnessModifier * 100));
    const newC = Math.max(0, Math.min(100, lch[1] + saturationModifier * 100));
    color = chroma.lch(newL, newC, isNaN(lch[2]) ? 0 : lch[2]);
  }

  const lch = color.lch();
  const baseHue = isNaN(lch[2]) ? 0 : lch[2];

  // Define light and dark end mixing targets keeping the exact same hue to prevent green/blue shifts
  const lightEnd = chroma.lch(98, Math.max(2, lch[1] * 0.15), baseHue);
  const darkEnd = chroma.lch(8, Math.max(4, lch[1] * 0.25), baseHue);

  const scaleLight = chroma.scale([lightEnd, color]).mode("lch");
  const scaleDark = chroma.scale([color, darkEnd]).mode("lch");

  const levels = ["50", "100", "200", "300", "400", "500-Base", "600", "700", "800", "900", "950"];
  const shades: PaletteShade[] = [];

  levels.forEach((lvl, idx) => {
    let c;
    if (idx < 5) {
      c = scaleLight(idx / 5);
    } else if (idx === 5) {
      c = color;
    } else {
      c = scaleDark((idx - 5) / 5);
    }

    const hexVal = c.hex().toUpperCase();
    const rgbArray = c.rgb();
    const rgbVal = `rgb(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]})`;
    
    const hslArray = c.hsl();
    const hslVal = `hsl(${Math.round(isNaN(hslArray[0]) ? 0 : hslArray[0])}, ${Math.round(hslArray[1] * 100)}%, ${Math.round(hslArray[2] * 100)}%)`;
    
    const contrWhite = chroma.contrast(hexVal, "#ffffff");
    const contrBlack = chroma.contrast(hexVal, "#000000");

    shades.push({
      level: lvl,
      hex: hexVal,
      rgb: rgbVal,
      hsl: hslVal,
      contrastOnWhite: Number(contrWhite.toFixed(2)),
      contrastOnBlack: Number(contrBlack.toFixed(2)),
    });
  });

  return shades;
};

// Generate matching status palettes tinted slightly with the base color's hue
export const generateStatusPalette = (
  baseColorHex: string,
  statusBaseHex: string
): PaletteShade[] => {
  const baseColor = chroma(baseColorHex);
  const statusColor = chroma(statusBaseHex);

  const baseLch = baseColor.lch();
  const statusLch = statusColor.lch();

  // Shift status hue slightly towards brand base (8% blend)
  if (!isNaN(baseLch[2]) && !isNaN(statusLch[2])) {
    let diff = baseLch[2] - statusLch[2];
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const newHue = (statusLch[2] + diff * 0.08 + 360) % 360;
    const harmoniousColor = chroma.lch(statusLch[0], statusLch[1], newHue);
    return generateShades(harmoniousColor.hex());
  }

  return generateShades(statusBaseHex);
};

// Generate Neutral Palette scales based on brand tinting
export const generateNeutralScale = (
  baseColorHex: string,
  neutralType: string
): PaletteShade[] => {
  const baseColor = chroma(baseColorHex);
  const lch = baseColor.lch();
  const baseHue = isNaN(lch[2]) ? 0 : lch[2];

  if (neutralType === "slate") {
    // Slate: cool neutral
    const slateBase = chroma.lch(50, 6, 250); // Cool slate
    return generateShades(slateBase.hex());
  }
  if (neutralType === "zinc") {
    // Zinc: neutral gray
    const zincBase = chroma.lch(50, 2, 250);
    return generateShades(zincBase.hex());
  }
  if (neutralType === "warm") {
    // Warm: stone neutral
    const stoneBase = chroma.lch(50, 4, 60);
    return generateShades(stoneBase.hex());
  }
  if (neutralType === "cool") {
    // Cool: cool gray
    const coolBase = chroma.lch(50, 4, 220);
    return generateShades(coolBase.hex());
  }
  
  // Brand Tinted Neutral: desaturate heavily and align hue
  const tintedBase = chroma.lch(55, 6, baseHue);
  return generateShades(tintedBase.hex());
};

// Calculate harmonious colors
export interface HarmonySet {
  name: string;
  colors: string[];
}

export const getHarmonies = (baseColorHex: string): HarmonySet[] => {
  const baseColor = chroma(baseColorHex);
  const lch = baseColor.lch();
  const L = lch[0];
  const C = lch[1];
  const H = isNaN(lch[2]) ? 0 : lch[2];

  const toHex = (l: number, c: number, h: number) => {
    return chroma.lch(l, c, (h + 360) % 360).hex().toUpperCase();
  };

  return [
    {
      name: "Complementary",
      colors: [baseColorHex.toUpperCase(), toHex(L, C, H + 180)],
    },
    {
      name: "Analogous",
      colors: [toHex(L, C, H - 30), baseColorHex.toUpperCase(), toHex(L, C, H + 30)],
    },
    {
      name: "Triadic",
      colors: [baseColorHex.toUpperCase(), toHex(L, C, H + 120), toHex(L, C, H + 240)],
    },
    {
      name: "Split Complementary",
      colors: [baseColorHex.toUpperCase(), toHex(L, C, H + 150), toHex(L, C, H + 210)],
    },
    {
      name: "Monochromatic",
      colors: [
        toHex(Math.min(95, L + 25), Math.max(10, C - 20), H),
        baseColorHex.toUpperCase(),
        toHex(Math.max(10, L - 25), Math.min(95, C + 10), H),
      ],
    },
    {
      name: "Tetradic",
      colors: [
        baseColorHex.toUpperCase(),
        toHex(L, C, H + 90),
        toHex(L, C, H + 180),
        toHex(L, C, H + 270),
      ],
    },
  ];
};

// Infer a creative name for the palette based on hue
export const inferColorName = (hex: string): string => {
  const color = chroma(hex);
  const h = isNaN(color.lch()[2]) ? 0 : color.lch()[2];

  const prefix = [
    "Aurora", "Eclipse", "Stellar", "Cosmic", "Oceanic", "Cyber", "Amber", "Vibrant", 
    "Radiant", "Velvet", "Vintage", "Solar", "Whispering", "Dynamic", "Polished", "Organic"
  ];
  
  let baseName = "Slate";

  if (h >= 0 && h < 20) baseName = "Crimson";
  else if (h >= 20 && h < 45) baseName = "Coral";
  else if (h >= 45 && h < 75) baseName = "Amber";
  else if (h >= 75 && h < 140) baseName = "Emerald";
  else if (h >= 140 && h < 175) baseName = "Teal";
  else if (h >= 175 && h < 210) baseName = "Cyan";
  else if (h >= 210 && h < 255) baseName = "Azure";
  else if (h >= 255 && h < 290) baseName = "Indigo";
  else if (h >= 290 && h < 330) baseName = "Amethyst";
  else if (h >= 330 && h < 360) baseName = "Fuchsia";

  const pIdx = Math.floor((h * 13) % prefix.length);
  return `${prefix[pIdx]} ${baseName}`;
};

// Contrast scoring recommendations
export const getContrastLabel = (ratio: number): { score: string; text: string; bg: string } => {
  if (ratio >= 7) {
    return { score: "AAA", text: "text-white bg-emerald-600 font-extrabold shadow-sm", bg: "Passes AAA compliance (highly readable)." };
  }
  if (ratio >= 4.5) {
    return { score: "AA", text: "text-white bg-green-500 font-extrabold shadow-sm", bg: "Passes AA compliance (good readability)." };
  }
  if (ratio >= 3) {
    return { score: "A", text: "text-amber-950 bg-amber-400 font-extrabold shadow-sm", bg: "Passes A compliance (minimum for large fonts)." };
  }
  return { score: "Fail", text: "text-white bg-rose-600 font-extrabold shadow-sm", bg: "Fails WCAG accessibility guidelines." };
};

// Export Code Generators
export const generateTailwindConfig = (
  paletteName: string,
  shades: PaletteShade[],
  secondary: PaletteShade[],
  neutrals: PaletteShade[],
  success: PaletteShade[],
  warning: PaletteShade[],
  error: PaletteShade[]
): string => {
  const isSingleScale = !secondary?.length && !neutrals?.length && !success?.length && !warning?.length && !error?.length;

  const buildTWConfig = (list: PaletteShade[], indent = "        ") => {
    return list.map((s) => {
      const cleanLevel = s.level.includes("-Base") ? `"${s.level.replace("-Base", "")}"` : s.level;
      return `${indent}${cleanLevel}: "${s.hex.toUpperCase()}",`;
    }).join("\n");
  };

  const slug = paletteName.toLowerCase().replace(/\s+/g, "-");

  if (isSingleScale) {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        "${slug}": {
${buildTWConfig(shades)}
        }
      }
    }
  }
};`;
  }

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        "${slug}-primary": {
${buildTWConfig(shades)}
        },
        "${slug}-secondary": {
${buildTWConfig(secondary)}
        },
        "${slug}-neutral": {
${buildTWConfig(neutrals)}
        },
        "success": {
${buildTWConfig(success)}
        },
        "warning": {
${buildTWConfig(warning)}
        },
        "error": {
${buildTWConfig(error)}
        }
      }
    }
  }
};`;
};

export const generateCSSVariables = (
  shades: PaletteShade[],
  secondary: PaletteShade[],
  neutrals: PaletteShade[],
  success: PaletteShade[],
  warning: PaletteShade[],
  error: PaletteShade[],
  paletteName?: string
): string => {
  const isSingleScale = !secondary?.length && !neutrals?.length && !success?.length && !warning?.length && !error?.length;

  const buildCSSVars = (list: PaletteShade[], prefix: string) => {
    return list.map((s) => {
      const cleanLevel = s.level.replace("-Base", "");
      return `  --color-${prefix}-${cleanLevel}: ${s.hex.toUpperCase()};`;
    }).join("\n");
  };

  if (isSingleScale) {
    const prefix = (paletteName || "primary").toLowerCase().replace(/\s+/g, "-");
    return `:root {
  /* ${paletteName || "Primary"} Scale */
${buildCSSVars(shades, prefix)}
}`;
  }

  return `:root {
  /* Primary Scale */
${buildCSSVars(shades, "primary")}

  /* Secondary Scale */
${buildCSSVars(secondary, "secondary")}

  /* Neutral Scale */
${buildCSSVars(neutrals, "neutral")}

  /* Success Scale */
${buildCSSVars(success, "success")}

  /* Warning Scale */
${buildCSSVars(warning, "warning")}

  /* Error Scale */
${buildCSSVars(error, "error")}
}`;
};

export const generateJSONTokens = (
  shades: PaletteShade[],
  secondary: PaletteShade[],
  neutrals: PaletteShade[],
  success: PaletteShade[],
  warning: PaletteShade[],
  error: PaletteShade[],
  paletteName?: string
): string => {
  const isSingleScale = !secondary?.length && !neutrals?.length && !success?.length && !warning?.length && !error?.length;

  const getShadesObj = (list: PaletteShade[]) => {
    const obj: Record<string, string> = {};
    list.forEach((s) => {
      const cleanLevel = s.level.replace("-Base", "");
      obj[cleanLevel] = s.hex.toUpperCase();
    });
    return obj;
  };

  if (isSingleScale) {
    const prefix = (paletteName || "primary").toLowerCase().replace(/\s+/g, "-");
    const tokens = {
      [prefix]: getShadesObj(shades),
    };
    return JSON.stringify(tokens, null, 2);
  }

  const tokens = {
    primary: getShadesObj(shades),
    secondary: getShadesObj(secondary),
    neutral: getShadesObj(neutrals),
    success: getShadesObj(success),
    warning: getShadesObj(warning),
    error: getShadesObj(error)
  };

  return JSON.stringify(tokens, null, 2);
};

export const generateFigmaTokens = (
  shades: PaletteShade[],
  secondary: PaletteShade[],
  neutrals: PaletteShade[],
  success: PaletteShade[],
  warning: PaletteShade[],
  error: PaletteShade[],
  paletteName?: string
): string => {
  const isSingleScale = !secondary?.length && !neutrals?.length && !success?.length && !warning?.length && !error?.length;

  const buildGroup = (list: PaletteShade[], rampName: string) => {
    const group: Record<string, any> = {};
    list.forEach((s) => {
      const cleanLevel = s.level.replace("-Base", "");
      const c = chroma(s.hex);
      const rgbArray = c.rgb();
      const components = [
        rgbArray[0] / 255,
        rgbArray[1] / 255,
        rgbArray[2] / 255
      ];
      
      group[`${rampName}-${cleanLevel}`] = {
        "$type": "color",
        "$value": {
          "colorSpace": "srgb",
          "components": components,
          "alpha": 1,
          "hex": s.hex.toUpperCase()
        },
        "$extensions": {
          "com.figma.scopes": [
            "ALL_SCOPES"
          ]
        }
      };
    });
    return group;
  };

  if (isSingleScale) {
    const prefix = (paletteName || "primary").toLowerCase().replace(/\s+/g, "-");
    const groupName = paletteName || "Primary";
    const tokens = {
      "Colors": {
        [groupName]: buildGroup(shades, prefix)
      }
    };
    return JSON.stringify(tokens, null, 2);
  }

  const tokens = {
    "Colors": {
      "Primary": buildGroup(shades, "primary"),
      "Secondary": buildGroup(secondary, "secondary"),
      "Neutral": buildGroup(neutrals, "neutral"),
      "Success": buildGroup(success, "success"),
      "Warning": buildGroup(warning, "warning"),
      "Error": buildGroup(error, "error")
    }
  };

  return JSON.stringify(tokens, null, 2);
};

// ── Multi-scale generators (for "Export All" reference scales) ──────────────

export interface NamedScale {
  name: string;
  shades: PaletteShade[];
}

export const generateMultiScaleTailwind = (scales: NamedScale[]): string => {
  const entries = scales.map(({ name, shades }) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const rows = shades
      .map((s) => {
        const lvl = s.level.replace("-Base", "");
        return `          "${lvl}": "${s.hex.toUpperCase()}",`;
      })
      .join("\n");
    return `        "${slug}": {\n${rows}\n        },`;
  });

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
${entries.join("\n")}
      }
    }
  }
};`;
};

export const generateMultiScaleCSS = (scales: NamedScale[]): string => {
  const blocks = scales.map(({ name, shades }) => {
    const prefix = name.toLowerCase().replace(/\s+/g, "-");
    const rows = shades
      .map((s) => `  --color-${prefix}-${s.level.replace("-Base", "")}: ${s.hex.toUpperCase()};`)
      .join("\n");
    return `  /* ${name} */\n${rows}`;
  });

  return `:root {\n${blocks.join("\n\n")}\n}`;
};

export const generateMultiScaleJSON = (scales: NamedScale[]): string => {
  const obj: Record<string, Record<string, string>> = {};
  scales.forEach(({ name, shades }) => {
    const key = name.toLowerCase().replace(/\s+/g, "-");
    obj[key] = {};
    shades.forEach((s) => {
      obj[key][s.level.replace("-Base", "")] = s.hex.toUpperCase();
    });
  });
  return JSON.stringify(obj, null, 2);
};

export const generateMultiScaleFigma = (scales: NamedScale[]): string => {
  const groups: Record<string, Record<string, any>> = {};
  scales.forEach(({ name, shades }) => {
    const ramp = name.toLowerCase().replace(/\s+/g, "-");
    const group: Record<string, any> = {};
    shades.forEach((s) => {
      const lvl = s.level.replace("-Base", "");
      const c = chroma(s.hex);
      const rgb = c.rgb();
      group[`${ramp}-${lvl}`] = {
        "$type": "color",
        "$value": {
          colorSpace: "srgb",
          components: [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255],
          alpha: 1,
          hex: s.hex.toUpperCase(),
        },
        "$extensions": { "com.figma.scopes": ["ALL_SCOPES"] },
      };
    });
    groups[name] = group;
  });
  return JSON.stringify({ Colors: groups }, null, 2);
};

// Robust color parser to parse HEX, HSL, RGB, and HSB/HSV strings
export const parseAnyColor = (input: string): string | null => {
  const str = input.trim().toLowerCase();

  // 1. Try native chroma parsing first
  try {
    if (chroma.valid(str)) {
      return chroma(str).hex().toUpperCase();
    }
  } catch (e) {}

  // 2. Hex fallback (e.g. "c54b7a" without #)
  if (/^[0-9a-f]{3,8}$/i.test(str)) {
    const hex = "#" + str;
    if (chroma.valid(hex)) {
      return chroma(hex).hex().toUpperCase();
    }
  }

  // 3. HSB/HSV parsing (e.g. "hsb(335, 62%, 77%)" or "hsv(335, 62, 77)")
  const hsbRegex = /^(?:hsb|hsv)a?\(\s*([0-9.]+)(?:deg)?\s*,\s*([0-9.]+)%?\s*,\s*([0-9.]+)%?(?:\s*,\s*([0-9.]+))?\s*\)/i;
  const hsbMatch = str.match(hsbRegex);
  if (hsbMatch) {
    const h = parseFloat(hsbMatch[1]);
    const s = parseFloat(hsbMatch[2]) / 100;
    const v = parseFloat(hsbMatch[3]) / 100;
    try {
      return chroma.hsv(h, s, v).hex().toUpperCase();
    } catch (e) {}
  }

  // 4. Raw comma separated formats: E.g., "197, 75, 122" or "335, 51%, 53%"
  const commaRegex = /^\s*([0-9.]+)\s*%?\s*,\s*([0-9.]+)\s*%?\s*,\s*([0-9.]+)\s*%?\s*$/;
  const commaMatch = str.match(commaRegex);
  if (commaMatch) {
    const v1 = parseFloat(commaMatch[1]);
    const v2 = parseFloat(commaMatch[2]);
    const v3 = parseFloat(commaMatch[3]);

    if (v2 <= 100 && v3 <= 100) {
      try {
        const c = chroma.hsl(v1, v2 / 100, v3 / 100);
        return c.hex().toUpperCase();
      } catch (e) {}
    }
    if (v1 <= 255 && v2 <= 255 && v3 <= 255) {
      try {
        const c = chroma(v1, v2, v3);
        return c.hex().toUpperCase();
      } catch (e) {}
    }
  }

  return null;
};

