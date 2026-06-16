"use client";

import { Code, Copy, FolderDown, ImageDown, Moon, Palette, Shuffle, Sparkles, Sun } from "lucide-react";

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
  activeStudio: "gradient" | "palette";
  onChangeStudio: (studio: "gradient" | "palette") => void;

  // Gradient Studio Actions
  randomize?: () => void;
  copyCSS?: () => void;
  copySVG?: () => void;
  downloadPNG?: () => void;

  // Palette Studio Actions
  randomizePalette?: () => void;
  openExportPalette?: () => void;
}

export default function Header({
  theme,
  toggleTheme,
  activeStudio,
  onChangeStudio,
  randomize,
  copyCSS,
  copySVG,
  downloadPNG,
  randomizePalette,
  openExportPalette,
}: HeaderProps) {
  return (
    <header className="topbar" data-testid="topbar">
      {/* Brand logo & name */}
      <div className="brand shrink-0">
        <img src="/Logo-desktop.svg" alt="Niram Kalavai" className="brand-logo" />
        <span className="hidden sm:inline font-bold">
          Niram<span style={{ color: "hsl(var(--accent))" }}> Kalavai</span>
        </span>
      </div>

      {/* Central Studio Switcher Tabs */}
      <div className="flex p-1  border border-border rounded-full gap-1 shrink-0 font-sans">
        <button
          onClick={() => onChangeStudio("gradient")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${activeStudio === "gradient"
              ? "bg-primary text-white border border-accent/15 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
            }`}
        >
          <Sparkles size={13} />
          <span>Gradient Maker</span>
        </button>
        <button
          onClick={() => onChangeStudio("palette")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${activeStudio === "palette"
              ? "bg-primary text-white border border-accent/15 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
            }`}
        >
          <Palette size={13} />
          <span>Palette Studio</span>
        </button>
      </div>

      {/* Right-aligned Actions */}
      <div className="flex gap-2 items-center shrink-0">
        <button
          className="theme-toggle-btn icon-btn shrink-0"
          onClick={toggleTheme}
          title="Toggle Light/Dark Theme"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {activeStudio === "gradient" ? (
          <>
            <button
              className="btn-pill ghost shrink-0"
              onClick={randomize}
              data-testid="btn-randomize"
            >
              <Shuffle size={14} />
              <span className="btn-text hidden md:inline">Randomize</span>
            </button>
            <button
              className="btn-pill shrink-0"
              onClick={copyCSS}
              data-testid="btn-copy-css"
            >
              <Copy size={14} />
              <span className="btn-text hidden md:inline">Copy CSS</span>
            </button>
            <button
              className="btn-pill shrink-0"
              onClick={copySVG}
              title="Copy as SVG code"
            >
              <Code size={14} />
              <span className="btn-text hidden md:inline">Copy SVG</span>
            </button>
            <button
              className="btn-pill primary shrink-0"
              onClick={downloadPNG}
              data-testid="btn-download-png"
            >
              <ImageDown size={14} />
              <span className="btn-text hidden md:inline">Download PNG</span>
            </button>
          </>
        ) : (
          <>
            {/* <button
              className="btn-pill ghost shrink-0"
              onClick={randomizePalette}
              title="Randomize primary base color"
            >
              <Shuffle size={14} />
              <span className="btn-text hidden md:inline">Randomize</span>
            </button> */}
            <button
              className="btn-pill primary shrink-0"
              onClick={openExportPalette}
              title="Export palette configurations"
            >
              <FolderDown size={14} />
              <span className="btn-text hidden md:inline">Export Palette</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

