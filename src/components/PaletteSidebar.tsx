"use client";

import { FullPalette, parseAnyColor } from "@/lib/paletteUtils";
import chroma from "chroma-js";
import { ChevronDown, FolderHeart, Layers, Plus, Sliders, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import SavedPalettes from "./SavedPalettes";

const REFERENCE_COLORS = [
  { name: "Blue", hex: "#2196F3" },
  { name: "Red", hex: "#F44336" },
  { name: "Pink", hex: "#E91E63" },
  { name: "Purple", hex: "#9C27B0" },
  { name: "Deep Purple", hex: "#673AB7" },
  { name: "Indigo", hex: "#3F51B5" },
  { name: "Light Blue", hex: "#03A9F4" },
  { name: "Cyan", hex: "#00BCD4" },
  { name: "Teal", hex: "#009688" },
  { name: "Green", hex: "#4CAF50" },
  { name: "Light Green", hex: "#8BC34A" },
  { name: "Lime", hex: "#CDDC39" },
  { name: "Yellow", hex: "#FFEB3B" },
  { name: "Amber", hex: "#FFC107" },
  { name: "Orange", hex: "#FF9800" },
  { name: "Deep Orange", hex: "#FF5722" },
  { name: "Brown", hex: "#795548" },
  { name: "Grey", hex: "#9E9E9E" },
  { name: "Blue Grey", hex: "#607D8B" },
];

const formatColor = (hex: string, format: string): string => {
  try {
    const c = chroma(hex);
    if (format === "hsl") {
      const [h, s, l] = c.hsl();
      const rh = Math.round(isNaN(h) ? 0 : h);
      const rs = Math.round(s * 100);
      const rl = Math.round(l * 100);
      return `hsl(${rh}, ${rs}%, ${rl}%)`;
    } else if (format === "hsb" || format === "hsv") {
      const [h, s, v] = c.hsv();
      const rh = Math.round(isNaN(h) ? 0 : h);
      const rs = Math.round(s * 100);
      const rv = Math.round(v * 100);
      return `hsb(${rh}, ${rs}%, ${rv}%)`;
    } else if (format === "rgb") {
      const [r, g, b] = c.rgb();
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      return c.hex().toUpperCase();
    }
  } catch (e) {
    return hex;
  }
};

const getTripleValues = (colorHex: string, format: string): [number, number, number] => {
  try {
    const c = chroma(colorHex);
    if (format === "hsl") {
      const [h, s, l] = c.hsl();
      return [
        Math.round(isNaN(h) ? 0 : h),
        Math.round(s * 100),
        Math.round(l * 100)
      ];
    } else if (format === "hsb" || format === "hsv") {
      const [h, s, v] = c.hsv();
      return [
        Math.round(isNaN(h) ? 0 : h),
        Math.round(s * 100),
        Math.round(v * 100)
      ];
    } else {
      const [r, g, b] = c.rgb();
      return [r, g, b];
    }
  } catch (e) {
    return [0, 0, 0];
  }
};

interface CustomDropdownProps {
  value: string;
  options: { label: string; value: string; colorHex?: string }[];
  onChange: (val: string) => void;
  widthClass?: string;
}

function CustomDropdown({ value, options, onChange, widthClass = "w-[110px]" }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = () => setIsOpen(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isOpen]);

  const activeOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between bg-secondary/50 hover:bg-secondary text-foreground border border-border/80 hover:border-accent/40 rounded-lg px-2.5 py-1.5 text-[10px] font-bold outline-none cursor-pointer transition-all duration-200 ${widthClass}`}
      >
        <span className="truncate flex items-center gap-1.5">
          {activeOption?.colorHex && (
            <span className="w-2 h-2 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: activeOption.colorHex }} />
          )}
          {activeOption?.label}
        </span>
        <ChevronDown size={10} className={`text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-1.5 ${widthClass} max-h-[220px] overflow-y-auto bg-popover/95 backdrop-blur-md border border-border/90 rounded-xl shadow-xl z-50 py-1.5 scrollbar-none animate-in fade-in slide-in-from-top-1 duration-150`}>
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 text-[10px] font-semibold transition-colors cursor-pointer ${isActive
                  ? "bg-accent/15 text-accent font-bold"
                  : "text-foreground hover:bg-secondary/40"
                  }`}
              >
                <span className="truncate flex items-center gap-1.5">
                  {opt.colorHex && (
                    <span className="w-2 h-2 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: opt.colorHex }} />
                  )}
                  {opt.label}
                </span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ColorConfigRowProps {
  label: string;
  currentColor: string;
  colorFormat: "hex" | "hsb" | "hsl" | "rgb";
  onChangeColor: (hex: string) => void;
}

