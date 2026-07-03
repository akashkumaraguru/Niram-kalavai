export interface TypographyStyle {
  id: string; // e.g. "h1", "body-medium"
  name: string; // e.g. "H1", "Body Medium"
  step: number; // Scale step, e.g. 6 for H1, 0 for Body Medium
  sizePx: number;
  lineHeight: number;
  letterSpacing: number; // in em
  fontWeight: number;
  isOverridden?: boolean;
  isCustom?: boolean;
}

export interface StyleDefinition {
  id: string;
  name: string;
  step: number;
  weight: number;
  lh: number;
  ls: number;
  isCustom?: boolean;
}

export interface TypographySystem {
  name: string;
  fontFamily: string;
  baseSize: number;
  scaleRatio: number;
  scaleMethod: string; // e.g. "Major Third (1.250)"
  rounding: "integer" | "decimal" | "none";
  namingConvention: "camelCase" | "kebab-case" | "snake_case" | "PascalCase";
  responsiveScale: "none" | "stepped" | "fluid";
  styles: TypographyStyle[];
}

export const SCALES = [
  { name: "Minor Second", ratio: 1.067, label: "1.067 - Minor Second" },
  { name: "Major Second", ratio: 1.125, label: "1.125 - Major Second" },
  { name: "Minor Third", ratio: 1.200, label: "1.200 - Minor Third" },
  { name: "Major Third", ratio: 1.250, label: "1.250 - Major Third" },
  { name: "Perfect Fourth", ratio: 1.333, ratioVal: 1.333, label: "1.333 - Perfect Fourth" },
  { name: "Augmented Fourth", ratio: 1.414, label: "1.414 - Aug. Fourth" },
  { name: "Perfect Fifth", ratio: 1.500, label: "1.500 - Perfect Fifth" },
  { name: "Golden Ratio", ratio: 1.618, label: "1.618 - Golden Ratio" },
];

export const STYLE_DEFAULTS: { id: string; name: string; step: number; weight: number; lh: number; ls: number }[] = [
  { id: "h1", name: "H1", step: 6, weight: 800, lh: 1.15, ls: -0.025 },
  { id: "h2", name: "H2", step: 5, weight: 700, lh: 1.2, ls: -0.02 },
  { id: "h3", name: "H3", step: 4, weight: 700, lh: 1.25, ls: -0.015 },
  { id: "h4", name: "H4", step: 3, weight: 600, lh: 1.3, ls: -0.01 },
  { id: "h5", name: "H5", step: 2, weight: 600, lh: 1.35, ls: -0.005 },
  { id: "h6", name: "H6", step: 1, weight: 600, lh: 1.4, ls: 0 },
  { id: "body-large", name: "Body Large", step: 0.5, weight: 400, lh: 1.5, ls: 0 },
  { id: "body-medium", name: "Body Medium", step: 0, weight: 400, lh: 1.5, ls: 0 },
  { id: "body-small", name: "Body Small", step: -0.5, weight: 400, lh: 1.5, ls: 0.005 },
  { id: "caption", name: "Caption", step: -1.5, weight: 400, lh: 1.4, ls: 0.01 },
  { id: "label-large", name: "Label Large", step: 0, weight: 500, lh: 1.3, ls: 0.01 },
  { id: "label-medium", name: "Label Medium", step: -1, weight: 500, lh: 1.3, ls: 0.015 },
  { id: "label-small", name: "Label Small", step: -2, weight: 500, lh: 1.3, ls: 0.02 },
  { id: "button", name: "Button", step: -0.5, weight: 600, lh: 1.2, ls: 0.025 },
];

export const formatName = (id: string, convention: TypographySystem["namingConvention"]): string => {
  const parts = id.split("-");
  switch (convention) {
    case "camelCase":
      return parts.map((p, idx) => (idx === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1))).join("");
    case "snake_case":
      return parts.join("_");
    case "PascalCase":
      return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
    case "kebab-case":
    default:
      return id;
  }
};

export const calculateSize = (
  baseSize: number,
  ratio: number,
  step: number,
  rounding: TypographySystem["rounding"]
): number => {
  const calculated = baseSize * Math.pow(ratio, step);
  if (rounding === "integer") {
    return Math.round(calculated);
  } else if (rounding === "decimal") {
    return Number(calculated.toFixed(1));
  } else {
    return Number(calculated.toFixed(2));
  }
};

export const generateStyles = (
  baseSize: number,
  ratio: number,
  rounding: TypographySystem["rounding"],
  defs: StyleDefinition[],
  overrides: Record<string, Partial<TypographyStyle>> = {}
): TypographyStyle[] => {
  return defs.map((def) => {
    const calculatedSize = calculateSize(baseSize, ratio, def.step, rounding);
    const ov = overrides[def.id] || {};
    return {
      id: def.id,
      name: def.name,
      step: def.step,
      sizePx: ov.sizePx !== undefined ? ov.sizePx : calculatedSize,
      lineHeight: ov.lineHeight !== undefined ? ov.lineHeight : def.lh,
      letterSpacing: ov.letterSpacing !== undefined ? ov.letterSpacing : def.ls,
      fontWeight: ov.fontWeight !== undefined ? ov.fontWeight : def.weight,
      isOverridden: Object.keys(ov).length > 0,
      isCustom: def.isCustom,
    };
  });
};

