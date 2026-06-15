"use client";

import { Code, Copy, ImageDown, Moon, Shuffle, Sun } from "lucide-react";

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
  randomize: () => void;
  copyCSS: () => void;
  copySVG: () => void;
  downloadPNG: () => void;
}

export default function Header({
  theme,
  toggleTheme,
  randomize,
  copyCSS,
  copySVG,
  downloadPNG,
}: HeaderProps) {
  return (
    <header className="topbar" data-testid="topbar">
      <div className="brand">
        <img src="/Logo.svg" alt="Niram Kalavai" className="brand-logo" />
        <span>Niram<span style={{ color: "hsl(var(--accent))" }}> Kalavai</span></span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button className="theme-toggle-btn icon-btn" onClick={toggleTheme} title="Toggle Light/Dark Theme">
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="btn-pill ghost" onClick={randomize} data-testid="btn-randomize">
          <Shuffle size={14} /> <span className="btn-text">Randomize</span>
        </button>
        <button className="btn-pill" onClick={copyCSS} data-testid="btn-copy-css">
          <Copy size={14} /> <span className="btn-text">Copy CSS</span>
        </button>
        <button className="btn-pill" onClick={copySVG} title="Copy as SVG code">
          <Code size={14} /> <span className="btn-text">Copy SVG</span>
        </button>
        <button className="btn-pill primary" onClick={downloadPNG} data-testid="btn-download-png">
          <ImageDown size={14} /> <span className="btn-text">Download PNG</span>
        </button>
      </div>
    </header>
  );
}
