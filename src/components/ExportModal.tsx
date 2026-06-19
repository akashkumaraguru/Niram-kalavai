"use client";

import { useState } from "react";
import { X, Copy, Check, Download } from "lucide-react";
import { toast } from "sonner";
import {
  PaletteShade,
  NamedScale,
  generateTailwindConfig,
  generateCSSVariables,
  generateJSONTokens,
  generateFigmaTokens,
  generateMultiScaleTailwind,
  generateMultiScaleCSS,
  generateMultiScaleJSON,
  generateMultiScaleFigma,
} from "@/lib/paletteUtils";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  paletteName: string;
  shades: PaletteShade[];
  secondary: PaletteShade[];
  neutrals: PaletteShade[];
  success: PaletteShade[];
  info: PaletteShade[];
  warning: PaletteShade[];
  error: PaletteShade[];
  /** When provided, the modal switches to multi-scale "Export All" mode */
  scales?: NamedScale[];
}

type TabType = "tailwind" | "css" | "json" | "figma";

export default function ExportModal({
  isOpen,
  onClose,
  paletteName,
  shades,
  secondary,
  neutrals,
  success,
  info,
  warning,
  error,
  scales,
}: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("tailwind");
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const isMultiScale = !!scales?.length;

  const getExportCode = (): string => {
    if (isMultiScale) {
      switch (activeTab) {
        case "tailwind": return generateMultiScaleTailwind(scales!);
        case "css":      return generateMultiScaleCSS(scales!);
        case "json":     return generateMultiScaleJSON(scales!);
        case "figma":    return generateMultiScaleFigma(scales!);
        default:         return "";
      }
    }
    switch (activeTab) {
      case "tailwind": return generateTailwindConfig(paletteName, shades, secondary, neutrals, success, info, warning, error);
      case "css":      return generateCSSVariables(shades, secondary, neutrals, success, info, warning, error, paletteName);
      case "json":     return generateJSONTokens(shades, secondary, neutrals, success, info, warning, error, paletteName);
      case "figma":    return generateFigmaTokens(shades, secondary, neutrals, success, info, warning, error, paletteName);
      default:         return "";
    }
  };

  const code = getExportCode();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy code");
    }
  };

  const handleDownload = () => {
    // When exporting all scales as Figma tokens → "primitive-tokens.json"
    if (isMultiScale && activeTab === "figma") {
      const blob = new Blob([code], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "primitive-tokens.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Downloaded primitive-tokens.json");
      return;
    }

    const base = isMultiScale
      ? "reference-scales-all"
      : paletteName.toLowerCase().replace(/\s+/g, "-");

    let filename = base;
    let mimeType = "text/plain";

    switch (activeTab) {
      case "tailwind": filename += ".js";          mimeType = "application/javascript"; break;
      case "css":      filename += ".css";         mimeType = "text/css";               break;
      case "json":     filename += "-tokens.json"; mimeType = "application/json";       break;
      case "figma":    filename += "-figma.json";  mimeType = "application/json";       break;
    }

    const blob = new Blob([code], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const title = isMultiScale
    ? `Export All Reference Scales (${scales!.length})`
    : "Export Palette";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full sm:max-w-2xl bg-card border border-border sm:rounded-xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] text-foreground transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">{title}</h3>
            {isMultiScale && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                All 19 Material Design palettes · shades 50 – 950
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-input transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-input p-1 gap-1 border-b border-border">
          {(["tailwind", "css", "json", "figma"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCopied(false); }}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-secondary text-accent border border-accent/20 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-input"
              }`}
            >
              {tab === "tailwind" ? "Tailwind CSS" : tab === "css" ? "CSS Variables" : tab === "json" ? "JSON format" : "Figma Tokens"}
            </button>
          ))}
        </div>

        {/* Code Console */}
        <div className="relative flex-1 min-h-[300px] overflow-hidden bg-background font-mono text-xs border-b border-border">
          <pre className="absolute inset-0 p-4 overflow-auto text-emerald-500 whitespace-pre scrollbar-thin">
            <code>{code}</code>
          </pre>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={handleCopy}
              className="btn-pill flex items-center gap-1.5 px-3 py-1.5 rounded-lg active:scale-95 cursor-pointer text-xs"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="btn-pill primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg active:scale-95 cursor-pointer text-xs"
            >
              <Download size={14} />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
