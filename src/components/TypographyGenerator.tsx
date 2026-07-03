"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import Header from "./Header";
import TypographySidebar from "./TypographySidebar";
import TypographyPreviewArea from "./TypographyPreviewArea";
import TypographyExportModal from "./TypographyExportModal";
import {
  TypographySystem,
  TypographyStyle,
  StyleDefinition,
  generateStyles,
  STYLE_DEFAULTS
} from "@/lib/typographyUtils";

interface TypographyGeneratorProps {
  theme: string;
  toggleTheme: () => void;
  onChangeStudio: (studio: "gradient" | "palette" | "typography") => void;
}

export default function TypographyGenerator({
  theme,
  toggleTheme,
  onChangeStudio,
}: TypographyGeneratorProps) {
  // Base configuration states
  const [name, setName] = useState<string>("Inter Scale");
  const [fontFamily, setFontFamily] = useState<string>("Inter");
  const [baseSize, setBaseSize] = useState<number>(16);
  const [scaleRatio, setScaleRatio] = useState<number>(1.25);
  const [scaleMethod, setScaleMethod] = useState<string>("Major Third");
  const [rounding, setRounding] = useState<TypographySystem["rounding"]>("integer");
  const [namingConvention, setNamingConvention] = useState<TypographySystem["namingConvention"]>("camelCase");
  const [responsiveScale, setResponsiveScale] = useState<TypographySystem["responsiveScale"]>("none");

  // Dynamic list of active style definitions (defaults + custom)
  const [styleDefs, setStyleDefs] = useState<StyleDefinition[]>(STYLE_DEFAULTS);

  // Overrides map styleId -> partial overrides
  const [overrides, setOverrides] = useState<Record<string, Partial<TypographyStyle>>>({});

  // Saved presets list
  const [savedPresets, setSavedPresets] = useState<TypographySystem[]>([]);

  // Export modal state
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Synchronize dynamic calculations when settings, overrides or style defs change
  const styles = useMemo(() => {
    return generateStyles(baseSize, scaleRatio, rounding, styleDefs, overrides);
  }, [baseSize, scaleRatio, rounding, styleDefs, overrides]);

  const currentSystem: TypographySystem = {
    name,
    fontFamily,
    baseSize,
    scaleRatio,
    scaleMethod,
    rounding,
    namingConvention,
    responsiveScale,
    styles,
  };

  // Load presets on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("niram-kalavai-saved-typography");
        if (stored) {
          setSavedPresets(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Failed to load saved typography systems:", err);
      }
    }
  }, []);

  const handleSavePreset = useCallback((presetName: string) => {
    // Check if name already exists
    if (savedPresets.some((p) => p.name.toLowerCase() === presetName.toLowerCase())) {
      toast.error(`A system named "${presetName}" already exists.`);
      return;
    }

    const newPreset: TypographySystem = {
      name: presetName,
      fontFamily,
      baseSize,
      scaleRatio,
      scaleMethod,
      rounding,
      namingConvention,
      responsiveScale,
      // Store style snapshots if they have overrides
      styles: styles.map((st) => ({
        ...st,
        isOverridden: overrides[st.id] ? true : false,
      })),
    };

    const updated = [newPreset, ...savedPresets];
    setSavedPresets(updated);
    try {
      localStorage.setItem("niram-kalavai-saved-typography", JSON.stringify(updated));
      toast.success(`Successfully saved "${presetName}"!`);
      setName(presetName);
    } catch (err) {
      toast.error("Failed to save preset to storage");
    }
  }, [fontFamily, baseSize, scaleRatio, scaleMethod, rounding, namingConvention, responsiveScale, styles, overrides, savedPresets]);

  const handleDeletePreset = useCallback((presetName: string) => {
    const updated = savedPresets.filter((p) => p.name !== presetName);
    setSavedPresets(updated);
    try {
      localStorage.setItem("niram-kalavai-saved-typography", JSON.stringify(updated));
      toast.success(`Deleted typography system "${presetName}"`);
    } catch (err) {
      toast.error("Failed to delete preset from storage");
    }
  }, [savedPresets]);

  const handleLoadPreset = useCallback((preset: TypographySystem) => {
    setName(preset.name);
    setFontFamily(preset.fontFamily);
    setBaseSize(preset.baseSize);
    setScaleRatio(preset.scaleRatio);
    setScaleMethod(preset.scaleMethod || "Custom");
    setRounding(preset.rounding || "integer");
    setNamingConvention(preset.namingConvention || "camelCase");
    setResponsiveScale(preset.responsiveScale || "none");

    // Reconstruct styleDefs
    const newDefs = preset.styles.map((st) => ({
      id: st.id,
      name: st.name,
      step: st.step,
      weight: st.fontWeight,
      lh: st.lineHeight,
      ls: st.letterSpacing,
      isCustom: st.isCustom,
    }));
    setStyleDefs(newDefs);

    // Reconstruct overrides
    const newOverrides: Record<string, Partial<TypographyStyle>> = {};
    preset.styles.forEach((st) => {
      if (st.isOverridden) {
        newOverrides[st.id] = {
          sizePx: st.sizePx,
          lineHeight: st.lineHeight,
          letterSpacing: st.letterSpacing,
          fontWeight: st.fontWeight,
        };
      }
    });
    setOverrides(newOverrides);
    toast.success(`Loaded typography system "${preset.name}"`);
  }, []);

  const handleUpdateSystem = useCallback((patch: Partial<TypographySystem>) => {
    if (patch.fontFamily !== undefined) setFontFamily(patch.fontFamily);
    if (patch.baseSize !== undefined) setBaseSize(patch.baseSize);
    if (patch.scaleRatio !== undefined) setScaleRatio(patch.scaleRatio);
    if (patch.scaleMethod !== undefined) setScaleMethod(patch.scaleMethod);
    if (patch.rounding !== undefined) setRounding(patch.rounding);
    if (patch.namingConvention !== undefined) setNamingConvention(patch.namingConvention);
    if (patch.responsiveScale !== undefined) setResponsiveScale(patch.responsiveScale);
  }, []);

  const handleChangeStyleOverride = useCallback((styleId: string, patch: Partial<TypographyStyle>) => {
    setOverrides((prev) => ({
      ...prev,
      [styleId]: {
        ...(prev[styleId] || {}),
        ...patch,
      },
    }));
  }, []);

  const handleRemoveStyleOverride = useCallback((styleId: string) => {
    setOverrides((prev) => {
      const copy = { ...prev };
      delete copy[styleId];
      return copy;
    });
  }, []);

  const handleResetAllOverrides = useCallback(() => {
    setOverrides({});
    setStyleDefs(STYLE_DEFAULTS);
    toast.success("Reset all styles and manual overrides");
  }, []);

  const handleAddStyle = useCallback(() => {
    // Find next heading number
    let maxHeadingNum = 0;
    styleDefs.forEach((def) => {
      const match = def.name.match(/^H(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxHeadingNum) {
          maxHeadingNum = num;
        }
      }
    });

    const nextNum = maxHeadingNum > 0 ? maxHeadingNum + 1 : 7;
    const newId = `h${nextNum}`;
    
    // Check if ID already exists (in case they have non-standard names)
    let finalId = newId;
    let index = 1;
    while (styleDefs.some((d) => d.id === finalId)) {
      finalId = `${newId}_${index}`;
      index++;
    }

    const newDef = {
      id: finalId,
      name: `H${nextNum}`,
      step: nextNum,
      weight: 700,
      lh: 1.2,
      ls: -0.02,
      isCustom: true,
    };

    setStyleDefs((prev) => [newDef, ...prev]);
    toast.success(`Added heading style ${newDef.name}!`);
  }, [styleDefs]);

  const handleDeleteStyle = useCallback((styleId: string) => {
    setStyleDefs((prev) => prev.filter((d) => d.id !== styleId));
    setOverrides((prev) => {
      const copy = { ...prev };
      delete copy[styleId];
      return copy;
    });
    toast.success("Removed style from list");
  }, []);

  const handleDeleteMultipleStyles = useCallback((styleIds: string[]) => {
    setStyleDefs((prev) => prev.filter((d) => !styleIds.includes(d.id)));
    setOverrides((prev) => {
      const copy = { ...prev };
      styleIds.forEach((id) => {
        delete copy[id];
      });
      return copy;
    });
    toast.success(`Removed ${styleIds.length} styles`);
  }, []);

  const handleChangeStyleName = useCallback((styleId: string, newName: string) => {
    setStyleDefs((prev) =>
      prev.map((d) => (d.id === styleId ? { ...d, name: newName } : d))
    );
  }, []);

  const hasOverrides = Object.keys(overrides).length > 0;

  return (
    <div className="app-shell">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        activeStudio="typography"
        onChangeStudio={onChangeStudio}
        openExportTypography={() => setIsExportOpen(true)}
      />

      {/* Workspace Preview */}
      <TypographyPreviewArea
        system={currentSystem}
        onChangeStyleOverride={handleChangeStyleOverride}
        onRemoveStyleOverride={handleRemoveStyleOverride}
        onResetAllOverrides={handleResetAllOverrides}
        onAddStyle={handleAddStyle}
        onDeleteStyle={handleDeleteStyle}
        onChangeStyleName={handleChangeStyleName}
        onDeleteMultipleStyles={handleDeleteMultipleStyles}
      />

      {/* Control Sidebar */}
      <TypographySidebar
        system={currentSystem}
        onChangeSystem={handleUpdateSystem}
        savedPresets={savedPresets}
        onSavePreset={handleSavePreset}
        onDeletePreset={handleDeletePreset}
        onLoadPreset={handleLoadPreset}
        onResetOverrides={handleResetAllOverrides}
        hasOverrides={hasOverrides}
      />

      {/* Export & Tokens Modal */}
      <TypographyExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        system={currentSystem}
      />
    </div>
  );
}
