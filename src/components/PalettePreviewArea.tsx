"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Palette,
  Layout,
  CheckCircle2,
  XCircle,
  Eye,
  Sun,
  ExternalLink,
  Moon,
  Info,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { PaletteShade, FullPalette, NamedScale, getContrastLabel } from "@/lib/paletteUtils";
import chroma from "chroma-js";

const makeShade = (level: string, hex: string): PaletteShade => {
  const c = chroma(hex);
  const rgbArray = c.rgb();
  const hslArray = c.hsl();
  return {
    level,
    hex: hex.toUpperCase(),
    rgb: `rgb(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]})`,
    hsl: `hsl(${Math.round(isNaN(hslArray[0]) ? 0 : hslArray[0])}, ${Math.round(hslArray[1] * 100)}%, ${Math.round(hslArray[2] * 100)}%)`,
    contrastOnWhite: Number(chroma.contrast(hex, "#ffffff").toFixed(2)),
    contrastOnBlack: Number(chroma.contrast(hex, "#000000").toFixed(2)),
  };
};

const MATERIAL_PALETTES = [
  {
    name: "Red",
    shades: [
      makeShade("50", "#ffebee"),
      makeShade("100", "#ffcdd2"),
      makeShade("200", "#ef9a9a"),
      makeShade("300", "#e57373"),
      makeShade("400", "#ef5350"),
      makeShade("500", "#f44336"),
      makeShade("600", "#e53935"),
      makeShade("700", "#d32f2f"),
      makeShade("800", "#c62828"),
      makeShade("900", "#b71c1c"),
      makeShade("950", "#7d0000"),
      makeShade("A100", "#ff8a80"),
      makeShade("A200", "#ff5252"),
      makeShade("A400", "#ff1744"),
      makeShade("A700", "#d50000"),
    ]
  },
  {
    name: "Pink",
    shades: [
      makeShade("50", "#fce4ec"),
      makeShade("100", "#f8bbd0"),
      makeShade("200", "#f48fb1"),
      makeShade("300", "#f06292"),
      makeShade("400", "#ec407a"),
      makeShade("500", "#e91e63"),
      makeShade("600", "#d81b60"),
      makeShade("700", "#c2185b"),
      makeShade("800", "#ad1457"),
      makeShade("900", "#880e4f"),
      makeShade("950", "#4a0e23"),
      makeShade("A100", "#ff80ab"),
      makeShade("A200", "#ff4081"),
      makeShade("A400", "#f50057"),
      makeShade("A700", "#c51162"),
    ]
  },
  {
    name: "Purple",
    shades: [
      makeShade("50", "#f3e5f5"),
      makeShade("100", "#e1bee7"),
      makeShade("200", "#ce93d8"),
      makeShade("300", "#ba68c8"),
      makeShade("400", "#ab47bc"),
      makeShade("500", "#9c27b0"),
      makeShade("600", "#8e24aa"),
      makeShade("700", "#7b1fa2"),
      makeShade("800", "#6a1b9a"),
      makeShade("900", "#4a148c"),
      makeShade("950", "#2a0845"),
      makeShade("A100", "#ea80fc"),
      makeShade("A200", "#e040fb"),
      makeShade("A400", "#d500f9"),
      makeShade("A700", "#aa00ff"),
    ]
  },
  {
    name: "Deep Purple",
    shades: [
      makeShade("50", "#ede7f6"),
      makeShade("100", "#d1c4e9"),
      makeShade("200", "#b39ddb"),
      makeShade("300", "#9575cd"),
      makeShade("400", "#7e57c2"),
      makeShade("500", "#673ab7"),
      makeShade("600", "#5e35b1"),
      makeShade("700", "#512da8"),
      makeShade("800", "#4527a0"),
      makeShade("900", "#311b92"),
      makeShade("950", "#1a0d3a"),
      makeShade("A100", "#b388ff"),
      makeShade("A200", "#7c4dff"),
      makeShade("A400", "#651fff"),
      makeShade("A700", "#6200ea"),
    ]
  },
  {
    name: "Indigo",
    shades: [
      makeShade("50", "#e8eaf6"),
      makeShade("100", "#c5cae9"),
      makeShade("200", "#9fa8da"),
      makeShade("300", "#7986cb"),
      makeShade("400", "#5c6bc0"),
      makeShade("500", "#3f51b5"),
      makeShade("600", "#3949ab"),
      makeShade("700", "#303f9f"),
      makeShade("800", "#283593"),
      makeShade("900", "#1a237e"),
      makeShade("950", "#0f1249"),
      makeShade("A100", "#8c9eff"),
      makeShade("A200", "#536dfe"),
      makeShade("A400", "#3d5afe"),
      makeShade("A700", "#304ffe"),
    ]
  },
  {
    name: "Blue",
    shades: [
      makeShade("50", "#e3f2fd"),
      makeShade("100", "#bbdefb"),
      makeShade("200", "#90caf9"),
      makeShade("300", "#64b5f6"),
      makeShade("400", "#42a5f5"),
      makeShade("500", "#2196f3"),
      makeShade("600", "#1e88e5"),
      makeShade("700", "#1976d2"),
      makeShade("800", "#1565c0"),
      makeShade("900", "#0d47a1"),
      makeShade("950", "#051a7a"),
      makeShade("A100", "#82b1ff"),
      makeShade("A200", "#448aff"),
      makeShade("A400", "#2979ff"),
      makeShade("A700", "#2962ff"),
    ]
  },
  {
    name: "Light Blue",
    shades: [
      makeShade("50", "#e1f5fe"),
      makeShade("100", "#b3e5fc"),
      makeShade("200", "#81d4fa"),
      makeShade("300", "#4fc3f7"),
      makeShade("400", "#29b6f6"),
      makeShade("500", "#03a9f4"),
      makeShade("600", "#039be5"),
      makeShade("700", "#0288d1"),
      makeShade("800", "#0277bd"),
      makeShade("900", "#01579b"),
      makeShade("950", "#003d8c"),
      makeShade("A100", "#80d8ff"),
      makeShade("A200", "#40c4ff"),
      makeShade("A400", "#00b0ff"),
      makeShade("A700", "#0091ea"),
    ]
  },
  {
    name: "Cyan",
    shades: [
      makeShade("50", "#e0f7fa"),
      makeShade("100", "#b2ebf2"),
      makeShade("200", "#80deea"),
      makeShade("300", "#4dd0e1"),
      makeShade("400", "#26c6da"),
      makeShade("500", "#00bcd4"),
      makeShade("600", "#00acc1"),
      makeShade("700", "#0097a7"),
      makeShade("800", "#00838f"),
      makeShade("900", "#006064"),
      makeShade("950", "#003a42"),
      makeShade("A100", "#84ffff"),
      makeShade("A200", "#18ffff"),
      makeShade("A400", "#00e5ff"),
      makeShade("A700", "#00b8d4"),
    ]
  },
  {
    name: "Teal",
    shades: [
      makeShade("50", "#e0f2f1"),
      makeShade("100", "#b2dfdb"),
      makeShade("200", "#80cbc4"),
      makeShade("300", "#4db6ac"),
      makeShade("400", "#26a69a"),
      makeShade("500", "#009688"),
      makeShade("600", "#00897b"),
      makeShade("700", "#00796b"),
      makeShade("800", "#00695c"),
      makeShade("900", "#004d40"),
      makeShade("950", "#002b26"),
      makeShade("A100", "#a7ffeb"),
      makeShade("A200", "#64ffda"),
      makeShade("A400", "#1de9b6"),
      makeShade("A700", "#00bfa5"),
    ]
  },
  {
    name: "Green",
    shades: [
      makeShade("50", "#e8f5e9"),
      makeShade("100", "#c8e6c9"),
      makeShade("200", "#a5d6a7"),
      makeShade("300", "#81c784"),
      makeShade("400", "#66bb6a"),
      makeShade("500", "#4caf50"),
      makeShade("600", "#43a047"),
      makeShade("700", "#388e3c"),
      makeShade("800", "#2e7d32"),
      makeShade("900", "#1b5e20"),
      makeShade("950", "#0e3a1a"),
      makeShade("A100", "#b9f6ca"),
      makeShade("A200", "#69f0ae"),
      makeShade("A400", "#00e676"),
      makeShade("A700", "#00c853"),
    ]
  },
  {
    name: "Light Green",
    shades: [
      makeShade("50", "#f1f8e9"),
      makeShade("100", "#dcedc8"),
      makeShade("200", "#c5e1a5"),
      makeShade("300", "#aed581"),
      makeShade("400", "#9ccc65"),
      makeShade("500", "#8bc34a"),
      makeShade("600", "#7cb342"),
      makeShade("700", "#689f38"),
      makeShade("800", "#558b2f"),
      makeShade("900", "#33691e"),
      makeShade("950", "#1a2e0a"),
      makeShade("A100", "#ccff90"),
      makeShade("A200", "#b2ff59"),
      makeShade("A400", "#76ff03"),
      makeShade("A700", "#64dd17"),
    ]
  },
  {
    name: "Lime",
    shades: [
      makeShade("50", "#f9fbe7"),
      makeShade("100", "#f0f4c3"),
      makeShade("200", "#e6ee9c"),
      makeShade("300", "#dce775"),
      makeShade("400", "#d4e157"),
      makeShade("500", "#cddc39"),
      makeShade("600", "#c0ca33"),
      makeShade("700", "#afb42b"),
      makeShade("800", "#9e9d24"),
      makeShade("900", "#827717"),
      makeShade("950", "#3a3800"),
      makeShade("A100", "#f4ff81"),
      makeShade("A200", "#eeff41"),
      makeShade("A400", "#c6ff00"),
      makeShade("A700", "#aeea00"),
    ]
  },
  {
    name: "Yellow",
    shades: [
      makeShade("50", "#fffde7"),
      makeShade("100", "#fff9c4"),
      makeShade("200", "#fff59d"),
      makeShade("300", "#fff176"),
      makeShade("400", "#ffee58"),
      makeShade("500", "#ffeb3b"),
      makeShade("600", "#fdd835"),
      makeShade("700", "#fbc02d"),
      makeShade("800", "#f9a825"),
      makeShade("900", "#f57f17"),
      makeShade("950", "#4a3f00"),
      makeShade("A100", "#ffff8d"),
      makeShade("A200", "#ffff00"),
      makeShade("A400", "#ffea00"),
      makeShade("A700", "#ffd600"),
    ]
  },
  {
    name: "Amber",
    shades: [
      makeShade("50", "#fff8e1"),
      makeShade("100", "#ffecb3"),
      makeShade("200", "#ffe082"),
      makeShade("300", "#ffd54f"),
      makeShade("400", "#ffca28"),
      makeShade("500", "#ffc107"),
      makeShade("600", "#ffb300"),
      makeShade("700", "#ffa000"),
      makeShade("800", "#ff8f00"),
      makeShade("900", "#ff6f00"),
      makeShade("950", "#4a3600"),
      makeShade("A100", "#ffe57f"),
      makeShade("A200", "#ffd740"),
      makeShade("A400", "#ffc400"),
      makeShade("A700", "#ffab00"),
    ]
  },
  {
    name: "Orange",
    shades: [
      makeShade("50", "#fff3e0"),
      makeShade("100", "#ffe0b2"),
      makeShade("200", "#ffcc80"),
      makeShade("300", "#ffb74d"),
      makeShade("400", "#ffa726"),
      makeShade("500", "#ff9800"),
      makeShade("600", "#fb8c00"),
      makeShade("700", "#f57c00"),
      makeShade("800", "#ef6c00"),
      makeShade("900", "#e65100"),
      makeShade("950", "#3a2a00"),
      makeShade("A100", "#ffd180"),
      makeShade("A200", "#ffab40"),
      makeShade("A400", "#ff9100"),
      makeShade("A700", "#ff6d00"),
    ]
  },
  {
    name: "Deep Orange",
    shades: [
      makeShade("50", "#fbe9e7"),
      makeShade("100", "#ffccbc"),
      makeShade("200", "#ffab91"),
      makeShade("300", "#ff8a65"),
      makeShade("400", "#ff7043"),
      makeShade("500", "#ff5722"),
      makeShade("600", "#f4511e"),
      makeShade("700", "#e64a19"),
      makeShade("800", "#d84315"),
      makeShade("900", "#bf360c"),
      makeShade("950", "#5a1a08"),
      makeShade("A100", "#ff9e80"),
      makeShade("A200", "#ff6e40"),
      makeShade("A400", "#ff3d00"),
      makeShade("A700", "#dd2c00"),
    ]
  },
  {
    name: "Brown",
    shades: [
      makeShade("50", "#efebe9"),
      makeShade("100", "#d7ccc8"),
      makeShade("200", "#bcaaa4"),
      makeShade("300", "#a1887f"),
      makeShade("400", "#8d6e63"),
      makeShade("500", "#795548"),
      makeShade("600", "#6d4c41"),
      makeShade("700", "#5d4037"),
      makeShade("800", "#4e342e"),
      makeShade("900", "#3e2723"),
      makeShade("950", "#2a1a10"),
      makeShade("A100", "#d7ccc8"),
      makeShade("A200", "#bcaaa4"),
      makeShade("A400", "#8d6e63"),
      makeShade("A700", "#5d4037"),
    ]
  },
  {
    name: "Grey",
    shades: [
      makeShade("50", "#fafafa"),
      makeShade("100", "#f5f5f5"),
      makeShade("200", "#eeeeee"),
      makeShade("300", "#e0e0e0"),
      makeShade("400", "#bdbdbd"),
      makeShade("500", "#9e9e9e"),
      makeShade("600", "#757575"),
      makeShade("700", "#616161"),
      makeShade("800", "#424242"),
      makeShade("900", "#212121"),
      makeShade("950", "#121212"),
      makeShade("A100", "#f5f5f5"),
      makeShade("A200", "#eeeeee"),
      makeShade("A400", "#bdbdbd"),
      makeShade("A700", "#616161"),
    ]
  },
  {
    name: "Blue Grey",
    shades: [
      makeShade("50", "#eceff1"),
      makeShade("100", "#cfd8dc"),
      makeShade("200", "#b0bec5"),
      makeShade("300", "#90a4ae"),
      makeShade("400", "#78909c"),
      makeShade("500", "#607d8b"),
      makeShade("600", "#546e7a"),
      makeShade("700", "#455a64"),
      makeShade("800", "#37474f"),
      makeShade("900", "#263238"),
      makeShade("950", "#0f1419"),
      makeShade("A100", "#cfd8dc"),
      makeShade("A200", "#b0bec5"),
      makeShade("A400", "#78909c"),
      makeShade("A700", "#455a64"),
    ]
  }
];

