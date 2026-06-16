"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import chroma from "chroma-js";
import PaletteSidebar from "./PaletteSidebar";
import PalettePreviewArea from "./PalettePreviewArea";
import ExportModal from "./ExportModal";
import Header from "./Header";
import {
  FullPalette,
  PaletteShade,
  NamedScale,
  generateShades,
  generateNeutralScale,
  inferColorName,
} from "@/lib/paletteUtils";

interface PaletteGeneratorProps {
  theme: string;
  toggleTheme: () => void;
  onChangeStudio: (studio: "gradient" | "palette") => void;
}

export default function PaletteGenerator({
  theme,
  toggleTheme,
  onChangeStudio,
}: PaletteGeneratorProps) {
  // Base states
  const [baseColor, setBaseColor] = useState<string>("#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState<string>("#8B5CF6");
  const [neutralColor, setNeutralColor] = useState<string>("#9E9E9E");
  const [successColor, setSuccessColor] = useState<string>("#4CAF50");
  const [warningColor, setWarningColor] = useState<string>("#FFEB3B");
  const [errorColor, setErrorColor] = useState<string>("#F44336");
  const [lightnessModifier, setLightnessModifier] = useState<number>(0);
  const [saturationModifier, setSaturationModifier] = useState<number>(0);
  const [neutralType, setNeutralType] = useState<string>("zinc");
  const [harmonyMode, setHarmonyMode] = useState<string>("Complementary");
  const [headingFont, setHeadingFont] = useState<string>("Outfit");
  const [bodyFont, setBodyFont] = useState<string>("Inter");
  const [fontsSynced, setFontsSynced] = useState<boolean>(true);
  const [paletteName, setPaletteName] = useState<string>("Blue Ribbon");
  
  const [savedPalettes, setSavedPalettes] = useState<FullPalette[]>([]);
  const [paletteNameInput, setPaletteNameInput] = useState<string>("");
  const [exportPaletteData, setExportPaletteData] = useState<{
    name: string;
    shades: PaletteShade[];
    secondary?: PaletteShade[];
    neutrals?: PaletteShade[];
    success?: PaletteShade[];
    warning?: PaletteShade[];
    error?: PaletteShade[];
  } | null>(null);
  const [exportAllScalesData, setExportAllScalesData] = useState<NamedScale[] | null>(null);

  // Sync URL color on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const colorParam = params.get("color");
      if (colorParam) {
        let cleanColor = colorParam;
        if (!cleanColor.startsWith("#")) {
          cleanColor = "#" + cleanColor;
        }
        // Validate hex format
        if (/^#[0-9A-F]{6}$/i.test(cleanColor)) {
          setBaseColor(cleanColor);
          setPaletteName(inferColorName(cleanColor));
        }
      }
      const secondaryParam = params.get("secondary");
      if (secondaryParam) {
        let clean = secondaryParam;
        if (!clean.startsWith("#")) clean = "#" + clean;
        if (/^#[0-9A-F]{6}$/i.test(clean)) {
          setSecondaryColor(clean);
        }
      }
      const neutralParam = params.get("neutral");
      if (neutralParam) {
        let clean = neutralParam;
        if (!clean.startsWith("#")) clean = "#" + clean;
        if (/^#[0-9A-F]{6}$/i.test(clean)) {
          setNeutralColor(clean);
        }
      }
      const successParam = params.get("success");
      if (successParam) {
        let clean = successParam;
        if (!clean.startsWith("#")) clean = "#" + clean;
        if (/^#[0-9A-F]{6}$/i.test(clean)) {
          setSuccessColor(clean);
        }
      }
      const warningParam = params.get("warning");
      if (warningParam) {
        let clean = warningParam;
        if (!clean.startsWith("#")) clean = "#" + clean;
        if (/^#[0-9A-F]{6}$/i.test(clean)) {
          setWarningColor(clean);
        }
      }
      const errorParam = params.get("error");
      if (errorParam) {
        let clean = errorParam;
        if (!clean.startsWith("#")) clean = "#" + clean;
        if (/^#[0-9A-F]{6}$/i.test(clean)) {
          setErrorColor(clean);
        }
      }
    }
  }, []);

  // Update URL state query params on base color change
  const handleSetBaseColor = (hex: string) => {
    // Basic validation
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      setBaseColor(hex);
      setPaletteName(inferColorName(hex));
      
      // Update URL query parameters silently
      if (typeof window !== "undefined") {
        const cleanHex = hex.replace("#", "");
        const params = new URLSearchParams(window.location.search);
        params.set("color", cleanHex);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, "", newUrl);
      }
    }
  };

  const handleSetSuccessColor = (hex: string) => {
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      setSuccessColor(hex);
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        params.set("success", hex.replace("#", ""));
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, "", newUrl);
      }
    }
  };

  const handleSetWarningColor = (hex: string) => {
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      setWarningColor(hex);
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        params.set("warning", hex.replace("#", ""));
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, "", newUrl);
      }
    }
  };

  const handleSetSecondaryColor = (hex: string) => {
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      setSecondaryColor(hex);
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        params.set("secondary", hex.replace("#", ""));
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, "", newUrl);
      }
    }
  };

  const handleSetNeutralColor = (hex: string) => {
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      setNeutralColor(hex);
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        params.set("neutral", hex.replace("#", ""));
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, "", newUrl);
      }
    }
  };

  const handleSetErrorColor = (hex: string) => {
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      setErrorColor(hex);
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        params.set("error", hex.replace("#", ""));
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, "", newUrl);
      }
    }
  };

  // Generate scales using LCH logic
  const primaryShades = useMemo(() => {
    return generateShades(baseColor, lightnessModifier, saturationModifier);
  }, [baseColor, lightnessModifier, saturationModifier]);

  const secondaryShades = useMemo(() => {
    return generateShades(secondaryColor, lightnessModifier, saturationModifier);
  }, [secondaryColor, lightnessModifier, saturationModifier]);

  const neutralShades = useMemo(() => {
    return generateShades(neutralColor, lightnessModifier, saturationModifier);
  }, [neutralColor, lightnessModifier, saturationModifier]);

  const successShades = useMemo(() => {
    return generateShades(successColor);
  }, [successColor]);

  const warningShades = useMemo(() => {
    return generateShades(warningColor);
  }, [warningColor]);

  const errorShades = useMemo(() => {
    return generateShades(errorColor);
  }, [errorColor]);

  // Aggregate current palette model
  const currentPalette: FullPalette = useMemo(() => {
    return {
      name: paletteName,
      description: `LCH Perceptual Scale based on ${baseColor}`,
      createdDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      baseColor,
      shades: primaryShades,
      secondaryColor,
      secondary: secondaryShades,
      neutralType,
      neutrals: neutralShades,
      success: successShades,
      warning: warningShades,
      error: errorShades,
      harmonyMode,
      headingFont,
      bodyFont,
      lockedShades: [],
      // Extra fields for custom status color inputs
      neutralColor,
      successColor,
      warningColor,
      errorColor,
    } as any;
  }, [
    paletteName,
    baseColor,
    primaryShades,
    secondaryColor,
    secondaryShades,
    neutralType,
    neutralShades,
    successShades,
    warningShades,
    errorShades,
    harmonyMode,
    headingFont,
    bodyFont,
    neutralColor,
    successColor,
    warningColor,
    errorColor,
  ]);

  // Load saved palettes from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tailwind-palette-presets");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedPalettes(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load saved palettes:", e);
    }
  }, []);

  // Save current palette
  const handleSavePalette = () => {
    const name = paletteNameInput.trim().slice(0, 32);
    if (!name) {
      toast.error("Please enter a valid palette name");
      return;
    }
    const exists = savedPalettes.some((p) => p.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toast.error("A palette with this name already exists");
      return;
    }

    const newPal: FullPalette = {
      ...currentPalette,
      name,
    };

    const updated = [...savedPalettes, newPal];
    try {
      localStorage.setItem("tailwind-palette-presets", JSON.stringify(updated));
      setSavedPalettes(updated);
      setPaletteNameInput("");
      toast.success(`Saved "${name}"`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save palette");
    }
  };

  // Delete saved palette
  const handleDeletePalette = (name: string) => {
    const updated = savedPalettes.filter((p) => p.name !== name);
    try {
      localStorage.setItem("tailwind-palette-presets", JSON.stringify(updated));
      setSavedPalettes(updated);
      toast.success(`Deleted "${name}"`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete palette");
    }
  };

  // Select a saved palette
  const handleSelectPalette = (pal: FullPalette) => {
    setBaseColor(pal.baseColor);
    setPaletteName(pal.name);
    setNeutralType(pal.neutralType);
    setHeadingFont(pal.headingFont);
    setBodyFont(pal.bodyFont);

    if (pal.secondaryColor) handleSetSecondaryColor(pal.secondaryColor);
    if (pal.neutralColor) handleSetNeutralColor(pal.neutralColor);
    if (pal.successColor) handleSetSuccessColor(pal.successColor);
    if (pal.warningColor) handleSetWarningColor(pal.warningColor);
    if (pal.errorColor) handleSetErrorColor(pal.errorColor);
    
    // Also update URL parameter silently for base color
    if (typeof window !== "undefined") {
      const cleanHex = pal.baseColor.replace("#", "");
      const params = new URLSearchParams(window.location.search);
      params.set("color", cleanHex);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }
    
    toast.success(`Loaded "${pal.name}"`);
  };

  // Randomize colors
  const handleRandomizeColor = () => {
    // 1. Primary Color
    const pHue = Math.floor(Math.random() * 360);
    const pSat = 60 + Math.floor(Math.random() * 25); // 60% - 85%
    const pLit = 48 + Math.floor(Math.random() * 15); // 48% - 63%
    const primaryColor = chroma.hsl(pHue, pSat / 100, pLit / 100).hex().toUpperCase();
    handleSetBaseColor(primaryColor);

    // 2. Secondary Color (coordinated harmony)
    const harmonyModes = ["analogous", "complementary", "split-complementary", "triadic"];
    const mode = harmonyModes[Math.floor(Math.random() * harmonyModes.length)];
    let sHue = pHue;
    if (mode === "analogous") {
      sHue = pHue + (Math.random() > 0.5 ? 30 : -30);
    } else if (mode === "complementary") {
      sHue = pHue + 180;
    } else if (mode === "split-complementary") {
      sHue = pHue + (Math.random() > 0.5 ? 150 : 210);
    } else if (mode === "triadic") {
      sHue = pHue + (Math.random() > 0.5 ? 120 : 240);
    }
    sHue = (sHue + 360) % 360;
    const sSat = 55 + Math.floor(Math.random() * 25); // 55% - 80%
    const sLit = 45 + Math.floor(Math.random() * 15); // 45% - 60%
    const secondaryColor = chroma.hsl(sHue, sSat / 100, sLit / 100).hex().toUpperCase();
    handleSetSecondaryColor(secondaryColor);

    // 3. Neutral Color (random matching gray tone)
    const neutralTypes = ["zinc", "slate", "cool", "warm", "brand"];
    const nType = neutralTypes[Math.floor(Math.random() * neutralTypes.length)];
    let nHue = 240;
    let nSat = 5;
    if (nType === "zinc") {
      nHue = 240; nSat = 4 + Math.floor(Math.random() * 4); // 4% - 8%
    } else if (nType === "slate") {
      nHue = 200; nSat = 8 + Math.floor(Math.random() * 6); // 8% - 14%
    } else if (nType === "cool") {
      nHue = 220; nSat = 5 + Math.floor(Math.random() * 5); // 5% - 10%
    } else if (nType === "warm") {
      nHue = 40; nSat = 6 + Math.floor(Math.random() * 6); // 6% - 12%
    } else { // brand-tinted
      nHue = pHue; nSat = 6 + Math.floor(Math.random() * 6); // 6% - 12%
    }
    const nLit = 46 + Math.floor(Math.random() * 8); // 46% - 54%
    const neutralColor = chroma.hsl(nHue, nSat / 100, nLit / 100).hex().toUpperCase();
    handleSetNeutralColor(neutralColor);

    // 4. Success Color (Green/Teal variations)
    const succHue = 115 + Math.floor(Math.random() * 30); // 115 - 145 (Green)
    const succSat = 55 + Math.floor(Math.random() * 20); // 55% - 75%
    const succLit = 44 + Math.floor(Math.random() * 10); // 44% - 54%
    const successColor = chroma.hsl(succHue, succSat / 100, succLit / 100).hex().toUpperCase();
    handleSetSuccessColor(successColor);

    // 5. Warning Color (Amber/Yellow/Orange variations)
    const warnHue = 35 + Math.floor(Math.random() * 20); // 35 - 55 (Amber/Yellow-orange)
    const warnSat = 75 + Math.floor(Math.random() * 20); // 75% - 95%
    const warnLit = 46 + Math.floor(Math.random() * 10); // 46% - 56%
    const warningColor = chroma.hsl(warnHue, warnSat / 100, warnLit / 100).hex().toUpperCase();
    handleSetWarningColor(warningColor);

    // 6. Error Color (Red/Crimson variations)
    const errHue = (Math.random() > 0.5 ? (350 + Math.floor(Math.random() * 15)) : Math.floor(Math.random() * 10)) % 360; // Red/Crimson
    const errSat = 65 + Math.floor(Math.random() * 20); // 65% - 85%
    const errLit = 44 + Math.floor(Math.random() * 10); // 44% - 54%
    const errorColor = chroma.hsl(errHue, errSat / 100, errLit / 100).hex().toUpperCase();
    handleSetErrorColor(errorColor);
  };

  // Randomize typography selection
  const handleRandomizeFonts = () => {
    const FONTS_LIST = [
      "Outfit",
      "Inter",
      "Poppins",
      "Roboto",
      "Playfair Display",
      "Lora",
      "Merriweather",
      "JetBrains Mono"
    ];
    const randHeading = FONTS_LIST[Math.floor(Math.random() * FONTS_LIST.length)];
    setHeadingFont(randHeading);
    if (fontsSynced) {
      setBodyFont(randHeading);
    } else {
      const randBody = FONTS_LIST[Math.floor(Math.random() * FONTS_LIST.length)];
      setBodyFont(randBody);
    }
  };

  // Handle syncing toggle
  const handleToggleFontsSynced = () => {
    const next = !fontsSynced;
    setFontsSynced(next);
    if (next) {
      setBodyFont(headingFont);
    }
  };

  const handleHeadingFontChange = (font: string) => {
    setHeadingFont(font);
    if (fontsSynced) {
      setBodyFont(font);
    }
  };

  return (
    <div className="app-shell">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        activeStudio="palette"
        onChangeStudio={onChangeStudio}
        randomizePalette={handleRandomizeColor}
        openExportPalette={() => setExportPaletteData({
          name: currentPalette.name,
          shades: currentPalette.shades,
          secondary: currentPalette.secondary || [],
          neutrals: currentPalette.neutrals,
          success: currentPalette.success,
          warning: currentPalette.warning,
          error: currentPalette.error,
        })}
      />

      {/* Main Workspace Preview */}
      <PalettePreviewArea
        currentPalette={currentPalette}
        onSetBaseColor={handleSetBaseColor}
        onSetSecondaryColor={handleSetSecondaryColor}
        openExportPalette={() => setExportPaletteData({
          name: currentPalette.name,
          shades: currentPalette.shades,
          secondary: currentPalette.secondary || [],
          neutrals: currentPalette.neutrals,
          success: currentPalette.success,
          warning: currentPalette.warning,
          error: currentPalette.error,
        })}
        onExportSingleScale={(name, shades) => setExportPaletteData({
          name,
          shades,
          secondary: [],
          neutrals: [],
          success: [],
          warning: [],
          error: [],
        })}
        onExportAllScales={(scales) => setExportAllScalesData(scales)}
      />

      {/* Right Sidebar Control Rail */}
      <PaletteSidebar
        currentPalette={currentPalette}
        onChangeBaseColor={handleSetBaseColor}
        lightnessModifier={lightnessModifier}
        onChangeLightnessModifier={setLightnessModifier}
        saturationModifier={saturationModifier}
        onChangeSaturationModifier={setSaturationModifier}
        secondaryColor={secondaryColor}
        onChangeSecondaryColor={handleSetSecondaryColor}
        neutralColor={neutralColor}
        onChangeNeutralColor={handleSetNeutralColor}
        successColor={successColor}
        onChangeSuccessColor={handleSetSuccessColor}
        warningColor={warningColor}
        onChangeWarningColor={handleSetWarningColor}
        errorColor={errorColor}
        onChangeErrorColor={handleSetErrorColor}
        harmonyMode={harmonyMode}
        onChangeHarmonyMode={setHarmonyMode}
        headingFont={headingFont}
        bodyFont={bodyFont}
        onChangeHeadingFont={handleHeadingFontChange}
        onChangeBodyFont={setBodyFont}
        fontsSynced={fontsSynced}
        onToggleFontsSynced={handleToggleFontsSynced}
        onRandomizeFonts={handleRandomizeFonts}
        onRandomizeColor={handleRandomizeColor}
        savedPalettes={savedPalettes}
        onSelectSavedPalette={handleSelectPalette}
        onDeleteSavedPalette={handleDeletePalette}
        onSavePalette={handleSavePalette}
        paletteNameInput={paletteNameInput}
        setPaletteNameInput={setPaletteNameInput}
      />

      {/* Export Code Modal overlay — single palette or single scale */}
      <ExportModal
        isOpen={!!exportPaletteData}
        onClose={() => setExportPaletteData(null)}
        paletteName={exportPaletteData?.name || currentPalette.name}
        shades={exportPaletteData?.shades || currentPalette.shades}
        secondary={exportPaletteData?.secondary || []}
        neutrals={exportPaletteData?.neutrals || []}
        success={exportPaletteData?.success || []}
        warning={exportPaletteData?.warning || []}
        error={exportPaletteData?.error || []}
      />

      {/* Export All modal — all 19 reference scales */}
      <ExportModal
        isOpen={!!exportAllScalesData}
        onClose={() => setExportAllScalesData(null)}
        paletteName="reference-scales"
        shades={[]}
        secondary={[]}
        neutrals={[]}
        success={[]}
        warning={[]}
        error={[]}
        scales={exportAllScalesData || undefined}
      />
    </div>
  );
}
