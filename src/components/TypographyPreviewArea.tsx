"use client";

import React, { useState } from "react";
import {
  Type,
  Layout,
  Code,
  LineChart,
  Laptop,
  Tablet as TabletIcon,
  Smartphone,
  Copy,
  Download,
  Check,
  Undo2,
  Trash2,
  Lock,
  Moon,
  Sun,
  Eye,
  Folder,
  FileCode,
  Settings,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import {
  TypographySystem,
  TypographyStyle,
  SCALES,
  formatName,
  exportAsJSON,
  exportAsDesignTokens,
  exportAsCSSVariables,
  exportAsSCSS,
  exportAsTailwindConfig,
  exportAsReactTheme,
  exportAsFlutterTheme,
  exportAsAndroidXML,
  exportAsIOSSwift,
  exportAsFigmaVariables,
  exportAsTokenStudio
} from "@/lib/typographyUtils";

interface TypographyPreviewAreaProps {
  system: TypographySystem;
  onChangeStyleOverride: (styleId: string, patch: Partial<TypographyStyle>) => void;
  onRemoveStyleOverride: (styleId: string) => void;
  onResetAllOverrides: () => void;
  onAddStyle: () => void;
  onDeleteStyle: (styleId: string) => void;
  onChangeStyleName: (styleId: string, newName: string) => void;
  onDeleteMultipleStyles: (styleIds: string[]) => void;
}

type PreviewTab = "visualizer" | "styles" | "mockups";
type MockupType = "website" | "dashboard" | "mobile" | "marketing";
type DeviceView = "desktop" | "tablet" | "mobile";
type ExportFormat =
  | "json"
  | "tokens"
  | "css"
  | "scss"
  | "tailwind"
  | "react"
  | "flutter"
  | "android"
  | "ios"
  | "figma"
  | "tokenstudio";

export default function TypographyPreviewArea({
  system,
  onChangeStyleOverride,
  onRemoveStyleOverride,
  onResetAllOverrides,
  onAddStyle,
  onDeleteStyle,
  onChangeStyleName,
  onDeleteMultipleStyles,
}: TypographyPreviewAreaProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>("styles");
  const [mockupType, setMockupType] = useState<MockupType>("website");
  const [deviceView, setDeviceView] = useState<DeviceView>("desktop");
  const [previewDark, setPreviewDark] = useState<boolean>(true);
  const [previewText, setPreviewText] = useState<string>("Playing with fonts is fun");
  // Helper to resolve font style properties
  const getStyleObj = (id: string, isMobile = false) => {
    const style = system.styles.find((s) => s.id === id);
    if (!style) return {};

    let size = style.sizePx;

    // Apply mobile scaling if responsiveScale is stepped/fluid and we are in mobile view
    if (isMobile) {
      if (system.responsiveScale === "stepped") {
        size = Math.max(10, Math.round(size * 0.8));
      } else if (system.responsiveScale === "fluid") {
        size = Math.max(10, Math.round(size * 0.85));
      }
    }

    return {
      fontFamily: `'${system.fontFamily}', sans-serif`,
      fontSize: `${size}px`,
      lineHeight: style.lineHeight,
      letterSpacing: `${style.letterSpacing}em`,
      fontWeight: style.fontWeight,
    };
  };

  // Resolve responsive styles for code preview (fluid)
  const getResponsiveCSSForStyle = (style: TypographyStyle) => {
    const minSize = Math.max(10, Math.round(style.sizePx * 0.8));
    const maxSize = style.sizePx;
    if (system.responsiveScale === "fluid") {
      return `clamp(${minSize}px, calc(${minSize}px + 1.25vw), ${maxSize}px)`;
    }
    return `${maxSize}px`;
  };

  // Render scale visualizer chart
  const renderVisualizer = () => {
    // Sort heading styles from H1 (largest) down to H6
    const headingStyles = system.styles.filter((s) => s.id.startsWith("h")).sort((a, b) => b.sizePx - a.sizePx);

    return (
      <div className="space-y-6 max-w-4xl mx-auto py-4">
        <div className="bg-card/45 border border-border/80 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border/60">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Typography Scale Chart</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Visualizing the dynamic hierarchy based on {system.scaleMethod} ({system.scaleRatio})
              </p>
            </div>
            <div className="text-[10px] font-bold text-accent px-2.5 py-1 bg-accent/10 rounded-full">
              Base Size: {system.baseSize}px
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {headingStyles.map((st, idx) => {
              const percentage = (st.sizePx / headingStyles[0].sizePx) * 100;
              return (
                <div key={st.id} className="group flex items-center gap-4">
                  {/* Left Label */}
                  <div className="w-16 shrink-0">
                    <span className="text-xs font-bold text-foreground block">{st.name}</span>
                    <span className="text-[10px] font-semibold text-muted-foreground mono block mt-0.5">
                      {st.sizePx}px
                    </span>
                  </div>

                  {/* Relative size bar */}
                  <div className="flex-1 h-6 bg-secondary/15 rounded-lg overflow-hidden relative flex items-center px-3">
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-accent/15 border-r border-accent/20 transition-all duration-500 rounded-l-lg"
                      style={{ width: `${percentage}%` }}
                    />
                    {/* Live text clip preview */}
                    <span
                      style={{
                        fontFamily: `'${system.fontFamily}', sans-serif`,
                        fontSize: "12px",
                        fontWeight: st.fontWeight,
                        color: "hsl(var(--foreground))",
                        zIndex: 1,
                      }}
                      className="truncate opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      {system.fontFamily} - The quick brown fox jumps over the lazy dog.
                    </span>
                  </div>

                  {/* Right multiplier tag */}
                  <div className="w-14 shrink-0 text-right">
                    <span className="text-[10px] font-bold text-muted-foreground bg-input/50 px-2 py-0.5 rounded border border-border/60 mono">
                      x{Math.pow(system.scaleRatio, st.step).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Informative Scale Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card/45 border border-border/80 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Scale Steps Calculation</h4>
            <div className="space-y-2 text-[10px] text-muted-foreground max-h-[180px] overflow-y-auto pr-1">
              {system.styles.map((st) => (
                <div key={st.id} className="flex justify-between items-center py-1 border-b border-border/20 last:border-0">
                  <span className="font-bold text-foreground">{st.name}</span>
                  <span className="mono text-accent">
                    Step {st.step} &rarr; {st.sizePx}px (multiplier: x{Math.pow(system.scaleRatio, st.step).toFixed(3)})
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card/45 border border-border/80 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Scale Tip</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A modular type scale helps maintain proportional typographic hierarchy across design components. By using
                the base size (<strong>{system.baseSize}px</strong>) and multiplying it by the ratio (
                <strong>{system.scaleRatio}</strong>) to the power of the step, you establish balanced increments of scale
                that remain harmonious regardless of font face.
              </p>
            </div>
            <div className="text-[10px] bg-secondary/20 p-2.5 rounded-xl border border-border/60 text-muted-foreground/90 mt-2">
              💡 Drag sliders in the Sidebar settings to dynamically scale or apply rounded values instantly.
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Interactive Styles override table
  const renderStylesList = () => {
    const selectedStyleIds = system.styles.filter((s) => s.isOverridden).map((s) => s.id);

    return (
      <div className="space-y-4 max-w-4xl mx-auto py-2">
        {/* Sample text setter */}
        <div className="flex gap-4 items-center bg-card/40 border border-border/80 rounded-2xl p-4">
          <div className="w-24 shrink-0 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Preview text
          </div>
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Type sample text here..."
            className="flex-1 bg-secondary/40 border border-border/80 hover:border-accent/40 rounded-xl px-3 py-2 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground"
          />
        </div>

        {/* Header with Add Button */}
        <div className="flex justify-end items-center">
          {selectedStyleIds.length > 0 && (
            <button
              onClick={() => onDeleteMultipleStyles(selectedStyleIds)}
              className="w-8 h-8 rounded-xl bg-destructive hover:bg-destructive/90 text-white flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer shadow-md shadow-destructive/25 mr-2"
              title={`Delete Selected (${selectedStyleIds.length})`}
            >
              <Trash2 size={15} />
            </button>
          )}
          <button
            onClick={onAddStyle}
            className="w-8 h-8 rounded-xl bg-accent hover:bg-accent/90 text-white flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer shadow-md shadow-accent/25"
            title="Add New Style"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Interactive rows */}
        <div className="space-y-3">
          {system.styles.map((st) => (
            <div
              key={st.id}
              className={`p-4 rounded-2xl border transition-all ${
                st.isOverridden
                  ? "bg-accent/5 border-accent/60 shadow-lg shadow-accent/5"
                  : "bg-card/40 border-border hover:bg-secondary/40"
              }`}
            >
              {/* Row header */}
              <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  {/* Style Checkbox Indicator */}
                  <div
                    onClick={() => {
                      if (st.isOverridden) {
                        onRemoveStyleOverride(st.id);
                      } else {
                        // Initialize override with current calculated values
                        onChangeStyleOverride(st.id, {
                          sizePx: st.sizePx,
                          lineHeight: st.lineHeight,
                          letterSpacing: st.letterSpacing,
                          fontWeight: st.fontWeight,
                        });
                      }
                    }}
                    className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                      st.isOverridden
                        ? "bg-accent border-accent text-white"
                        : "border-border hover:border-accent/65"
                    }`}
                  >
                    {st.isOverridden && <Check size={11} strokeWidth={3} />}
                  </div>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={st.name}
                      onChange={(e) => onChangeStyleName(st.id, e.target.value)}
                      className="bg-transparent border-none text-xs font-bold text-foreground outline-none px-1 py-0.5 rounded hover:bg-secondary/40 focus:bg-secondary/60 transition-all w-24 shrink-0"
                      title="Click to rename style"
                    />
                  </div>
                </div>

                {/* Overrides control panel & delete actions */}
                <div className="flex items-center gap-2">
                  {st.isOverridden ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Size px */}
                      <div className="flex items-center gap-1 bg-secondary/50 rounded-lg px-2 py-1 text-[10px] border border-border/80">
                        <span className="text-muted-foreground">Size:</span>
                        <input
                          type="number"
                          value={st.sizePx}
                          min="1"
                          max="200"
                          onChange={(e) => onChangeStyleOverride(st.id, { sizePx: Number(e.target.value) })}
                          className="w-10 bg-transparent text-foreground border-none font-bold text-center outline-none shrink-0"
                        />
                        <span className="text-muted-foreground">px</span>
                      </div>

                      {/* Weight */}
                      <div className="flex items-center gap-1 bg-secondary/50 rounded-lg px-2 py-1 text-[10px] border border-border/80">
                        <span className="text-muted-foreground">Weight:</span>
                        <select
                          value={st.fontWeight}
                          onChange={(e) => onChangeStyleOverride(st.id, { fontWeight: Number(e.target.value) })}
                          className="bg-transparent border-none font-bold text-foreground outline-none cursor-pointer font-sans"
                        >
                          <option value="300">Light</option>
                          <option value="400">Regular</option>
                          <option value="500">Medium</option>
                          <option value="600">SemiBold</option>
                          <option value="700">Bold</option>
                          <option value="800">ExtraBold</option>
                          <option value="900">Black</option>
                        </select>
                      </div>

                      {/* Line height */}
                      <div className="flex items-center gap-1 bg-secondary/50 rounded-lg px-2 py-1 text-[10px] border border-border/80">
                        <span className="text-muted-foreground">Line Height:</span>
                        <input
                          type="number"
                          step="0.05"
                          min="0.5"
                          max="3"
                          value={st.lineHeight}
                          onChange={(e) => onChangeStyleOverride(st.id, { lineHeight: Number(e.target.value) })}
                          className="w-12 bg-transparent text-foreground border-none font-bold text-center outline-none shrink-0"
                        />
                      </div>

                      {/* Letter spacing */}
                      <div className="flex items-center gap-1 bg-secondary/50 rounded-lg px-2 py-1 text-[10px] border border-border/80">
                        <span className="text-muted-foreground">Spacing:</span>
                        <input
                          type="number"
                          step="0.005"
                          min="-0.2"
                          max="0.5"
                          value={st.letterSpacing}
                          onChange={(e) => onChangeStyleOverride(st.id, { letterSpacing: Number(e.target.value) })}
                          className="w-14 bg-transparent text-foreground border-none font-bold text-center outline-none shrink-0"
                        />
                        <span className="text-muted-foreground">em</span>
                      </div>

                      {/* Undo override button */}
                      <button
                        onClick={() => onRemoveStyleOverride(st.id)}
                        className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded transition-colors cursor-pointer"
                        title="Remove override"
                      >
                        <Undo2 size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3 text-[10px] text-muted-foreground font-semibold px-2 py-1 bg-secondary/35 rounded-lg border border-border/40 mono">
                      <span>Size: {st.sizePx}px</span>
                      <span>Weight: {st.fontWeight}</span>
                      <span>L/H: {st.lineHeight}</span>
                      <span>L/S: {st.letterSpacing}em</span>
                    </div>
                  )}

                  {/* Delete Style button */}
                  <button
                    onClick={() => onDeleteStyle(st.id)}
                    className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded transition-colors cursor-pointer border border-border/40 hover:border-destructive/30"
                    title="Delete style row"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Sample Preview Text */}
              <div className="pt-4 overflow-x-auto scrollbar-none">
                <div style={getStyleObj(st.id)} className="whitespace-nowrap text-foreground min-h-[1.5em] transition-all">
                  {previewText || "Playing with fonts is fun"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Real world Mockups with device wrapper
  const renderMockups = () => {
    const isMobile = deviceView === "mobile";

    return (
      <div className="h-full flex flex-col space-y-4">
        {/* Mockup Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card/45 border border-border/80 rounded-2xl px-4 py-3 shrink-0">
          {/* Mockup Layout tabs */}
          <div className="flex bg-secondary/30 p-0.5 rounded-lg border border-border/50 font-sans">
            {(["website", "dashboard", "mobile", "marketing"] as MockupType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setMockupType(tab)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  mockupType === tab ? "bg-accent text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "mobile" ? "Mobile App" : tab === "marketing" ? "Marketing" : tab}
              </button>
            ))}
          </div>

          {/* Viewport device frame switches */}
          <div className="flex gap-2">
            <button
              onClick={() => setDeviceView("desktop")}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                deviceView === "desktop" ? "bg-accent/15 border-accent text-accent" : "border-border text-muted-foreground hover:text-foreground"
              }`}
              title="Desktop view"
            >
              <Laptop size={14} />
            </button>
            <button
              onClick={() => setDeviceView("tablet")}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                deviceView === "tablet" ? "bg-accent/15 border-accent text-accent" : "border-border text-muted-foreground hover:text-foreground"
              }`}
              title="Tablet view"
            >
              <TabletIcon size={14} />
            </button>
            <button
              onClick={() => setDeviceView("mobile")}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                deviceView === "mobile" ? "bg-accent/15 border-accent text-accent" : "border-border text-muted-foreground hover:text-foreground"
              }`}
              title="Mobile view"
            >
              <Smartphone size={14} />
            </button>
          </div>
        </div>

        {/* Viewport device frame wrapper */}
        <div className="flex-1 flex justify-center items-start overflow-y-auto bg-slate-950/40 rounded-2xl border border-border/80 p-4 scrollbar-thin min-h-[450px]">
          <div
            className={`transition-all duration-300 border border-border shadow-2xl overflow-hidden flex flex-col h-[580px] ${
              previewDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"
            } ${deviceView === "desktop" ? "w-full" : deviceView === "tablet" ? "w-[768px]" : "w-[360px] rounded-[36px] border-[8px] border-slate-800"}`}
          >
            {/* If mobile, show mobile header bar */}
            {deviceView === "mobile" && (
              <div className="h-6 bg-slate-800 flex items-center justify-between px-6 text-[9px] text-white/50 font-sans shrink-0 select-none">
                <span>9:41 AM</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1.5 bg-white/60 rounded-xs" />
                  <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {mockupType === "website" && (
                <div className="space-y-8 py-6">
                  {/* Hero Container */}
                  <div className="text-center space-y-4 max-w-xl mx-auto">
                    <span style={getStyleObj("label-large", isMobile)} className="text-accent uppercase tracking-wider font-bold">
                      Launch Platform
                    </span>
                    <h1 style={getStyleObj("h1", isMobile)} className="leading-tight">
                      Architecting beautiful typographic scale systems.
                    </h1>
                    <p style={getStyleObj("body-large", isMobile)} className="opacity-75">
                      Niram Kalavai helps you generate, preview, and export premium color palettes, gradients, and type scales for developers.
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                      <button style={getStyleObj("button", isMobile)} className="px-5 py-2.5 rounded-lg bg-accent text-white font-bold cursor-pointer hover:opacity-90 active:scale-95 transition-all">
                        Get Started Free
                      </button>
                      <button style={getStyleObj("button", isMobile)} className="px-5 py-2.5 rounded-lg border border-border font-bold cursor-pointer hover:bg-secondary/20 transition-all">
                        Read Docs
                      </button>
                    </div>
                  </div>

                  {/* Feature Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-border/40">
                    {["Exporters", "Modular Scale", "Manual Overrides"].map((feat, idx) => (
                      <div key={feat} className="p-4 rounded-xl bg-secondary/10 border border-border/20 space-y-2">
                        <span className="text-[10px] font-bold text-accent">0{idx + 1}</span>
                        <h4 style={getStyleObj("h4", isMobile)}>{feat}</h4>
                        <p style={getStyleObj("body-small", isMobile)} className="opacity-75">
                          Configure values dynamically using standard design algorithms like Major Third or Perfect Fifth.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mockupType === "dashboard" && (
                <div className="space-y-6">
                  {/* Page header */}
                  <div className="flex justify-between items-center border-b border-border/40 pb-4">
                    <div>
                      <h2 style={getStyleObj("h2", isMobile)}>Analytics Overview</h2>
                      <p style={getStyleObj("body-small", isMobile)} className="opacity-75">
                        Track metrics, scaling, and variables conversions.
                      </p>
                    </div>
                    <button style={getStyleObj("button", isMobile)} className="px-3.5 py-1.5 rounded-lg bg-accent text-white font-bold text-xs cursor-pointer">
                      Export Report
                    </button>
                  </div>

                  {/* Stats KPIs grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Active Tokens", value: "32,950", change: "+12.4% vs last week" },
                      { label: "Scale Multiplier", value: `${system.scaleRatio}x`, change: system.scaleMethod },
                      { label: "Override States", value: `${system.styles.filter(s => s.isOverridden).length} Styles`, change: "Modified manually" },
                    ].map((stat) => (
                      <div key={stat.label} className="p-4 bg-secondary/15 rounded-xl border border-border/30 space-y-1.5">
                        <span style={getStyleObj("label-medium", isMobile)} className="opacity-60 block">{stat.label}</span>
                        <span style={getStyleObj("h1", isMobile)} className="block font-bold text-foreground">{stat.value}</span>
                        <span style={getStyleObj("caption", isMobile)} className="text-accent block font-medium">{stat.change}</span>
                      </div>
                    ))}
                  </div>

                  {/* Sample table list */}
                  <div className="bg-secondary/10 border border-border/30 rounded-xl overflow-hidden mt-2">
                    <div className="px-4 py-2 border-b border-border/30 flex justify-between bg-secondary/5">
                      <span style={getStyleObj("label-large", isMobile)} className="font-bold">Recent Changes</span>
                      <span style={getStyleObj("caption", isMobile)} className="text-accent cursor-pointer">View All</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { title: "Tailwind JSON tokens compiled", desc: "Generated CSS clamp attributes dynamically.", date: "10m ago" },
                        { title: "Saved Elegant Serif preset", desc: "Base font Outfit initialized.", date: "2h ago" },
                      ].map((item) => (
                        <div key={item.title} className="flex justify-between items-start text-xs border-b border-border/20 last:border-0 pb-2 last:pb-0">
                          <div>
                            <h4 style={getStyleObj("label-large", isMobile)} className="font-semibold">{item.title}</h4>
                            <p style={getStyleObj("body-small", isMobile)} className="opacity-75 mt-0.5">{item.desc}</p>
                          </div>
                          <span style={getStyleObj("caption", isMobile)} className="opacity-60">{item.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {mockupType === "mobile" && (
                <div className="space-y-5 max-w-sm mx-auto font-sans">
                  {/* Header bar */}
                  <div className="flex justify-between items-center">
                    <h3 style={getStyleObj("h3", isMobile)} className="font-bold">Kalavai Mobile</h3>
                    <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center font-bold text-accent text-xs">
                      AK
                    </div>
                  </div>

                  {/* Main card */}
                  <div className="p-5 rounded-2xl bg-accent text-white space-y-3 relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                      <Type size={120} />
                    </div>
                    <span style={getStyleObj("label-medium", isMobile)} className="opacity-80 block uppercase tracking-wider">
                      Current System
                    </span>
                    <h2 style={getStyleObj("h2", isMobile)} className="font-bold">
                      {system.fontFamily} Scale
                    </h2>
                    <p style={getStyleObj("body-small", isMobile)} className="opacity-90">
                      Auto-scaling text sizes configured with Major Third (1.25).
                    </p>
                  </div>

                  {/* Actions List */}
                  <div className="space-y-2">
                    <span style={getStyleObj("label-large", isMobile)} className="font-bold block opacity-70 px-1">
                      Quick Settings
                    </span>
                    {[
                      { icon: <Settings size={14} />, name: "Base Size", value: `${system.baseSize}px` },
                      { icon: <Type size={14} />, name: "Font Family", value: system.fontFamily },
                    ].map((act) => (
                      <div key={act.name} className="flex justify-between items-center p-3.5 bg-secondary/15 rounded-xl border border-border/25">
                        <div className="flex items-center gap-3">
                          <div className="text-accent bg-accent/10 p-1.5 rounded-lg border border-accent/20">
                            {act.icon}
                          </div>
                          <span style={getStyleObj("label-large", isMobile)}>{act.name}</span>
                        </div>
                        <span style={getStyleObj("caption", isMobile)} className="opacity-75 font-semibold">{act.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tab bar bottom */}
                  <div className="pt-2 flex justify-around border-t border-border/30">
                    {["Explore", "Styles", "Variables"].map((tab, idx) => (
                      <div key={tab} className="text-center py-1 cursor-pointer flex flex-col items-center">
                        <span style={getStyleObj("caption", isMobile)} className={`font-bold ${idx === 0 ? "text-accent" : "opacity-60"}`}>
                          {tab}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mockupType === "marketing" && (
                <div className="space-y-10 py-4">
                  {/* Hero Marketing */}
                  <div className="text-center space-y-4 max-w-xl mx-auto">
                    <span className="bg-accent/10 border border-accent/30 text-accent rounded-full px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                      Design Systems Tooling
                    </span>
                    <h1 style={getStyleObj("h1", isMobile)} className="text-5xl font-black leading-tight tracking-tight">
                      Dynamic Type Scales Redefined.
                    </h1>
                    <p style={getStyleObj("body-large", isMobile)} className="max-w-md mx-auto opacity-75">
                      Inject gorgeous typographical mathematical systems directly into your web applications, design files, or native applications.
                    </p>
                    <div className="pt-2 flex justify-center gap-3">
                      <button style={getStyleObj("button", isMobile)} className="px-6 py-3 rounded-lg bg-accent text-white font-bold cursor-pointer hover:opacity-90 active:scale-95 transition-all">
                        Create System
                      </button>
                    </div>
                  </div>

                  {/* Promo content box */}
                  <div className="bg-secondary/10 border border-border/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 space-y-2.5">
                      <h3 style={getStyleObj("h3", isMobile)}>Real-time clamping calculations.</h3>
                      <p style={getStyleObj("body-medium", isMobile)} className="opacity-75">
                        Fluid typography automatically adjusts sizes based on viewport widths, eliminating break-point media queries completely.
                      </p>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border/80 text-[10px] font-mono text-emerald-500 whitespace-nowrap overflow-x-auto w-full md:w-auto">
                      font-size: {getResponsiveCSSForStyle(system.styles.find(s => s.id === "h1")!)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      {/* Workspace Navbar */}
      <div className="flex justify-between items-center px-4 sm:px-6 py-2.5 sm:py-3 border-b border-border bg-card/45 backdrop-blur-md shrink-0">
        <div className="preview-tabs">
          {(["styles", "mockups", "visualizer"] as PreviewTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`preview-tab-btn flex items-center gap-1.5 ${activeTab === tab ? "active" : ""}`}
            >
              {tab === "visualizer" && (
                <>
                  <LineChart size={13} />
                  <span>Scale Chart</span>
                </>
              )}
              {tab === "styles" && (
                <>
                  <Type size={13} />
                  <span>Typography Playarea</span>
                </>
              )}
              {tab === "mockups" && (
                <>
                  <Layout size={13} />
                  <span>Mockups Preview</span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Quick actions on right */}
        <div className="flex items-center gap-2">
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

      {/* Main Workspace Preview Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {activeTab === "visualizer" && renderVisualizer()}
        {activeTab === "styles" && renderStylesList()}
        {activeTab === "mockups" && renderMockups()}
      </div>
    </div>
  );
}