interface PalettePreviewAreaProps {
  currentPalette: FullPalette;
  onSetBaseColor: (hex: string) => void;
  onSetSecondaryColor: (hex: string) => void;
  openExportPalette?: () => void;
  onExportSingleScale?: (name: string, shades: PaletteShade[]) => void;
  onExportAllScales?: (scales: NamedScale[]) => void;
}

type PreviewTab = "shades" | "mockups";
type MockupType = "web" | "dashboard" | "components" | "mobile" | "gradients";

export default function PalettePreviewArea({
  currentPalette,
  onSetBaseColor,
  onSetSecondaryColor,
  openExportPalette,
  onExportSingleScale,
  onExportAllScales,
}: PalettePreviewAreaProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>("shades");
  const [mockupMode, setMockupMode] = useState<MockupType>("web");
  const [previewDark, setPreviewDark] = useState<boolean>(false);
  const [selectedMaterialColor, setSelectedMaterialColor] = useState<string>("Blue");
  const [isA11yModalOpen, setIsA11yModalOpen] = useState<boolean>(false);
  const pillsRef = useRef<HTMLDivElement>(null);

  // Scroll selected pill into view (inside pills container only — never scrolls the page)
  useEffect(() => {
    const container = pillsRef.current;
    if (!container) return;
    const activeBtn = container.querySelector<HTMLButtonElement>(`[data-color="${selectedMaterialColor}"]`);
    if (!activeBtn) return;
    const btnLeft   = activeBtn.offsetLeft;
    const btnRight  = btnLeft + activeBtn.offsetWidth;
    const visLeft   = container.scrollLeft;
    const visRight  = visLeft + container.clientWidth;
    if (btnLeft < visLeft) {
      container.scrollTo({ left: btnLeft - 8, behavior: "smooth" });
    } else if (btnRight > visRight) {
      container.scrollTo({ left: btnRight - container.clientWidth + 8, behavior: "smooth" });
    }
  }, [selectedMaterialColor]);
  
  // Track selected shade by category and level to survive palette regenerations
  const [selectedShadeInfo, setSelectedShadeInfo] = useState<{
    category: string;
    level: string;
  }>({ category: "Primary", level: "500" });

  const selectedShade = useMemo(() => {
    let list: PaletteShade[] = [];
    if (selectedShadeInfo.category === "Brand" || selectedShadeInfo.category === "Primary") list = currentPalette.shades;
    else if (selectedShadeInfo.category === "Secondary") list = currentPalette.secondary || [];
    else if (selectedShadeInfo.category === "Neutral") list = currentPalette.neutrals;
    else if (selectedShadeInfo.category === "Success") list = currentPalette.success;
    else if (selectedShadeInfo.category === "Warning") list = currentPalette.warning;
    else if (selectedShadeInfo.category === "Error") list = currentPalette.error;
    else {
      const cleanCat = selectedShadeInfo.category.replace(" (Normal)", "").replace(" (Accent)", "");
      const foundPal = MATERIAL_PALETTES.find(p => p.name === cleanCat);
      if (foundPal) list = foundPal.shades;
    }

    const matched = list.find((s) => s.level === selectedShadeInfo.level);
    return matched ? { category: selectedShadeInfo.category, shade: matched } : null;
  }, [selectedShadeInfo, currentPalette]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied: ${text}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy color code");
    }
  };

  const renderShadeRow = (title: string, shades: PaletteShade[]) => {
    const cleanTitle = title.replace(" (Normal)", "").replace(" (Accent)", "");
    const isActiveSection = selectedShadeInfo.category === title;

    return (
      <div className="space-y-2.5 pb-2">
        <div className="flex flex-wrap justify-between items-center gap-y-1.5 px-1">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {title} Scale
          </h4>
          <div className="flex items-center gap-2 flex-wrap">
            {!["Primary", "Secondary", "Neutral", "Success", "Warning", "Error"].includes(cleanTitle) && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const hex = shades.find(s => s.level === "500")?.hex || shades[Math.floor(shades.length / 2)]?.hex;
                    if (hex) {
                      onSetBaseColor(hex);
                      toast.success(`Set ${cleanTitle} as Primary Color`);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-accent text-accent-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Make Primary
                </button>
                <button
                  onClick={() => {
                    const hex = shades.find(s => s.level === "500")?.hex || shades[Math.floor(shades.length / 2)]?.hex;
                    if (hex) {
                      onSetSecondaryColor(hex);
                      toast.success(`Set ${cleanTitle} as Secondary Color`);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border/60 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  Make Secondary
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="grid gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-1.5" style={{ gridTemplateColumns: `repeat(${shades.length}, minmax(20px, 1fr))` }}>
          {shades.map((sh) => {
            const isSelected = isActiveSection && selectedShadeInfo.level === sh.level;
            return (
              <div key={sh.level} className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    setSelectedShadeInfo({ category: title, level: sh.level });
                    copyToClipboard(sh.hex);
                    if (cleanTitle === "Brand" || cleanTitle === "Primary") {
                      onSetBaseColor(sh.hex);
                    }
                  }}
                  className={`group relative aspect-[1.1/1] rounded-xl overflow-hidden shadow-sm border transition-all duration-200 active:scale-95 cursor-pointer ${
                    isSelected ? "ring-2 ring-accent scale-102 border-accent" : "border-border/30 hover:scale-105 hover:shadow-md"
                  }`}
                  style={{ backgroundColor: sh.hex }}
                  title={`${sh.hex} - Level ${sh.level}`}
                >
                  {/* Copy icon overlay */}
                  <span
                    className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Copy size={12} className="text-white drop-shadow" />
                  </span>
                </button>
                <div className="text-center">
                  <div className="text-[10px] font-bold text-foreground">{sh.level}</div>
                  <div
                    onClick={() => copyToClipboard(sh.hex)}
                    className="text-[9px] font-mono text-muted-foreground/80 hover:text-accent transition-colors cursor-pointer select-none truncate"
                    title="Copy hex code"
                  >
                    {sh.hex}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inline Contrast Checker Panel below swatches */}
        {isActiveSection && selectedShade && (
          <div className="mt-3 p-3.5 rounded-xl bg-input/10 border border-border/50 animate-fade-in text-left relative pr-8">
            {/* Close Button */}
            <button
              onClick={() => setSelectedShadeInfo({ category: "", level: "" })}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground hover:bg-secondary/40 w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer text-[10px] font-extrabold border border-transparent hover:border-border"
              title="Close Contrast Panel"
            >
              ✕
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg border border-border shadow shrink-0"
                  style={{ backgroundColor: selectedShade.shade.hex }}
                />
                <div>
                  <div className="text-xs font-bold text-foreground capitalize">
                    {selectedShade.category} - Shade {selectedShade.shade.level}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground flex gap-3 mt-0.5">
                    <span onClick={() => copyToClipboard(selectedShade.shade.hex)} className="hover:text-accent cursor-pointer">
                      Hex: {selectedShade.shade.hex}
                    </span>
                    <span onClick={() => copyToClipboard(selectedShade.shade.rgb)} className="hover:text-accent cursor-pointer">
                      RGB: {selectedShade.shade.rgb}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-input/40 px-3 py-1 rounded-lg border border-border/60 flex flex-col justify-center min-w-[100px]">
                  <div className="text-[7.5px] font-bold text-muted-foreground uppercase tracking-wider">On White (#FFF)</div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xs font-bold font-mono">{selectedShade.shade.contrastOnWhite}:1</span>
                    <span className={`text-[7px] font-bold px-1 py-0.25 rounded ${getContrastLabel(selectedShade.shade.contrastOnWhite).text}`}>
                      {getContrastLabel(selectedShade.shade.contrastOnWhite).score}
                    </span>
                  </div>
                </div>

                <div className="bg-input/40 px-3 py-1 rounded-lg border border-border/60 flex flex-col justify-center min-w-[100px]">
                  <div className="text-[7.5px] font-bold text-muted-foreground uppercase tracking-wider">On Black (#000)</div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xs font-bold font-mono">{selectedShade.shade.contrastOnBlack}:1</span>
                    <span className={`text-[7px] font-bold px-1 py-0.25 rounded ${getContrastLabel(selectedShade.shade.contrastOnBlack).text}`}>
                      {getContrastLabel(selectedShade.shade.contrastOnBlack).score}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      {/* Top Navbar */}
      <div className="flex justify-between items-center px-4 sm:px-6 py-2.5 sm:py-3 border-b border-border bg-card/45 backdrop-blur-md shrink-0">
        {/* Navigation Tabs */}
        <div className="preview-tabs">
          {(["shades", "mockups"] as PreviewTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`preview-tab-btn flex items-center gap-1.5 ${
                activeTab === tab ? "active" : ""
              }`}
            >
              {tab === "shades" ? (
                <>
                  <Palette size={13} />
                  <span>Color Scales</span>
                </>
              ) : (
                <>
                  <Layout size={13} />
                  <span>Mockups Preview</span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Global Preview Dark/Light Toggle */}
        <div className="flex items-center gap-2">
          {activeTab === "shades" && (
            <button
              onClick={() => setIsA11yModalOpen(true)}
              className=" flex items-center gap-1.5 py-1  text-xs active:scale-95 cursor-pointer"
              title="WCAG Contrast & Accessibility Check"
            >
              <Info size={13} className="text-accent" />
              <span>A11y Guide</span>
            </button>
          )}
          {activeTab === "mockups" && (
            <button
              onClick={() => setPreviewDark(!previewDark)}
              className="btn-pill flex items-center gap-1.5 py-1 px-3.5 text-xs active:scale-95 cursor-pointer"
            >
              {previewDark ? (
                <>
                  <Sun size={13} className="text-amber-500" />
                  <span>Light Preview</span>
                </>
              ) : (
                <>
                  <Moon size={13} className="text-accent" />
                  <span>Dark Preview</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-5 sm:space-y-8">
        {activeTab === "shades" && (
          <div key="shades" className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
            {/* Primary & Secondary Scale container */}
            <div className="bg-card/40 p-3 sm:p-5 rounded-2xl border border-border/80 space-y-4 sm:space-y-6">
              {renderShadeRow("Primary", currentPalette.shades)}
              {currentPalette.secondary && renderShadeRow("Secondary", currentPalette.secondary)}
            </div>

            {/* Other Scales container */}
            <div className="bg-card/40 p-3 sm:p-5 rounded-2xl border border-border/80 space-y-4 sm:space-y-6">
              {renderShadeRow("Neutral", currentPalette.neutrals)}
              {renderShadeRow("Success", currentPalette.success)}
              {renderShadeRow("Warning", currentPalette.warning)}
              {renderShadeRow("Error", currentPalette.error)}
            </div>

            {/* Material Design Scales container */}
            <div className="bg-card/40 p-3 sm:p-5 rounded-2xl border border-border/80 space-y-3 sm:space-y-4 ">
              <div className="flex flex-wrap justify-between items-center gap-y-2 border-b border-border pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Palette size={14} className="text-accent" />
                  Reference Scales
                </h3>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Export All — every palette 50-950 */}
                  <button
                    onClick={() => {
                      if (onExportAllScales) {
                        const scales: NamedScale[] = MATERIAL_PALETTES.map((pal) => ({
                          name: pal.name,
                          shades: pal.shades.filter((s) => !s.level.startsWith("A")),
                        }));
                        onExportAllScales(scales);
                      }
                    }}
                    className="px-2.5 py-1 text-foreground border border-border rounded-md flex items-center gap-2 text-[10px] font-bold active:scale-95 transition-all cursor-pointer hover:bg-secondary/60"
                  >
                    <ExternalLink size={14} />
                    Export All
                  </button>
                  {/* Export active scale only */}
                  <button
                    onClick={() => {
                      const activePal = MATERIAL_PALETTES.find(p => p.name === selectedMaterialColor);
                      if (activePal && onExportSingleScale) {
                        const normalShades = activePal.shades.filter(s => !s.level.startsWith("A"));
                        onExportSingleScale(`${activePal.name} Scale`, normalShades);
                      }
                    }}
                    className="px-2.5 py-1 text-foreground border border-border rounded-md flex items-center gap-2 text-[10px] font-bold active:scale-95 transition-all cursor-pointer hover:bg-secondary/60"
                  >
                    <ExternalLink size={14} />
                    Export
                  </button>
                </div>
              </div>
              
              {/* Horizontal scrollable navigation pills — right edge fades to hint more content */}
              <div
                className="overflow-hidden"
                style={{ maskImage: "linear-gradient(to right, black 80%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 80%, transparent 100%)" }}
              >
                <div
                  ref={pillsRef}
                  className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none"
                >
                  {MATERIAL_PALETTES.map((pal) => {
                    const isActive = selectedMaterialColor === pal.name;
                    const color500 = pal.shades.find(s => s.level === "500")?.hex || "#ccc";
                    return (
                      <button
                        key={pal.name}
                        data-color={pal.name}
                        onClick={() => setSelectedMaterialColor(pal.name)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                          isActive
                            ? "bg-secondary text-foreground border-accent shadow-sm"
                            : "bg-input/20 text-muted-foreground border-border hover:bg-input/40 hover:text-foreground"
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: color500 }} />
                        {pal.name}
                      </button>
                    );
                  })}
                  {/* Spacer so last pill isn't hidden under the fade */}
                  <span className="shrink-0 w-8 inline-block" />
                </div>
              </div>

              {/* Render split shades for selected color scale */}
              {(() => {
                const activePal = MATERIAL_PALETTES.find(p => p.name === selectedMaterialColor);
                if (!activePal) return null;
                const normalShades = activePal.shades.filter(s => !s.level.startsWith("A"));
                return (
                  <div className="pt-1">
                    {renderShadeRow(activePal.name, normalShades)}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === "mockups" && (
          <div key="mockups" className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Mockups Submenu using Niram Kalavai ratio-btn class */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {(["web", "dashboard", "components", "mobile", "gradients"] as MockupType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => setMockupMode(type)}
                    className={`ratio-btn flex items-center shrink-0 cursor-pointer ${
                      mockupMode === type ? "active" : ""
                    }`}
                  >
                    {type === "web"
                      ? "Website UI"
                      : type === "dashboard"
                      ? "Dashboard Charts"
                      : type === "components"
                      ? "Shadcn/UI components"
                      : type === "mobile"
                      ? "Mobile View"
                      : "Gradients Card"}
                  </button>
                )
              )}
            </div>

            {/* Mockup Frame Container */}
            <div
              className={`rounded-2xl border border-border shadow-2xl overflow-hidden transition-all duration-300 ${
                previewDark ? "bg-slate-950 text-slate-100" : "bg-white text-slate-800"
              }`}
              style={{
                fontFamily: `${currentPalette.bodyFont}, sans-serif`,
              }}
            >
              {/* Fake Window Bar */}
              <div
                className={`px-4 py-3 flex items-center justify-between border-b ${
                  previewDark
                    ? "bg-slate-900/55 border-slate-800/80"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div
                  className={`text-[10px] px-4 py-0.5 rounded font-bold ${
                    previewDark ? "bg-slate-950 text-slate-500" : "bg-slate-200/50 text-slate-655"
                  }`}
                >
                  niramkalavai.studio/preview
                </div>
                <div className="w-12" />
              </div>

              {/* Preview Body */}
              <div className="p-6">
                {mockupMode === "web" && (
                  <div className="space-y-8 animate-fade-in">
                    {/* Navigation banner */}
                    <div
                      className={`flex justify-between items-center p-3 rounded-xl border ${
                        previewDark
                          ? "bg-slate-900/30 border-slate-800/60"
                          : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-md shadow-sm"
                          style={{ backgroundColor: currentPalette.shades[5].hex }}
                        />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {currentPalette.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                        <span className="hover:text-accent cursor-pointer">Features</span>
                        <span className="hover:text-accent cursor-pointer">Pricing</span>
                        <span className="hover:text-accent cursor-pointer">Blog</span>
                        <button
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-transform active:scale-95 cursor-pointer"
                          style={{
                            backgroundColor: currentPalette.shades[5].hex,
                            color: currentPalette.shades[0].hex,
                          }}
                        >
                          Sign In
                        </button>
                      </div>
                    </div>

                    {/* Hero Section */}
                    <div className="text-center py-10 space-y-4 max-w-xl mx-auto">
                      <h2
                        className="text-4xl font-extrabold tracking-tight leading-tight"
                        style={{
                          fontFamily: `${currentPalette.headingFont}, sans-serif`,
                          color: previewDark
                            ? currentPalette.shades[2].hex
                            : currentPalette.shades[8].hex,
                        }}
                      >
                        Supercharge your tailwind applications.
                      </h2>
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          color: previewDark
                            ? currentPalette.neutrals[3].hex
                            : currentPalette.neutrals[6].hex,
                        }}
                      >
                        Easily export color schemes, CSS Variables, and typography tokens. Speed up
                        development with WCAG compliance checkers.
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          className="px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-accent/5 transition-transform active:scale-95 cursor-pointer"
                          style={{
                            backgroundColor: currentPalette.shades[5].hex,
                            color: currentPalette.shades[0].hex,
                          }}
                        >
                          Get Started Free
                        </button>
                        <button
                          className="px-5 py-2.5 rounded-xl text-xs font-bold border shadow-sm transition-all active:scale-95 cursor-pointer"
                          style={{
                            borderColor: previewDark ? "#2d3748" : "#e2e8f0",
                            backgroundColor: previewDark ? "#1a202c" : "#f7fafc",
                            color: previewDark ? "#f7fafc" : "#2d3748",
                          }}
                        >
                          Book Demo
                        </button>
                      </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      {["Fast integration", "Modern fonts", "Accessibility checked"].map(
                        (feat, i) => (
                          <div
                            key={i}
                            className={`p-4 rounded-xl border space-y-2 ${
                              previewDark
                                ? "bg-slate-900/40 border-slate-800/60"
                                : "bg-slate-50/50 border-slate-100"
                            }`}
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center mb-1 shadow-sm"
                              style={{
                                backgroundColor: `${currentPalette.shades[4].hex}22`,
                                color: currentPalette.shades[5].hex,
                              }}
                            >
                              <CheckCircle2 size={16} />
                            </div>
                            <h4 className="text-xs font-bold">{feat}</h4>
                            <p className="text-[11px] text-muted-foreground/80 leading-normal font-semibold">
                              Seamless shade grading helps avoid color mismatches in your buttons,
                              borders, and panels.
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {mockupMode === "dashboard" && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-muted-foreground">Sales Dashboard</h4>
                      <span className="text-[11px] bg-slate-900 text-muted-foreground px-2.5 py-0.5 rounded border border-border font-semibold">
                        Real-time Stats
                      </span>
                    </div>

                    {/* Simple SVG charts */}
                    <div className="grid grid-cols-3 gap-5">
                      {/* Bar chart */}
                      <div className="p-4 rounded-xl border border-border/80 bg-input/20 flex flex-col justify-between aspect-[1.4/1]">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                          Revenue Growth
                        </span>
                        <svg className="w-full h-20" viewBox="0 0 100 50">
                          {/* Grid lines */}
                          <line
                            x1="0"
                            y1="40"
                            x2="100"
                            y2="40"
                            stroke="#475569"
                            strokeWidth="0.25"
                            strokeDasharray="2"
                          />
                          <line
                            x1="0"
                            y1="20"
                            x2="100"
                            y2="20"
                            stroke="#475569"
                            strokeWidth="0.25"
                            strokeDasharray="2"
                          />
                          {/* Bars */}
                          <rect
                            x="5"
                            y="25"
                            width="10"
                            height="15"
                            rx="1"
                            fill={currentPalette.shades[4].hex}
                          />
                          <rect
                            x="20"
                            y="15"
                            width="10"
                            height="25"
                            rx="1"
                            fill={currentPalette.shades[5].hex}
                          />
                          <rect
                            x="35"
                            y="30"
                            width="10"
                            height="10"
                            rx="1"
                            fill={currentPalette.shades[3].hex}
                          />
                          <rect
                            x="50"
                            y="10"
                            width="10"
                            height="30"
                            rx="1"
                            fill={currentPalette.shades[6].hex}
                          />
                          <rect
                            x="65"
                            y="8"
                            width="10"
                            height="32"
                            rx="1"
                            fill={currentPalette.success[5].hex}
                          />
                          <rect
                            x="80"
                            y="18"
                            width="10"
                            height="22"
                            rx="1"
                            fill={currentPalette.shades[5].hex}
                          />
                        </svg>
                      </div>

                      {/* Line chart */}
                      <div className="p-4 rounded-xl border border-border/80 bg-input/20 flex flex-col justify-between aspect-[1.4/1]">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                          User Conversion Rate
                        </span>
                        <svg className="w-full h-20" viewBox="0 0 100 50">
                          <path
                            d="M 5 40 Q 25 15, 45 35 T 85 10"
                            fill="none"
                            stroke={currentPalette.shades[5].hex}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          {/* Area under line */}
                          <path
                            d="M 5 40 Q 25 15, 45 35 T 85 10 L 85 45 L 5 45 Z"
                            fill={`${currentPalette.shades[4].hex}22`}
                          />
                        </svg>
                      </div>

                      {/* Pie/Donut Chart */}
                      <div className="p-4 rounded-xl border border-border/80 bg-input/20 flex flex-col justify-between aspect-[1.4/1]">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                          System Diagnostics
                        </span>
                        <div className="flex items-center justify-center">
                          <svg className="w-16 h-16" viewBox="0 0 36 36">
                            <circle
                              cx="18"
                              cy="18"
                              r="15.915"
                              fill="transparent"
                              stroke="#334155"
                              strokeWidth="3.5"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="15.915"
                              fill="transparent"
                              stroke={currentPalette.shades[5].hex}
                              strokeWidth="3.5"
                              strokeDasharray="60 40"
                              strokeDashoffset="25"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="15.915"
                              fill="transparent"
                              stroke={currentPalette.success[5].hex}
                              strokeWidth="3.5"
                              strokeDasharray="25 75"
                              strokeDashoffset="85"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="15.915"
                              fill="transparent"
                              stroke={currentPalette.error[5].hex}
                              strokeWidth="3.5"
                              strokeDasharray="15 85"
                              strokeDashoffset="110"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {mockupMode === "components" && (
                  <div className="space-y-6 animate-fade-in">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Shadcn / Tailwind Components Sim
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      {/* Form inputs */}
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">
                            Project Title
                          </label>
                          <input
                            type="text"
                            placeholder="Enter text..."
                            defaultValue="Niram Kalavai Project"
                            className={`w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none transition-colors ${
                              previewDark
                                ? "bg-slate-900 border-slate-800 text-white focus:border-accent"
                                : "bg-white border-slate-200 text-slate-855 focus:border-accent"
                            }`}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">
                            Status Mode
                          </label>
                          <select
                            className={`w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none transition-colors ${
                              previewDark
                                ? "bg-slate-900 border-slate-800 text-white focus:border-accent"
                                : "bg-white border-slate-200 text-slate-855 focus:border-accent"
                            }`}
                          >
                            <option>Production Ready</option>
                            <option>Staging</option>
                            <option>Development</option>
                          </select>
                        </div>
                      </div>

                      {/* Interactive Buttons & Status Indicators */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                          Buttons States
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-transform active:scale-95 cursor-pointer"
                            style={{
                              backgroundColor: currentPalette.shades[5].hex,
                              color: currentPalette.shades[0].hex,
                            }}
                          >
                            Primary
                          </button>
                          <button
                            className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-transform active:scale-95 cursor-pointer"
                            style={{
                              borderColor: currentPalette.shades[4].hex,
                              color: currentPalette.shades[6].hex,
                              backgroundColor: `${currentPalette.shades[1].hex}22`,
                            }}
                          >
                            Outline
                          </button>
                          <button
                            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-transform active:scale-95 cursor-pointer"
                            style={{
                              backgroundColor: currentPalette.error[5].hex,
                              color: currentPalette.error[0].hex,
                            }}
                          >
                            Destructive
                          </button>
                        </div>

                        <label className="text-[10px] font-bold text-muted-foreground uppercase block pt-1">
                          Dynamic Alerts
                        </label>
                        <div className="space-y-2">
                          {/* Success Alert */}
                          <div
                            className="p-2.5 rounded-lg border-l-2 text-xs font-semibold flex gap-2 items-center"
                            style={{
                              backgroundColor: `${currentPalette.success[0].hex}22`,
                              borderColor: currentPalette.success[5].hex,
                              color: currentPalette.success[9].hex,
                            }}
                          >
                            <CheckCircle2 size={13} />
                            <span>Database backup completed successfully.</span>
                          </div>

                          {/* Error Alert */}
                          <div
                            className="p-2.5 rounded-lg border-l-2 text-xs font-semibold flex gap-2 items-center"
                            style={{
                              backgroundColor: `${currentPalette.error[0].hex}22`,
                              borderColor: currentPalette.error[5].hex,
                              color: currentPalette.error[9].hex,
                            }}
                          >
                            <XCircle size={13} />
                            <span>Failed to parse auth cookies config token.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {mockupMode === "mobile" && (
                  <div className="flex justify-center animate-fade-in">
                    {/* Simulated Smartphone Screen */}
                    <div
                      className={`w-56 aspect-[1/2] rounded-2xl border-4 p-3 space-y-4 overflow-hidden relative flex flex-col justify-between ${
                        previewDark
                          ? "bg-slate-950 border-border"
                          : "bg-slate-50 border-slate-350"
                      }`}
                    >
                      {/* Top status bar */}
                      <div className="flex justify-between items-center text-[8px] font-bold text-muted-foreground/80">
                        <span>09:41</span>
                        <span>5G 100%</span>
                      </div>

                      <div className="flex-1 space-y-3 mt-2 overflow-hidden">
                        {/* Avatar / welcome header */}
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: currentPalette.shades[5].hex }}
                          />
                          <div>
                            <div className="text-[9px] font-bold">Hello user!</div>
                            <div className="text-[7px] text-muted-foreground">Admin Account</div>
                          </div>
                        </div>

                        {/* Summary widget card */}
                        <div
                          className="p-2.5 rounded-xl text-white space-y-1.5"
                          style={{
                            background: `linear-gradient(135deg, ${currentPalette.shades[5].hex}, ${currentPalette.shades[7].hex})`,
                          }}
                        >
                          <div className="text-[8px] opacity-80 uppercase font-bold">
                            Balance Total
                          </div>
                          <div className="text-sm font-black">$45,120.00</div>
                          <div className="text-[7px] bg-white/20 px-1 py-0.5 rounded w-max font-bold">
                            +12.8% this month
                          </div>
                        </div>

                        {/* Action items list */}
                        <div className="space-y-1.5">
                          <div className="text-[8px] text-muted-foreground font-bold uppercase">
                            Transactions
                          </div>
                          {[
                            { name: "Salary Deposit", amt: "+$3,500.00", isSuccess: true },
                            { name: "SaaS Subscription", amt: "-$15.00", isSuccess: false },
                          ].map((t, idx) => (
                            <div
                              key={idx}
                              className={`p-1.5 rounded-lg flex justify-between items-center text-[8px] font-semibold ${
                                previewDark ? "bg-slate-900 text-slate-100" : "bg-white border border-slate-100"
                              }`}
                            >
                              <span className="font-semibold">{t.name}</span>
                              <span
                                className={`font-bold ${
                                  t.isSuccess ? "text-emerald-500" : "text-rose-500"
                                }`}
                              >
                                {t.amt}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Home Indicator */}
                      <div className="w-16 h-1 bg-slate-500 rounded-full mx-auto self-end mt-2" />
                    </div>
                  </div>
                )}

                {mockupMode === "gradients" && (
                  <div className="space-y-6 animate-fade-in">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Gradient Card Combos
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Gradient card 1 */}
                      <div
                        className="aspect-[2/1] rounded-2xl p-5 text-white flex flex-col justify-between shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${currentPalette.shades[4].hex}, ${currentPalette.shades[7].hex})`,
                        }}
                      >
                        <div className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full w-max font-bold">
                          Brand Flow
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">Shades 400 ➔ 700</h4>
                          <p className="text-[10px] opacity-80 mt-0.5">
                            Consistent lightness scale interpolation.
                          </p>
                        </div>
                      </div>

                      {/* Gradient card 2 */}
                      <div
                        className="aspect-[2/1] rounded-2xl p-5 text-white flex flex-col justify-between shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${currentPalette.shades[5].hex}, ${currentPalette.success[5].hex})`,
                        }}
                      >
                        <div className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full w-max font-bold">
                          Complementary Blend
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">Brand 500 ➔ Success 500</h4>
                          <p className="text-[10px] opacity-80 mt-0.5">
                            Cross-hue transition with synced perception.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accessibility Modal Popup */}
      {isA11yModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-background border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-border bg-card/20">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <CheckCircle2 size={16} className="text-accent" />
                WCAG Accessibility Guide
              </h3>
              <button
                onClick={() => setIsA11yModalOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-input px-3 py-1.5 rounded-lg border border-border/60 transition-all cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-left">
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">50 - 300 shades:</strong> High-lightness, best for backgrounds, borders, or text on dark themes.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">400 - 600 shades:</strong> Medium levels, perfect for CTA buttons, status borders, and icons.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">700 - 950/950+ shades:</strong> Rich shades, highly readable on white; ideal for body copy and headings.
                  </span>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-5 py-3 border-t border-border bg-card/20 text-center text-[10px] text-muted-foreground flex items-start gap-1">
              <Info size={11} className="shrink-0 mt-0.5" />
              <span>
                WCAG AA compliance guidelines for dynamic web design systems.
              </span>
            </div>
          </div>
        </div>
      )}
      {/* Credits footer */}
      <div className="preview-footer-credits" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "10px 0 12px", fontSize: "12px", color: "hsl(var(--muted-foreground))", borderTop: "1px solid hsl(var(--border))", marginTop: "auto" }}>
        <span>
          Built with ❤️ by{" "}
          <a
            href="https://www.linkedin.com/in/akash-kumaraguru/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "hsl(var(--accent))", textDecoration: "none", fontWeight: 500 }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Akash Kumaraguru
          </a>
        </span>
      </div>
    </div>
  );
}