function ColorConfigRow({
  label,
  currentColor,
  colorFormat,
  onChangeColor,
}: ColorConfigRowProps) {
  const [localInput, setLocalInput] = useState(formatColor(currentColor, colorFormat));
  const [isFocused, setIsFocused] = useState(false);

  // States for triple inputs
  const [localV1, setLocalV1] = useState("");
  const [localV2, setLocalV2] = useState("");
  const [localV3, setLocalV3] = useState("");
  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isFocused && activeInputIndex === null) {
      setLocalInput(formatColor(currentColor, colorFormat));
      const [x1, x2, x3] = getTripleValues(currentColor, colorFormat);
      setLocalV1(String(x1));
      setLocalV2(String(x2));
      setLocalV3(String(x3));
    }
  }, [currentColor, colorFormat, isFocused, activeInputIndex]);

  const handleLocalChange = (val: string) => {
    if (colorFormat === "hex") {
      const hasHash = val.startsWith("#");
      const cleanHex = val.replace(/[^0-9a-fA-F]/g, "");
      const limitedHex = cleanHex.slice(0, 6);
      const newVal = (hasHash ? "#" : "") + limitedHex;
      setLocalInput(newVal);
      const parsed = parseAnyColor(newVal);
      if (parsed) {
        onChangeColor(parsed);
      }
    } else {
      setLocalInput(val);
      const parsed = parseAnyColor(val);
      if (parsed) {
        onChangeColor(parsed);
      }
    }
  };

  const handleLocalBlur = () => {
    setIsFocused(false);
    const parsed = parseAnyColor(localInput);
    if (parsed) {
      onChangeColor(parsed);
      setLocalInput(formatColor(parsed, colorFormat));
    } else {
      setLocalInput(formatColor(currentColor, colorFormat));
    }
  };

  // Determine formats for the triple inputs
  let label1 = "R", label2 = "G", label3 = "B";
  let min1 = 0, max1 = 255;
  let min2 = 0, max2 = 255;
  let min3 = 0, max3 = 255;
  let suffix2 = "", suffix3 = "";

  if (colorFormat === "hsl") {
    label1 = "H"; label2 = "S"; label3 = "L";
    min1 = 0; max1 = 360;
    min2 = 0; max2 = 100; suffix2 = "%";
    min3 = 0; max3 = 100; suffix3 = "%";
  } else if (colorFormat === "hsb") {
    label1 = "H"; label2 = "S"; label3 = "B";
    min1 = 0; max1 = 360;
    min2 = 0; max2 = 100; suffix2 = "%";
    min3 = 0; max3 = 100; suffix3 = "%";
  }

  const handleTripleChange = (idx: 1 | 2 | 3, val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, "");

    let n1 = parseFloat(idx === 1 ? cleanVal : localV1) || 0;
    let n2 = parseFloat(idx === 2 ? cleanVal : localV2) || 0;
    let n3 = parseFloat(idx === 3 ? cleanVal : localV3) || 0;

    if (idx === 1) {
      setLocalV1(cleanVal);
      n1 = Math.max(min1, Math.min(max1, n1));
    } else if (idx === 2) {
      setLocalV2(cleanVal);
      n2 = Math.max(min2, Math.min(max2, n2));
    } else {
      setLocalV3(cleanVal);
      n3 = Math.max(min3, Math.min(max3, n3));
    }

    try {
      let hex;
      if (colorFormat === "hsl") {
        hex = chroma.hsl(n1, n2 / 100, n3 / 100).hex();
      } else if (colorFormat === "hsb") {
        hex = chroma.hsv(n1, n2 / 100, n3 / 100).hex();
      } else {
        hex = chroma(n1, n2, n3).hex();
      }
      onChangeColor(hex.toUpperCase());
    } catch (e) { }
  };

  const handleTripleBlur = () => {
    setActiveInputIndex(null);
    const [x1, x2, x3] = getTripleValues(currentColor, colorFormat);
    setLocalV1(String(x1));
    setLocalV2(String(x2));
    setLocalV3(String(x3));
  };

  const currentRefName = REFERENCE_COLORS.find(
    c => c.hex.toLowerCase() === currentColor.toLowerCase()
  )?.name || "Custom";

  const scaleDropdownOptions = REFERENCE_COLORS.map(c => ({
    label: c.name,
    value: c.name,
    colorHex: c.hex,
  }));

  const dropdownOptionsWithCustom = currentRefName === "Custom"
    ? [{ label: "Custom", value: "Custom" }, ...scaleDropdownOptions]
    : scaleDropdownOptions;

  return (
    <div className="group relative flex flex-col gap-1.5 p-3 rounded-xl bg-card/45 border border-border/50 hover:border-accent/40 focus-within:border-accent/60 transition-all duration-300 shadow-sm hover:shadow-md">
      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block transition-colors group-hover:text-foreground">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {/* Visual Color Circle Picker with Double-Ring Styling */}
        <div className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center p-0.5 shrink-0 relative transition-transform duration-200 hover:scale-105 active:scale-95 shadow-sm">
          <div
            className="w-full h-full rounded-full border border-black/10 shadow-inner"
            style={{ backgroundColor: currentColor }}
          />
          <input
            type="color"
            value={currentColor.startsWith("#") && currentColor.length === 7 ? currentColor : "#cccccc"}
            onChange={(e) => handleLocalChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
          />
        </div>

        {/* Inputs section: Hex vs Triple Inputs */}
        <div className="flex-1 min-w-0">
          {colorFormat === "hex" ? (
            <input
              type="text"
              value={localInput}
              onChange={(e) => handleLocalChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={handleLocalBlur}
              className="w-full bg-transparent border-0 font-mono text-[11px] font-bold text-foreground outline-none tracking-wide select-all focus:text-accent transition-colors"
              placeholder="#3B82F6"
            />
          ) : (
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col items-center gap-0.5">
                <input
                  type="text"
                  value={localV1}
                  onChange={(e) => handleTripleChange(1, e.target.value)}
                  onFocus={() => setActiveInputIndex(1)}
                  onBlur={handleTripleBlur}
                  className="w-full text-center bg-background border border-border/80 rounded-lg py-1 px-1 font-mono text-[10px] font-bold text-foreground focus:border-accent outline-none"
                />
                <span className="text-[8px] font-bold text-muted-foreground">{label1}</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-0.5">
                <input
                  type="text"
                  value={localV2}
                  onChange={(e) => handleTripleChange(2, e.target.value)}
                  onFocus={() => setActiveInputIndex(2)}
                  onBlur={handleTripleBlur}
                  className="w-full text-center bg-background border border-border/80 rounded-lg py-1 px-1 font-mono text-[10px] font-bold text-foreground focus:border-accent outline-none"
                />
                <span className="text-[8px] font-bold text-muted-foreground">{label2}{suffix2}</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-0.5">
                <input
                  type="text"
                  value={localV3}
                  onChange={(e) => handleTripleChange(3, e.target.value)}
                  onFocus={() => setActiveInputIndex(3)}
                  onBlur={handleTripleBlur}
                  className="w-full text-center bg-background border border-border/80 rounded-lg py-1 px-1 font-mono text-[10px] font-bold text-foreground focus:border-accent outline-none"
                />
                <span className="text-[8px] font-bold text-muted-foreground">{label3}{suffix3}</span>
              </div>
            </div>
          )}
        </div>

        {/* Styled Custom Dropdown component */}
        <CustomDropdown
          value={currentRefName}
          options={dropdownOptionsWithCustom}
          onChange={(selectedVal) => {
            const selected = REFERENCE_COLORS.find(c => c.name === selectedVal);
            if (selected) {
              onChangeColor(selected.hex);
            }
          }}
          widthClass="w-[115px]"
        />
      </div>
    </div>
  );
}

interface PaletteSidebarProps {
  currentPalette: FullPalette;
  onChangeBaseColor: (hex: string) => void;
  lightnessModifier: number;
  onChangeLightnessModifier: (val: number) => void;
  saturationModifier: number;
  onChangeSaturationModifier: (val: number) => void;
  secondaryColor: string;
  onChangeSecondaryColor: (hex: string) => void;
  neutralColor: string;
  onChangeNeutralColor: (hex: string) => void;
  successColor: string;
  onChangeSuccessColor: (hex: string) => void;
  infoColor: string;
  onChangeInfoColor: (hex: string) => void;
  warningColor: string;
  onChangeWarningColor: (hex: string) => void;
  errorColor: string;
  onChangeErrorColor: (hex: string) => void;
  harmonyMode: string;
  onChangeHarmonyMode: (mode: string) => void;
  headingFont: string;
  bodyFont: string;
  onChangeHeadingFont: (font: string) => void;
  onChangeBodyFont: (font: string) => void;
  fontsSynced: boolean;
  onToggleFontsSynced: () => void;
  onRandomizeFonts: () => void;
  onRandomizeColor: () => void;
  savedPalettes: FullPalette[];
  onSelectSavedPalette: (palette: FullPalette) => void;
  onDeleteSavedPalette: (name: string) => void;
  onSavePalette: () => void;
  paletteNameInput: string;
  setPaletteNameInput: (val: string) => void;
}

export default function PaletteSidebar({
  currentPalette,
  onChangeBaseColor,
  secondaryColor,
  onChangeSecondaryColor,
  neutralColor,
  onChangeNeutralColor,
  successColor,
  onChangeSuccessColor,
  infoColor,
  onChangeInfoColor,
  warningColor,
  onChangeWarningColor,
  errorColor,
  onChangeErrorColor,
  onRandomizeColor,
  savedPalettes,
  onSelectSavedPalette,
  onDeleteSavedPalette,
  onSavePalette,
  paletteNameInput,
  setPaletteNameInput,
}: PaletteSidebarProps) {
  const [sidebarTab, setSidebarTab] = useState<"controls" | "saved">("controls");
  const [colorFormat, setColorFormat] = useState<"hex" | "hsb" | "hsl" | "rgb">("hex");
  const [colorInput, setColorInput] = useState<string>(formatColor(currentPalette.baseColor, "hex"));
  const [baseColorFocused, setBaseColorFocused] = useState<boolean>(false);

  // States for base triple inputs
  const [baseV1, setBaseV1] = useState("");
  const [baseV2, setBaseV2] = useState("");
  const [baseV3, setBaseV3] = useState("");
  const [baseActiveInputIndex, setBaseActiveInputIndex] = useState<number | null>(null);

  // Sync colorInput and triple inputs when baseColor or colorFormat changes externally
  useEffect(() => {
    if (!baseColorFocused) {
      setColorInput(formatColor(currentPalette.baseColor, colorFormat));
    }
    if (baseActiveInputIndex === null) {
      const [x1, x2, x3] = getTripleValues(currentPalette.baseColor, colorFormat);
      setBaseV1(String(x1));
      setBaseV2(String(x2));
      setBaseV3(String(x3));
    }
  }, [currentPalette.baseColor, colorFormat, baseColorFocused, baseActiveInputIndex]);

  const handleInputChange = (val: string) => {
    if (colorFormat === "hex") {
      const hasHash = val.startsWith("#");
      const cleanHex = val.replace(/[^0-9a-fA-F]/g, "");
      const limitedHex = cleanHex.slice(0, 6);
      const newVal = (hasHash ? "#" : "") + limitedHex;
      setColorInput(newVal);
      const parsed = parseAnyColor(newVal);
      if (parsed) {
        onChangeBaseColor(parsed);
      }
    } else {
      setColorInput(val);
      const parsed = parseAnyColor(val);
      if (parsed) {
        onChangeBaseColor(parsed);
      }
    }
  };

  const handleBaseTripleChange = (idx: 1 | 2 | 3, val: string) => {
    let min1 = 0, max1 = 255;
    let min2 = 0, max2 = 255;
    let min3 = 0, max3 = 255;

    if (colorFormat === "hsl" || colorFormat === "hsb") {
      min1 = 0; max1 = 360;
      min2 = 0; max2 = 100;
      min3 = 0; max3 = 100;
    }

    const cleanVal = val.replace(/[^0-9]/g, "");

    let n1 = parseFloat(idx === 1 ? cleanVal : baseV1) || 0;
    let n2 = parseFloat(idx === 2 ? cleanVal : baseV2) || 0;
    let n3 = parseFloat(idx === 3 ? cleanVal : baseV3) || 0;

    if (idx === 1) {
      setBaseV1(cleanVal);
      n1 = Math.max(min1, Math.min(max1, n1));
    } else if (idx === 2) {
      setBaseV2(cleanVal);
      n2 = Math.max(min2, Math.min(max2, n2));
    } else {
      setBaseV3(cleanVal);
      n3 = Math.max(min3, Math.min(max3, n3));
    }

    try {
      let hex;
      if (colorFormat === "hsl") {
        hex = chroma.hsl(n1, n2 / 100, n3 / 100).hex();
      } else if (colorFormat === "hsb") {
        hex = chroma.hsv(n1, n2 / 100, n3 / 100).hex();
      } else {
        hex = chroma(n1, n2, n3).hex();
      }
      onChangeBaseColor(hex.toUpperCase());
    } catch (e) { }
  };

  const handleBaseTripleBlur = () => {
    setBaseActiveInputIndex(null);
    const [x1, x2, x3] = getTripleValues(currentPalette.baseColor, colorFormat);
    setBaseV1(String(x1));
    setBaseV2(String(x2));
    setBaseV3(String(x3));
  };

  const handleInputBlur = () => {
    const parsed = parseAnyColor(colorInput);
    if (parsed) {
      onChangeBaseColor(parsed);
      setColorInput(formatColor(parsed, colorFormat));
    } else {
      setColorInput(formatColor(currentPalette.baseColor, colorFormat));
    }
  };

  const formatOptions = [
    { label: "HEX", value: "hex" },
    { label: "HSB", value: "hsb" },
    { label: "HSL", value: "hsl" },
    { label: "RGB", value: "rgb" },
  ];

  const scaleDropdownOptions = [
    ...REFERENCE_COLORS.map(c => ({
      label: c.name,
      value: c.name,
      colorHex: c.hex,
    })),
  ];

  return (
    <aside className="controls" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: "320px" }}>
      {/* Sidebar Dual-Tab Header */}
      <div className="flex border-b border-border/60 bg-card/20 backdrop-blur-sm sticky top-0 z-20">
        <button
          onClick={() => setSidebarTab("controls")}
          className={`flex-1 py-2.5 sm:py-3 text-center text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 outline-none ${sidebarTab === "controls"
              ? "border-accent text-accent bg-accent/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20"
            }`}
        >
          <Sliders size={12} />
          Palette Generator
        </button>
        <button
          onClick={() => setSidebarTab("saved")}
          className={`flex-1 py-2.5 sm:py-3 text-center text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 outline-none ${sidebarTab === "saved"
              ? "border-accent text-accent bg-accent/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20"
            }`}
        >
          <FolderHeart size={12} />
          Saved Palettes
        </button>
      </div>

      {/* Sidebar Panel Content */}
      <div className="flex-1 overflow-y-auto scrollbar-none" style={{ padding: "16px 14px 64px" }}>
        {sidebarTab === "controls" ? (
          <div className="space-y-6">
            {/* Save Current Palette Input Area */}
            <div className="p-4 bg-card/45 border border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1">
                <FolderHeart size={12} className="text-accent" />
                Save Current Palette
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Name your palette..."
                  value={paletteNameInput}
                  onChange={(e) => setPaletteNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSavePalette();
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  onClick={onSavePalette}
                  className="p-2 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground font-medium text-xs transition-all flex items-center justify-center shrink-0 active:scale-95 cursor-pointer"
                  title="Save Palette"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Base Color Picker Section */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Layers size={12} className="text-accent" />
                  Primary Color
                </h4>
                <button
                  onClick={onRandomizeColor}
                  className="group relative flex items-center gap-1.5 px-3 py-1 text-[10px] font-extrabold text-white bg-primary hover:bg-primary/90  shadow-md  hover:shadow-lg  active:scale-95 transition-all duration-300 border-0 rounded-lg cursor-pointer overflow-hidden"
                >
                  <Sparkles size={11} className="transition-transform group-hover:rotate-12 duration-300" />
                  <span>Randomize</span>
                </button>
              </div>

              <div className="flex items-center gap-3 bg-card/60 p-3.5 border border-border/60 hover:border-accent/40 focus-within:border-accent/60 transition-all duration-300 rounded-2xl shadow-sm">
                {/* Visual Picker with Double-Ring Styling */}
                <div className="w-9 h-9 rounded-full border border-border bg-background flex items-center justify-center p-0.5 shrink-0 relative transition-transform hover:scale-105 active:scale-95 shadow-sm">
                  <div
                    className="w-full h-full rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: currentPalette.baseColor }}
                  />
                  <input
                    type="color"
                    value={currentPalette.baseColor.startsWith("#") && currentPalette.baseColor.length === 7 ? currentPalette.baseColor : "#3b82f6"}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                  />
                </div>
                {/* TextInput / Triple Inputs */}
                <div className="flex-1 min-w-0">
                  {colorFormat === "hex" ? (
                    <input
                      type="text"
                      value={colorInput}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onFocus={() => setBaseColorFocused(true)}
                      onBlur={handleInputBlur}
                      className="w-full bg-transparent border-0 font-mono text-xs font-bold text-foreground outline-none tracking-wide select-all focus:text-accent"
                      placeholder="#3B82F6"
                    />
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1 flex flex-col items-center gap-0.5">
                        <input
                          type="text"
                          value={baseV1}
                          onChange={(e) => handleBaseTripleChange(1, e.target.value)}
                          onFocus={() => setBaseActiveInputIndex(1)}
                          onBlur={handleBaseTripleBlur}
                          className="w-full text-center bg-background border border-border/80 rounded-lg py-1 px-1 font-mono text-[10px] font-bold text-foreground focus:border-accent outline-none"
                        />
                        <span className="text-[8px] font-bold text-muted-foreground">
                          {colorFormat === "hsl" || colorFormat === "hsb" ? "H" : "R"}
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-0.5">
                        <input
                          type="text"
                          value={baseV2}
                          onChange={(e) => handleBaseTripleChange(2, e.target.value)}
                          onFocus={() => setBaseActiveInputIndex(2)}
                          onBlur={handleBaseTripleBlur}
                          className="w-full text-center bg-background border border-border/80 rounded-lg py-1 px-1 font-mono text-[10px] font-bold text-foreground focus:border-accent outline-none"
                        />
                        <span className="text-[8px] font-bold text-muted-foreground">
                          S{colorFormat === "hsl" || colorFormat === "hsb" ? "%" : ""}
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-0.5">
                        <input
                          type="text"
                          value={baseV3}
                          onChange={(e) => handleBaseTripleChange(3, e.target.value)}
                          onFocus={() => setBaseActiveInputIndex(3)}
                          onBlur={handleBaseTripleBlur}
                          className="w-full text-center bg-background border border-border/80 rounded-lg py-1 px-1 font-mono text-[10px] font-bold text-foreground focus:border-accent outline-none"
                        />
                        <span className="text-[8px] font-bold text-muted-foreground">
                          {colorFormat === "hsl" ? "L%" : colorFormat === "hsb" ? "B%" : "B"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {/* Styled Format Custom Dropdown */}
                <CustomDropdown
                  value={colorFormat}
                  options={formatOptions}
                  onChange={(val) => setColorFormat(val as any)}
                  widthClass="w-[75px]"
                />
              </div>
            </div>

            {/* Custom Scales (Neutral, Success, Warning, Error) Section */}
            <div className="space-y-3 border-t border-border/80 pt-5">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Sliders size={12} className="text-accent" />
                Theme Scales Configuration
              </h4>
              <div className="space-y-2.5">
                <ColorConfigRow label="Secondary Color" currentColor={secondaryColor} colorFormat={colorFormat} onChangeColor={onChangeSecondaryColor} />
                <ColorConfigRow label="Neutral Color" currentColor={neutralColor} colorFormat={colorFormat} onChangeColor={onChangeNeutralColor} />
                <ColorConfigRow label="Success Color" currentColor={successColor} colorFormat={colorFormat} onChangeColor={onChangeSuccessColor} />
                <ColorConfigRow label="Info Color" currentColor={infoColor} colorFormat={colorFormat} onChangeColor={onChangeInfoColor} />
                <ColorConfigRow label="Warning Color" currentColor={warningColor} colorFormat={colorFormat} onChangeColor={onChangeWarningColor} />
                <ColorConfigRow label="Error Color" currentColor={errorColor} colorFormat={colorFormat} onChangeColor={onChangeErrorColor} />
              </div>
            </div>
          </div>
        ) : (
          <SavedPalettes
            saved={savedPalettes}
            currentPalette={currentPalette}
            onSelect={onSelectSavedPalette}
            onDelete={onDeleteSavedPalette}
          />
        )}
      </div>
    </aside>
  );
}
