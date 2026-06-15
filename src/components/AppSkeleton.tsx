"use client";

import { Moon, Sun } from "lucide-react";

interface AppSkeletonProps {
  theme: string;
  toggleTheme: () => void;
}

export default function AppSkeleton({ theme, toggleTheme }: AppSkeletonProps) {
  return (
    <div className="app-shell skeleton-mode">
      <header className="topbar">
        <div className="brand">
          <img src="/Logo.svg" alt="Niram Kalavai" className="brand-logo" />
          <span>Niram<span style={{ color: "hsl(var(--accent))" }}> Kalavai</span></span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="theme-toggle-btn icon-btn" onClick={toggleTheme} title="Toggle Light/Dark Theme">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="skeleton-block shimmer" style={{ width: 100, height: 36, borderRadius: 999 }} />
          <div className="skeleton-block shimmer" style={{ width: 100, height: 36, borderRadius: 999 }} />
          <div className="skeleton-block shimmer" style={{ width: 120, height: 36, borderRadius: 999 }} />
        </div>
      </header>
      <main className="preview-area">
        <div className="preview-tabs">
          <div className="skeleton-block shimmer" style={{ width: 80, height: 32 }} />
          <div className="skeleton-block shimmer" style={{ width: 120, height: 32 }} />
        </div>
        <div className="preview-Gradient skeleton-block shimmer" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="spinner" />
        </div>
      </main>
      <aside className="controls">
        <div style={{ marginBottom: 24 }}>
          <div className="skeleton-block shimmer" style={{ width: 80, height: 12, marginBottom: 12 }} />
          <div className="skeleton-block shimmer" style={{ width: "100%", height: 38 }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div className="skeleton-block shimmer" style={{ width: 100, height: 12, marginBottom: 16 }} />
          <div className="skeleton-block shimmer" style={{ width: "100%", height: 28, marginBottom: 16 }} />
          <div className="skeleton-block shimmer" style={{ width: "100%", height: 48, marginBottom: 8 }} />
          <div className="skeleton-block shimmer" style={{ width: "100%", height: 48 }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div className="skeleton-block shimmer" style={{ width: 90, height: 12, marginBottom: 12 }} />
          <div className="skeleton-block shimmer" style={{ width: "100%", height: 36 }} />
        </div>
      </aside>
    </div>
  );
}