// ── Code Exporters ───────────────────────────────────────────────────────────

export const exportAsJSON = (system: TypographySystem): string => {
  const formatted: Record<string, any> = {
    fontFamily: system.fontFamily,
    baseSize: `${system.baseSize}px`,
    scaleRatio: system.scaleRatio,
    rounding: system.rounding,
    styles: {},
  };
  system.styles.forEach((st) => {
    const key = formatName(st.id, system.namingConvention);
    formatted.styles[key] = {
      fontSize: `${st.sizePx}px`,
      lineHeight: st.lineHeight,
      letterSpacing: `${st.letterSpacing}em`,
      fontWeight: st.fontWeight,
    };
  });
  return JSON.stringify(formatted, null, 2);
};

export const exportAsDesignTokens = (system: TypographySystem): string => {
  const tokens: Record<string, any> = {
    fontFamily: {
      $type: "fontFamily",
      $value: system.fontFamily,
    },
    baseSize: {
      $type: "dimension",
      $value: `${system.baseSize}px`,
    },
  };

  system.styles.forEach((st) => {
    const key = formatName(st.id, system.namingConvention);
    tokens[key] = {
      fontSize: {
        $type: "dimension",
        $value: `${st.sizePx}px`,
      },
      lineHeight: {
        $type: "number",
        $value: st.lineHeight,
      },
      letterSpacing: {
        $type: "dimension",
        $value: `${st.letterSpacing}em`,
      },
      fontWeight: {
        $type: "number",
        $value: st.fontWeight,
      },
    };
  });

  return JSON.stringify(tokens, null, 2);
};

export const exportAsCSSVariables = (system: TypographySystem): string => {
  const lines: string[] = [
    `/* Typography: ${system.name} */`,
    `:root {`,
    `  --font-family: '${system.fontFamily}', sans-serif;`,
    `  --base-font-size: ${system.baseSize}px;`,
    ``,
  ];

  system.styles.forEach((st) => {
    const key = formatName(st.id, system.namingConvention);
    lines.push(`  /* ${st.name} */`);
    lines.push(`  --text-${key}-size: ${st.sizePx}px;`);
    lines.push(`  --text-${key}-line-height: ${st.lineHeight};`);
    lines.push(`  --text-${key}-letter-spacing: ${st.letterSpacing}em;`);
    lines.push(`  --text-${key}-weight: ${st.fontWeight};`);
    lines.push(``);
  });

  lines.push(`}`);
  return lines.join("\n");
};

export const exportAsSCSS = (system: TypographySystem): string => {
  const lines: string[] = [
    `// Typography Variables: ${system.name}`,
    `$font-family: '${system.fontFamily}', sans-serif;`,
    `$base-font-size: ${system.baseSize}px;`,
    ``,
  ];

  system.styles.forEach((st) => {
    const key = formatName(st.id, system.namingConvention);
    lines.push(`// ${st.name}`);
    lines.push(`$text-${key}-size: ${st.sizePx}px;`);
    lines.push(`$text-${key}-line-height: ${st.lineHeight};`);
    lines.push(`$text-${key}-letter-spacing: ${st.letterSpacing}em;`);
    lines.push(`$text-${key}-weight: ${st.fontWeight};`);
    lines.push(``);
  });

  return lines.join("\n");
};

export const exportAsTailwindConfig = (system: TypographySystem): string => {
  const stylesObj: string[] = [];
  system.styles.forEach((st) => {
    const key = formatName(st.id, system.namingConvention);
    stylesObj.push(
      `        '${key}': ['${st.sizePx}px', { lineHeight: '${st.lineHeight}', letterSpacing: '${st.letterSpacing}em', fontWeight: '${st.fontWeight}' }],`
    );
  });

  return `module.exports = {
  theme: {
    extend: {
      fontFamily: {
        primary: ['${system.fontFamily}', 'sans-serif'],
      },
      fontSize: {
${stylesObj.join("\n")}
      }
    }
  }
};`;
};

export const exportAsReactTheme = (system: TypographySystem): string => {
  const styleConfigs: string[] = [];
  system.styles.forEach((st) => {
    const key = formatName(st.id, system.namingConvention);
    styleConfigs.push(`    ${key}: {
      fontFamily: "'${system.fontFamily}', sans-serif",
      fontSize: '${st.sizePx}px',
      lineHeight: ${st.lineHeight},
      letterSpacing: '${st.letterSpacing}em',
      fontWeight: ${st.fontWeight},
    },`);
  });

  return `import React from 'react';

export const typographyTheme = {
  fontFamily: "'${system.fontFamily}', sans-serif",
  baseSize: ${system.baseSize},
  styles: {
${styleConfigs.join("\n")}
  }
};

// Example Hook or Context Usage
export const TypographyContext = React.createContext(typographyTheme);
export const useTypography = () => React.useContext(TypographyContext);
`;
};

