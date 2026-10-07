import { isRecord } from "./validation";
import { generateShades, type FullPalette, type PaletteShade } from "./paletteUtils";
import { STYLE_DEFAULTS, type StyleDefinition, type TypographyStyle, type TypographySystem } from "./typographyUtils";

const finite = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
const hex = (value: unknown): value is string => typeof value === "string" && /^#[a-f\d]{6}$/i.test(value);
const text = (value: unknown, fallback: string): string => typeof value === "string" && value.trim() ? value.trim() : fallback;

function validShades(value: unknown): value is PaletteShade[] {
  return Array.isArray(value) && value.length > 0 && value.every(shade => isRecord(shade)
    && typeof shade.level === "string" && /^(?:50|[1-9]00|950)(?:-Base)?$/.test(shade.level)
    && hex(shade.hex) && typeof shade.rgb === "string" && typeof shade.hsl === "string"
    && finite(shade.contrastOnWhite, 1, 21) && finite(shade.contrastOnBlack, 1, 21));
}

export function validatePalette(value: unknown): FullPalette | null {
  if (!isRecord(value) || !text(value.name, "") || !hex(value.baseColor) || !validShades(value.shades)) return null;
  const colorFromScale = (color: unknown, scale: unknown, fallback: string): string => {
    if (hex(color)) return color;
    if (validShades(scale)) return scale.find(s => s.level.replace("-Base", "") === "500")?.hex ?? fallback;
    return fallback;
  };
  const secondaryColor = colorFromScale(value.secondaryColor, value.secondary, "#8B5CF6");
  const neutralColor = colorFromScale(value.neutralColor, value.neutrals, "#9E9E9E");
  const successColor = colorFromScale(value.successColor, value.success, "#4CAF50");
  const infoColor = colorFromScale(value.infoColor, value.info, "#2196F3");
  const warningColor = colorFromScale(value.warningColor, value.warning, "#FFEB3B");
  const errorColor = colorFromScale(value.errorColor, value.error, "#F44336");
  return {
    name: text(value.name, "").slice(0, 32), description: text(value.description, ""), createdDate: text(value.createdDate, ""),
    baseColor: value.baseColor, shades: value.shades, secondaryColor, neutralColor, successColor, infoColor, warningColor, errorColor,
    secondary: validShades(value.secondary) ? value.secondary : generateShades(secondaryColor),
    neutrals: validShades(value.neutrals) ? value.neutrals : generateShades(neutralColor),
    success: validShades(value.success) ? value.success : generateShades(successColor),
    info: validShades(value.info) ? value.info : generateShades(infoColor),
    warning: validShades(value.warning) ? value.warning : generateShades(warningColor),
    error: validShades(value.error) ? value.error : generateShades(errorColor),
    neutralType: text(value.neutralType, "zinc"), harmonyMode: text(value.harmonyMode, "Complementary"),
    headingFont: text(value.headingFont, "Outfit"), bodyFont: text(value.bodyFont, "Inter"), lockedShades: [],
    lightnessModifier: finite(value.lightnessModifier, -1, 1) ? value.lightnessModifier : 0,
    saturationModifier: finite(value.saturationModifier, -1, 1) ? value.saturationModifier : 0,
    fontsSynced: value.fontsSynced === true,
  };
}

function validStyle(value: unknown): value is TypographyStyle {
  return isRecord(value) && typeof value.id === "string" && /^[a-z][a-z\d_-]*$/i.test(value.id)
    && typeof value.name === "string" && finite(value.step, -100, 100) && finite(value.sizePx, 0.01, 100000)
    && finite(value.fontWeight, 100, 900) && finite(value.lineHeight, 0.5, 3) && finite(value.letterSpacing, -0.2, 0.5);
}

export function restoreStyleDefinitions(preset: TypographySystem): StyleDefinition[] {
  return preset.styles.map(style => {
    const baseline = preset.styleDefs?.find(def => def.id === style.id) ?? STYLE_DEFAULTS.find(def => def.id === style.id);
    return {
      id: style.id, name: style.name, step: style.step, isCustom: style.isCustom,
      weight: baseline?.weight ?? 700, lh: baseline?.lh ?? 1.2, ls: baseline?.ls ?? -0.02,
    };
  });
}

export function validateTypographyPreset(value: unknown): TypographySystem | null {
  if (!isRecord(value) || !text(value.name, "") || typeof value.fontFamily !== "string"
    || !/^[\w -]+$/.test(value.fontFamily) || !finite(value.baseSize, 1, 200) || !finite(value.scaleRatio, 1, 3)
    || !Array.isArray(value.styles) || !value.styles.every(validStyle)) return null;
  if (new Set(value.styles.map(style => style.id)).size !== value.styles.length) return null;
  const styleDefs: StyleDefinition[] = Array.isArray(value.styleDefs) ? value.styleDefs.filter((def): def is StyleDefinition =>
    isRecord(def) && typeof def.id === "string" && typeof def.name === "string" && finite(def.step, -100, 100)
    && finite(def.weight, 100, 900) && finite(def.lh, 0.5, 3) && finite(def.ls, -0.2, 0.5)) : [];
  return {
    name: text(value.name, "").slice(0, 64), fontFamily: value.fontFamily, baseSize: value.baseSize, scaleRatio: value.scaleRatio,
    scaleMethod: text(value.scaleMethod, "Custom"),
    rounding: value.rounding === "none" || value.rounding === "decimal" ? value.rounding : "integer",
    namingConvention: value.namingConvention === "kebab-case" || value.namingConvention === "snake_case" || value.namingConvention === "PascalCase" ? value.namingConvention : "camelCase",
    responsiveScale: value.responsiveScale === "stepped" || value.responsiveScale === "fluid" ? value.responsiveScale : "none",
    styles: value.styles, styleDefs,
  };
}
