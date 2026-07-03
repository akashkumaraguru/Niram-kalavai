"use client";

import {
  TypographySystem,
  exportAsAndroidXML,
  exportAsCSSVariables,
  exportAsDesignTokens,
  exportAsFigmaVariables,
  exportAsFlutterTheme,
  exportAsIOSSwift,
  exportAsJSON,
  exportAsReactTheme,
  exportAsSCSS,
  exportAsTailwindConfig,
  exportAsTokenStudio,
  formatName
} from "@/lib/typographyUtils";
import {
  Check,
  Copy,
  Download,
  Folder,
  Type,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

interface TypographyExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  system: TypographySystem;
}

export default function TypographyExportModal({
  isOpen,
  onClose,
  system,
}: TypographyExportModalProps) {
  const [selectedTokenNode, setSelectedTokenNode] = useState<string | null>("h1");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("css");
  const [copied, setCopied] = useState<boolean>(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  // Exporter snippet selector
  const getExportCode = (): string => {
    switch (exportFormat) {
      case "json":
        return exportAsJSON(system);
      case "tokens":
        return exportAsDesignTokens(system);
      case "css":
        return exportAsCSSVariables(system);
      case "scss":
        return exportAsSCSS(system);
      case "tailwind":
        return exportAsTailwindConfig(system);
      case "react":
        return exportAsReactTheme(system);
      case "flutter":
        return exportAsFlutterTheme(system);
      case "android":
        return exportAsAndroidXML(system);
      case "ios":
        return exportAsIOSSwift(system);
      case "figma":
        return exportAsFigmaVariables(system);
      case "tokenstudio":
        return exportAsTokenStudio(system);
      default:
        return "";
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getExportCode());
      setCopied(true);
      toast.success("Token configurations copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy export code");
    }
  };

  const handleDownload = () => {
    const code = getExportCode();
    const cleanName = system.name.toLowerCase().replace(/\s+/g, "-");
    let filename = `${cleanName}-typography`;
    let mimeType = "text/plain";

    switch (exportFormat) {
      case "json":
      case "tokens":
      case "figma":
      case "tokenstudio":
        filename += ".json";
        mimeType = "application/json";
        break;
      case "css":
        filename += ".css";
        mimeType = "text/css";
        break;
      case "scss":
        filename += ".scss";
        mimeType = "text/x-scss";
        break;
      case "tailwind":
        filename += "-tailwind.js";
        mimeType = "application/javascript";
        break;
      case "react":
        filename += "-theme.ts";
        mimeType = "application/typescript";
        break;
      case "flutter":
        filename += ".dart";
        mimeType = "text/x-dart";
        break;
      case "android":
        filename += "-styles.xml";
        mimeType = "application/xml";
        break;
      case "ios":
        filename += ".swift";
        mimeType = "text/x-swift";
        break;
    }

    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  // Structured Token Nodes
  const categories = [
    {
      id: "heading",
      name: "Heading Tokens",
      nodes: system.styles.filter((s) => s.id.startsWith("h")),
    },
    {
      id: "body",
      name: "Body Tokens",
      nodes: system.styles.filter((s) => s.id.startsWith("body")),
    },
    {
      id: "label",
      name: "Label & Extra Tokens",
      nodes: system.styles.filter((s) => s.id.startsWith("label") || s.id === "caption" || s.id === "button"),
    },
  ];

  const activeNode = system.styles.find((s) => s.id === selectedTokenNode);

  const EXPORTS: { format: ExportFormat; label: string }[] = [
    { format: "css", label: "CSS Variables" },
    { format: "tailwind", label: "Tailwind Config" },
    { format: "json", label: "JSON Exporter" },
    { format: "tokens", label: "Design Tokens" },
    { format: "scss", label: "SCSS Variables" },
    { format: "react", label: "React Theme" },
    { format: "flutter", label: "Flutter (Dart)" },
    { format: "android", label: "Android XML" },
    { format: "ios", label: "iOS Swift" },
    { format: "figma", label: "Figma Variables" },
    { format: "tokenstudio", label: "Token Studio" },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-3xl p-6 shadow-2xl max-w-6xl w-full flex flex-col max-h-[90vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground hover:bg-secondary/40 p-2 rounded-xl transition-all cursor-pointer"
          title="Close Modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pr-8">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span>Export & Design Tokens</span>
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Export typography tokens in multiple developer and design formats. Click nodes to inspect.
          </p>
        </div>

        {/* content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden flex-1 py-1">
          {/* Token Tree Explorer Left Panel (5 columns) */}
          <div className="lg:col-span-5 bg-secondary/15 border border-border/70 rounded-2xl p-4 flex flex-col h-[480px] overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-none font-sans text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-foreground font-bold font-mono">
                  <Folder size={14} className="text-accent" />
                  <span>Typography</span>
                </div>

                <div className="pl-4 border-l border-border/80 space-y-3 pt-1.5">
                  {categories.map((cat) => (
                    <div key={cat.id} className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground font-bold font-mono">
                        <Folder size={12} className="text-muted-foreground/60" />
                        <span>{cat.name}</span>
                      </div>

                      <div className="pl-4 border-l border-border/60 space-y-0.5">
                        {cat.nodes.map((node) => {
                          const isSelected = selectedTokenNode === node.id;
                          return (
                            <div
                              key={node.id}
                              onClick={() => setSelectedTokenNode(node.id)}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${isSelected
                                  ? "bg-accent/15 border border-accent/20 text-accent font-bold"
                                  : "hover:bg-secondary/45 text-foreground font-semibold"
                                }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <Type size={11} className={isSelected ? "text-accent" : "text-muted-foreground/60"} />
                                <span>{formatName(node.id, system.namingConvention)}</span>
                              </div>
                              <span className="mono text-[9px] opacity-75">{node.sizePx}px</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Node detail inspect box */}
            {activeNode && (
              <div className="bg-background border border-border/80 rounded-xl p-3.5 mt-3 space-y-2 shrink-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-accent">{activeNode.name} Token</span>
                  <span className="text-[10px] text-muted-foreground/80 mono">
                    --text-{formatName(activeNode.id, system.namingConvention)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-foreground font-medium">
                  <div>Font Size: <strong className="font-bold">{activeNode.sizePx}px</strong></div>
                  <div>Weight: <strong className="font-bold">{activeNode.fontWeight}</strong></div>
                  <div>Line Height: <strong className="font-bold">{activeNode.lineHeight}</strong></div>
                  <div>Letter Spacing: <strong className="font-bold">{activeNode.letterSpacing}em</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Code Exporter Right Panel (7 columns) */}
          <div className="lg:col-span-7 bg-secondary/15 border border-border/70 rounded-2xl flex flex-col h-[480px] overflow-hidden">
            {/* Format selector tabs */}
            <div className="flex bg-background p-1 border-b border-border overflow-x-auto scrollbar-none shrink-0 font-sans">
              {EXPORTS.map((exp) => (
                <button
                  key={exp.format}
                  onClick={() => {
                    setExportFormat(exp.format);
                    setCopied(false);
                  }}
                  className={`px-3 py-2 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 cursor-pointer ${exportFormat === exp.format
                      ? "bg-secondary text-accent border border-accent/15 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/35"
                    }`}
                >
                  {exp.label}
                </button>
              ))}
            </div>

            {/* Code Console block */}
            <div className="relative flex-1 bg-background font-mono text-[11px] overflow-hidden border-b border-border/40">
              <pre className="absolute inset-0 p-4 overflow-auto text-emerald-500 whitespace-pre scrollbar-thin select-all">
                <code>{getExportCode()}</code>
              </pre>
            </div>

            {/* Actions button footer */}
            <div className="px-4 py-3 bg-secondary/5 border-t border-border/40 flex justify-end gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="btn-pill flex items-center gap-1.5 px-3 py-1.5 rounded-lg active:scale-95 cursor-pointer text-xs"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy Code"}
              </button>
              <button
                onClick={handleDownload}
                className="btn-pill primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg active:scale-95 cursor-pointer text-xs font-bold"
              >
                <Download size={14} />
                Download File
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
