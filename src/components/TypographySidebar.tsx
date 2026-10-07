"use client";

import { useEffect, useState } from "react";
import { ChevronDown, FolderHeart, Sliders, Trash2, Plus, Type } from "lucide-react";
import { SCALES, TypographySystem } from "@/lib/typographyUtils";

interface CustomDropdownProps {
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  widthClass?: string;
  suffix?: string;
}

function CustomDropdown({ value, options, onChange, isOpen, onToggle, widthClass = "w-[150px]", suffix = "" }: CustomDropdownProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = () => onToggle(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isOpen, onToggle]);

  const activeOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative font-sans" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => onToggle(!isOpen)}
        className={`flex items-center justify-between bg-secondary/50 hover:bg-secondary text-foreground border border-border/80 hover:border-accent/40 rounded-lg px-2.5 py-1.5 text-[10px] font-bold outline-none cursor-pointer transition-all duration-200 ${widthClass}`}
      >
        <span className="truncate">{activeOption ? `${activeOption.label}${suffix}` : ""}</span>
        <ChevronDown size={10} className={`text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-1.5 ${widthClass} max-h-[220px] overflow-y-auto bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-1.5 scrollbar-none animate-in fade-in slide-in-from-top-1 duration-150`}>
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  onToggle(false);
                }}
                className={`w-full flex items-center gap-2 text-left px-3 py-1.5 text-[10px] font-semibold transition-colors cursor-pointer rounded-md ${
                  isActive ? "bg-accent/15 text-accent font-bold" : "text-neutral-700 hover:bg-accent hover:text-white"
                }`}
              >
                <span className="w-3 shrink-0 flex items-center justify-center text-[10px] font-bold">
                  {isActive ? "✓" : ""}
                </span>
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const FONTS = [
  { label: "Inter", value: "Inter" },
  { label: "Poppins", value: "Poppins" },
  { label: "Roboto", value: "Roboto" },
  { label: "Playfair Display", value: "Playfair Display" },
  { label: "Lora", value: "Lora" },
  { label: "Merriweather", value: "Merriweather" },
  { label: "Outfit", value: "Outfit" },
  { label: "JetBrains Mono", value: "JetBrains Mono" },
  { label: "Montserrat", value: "Montserrat" },
  { label: "Lato", value: "Lato" },
  { label: "Open Sans", value: "Open Sans" },
  { label: "Syne", value: "Syne" },
  { label: "Space Grotesk", value: "Space Grotesk" },
  { label: "Cormorant Garamond", value: "Cormorant Garamond" },
  { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans" },
  { label: "DM Sans", value: "DM Sans" },
];

const BASE_SIZE_OPTIONS = [
  { label: "10", value: "10" },
  { label: "11", value: "11" },
  { label: "12", value: "12" },
  { label: "13", value: "13" },
  { label: "14", value: "14" },
  { label: "15", value: "15" },
  { label: "16", value: "16" },
  { label: "20", value: "20" },
  { label: "24", value: "24" },
  { label: "32", value: "32" },
  { label: "36", value: "36" },
  { label: "40", value: "40" },
  { label: "48", value: "48" },
  { label: "64", value: "64" },
  { label: "96", value: "96" },
  { label: "128", value: "128" },
];

const ROUNDINGS = [
  { label: "Round to integers", value: "integer" },
  { label: "1 decimal place", value: "decimal" },
  { label: "No rounding", value: "none" },
];

const CONVENTIONS = [
  { label: "camelCase", value: "camelCase" },
  { label: "kebab-case", value: "kebab-case" },
  { label: "snake_case", value: "snake_case" },
  { label: "PascalCase", value: "PascalCase" },
];

const RESPONSIVE_MODES = [
  { label: "None (Same size)", value: "none" },
  { label: "Stepped (Mobile scale)", value: "stepped" },
  { label: "Fluid (CSS clamp)", value: "fluid" },
];

interface TypographySidebarProps {
  system: TypographySystem;
  onChangeSystem: (patch: Partial<TypographySystem>) => void;
  savedPresets: TypographySystem[];
  onSavePreset: (name: string) => void;
  onDeletePreset: (name: string) => void;
  onLoadPreset: (preset: TypographySystem) => void;
  onResetOverrides: () => void;
  hasOverrides: boolean;
}

export default function TypographySidebar({
  system,
  onChangeSystem,
  savedPresets,
  onSavePreset,
  onDeletePreset,
  onLoadPreset,
  onResetOverrides,
  hasOverrides,
}: TypographySidebarProps) {
  const [sidebarTab, setSidebarTab] = useState<"controls" | "saved">("controls");
  const [presetNameInput, setPresetNameInput] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleSave = () => {
    const trimmed = presetNameInput.trim();
    if (!trimmed) return;
    onSavePreset(trimmed);
    setPresetNameInput("");
  };

  return (
    <aside className="controls stagger" data-testid="controls-rail">
      {/* Sidebar Tabs */}
      <div className="flex border-b border-border bg-card/20 shrink-0">
        <button
          onClick={() => setSidebarTab("controls")}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            sidebarTab === "controls" ? "border-accent text-accent bg-accent/5" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Sliders size={12} />
            Settings
          </div>
        </button>
        <button
          onClick={() => setSidebarTab("saved")}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            sidebarTab === "saved" ? "border-accent text-accent bg-accent/5" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <FolderHeart size={12} />
            Presets ({savedPresets.length})
          </div>
        </button>
      </div>

      {sidebarTab === "controls" ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-none">
          {/* Preset Name Input */}
          <div className="bg-card/40 border border-border/80 rounded-2xl p-3.5 space-y-3">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Save Typography System</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={presetNameInput}
                onChange={(e) => setPresetNameInput(e.target.value)}
                placeholder="e.g. Elegant Serif, Tech Minimalist..."
                className="flex-1 bg-secondary/50 hover:bg-secondary border border-border/80 hover:border-accent/40 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all"
              />
              <button
                onClick={handleSave}
                disabled={!presetNameInput.trim()}
                className="btn-pill primary flex items-center gap-1.5 px-3.5 text-xs py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus size={14} />
                Save
              </button>
            </div>
          </div>

          {/* Typography configuration */}
          <div className="space-y-4">
            <div className="section-title flex justify-between items-center">
              <span>Typography Configuration</span>
              {hasOverrides && (
                <button
                  onClick={onResetOverrides}
                  className="text-[9px] font-bold text-accent hover:underline flex items-center gap-0.5 cursor-pointer uppercase"
                >
                  Reset overrides
                </button>
              )}
            </div>

            {/* Font Family selector */}
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-xs font-semibold text-foreground">Font Family</span>
              <CustomDropdown
                value={system.fontFamily}
                options={FONTS}
                onChange={(val) => onChangeSystem({ fontFamily: val })}
                isOpen={activeDropdown === "fontFamily"}
                onToggle={(open) => setActiveDropdown(open ? "fontFamily" : null)}
                widthClass="w-[160px]"
              />
            </div>

            {/* Base Font Size selector */}
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-xs font-semibold text-foreground">Base Font Size</span>
              <CustomDropdown
                value={String(system.baseSize)}
                options={BASE_SIZE_OPTIONS}
                onChange={(val) => onChangeSystem({ baseSize: Number(val) })}
                isOpen={activeDropdown === "baseSize"}
                onToggle={(open) => setActiveDropdown(open ? "baseSize" : null)}
                widthClass="w-[160px]"
                suffix="px"
              />
            </div>

            {/* Scale Ratio selector */}
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-xs font-semibold text-foreground">Scale Ratio</span>
              <CustomDropdown
                value={String(system.scaleRatio)}
                options={SCALES.map((s) => ({ label: s.label, value: String(s.ratio) }))}
                onChange={(val) => {
                  const num = Number(val);
                  const selectedScale = SCALES.find((s) => s.ratio === num);
                  onChangeSystem({
                    scaleRatio: num,
                    scaleMethod: selectedScale ? selectedScale.name : "Custom",
                  });
                }}
                isOpen={activeDropdown === "scaleRatio"}
                onToggle={(open) => setActiveDropdown(open ? "scaleRatio" : null)}
                widthClass="w-[160px]"
              />
            </div>

            {/* Rounding settings */}
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-xs font-semibold text-foreground">Rounding</span>
              <CustomDropdown
                value={system.rounding}
                options={ROUNDINGS}
                onChange={(val) => onChangeSystem({ rounding: val as TypographySystem["rounding"] })}
                isOpen={activeDropdown === "rounding"}
                onToggle={(open) => setActiveDropdown(open ? "rounding" : null)}
                widthClass="w-[160px]"
              />
            </div>

            {/* Naming Convention */}
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-xs font-semibold text-foreground">Naming Convention</span>
              <CustomDropdown
                value={system.namingConvention}
                options={CONVENTIONS}
                onChange={(val) => onChangeSystem({ namingConvention: val as TypographySystem["namingConvention"] })}
                isOpen={activeDropdown === "namingConvention"}
                onToggle={(open) => setActiveDropdown(open ? "namingConvention" : null)}
                widthClass="w-[160px]"
              />
            </div>

            {/* Responsive settings */}
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-semibold text-foreground">Responsive Settings</span>
              <CustomDropdown
                value={system.responsiveScale}
                options={RESPONSIVE_MODES}
                onChange={(val) => onChangeSystem({ responsiveScale: val as TypographySystem["responsiveScale"] })}
                isOpen={activeDropdown === "responsiveScale"}
                onToggle={(open) => setActiveDropdown(open ? "responsiveScale" : null)}
                widthClass="w-[160px]"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Your Saved Systems ({savedPresets.length})
          </h4>

          {savedPresets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border border-dashed border-border/60 rounded-2xl">
              <Type size={28} className="mb-2 text-muted-foreground/40" />
              <p className="text-xs font-semibold">No saved systems yet</p>
              <p className="text-[10px] text-muted-foreground/50 mt-1">Configure and save one in Settings</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {savedPresets.map((preset) => (
                <div
                  key={preset.name}
                  role="button"
                  tabIndex={0}
                  aria-label={`Load ${preset.name} system`}
                  onKeyDown={event => {
                    if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onLoadPreset(preset); }
                  }}
                  onClick={() => onLoadPreset(preset)}
                  className="group relative p-3 rounded-xl border border-border bg-input/30 hover:bg-secondary/70 hover:border-accent/40 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-foreground group-hover:text-accent transition-colors truncate max-w-[200px]">
                        {preset.name}
                      </h5>
                      <div className="flex gap-2.5 mt-1 text-[10px] text-muted-foreground/80 font-medium">
                        <span>Font: <strong className="text-foreground/90 font-bold">{preset.fontFamily}</strong></span>
                        <span>Base: <strong className="text-foreground/90 font-bold">{preset.baseSize}px</strong></span>
                        <span>Scale: <strong className="text-foreground/90 font-bold">{preset.scaleMethod}</strong></span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePreset(preset.name);
                      }}
                      className="opacity-100 p-1 text-muted-foreground hover:text-destructive rounded transition-all hover:bg-input"
                      title="Delete saved system"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