export const exportAsFlutterTheme = (system: TypographySystem): string => {
  const stylesDart: string[] = [];
  system.styles.forEach((st) => {
    const key = formatName(st.id, system.namingConvention).replace(/-./g, (x) => x[1].toUpperCase());
    stylesDart.push(`  TextStyle get ${key} => TextStyle(
    fontFamily: '${system.fontFamily}',
    fontSize: ${st.sizePx.toFixed(1)},
    height: ${st.lineHeight.toFixed(2)},
    letterSpacing: ${(st.letterSpacing * st.sizePx).toFixed(2)}, // em converted to pixels
    fontWeight: FontWeight.w${st.fontWeight},
  );`);
  });

  return `import 'package:flutter/material.dart';

class AppTypography {
  static const double baseFontSize = ${system.baseSize.toFixed(1)};
  static const String fontFamily = '${system.fontFamily}';

${stylesDart.join("\n\n")}
}
`;
};

export const exportAsAndroidXML = (system: TypographySystem): string => {
  const stylesXml: string[] = [];
  system.styles.forEach((st) => {
    const key = formatName(st.id, "PascalCase");
    stylesXml.push(`    <!-- ${st.name} style -->
    <style name="Typography.${key}">
        <item name="android:fontFamily">@font/${system.fontFamily.toLowerCase().replace(/\s+/g, "_")}</item>
        <item name="android:textSize">${st.sizePx}sp</item>
        <item name="android:lineSpacingMultiplier">${st.lineHeight}</item>
        <item name="android:letterSpacing">${st.letterSpacing}</item>
        <item name="android:textFontWeight">${st.fontWeight}</item>
    </style>`);
  });

  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
${stylesXml.join("\n\n")}
</resources>
`;
};

export const exportAsIOSSwift = (system: TypographySystem): string => {
  const stylesSwift: string[] = [];
  system.styles.forEach((st) => {
    const key = formatName(st.id, "camelCase");
    const weightName =
      st.fontWeight >= 900
        ? ".black"
        : st.fontWeight >= 800
        ? ".heavy"
        : st.fontWeight >= 700
        ? ".bold"
        : st.fontWeight >= 600
        ? ".semibold"
        : st.fontWeight >= 500
        ? ".medium"
        : st.fontWeight >= 400
        ? ".regular"
        : ".light";

    stylesSwift.push(`    static func ${key}() -> Font {
        return Font.custom("${system.fontFamily}", size: ${st.sizePx})
            .weight(${weightName})
    }`);
  });

  return `import SwiftUI

struct AppTypography {
    static let fontFamily = "${system.fontFamily}"
    static let baseFontSize: CGFloat = ${system.baseSize}

${stylesSwift.join("\n\n")}
}
`;
};

export const exportAsFigmaVariables = (system: TypographySystem): string => {
  const vars: any[] = [
    { name: "typography/font-family", type: "STRING", value: system.fontFamily },
    { name: "typography/base-size", type: "FLOAT", value: system.baseSize },
  ];

  system.styles.forEach((st) => {
    const key = formatName(st.id, system.namingConvention);
    vars.push({ name: `typography/${key}/font-size`, type: "FLOAT", value: st.sizePx });
    vars.push({ name: `typography/${key}/line-height`, type: "FLOAT", value: st.lineHeight });
    vars.push({ name: `typography/${key}/letter-spacing`, type: "FLOAT", value: st.letterSpacing });
    vars.push({ name: `typography/${key}/font-weight`, type: "FLOAT", value: st.fontWeight });
  });

  const collection = {
    collections: [
      {
        name: "Typography Variables",
        modes: ["Default"],
        variables: vars,
      },
    ],
  };

  return JSON.stringify(collection, null, 2);
};

export const exportAsTokenStudio = (system: TypographySystem): string => {
  const ts: Record<string, any> = {
    fontFamilies: {
      primary: { value: system.fontFamily, type: "fontFamilies" },
    },
    fontSizes: {},
    lineHeights: {},
    letterSpacing: {},
    fontWeights: {},
  };

  system.styles.forEach((st) => {
    const key = formatName(st.id, system.namingConvention);
    ts.fontSizes[key] = { value: `${st.sizePx}px`, type: "fontSizes" };
    ts.lineHeights[key] = { value: String(st.lineHeight), type: "lineHeights" };
    ts.letterSpacing[key] = { value: `${st.letterSpacing}em`, type: "letterSpacing" };
    ts.fontWeights[key] = { value: String(st.fontWeight), type: "fontWeights" };
  });

  return JSON.stringify(ts, null, 2);
};
