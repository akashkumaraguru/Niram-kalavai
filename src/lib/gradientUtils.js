// Gradient utilities: build CSS strings and export to PNG via Gradient
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
  chaos: 0.5,
  grain: 0.3,
  seed: 1,
  blur: 150,
  pattern: "fine",
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
  return `radial-gradient(${g.shape || "circle"} farthest-corner at ${g.pos_x}% ${g.pos_y}%, ${stops})`;
};

export const buildGradientSVG = (g) => {
  const stops = sortStops(g.stops);
  const stopTags = stops
    .map((s) => `<stop offset="${s.position}%" stop-color="${s.color}" stop-opacity="${((s.opacity ?? 100) / 100).toFixed(2)}" />`)
    .join("\n    ");

  let gradDef;
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

// Export current gradient to a PNG by drawing on an offscreen Gradient
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
    "name": "Warm Flame",
    "config": {
      "type": "linear",
      "angle": 45,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_001_0",
          "color": "#FF9A9E",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_001_1",
          "color": "#FAD0C4",
          "position": 99,
          "opacity": 100
        },
        {
          "id": "wg_001_2",
          "color": "#FAD0C4",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Night Fade",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_002_0",
          "color": "#A18CD1",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_002_1",
          "color": "#FBC2EB",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Spring Warmth",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_003_0",
          "color": "#FAD0C4",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_003_1",
          "color": "#FAD0C4",
          "position": 1,
          "opacity": 100
        },
        {
          "id": "wg_003_2",
          "color": "#FFD1FF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Juicy Peach",
    "config": {
      "type": "linear",
      "angle": 90,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_004_0",
          "color": "#FFECD2",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_004_1",
          "color": "#FCB69F",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Young Passion",
    "config": {
      "type": "linear",
      "angle": 90,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_005_0",
          "color": "#FF8177",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_005_1",
          "color": "#FF867A",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_005_2",
          "color": "#FF8C7F",
          "position": 21,
          "opacity": 100
        },
        {
          "id": "wg_005_3",
          "color": "#F99185",
          "position": 52,
          "opacity": 100
        },
        {
          "id": "wg_005_4",
          "color": "#CF556C",
          "position": 78,
          "opacity": 100
        },
        {
          "id": "wg_005_5",
          "color": "#B12A5B",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Lady Lips",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_006_0",
          "color": "#FF9A9E",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_006_1",
          "color": "#FECFEF",
          "position": 99,
          "opacity": 100
        },
        {
          "id": "wg_006_2",
          "color": "#FECFEF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Sunny Morning",
    "config": {
      "type": "linear",
      "angle": 120,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_007_0",
          "color": "#F6D365",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_007_1",
          "color": "#FDA085",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Rainy Ashville",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_008_0",
          "color": "#FBC2EB",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_008_1",
          "color": "#A6C1EE",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Frozen Dreams",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_009_0",
          "color": "#FDCBF1",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_009_1",
          "color": "#FDCBF1",
          "position": 1,
          "opacity": 100
        },
        {
          "id": "wg_009_2",
          "color": "#E6DEE9",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Winter Neva",
    "config": {
      "type": "linear",
      "angle": 120,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_010_0",
          "color": "#A1C4FD",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_010_1",
          "color": "#C2E9FB",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Dusty Grass",
    "config": {
      "type": "linear",
      "angle": 120,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_011_0",
          "color": "#D4FC79",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_011_1",
          "color": "#96E6A1",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Tempting Azure",
    "config": {
      "type": "linear",
      "angle": 120,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_012_0",
          "color": "#84FAB0",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_012_1",
          "color": "#8FD3F4",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Heavy Rain",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_013_0",
          "color": "#CFD9DF",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_013_1",
          "color": "#E2EBF0",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Amy Crisp",
    "config": {
      "type": "linear",
      "angle": 120,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_014_0",
          "color": "#A6C0FE",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_014_1",
          "color": "#F68084",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Mean Fruit",
    "config": {
      "type": "linear",
      "angle": 120,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_015_0",
          "color": "#FCCB90",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_015_1",
          "color": "#D57EEB",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Deep Blue",
    "config": {
      "type": "linear",
      "angle": 120,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_016_0",
          "color": "#E0C3FC",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_016_1",
          "color": "#8EC5FC",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Ripe Malinka",
    "config": {
      "type": "linear",
      "angle": 120,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_017_0",
          "color": "#F093FB",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_017_1",
          "color": "#F5576C",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Cloudy Knoxville",
    "config": {
      "type": "linear",
      "angle": 120,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_018_0",
          "color": "#FDFBFB",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_018_1",
          "color": "#EBEDEE",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Malibu Beach",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_019_0",
          "color": "#4FACFE",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_019_1",
          "color": "#00F2FE",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "New Life",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_020_0",
          "color": "#43E97B",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_020_1",
          "color": "#38F9D7",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "True Sunset",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_021_0",
          "color": "#FA709A",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_021_1",
          "color": "#FEE140",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Morpheus Den",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_022_0",
          "color": "#30CFD0",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_022_1",
          "color": "#330867",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Rare Wind",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_023_0",
          "color": "#A8EDEA",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_023_1",
          "color": "#FED6E3",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Near Moon",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_024_0",
          "color": "#5EE7DF",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_024_1",
          "color": "#B490CA",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Wild Apple",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_025_0",
          "color": "#D299C2",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_025_1",
          "color": "#FEF9D7",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Saint Petersburg",
    "config": {
      "type": "linear",
      "angle": 135,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_026_0",
          "color": "#F5F7FA",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_026_1",
          "color": "#C3CFE2",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Arielles Smile",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_027_0",
          "color": "#16D9E3",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_027_1",
          "color": "#30C7EC",
          "position": 47,
          "opacity": 100
        },
        {
          "id": "wg_027_2",
          "color": "#46AEF7",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Plum Plate",
    "config": {
      "type": "linear",
      "angle": 135,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_028_0",
          "color": "#667EEA",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_028_1",
          "color": "#764BA2",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Everlasting Sky",
    "config": {
      "type": "linear",
      "angle": 135,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_029_0",
          "color": "#FDFCFB",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_029_1",
          "color": "#E2D1C3",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Happy Fisher",
    "config": {
      "type": "linear",
      "angle": 120,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_030_0",
          "color": "#89F7FE",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_030_1",
          "color": "#66A6FF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Blessing",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_031_0",
          "color": "#FDDB92",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_031_1",
          "color": "#D1FDFF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Sharpeye Eagle",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_032_0",
          "color": "#9890E3",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_032_1",
          "color": "#B1F4CF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Ladoga Bottom",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_033_0",
          "color": "#EBC0FD",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_033_1",
          "color": "#D9DED8",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Lemon Gate",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_034_0",
          "color": "#96FBC4",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_034_1",
          "color": "#F9F586",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Itmeo Branding",
    "config": {
      "type": "linear",
      "angle": 180,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_035_0",
          "color": "#2AF598",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_035_1",
          "color": "#009EFD",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Zeus Miracle",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_036_0",
          "color": "#CD9CF2",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_036_1",
          "color": "#F6F3FF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Old Hat",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_037_0",
          "color": "#E4AFCB",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_037_1",
          "color": "#B8CBB8",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_037_2",
          "color": "#B8CBB8",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_037_3",
          "color": "#E2C58B",
          "position": 30,
          "opacity": 100
        },
        {
          "id": "wg_037_4",
          "color": "#C2CE9C",
          "position": 64,
          "opacity": 100
        },
        {
          "id": "wg_037_5",
          "color": "#7EDBDC",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Star Wine",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_038_0",
          "color": "#B8CBB8",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_038_1",
          "color": "#B8CBB8",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_038_2",
          "color": "#B465DA",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_038_3",
          "color": "#CF6CC9",
          "position": 33,
          "opacity": 100
        },
        {
          "id": "wg_038_4",
          "color": "#EE609C",
          "position": 66,
          "opacity": 100
        },
        {
          "id": "wg_038_5",
          "color": "#EE609C",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Blue Velvet",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_039_0",
          "color": "#6A11CB",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_039_1",
          "color": "#2575FC",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Happy Acid",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_041_0",
          "color": "#37ECBA",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_041_1",
          "color": "#72AFD3",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Awesome Pine",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_042_0",
          "color": "#EBBBA7",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_042_1",
          "color": "#CFC7F8",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "New York",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_043_0",
          "color": "#FFF1EB",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_043_1",
          "color": "#ACE0F9",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Shy Rainbow",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_044_0",
          "color": "#EEA2A2",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_044_1",
          "color": "#BBC1BF",
          "position": 19,
          "opacity": 100
        },
        {
          "id": "wg_044_2",
          "color": "#57C6E1",
          "position": 42,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Mixed Hopes",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_046_0",
          "color": "#C471F5",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_046_1",
          "color": "#FA71CD",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Fly High",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_047_0",
          "color": "#48C6EF",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_047_1",
          "color": "#6F86D6",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Strong Bliss",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_048_0",
          "color": "#F78CA0",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_048_1",
          "color": "#F9748F",
          "position": 19,
          "opacity": 100
        },
        {
          "id": "wg_048_2",
          "color": "#FD868C",
          "position": 60,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Fresh Milk",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_049_0",
          "color": "#FEADA6",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_049_1",
          "color": "#F5EFEF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Snow Again",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_050_0",
          "color": "#E6E9F0",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_050_1",
          "color": "#EEF1F5",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "February Ink",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_051_0",
          "color": "#ACCBEE",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_051_1",
          "color": "#E7F0FD",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Kind Steel",
    "config": {
      "type": "linear",
      "angle": -20,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_052_0",
          "color": "#E9DEFA",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_052_1",
          "color": "#FBFCDB",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Soft Grass",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_053_0",
          "color": "#C1DFC4",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_053_1",
          "color": "#DEECDD",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Grown Early",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_054_0",
          "color": "#0BA360",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_054_1",
          "color": "#3CBA92",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Sharp Blues",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_055_0",
          "color": "#00C6FB",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_055_1",
          "color": "#005BEA",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Shady Water",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_056_0",
          "color": "#74EBD5",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_056_1",
          "color": "#9FACE6",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Dirty Beauty",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_057_0",
          "color": "#6A85B6",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_057_1",
          "color": "#BAC8E0",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Great Whale",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_058_0",
          "color": "#A3BDED",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_058_1",
          "color": "#6991C7",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Teen Notebook",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_059_0",
          "color": "#9795F0",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_059_1",
          "color": "#FBC8D4",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Polite Rumors",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_060_0",
          "color": "#A7A6CB",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_060_1",
          "color": "#8989BA",
          "position": 52,
          "opacity": 100
        },
        {
          "id": "wg_060_2",
          "color": "#8989BA",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Sweet Period",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_061_0",
          "color": "#3F51B1",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_061_1",
          "color": "#5A55AE",
          "position": 13,
          "opacity": 100
        },
        {
          "id": "wg_061_2",
          "color": "#7B5FAC",
          "position": 25,
          "opacity": 100
        },
        {
          "id": "wg_061_3",
          "color": "#8F6AAE",
          "position": 38,
          "opacity": 100
        },
        {
          "id": "wg_061_4",
          "color": "#A86AA4",
          "position": 50,
          "opacity": 100
        },
        {
          "id": "wg_061_5",
          "color": "#CC6B8E",
          "position": 62,
          "opacity": 100
        },
        {
          "id": "wg_061_6",
          "color": "#F18271",
          "position": 75,
          "opacity": 100
        },
        {
          "id": "wg_061_7",
          "color": "#F3A469",
          "position": 87,
          "opacity": 100
        },
        {
          "id": "wg_061_8",
          "color": "#F7C978",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Wide Matrix",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_062_0",
          "color": "#FCC5E4",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_062_1",
          "color": "#FDA34B",
          "position": 15,
          "opacity": 100
        },
        {
          "id": "wg_062_2",
          "color": "#FF7882",
          "position": 35,
          "opacity": 100
        },
        {
          "id": "wg_062_3",
          "color": "#C8699E",
          "position": 52,
          "opacity": 100
        },
        {
          "id": "wg_062_4",
          "color": "#7046AA",
          "position": 71,
          "opacity": 100
        },
        {
          "id": "wg_062_5",
          "color": "#0C1DB8",
          "position": 87,
          "opacity": 100
        },
        {
          "id": "wg_062_6",
          "color": "#020F75",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Soft Cherish",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_063_0",
          "color": "#DBDCD7",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_063_1",
          "color": "#DDDCD7",
          "position": 24,
          "opacity": 100
        },
        {
          "id": "wg_063_2",
          "color": "#E2C9CC",
          "position": 30,
          "opacity": 100
        },
        {
          "id": "wg_063_3",
          "color": "#E7627D",
          "position": 46,
          "opacity": 100
        },
        {
          "id": "wg_063_4",
          "color": "#B8235A",
          "position": 59,
          "opacity": 100
        },
        {
          "id": "wg_063_5",
          "color": "#801357",
          "position": 71,
          "opacity": 100
        },
        {
          "id": "wg_063_6",
          "color": "#3D1635",
          "position": 84,
          "opacity": 100
        },
        {
          "id": "wg_063_7",
          "color": "#1C1A27",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Red Salvation",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_064_0",
          "color": "#F43B47",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_064_1",
          "color": "#453A94",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Burning Spring",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_065_0",
          "color": "#4FB576",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_065_1",
          "color": "#44C489",
          "position": 30,
          "opacity": 100
        },
        {
          "id": "wg_065_2",
          "color": "#28A9AE",
          "position": 46,
          "opacity": 100
        },
        {
          "id": "wg_065_3",
          "color": "#28A2B7",
          "position": 59,
          "opacity": 100
        },
        {
          "id": "wg_065_4",
          "color": "#4C7788",
          "position": 71,
          "opacity": 100
        },
        {
          "id": "wg_065_5",
          "color": "#6C4F63",
          "position": 80,
          "opacity": 100
        },
        {
          "id": "wg_065_6",
          "color": "#432C39",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Night Party",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_066_0",
          "color": "#0250C5",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_066_1",
          "color": "#D43F8D",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Sky Glider",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_067_0",
          "color": "#88D3CE",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_067_1",
          "color": "#6E45E2",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Heaven Peach",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_068_0",
          "color": "#D9AFD9",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_068_1",
          "color": "#97D9E1",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Purple Division",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_069_0",
          "color": "#7028E4",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_069_1",
          "color": "#E5B2CA",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Aqua Splash",
    "config": {
      "type": "linear",
      "angle": 15,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_070_0",
          "color": "#13547A",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_070_1",
          "color": "#80D0C7",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Above Clouds",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_071_0",
          "color": "#BDBBBE",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_071_1",
          "color": "#9D9EA3",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Spiky Naga",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_072_0",
          "color": "#505285",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_072_1",
          "color": "#585E92",
          "position": 12,
          "opacity": 100
        },
        {
          "id": "wg_072_2",
          "color": "#65689F",
          "position": 25,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Love Kiss",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_073_0",
          "color": "#FF0844",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_073_1",
          "color": "#FFB199",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Clean Mirror",
    "config": {
      "type": "linear",
      "angle": 45,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_075_0",
          "color": "#93A5CF",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_075_1",
          "color": "#E4EFE9",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Premium Dark",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_076_0",
          "color": "#434343",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_076_1",
          "color": "#000000",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Cold Evening",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_077_0",
          "color": "#0C3483",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_077_1",
          "color": "#A2B6DF",
          "position": 100,
          "opacity": 100
        },
        {
          "id": "wg_077_2",
          "color": "#6B8CCE",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Cochiti Lake",
    "config": {
      "type": "linear",
      "angle": 45,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_078_0",
          "color": "#93A5CF",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_078_1",
          "color": "#E4EFE9",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Summer Games",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_079_0",
          "color": "#92FE9D",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_079_1",
          "color": "#00C9FF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Passionate Bed",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_080_0",
          "color": "#FF758C",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_080_1",
          "color": "#FF7EB3",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Mountain Rock",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_081_0",
          "color": "#868F96",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_081_1",
          "color": "#596164",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Desert Hump",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_082_0",
          "color": "#C79081",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_082_1",
          "color": "#DFA579",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Jungle Day",
    "config": {
      "type": "linear",
      "angle": 45,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_083_0",
          "color": "#8BAAAA",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_083_1",
          "color": "#AE8B9C",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Phoenix Start",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_084_0",
          "color": "#F83600",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_084_1",
          "color": "#F9D423",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "October Silenceiver",
    "config": {
      "type": "linear",
      "angle": -20,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_085_0",
          "color": "#B721FF",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_085_1",
          "color": "#21D4FD",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Faraway River",
    "config": {
      "type": "linear",
      "angle": -20,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_086_0",
          "color": "#6E45E2",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_086_1",
          "color": "#88D3CE",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Alchemist Lab",
    "config": {
      "type": "linear",
      "angle": -20,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_087_0",
          "color": "#D558C8",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_087_1",
          "color": "#24D292",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Over Sun",
    "config": {
      "type": "linear",
      "angle": 60,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_088_0",
          "color": "#ABECD6",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_088_1",
          "color": "#FBED96",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Premium White",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_089_0",
          "color": "#D5D4D0",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_089_1",
          "color": "#D5D4D0",
          "position": 1,
          "opacity": 100
        },
        {
          "id": "wg_089_2",
          "color": "#EEEEEC",
          "position": 31,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Mars Party",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_090_0",
          "color": "#5F72BD",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_090_1",
          "color": "#9B23EA",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Eternal Constance",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_091_0",
          "color": "#09203F",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_091_1",
          "color": "#537895",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Japan Blush",
    "config": {
      "type": "linear",
      "angle": -20,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_092_0",
          "color": "#DDD6F3",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_092_1",
          "color": "#FAACA8",
          "position": 100,
          "opacity": 100
        },
        {
          "id": "wg_092_2",
          "color": "#FAACA8",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Smiling Rain",
    "config": {
      "type": "linear",
      "angle": -20,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_093_0",
          "color": "#DCB0ED",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_093_1",
          "color": "#99C99C",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Cloudy Apple",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_094_0",
          "color": "#F3E7E9",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_094_1",
          "color": "#E3EEFF",
          "position": 99,
          "opacity": 100
        },
        {
          "id": "wg_094_2",
          "color": "#E3EEFF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Big Mango",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_095_0",
          "color": "#C71D6F",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_095_1",
          "color": "#D09693",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Healthy Water",
    "config": {
      "type": "linear",
      "angle": 60,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_096_0",
          "color": "#96DEDA",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_096_1",
          "color": "#50C9C3",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Amour Amour",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_097_0",
          "color": "#F77062",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_097_1",
          "color": "#FE5196",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Risky Concrete",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_098_0",
          "color": "#C4C5C7",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_098_1",
          "color": "#DCDDDF",
          "position": 52,
          "opacity": 100
        },
        {
          "id": "wg_098_2",
          "color": "#EBEBEB",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Strong Stick",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_099_0",
          "color": "#A8CABA",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_099_1",
          "color": "#5D4157",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Vicious Stance",
    "config": {
      "type": "linear",
      "angle": 60,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_100_0",
          "color": "#29323C",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_100_1",
          "color": "#485563",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Palo Alto",
    "config": {
      "type": "linear",
      "angle": -60,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_101_0",
          "color": "#16A085",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_101_1",
          "color": "#F4D03F",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Happy Memories",
    "config": {
      "type": "linear",
      "angle": -60,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_102_0",
          "color": "#FF5858",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_102_1",
          "color": "#F09819",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Midnight Bloom",
    "config": {
      "type": "linear",
      "angle": -20,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_103_0",
          "color": "#2B5876",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_103_1",
          "color": "#4E4376",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Crystalline",
    "config": {
      "type": "linear",
      "angle": -20,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_104_0",
          "color": "#00CDAC",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_104_1",
          "color": "#8DDAD5",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Raccoon Back",
    "config": {
      "type": "linear",
      "angle": -180,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_105_0",
          "color": "#BCC5CE",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_105_1",
          "color": "#929EAD",
          "position": 98,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Party Bliss",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_106_0",
          "color": "#4481EB",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_106_1",
          "color": "#04BEFE",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Confident Cloud",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_107_0",
          "color": "#DAD4EC",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_107_1",
          "color": "#DAD4EC",
          "position": 1,
          "opacity": 100
        },
        {
          "id": "wg_107_2",
          "color": "#F3E7E9",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Le Cocktail",
    "config": {
      "type": "linear",
      "angle": 45,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_108_0",
          "color": "#874DA2",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_108_1",
          "color": "#C43A30",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "River City",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_109_0",
          "color": "#4481EB",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_109_1",
          "color": "#04BEFE",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Frozen Berry",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_110_0",
          "color": "#E8198B",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_110_1",
          "color": "#C7EAFD",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Elegance",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_111_0",
          "color": "#EADFDF",
          "position": 59,
          "opacity": 100
        },
        {
          "id": "wg_111_1",
          "color": "#ECE2DF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Child Care",
    "config": {
      "type": "linear",
      "angle": -20,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_112_0",
          "color": "#F794A4",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_112_1",
          "color": "#FDD6BD",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Flying Lemon",
    "config": {
      "type": "linear",
      "angle": 60,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_113_0",
          "color": "#64B3F4",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_113_1",
          "color": "#C2E59C",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "New Retrowave",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_114_0",
          "color": "#3B41C5",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_114_1",
          "color": "#A981BB",
          "position": 49,
          "opacity": 100
        },
        {
          "id": "wg_114_2",
          "color": "#FFC8A9",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Hidden Jaguar",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_115_0",
          "color": "#0FD850",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_115_1",
          "color": "#F9F047",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Above The Sky",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_116_0",
          "color": "#D3D3D3",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_116_1",
          "color": "#D3D3D3",
          "position": 1,
          "opacity": 100
        },
        {
          "id": "wg_116_2",
          "color": "#E0E0E0",
          "position": 26,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Nega",
    "config": {
      "type": "linear",
      "angle": 45,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_117_0",
          "color": "#EE9CA7",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_117_1",
          "color": "#FFDDE1",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Dense Water",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_118_0",
          "color": "#3AB5B0",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_118_1",
          "color": "#3D99BE",
          "position": 31,
          "opacity": 100
        },
        {
          "id": "wg_118_2",
          "color": "#56317A",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Seashore",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_120_0",
          "color": "#209CFF",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_120_1",
          "color": "#68E0CF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Marble Wall",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_121_0",
          "color": "#BDC2E8",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_121_1",
          "color": "#BDC2E8",
          "position": 1,
          "opacity": 100
        },
        {
          "id": "wg_121_2",
          "color": "#E6DEE9",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Cheerful Caramel",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_122_0",
          "color": "#E6B980",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_122_1",
          "color": "#EACDA3",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Night Sky",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_123_0",
          "color": "#1E3C72",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_123_1",
          "color": "#1E3C72",
          "position": 1,
          "opacity": 100
        },
        {
          "id": "wg_123_2",
          "color": "#2A5298",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Magic Lake",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_124_0",
          "color": "#D5DEE7",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_124_1",
          "color": "#FFAFBD",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_124_2",
          "color": "#C9FFBF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Young Grass",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_125_0",
          "color": "#9BE15D",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_125_1",
          "color": "#00E3AE",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Colorful Peach",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_126_0",
          "color": "#ED6EA0",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_126_1",
          "color": "#EC8C69",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Gentle Care",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_127_0",
          "color": "#FFC3A0",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_127_1",
          "color": "#FFAFBD",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Plum Bath",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_128_0",
          "color": "#CC208E",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_128_1",
          "color": "#6713D2",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Happy Unicorn",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_129_0",
          "color": "#B3FFAB",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_129_1",
          "color": "#12FFF7",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Full Metal",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_130_0",
          "color": "#D5DEE7",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_130_1",
          "color": "#E8EBF2",
          "position": 50,
          "opacity": 100
        },
        {
          "id": "wg_130_2",
          "color": "#E2E7ED",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "African Field",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_131_0",
          "color": "#65BD60",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_131_1",
          "color": "#5AC1A8",
          "position": 25,
          "opacity": 100
        },
        {
          "id": "wg_131_2",
          "color": "#3EC6ED",
          "position": 50,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Solid Stone",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_132_0",
          "color": "#243949",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_132_1",
          "color": "#517FA4",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Orange Juice",
    "config": {
      "type": "linear",
      "angle": -20,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_133_0",
          "color": "#FC6076",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_133_1",
          "color": "#FF9A44",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Glass Water",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_134_0",
          "color": "#DFE9F3",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_134_1",
          "color": "#FFFFFF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "North Miracle",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_136_0",
          "color": "#00DBDE",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_136_1",
          "color": "#FC00FF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Fruit Blend",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_137_0",
          "color": "#F9D423",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_137_1",
          "color": "#FF4E50",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Millennium Pine",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_138_0",
          "color": "#50CC7F",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_138_1",
          "color": "#F5D100",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "High Flight",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_139_0",
          "color": "#0ACFFE",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_139_1",
          "color": "#495AFF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Mole Hall",
    "config": {
      "type": "linear",
      "angle": -20,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_140_0",
          "color": "#616161",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_140_1",
          "color": "#9BC5C3",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Space Shift",
    "config": {
      "type": "linear",
      "angle": 60,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_142_0",
          "color": "#3D3393",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_142_1",
          "color": "#2B76B9",
          "position": 37,
          "opacity": 100
        },
        {
          "id": "wg_142_2",
          "color": "#2CACD1",
          "position": 65,
          "opacity": 100
        },
        {
          "id": "wg_142_3",
          "color": "#35EB93",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Forest Inei",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_143_0",
          "color": "#DF89B5",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_143_1",
          "color": "#BFD9FE",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Royal Garden",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_144_0",
          "color": "#ED6EA0",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_144_1",
          "color": "#EC8C69",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Rich Metal",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_145_0",
          "color": "#D7D2CC",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_145_1",
          "color": "#304352",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Juicy Cake",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_146_0",
          "color": "#E14FAD",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_146_1",
          "color": "#F9D423",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Smart Indigo",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_147_0",
          "color": "#B224EF",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_147_1",
          "color": "#7579FF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Sand Strike",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_148_0",
          "color": "#C1C161",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_148_1",
          "color": "#C1C161",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_148_2",
          "color": "#D4D4B1",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Norse Beauty",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_149_0",
          "color": "#EC77AB",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_149_1",
          "color": "#7873F5",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Aqua Guidance",
    "config": {
      "type": "linear",
      "angle": 0,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_150_0",
          "color": "#007ADF",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_150_1",
          "color": "#00ECBC",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Sun Veggie",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_151_0",
          "color": "#20E2D7",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_151_1",
          "color": "#F9FEA5",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Sea Lord",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_152_0",
          "color": "#2CD8D5",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_152_1",
          "color": "#C5C1FF",
          "position": 56,
          "opacity": 100
        },
        {
          "id": "wg_152_2",
          "color": "#FFBAC3",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Black Sea",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_153_0",
          "color": "#2CD8D5",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_153_1",
          "color": "#6B8DD6",
          "position": 48,
          "opacity": 100
        },
        {
          "id": "wg_153_2",
          "color": "#8E37D7",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Grass Shampoo",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_154_0",
          "color": "#DFFFCD",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_154_1",
          "color": "#90F9C4",
          "position": 48,
          "opacity": 100
        },
        {
          "id": "wg_154_2",
          "color": "#39F3BB",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Landing Aircraft",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_155_0",
          "color": "#5D9FFF",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_155_1",
          "color": "#B8DCFF",
          "position": 48,
          "opacity": 100
        },
        {
          "id": "wg_155_2",
          "color": "#6BBBFF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Witch Dance",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_156_0",
          "color": "#A8BFFF",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_156_1",
          "color": "#884D80",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Sleepless Night",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_157_0",
          "color": "#5271C4",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_157_1",
          "color": "#B19FFF",
          "position": 48,
          "opacity": 100
        },
        {
          "id": "wg_157_2",
          "color": "#ECA1FE",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Angel Care",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_158_0",
          "color": "#FFE29F",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_158_1",
          "color": "#FFA99F",
          "position": 48,
          "opacity": 100
        },
        {
          "id": "wg_158_2",
          "color": "#FF719A",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Crystal River",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_159_0",
          "color": "#22E1FF",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_159_1",
          "color": "#1D8FE1",
          "position": 48,
          "opacity": 100
        },
        {
          "id": "wg_159_2",
          "color": "#625EB1",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Soft Lipstick",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_160_0",
          "color": "#B6CEE8",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_160_1",
          "color": "#F578DC",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Salt Mountain",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_161_0",
          "color": "#FFFEFF",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_161_1",
          "color": "#D7FFFE",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Perfect White",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_162_0",
          "color": "#E3FDF5",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_162_1",
          "color": "#FFE6FA",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Fresh Oasis",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_163_0",
          "color": "#7DE2FC",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_163_1",
          "color": "#B9B6E5",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Strict November",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_164_0",
          "color": "#CBBACC",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_164_1",
          "color": "#2580B3",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Morning Salad",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_165_0",
          "color": "#B7F8DB",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_165_1",
          "color": "#50A7C2",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Deep Relief",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_166_0",
          "color": "#7085B6",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_166_1",
          "color": "#87A7D9",
          "position": 50,
          "opacity": 100
        },
        {
          "id": "wg_166_2",
          "color": "#DEF3F8",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Sea Strike",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_167_0",
          "color": "#77FFD2",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_167_1",
          "color": "#6297DB",
          "position": 48,
          "opacity": 100
        },
        {
          "id": "wg_167_2",
          "color": "#1EECFF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Night Call",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_168_0",
          "color": "#AC32E4",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_168_1",
          "color": "#7918F2",
          "position": 48,
          "opacity": 100
        },
        {
          "id": "wg_168_2",
          "color": "#4801FF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Supreme Sky",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_169_0",
          "color": "#D4FFEC",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_169_1",
          "color": "#57F2CC",
          "position": 48,
          "opacity": 100
        },
        {
          "id": "wg_169_2",
          "color": "#4596FB",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Light Blue",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_170_0",
          "color": "#9EFBD3",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_170_1",
          "color": "#57E9F2",
          "position": 48,
          "opacity": 100
        },
        {
          "id": "wg_170_2",
          "color": "#45D4FB",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Mind Crawl",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_171_0",
          "color": "#473B7B",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_171_1",
          "color": "#3584A7",
          "position": 51,
          "opacity": 100
        },
        {
          "id": "wg_171_2",
          "color": "#30D2BE",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Lily Meadow",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_172_0",
          "color": "#65379B",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_172_1",
          "color": "#886AEA",
          "position": 53,
          "opacity": 100
        },
        {
          "id": "wg_172_2",
          "color": "#6457C6",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Sugar Lollipop",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_173_0",
          "color": "#A445B2",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_173_1",
          "color": "#D41872",
          "position": 52,
          "opacity": 100
        },
        {
          "id": "wg_173_2",
          "color": "#FF0066",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Sweet Dessert",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_174_0",
          "color": "#7742B2",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_174_1",
          "color": "#F180FF",
          "position": 52,
          "opacity": 100
        },
        {
          "id": "wg_174_2",
          "color": "#FD8BD9",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Magic Ray",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_175_0",
          "color": "#FF3CAC",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_175_1",
          "color": "#562B7C",
          "position": 52,
          "opacity": 100
        },
        {
          "id": "wg_175_2",
          "color": "#2B86C5",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Teen Party",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_176_0",
          "color": "#FF057C",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_176_1",
          "color": "#8D0B93",
          "position": 50,
          "opacity": 100
        },
        {
          "id": "wg_176_2",
          "color": "#321575",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Frozen Heat",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_177_0",
          "color": "#FF057C",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_177_1",
          "color": "#7C64D5",
          "position": 48,
          "opacity": 100
        },
        {
          "id": "wg_177_2",
          "color": "#4CC3FF",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Gagarin View",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_178_0",
          "color": "#69EACB",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_178_1",
          "color": "#EACCF8",
          "position": 48,
          "opacity": 100
        },
        {
          "id": "wg_178_2",
          "color": "#6654F1",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Fabled Sunset",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_179_0",
          "color": "#231557",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_179_1",
          "color": "#44107A",
          "position": 29,
          "opacity": 100
        },
        {
          "id": "wg_179_2",
          "color": "#FF1361",
          "position": 67,
          "opacity": 100
        }
      ]
    }
  },
  {
    "name": "Perfect Blue",
    "config": {
      "type": "linear",
      "angle": -225,
      "pos_x": 50,
      "pos_y": 50,
      "shape": "circle",
      "size": "farthest-corner",
      "stops": [
        {
          "id": "wg_180_0",
          "color": "#3D4E81",
          "position": 0,
          "opacity": 100
        },
        {
          "id": "wg_180_1",
          "color": "#5753C9",
          "position": 48,
          "opacity": 100
        },
        {
          "id": "wg_180_2",
          "color": "#6E7FF3",
          "position": 100,
          "opacity": 100
        }
      ]
    }
  }
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
      stops: validatedStops,
      chaos: typeof config.chaos === "number" ? Math.max(0, Math.min(1, config.chaos)) : 0.5,
      grain: typeof config.grain === "number" ? Math.max(0, Math.min(1, config.grain)) : 0.3,
      seed: typeof config.seed === "number" ? config.seed : 1,
      blur: typeof config.blur === "number" ? Math.max(10, Math.min(300, config.blur)) : 150,
      pattern: typeof config.pattern === "string" ? config.pattern : "fine",
    }
  };
};

export const PATTERNS = [
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
export const buildNoisySVG = (g, ratio = "fluid") => {
  const stops = g.stops || [];
  const chaos = g.chaos ?? 0.5;
  const grain = g.grain ?? 0.3;
  const seed = g.seed ?? 1;
  const blurVal = g.blur ?? 150;
  const patternId = g.pattern ?? "fine";

  const baseColor = stops[0]?.color || "#ffffff";

  // Deterministic pseudo-random number generator
  const pseudoRandom = (s, index, offset) => {
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
  const blobs = [];

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
    const opacity = 0.7 + (r3 * 0.25); // 0.7 to 0.95

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
  <rect width="${viewWidth}" height="${viewHeight}" fill="${baseColor}" />
  <g>
    ${blobElements}
  </g>
  <rect width="${viewWidth}" height="${viewHeight}" fill="transparent" filter="url(#whiteNoise)" opacity="${(grain * 1.1).toFixed(2)}" />
  <rect width="${viewWidth}" height="${viewHeight}" fill="transparent" filter="url(#darkNoise)" opacity="${(grain * 1.1).toFixed(2)}" />
</svg>`;
};

// URL-encodes an SVG string for use as a background-image URI
export const encodeSVGForCSS = (svgString) => {
  return svgString
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/{/g, "%7B")
    .replace(/}/g, "%7D")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/\s+/g, " ");
};

// Renders the noisy gradient SVG to Canvas and saves as PNG
export const exportNoisyGradientPNG = (svgString, width = 1920, height = 1080, filename = "noisy-gradient.png") => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const img = new Image();
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBlob((blob) => {
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    }, "image/png");
    URL.revokeObjectURL(url);
  };

  img.src = url;
};


