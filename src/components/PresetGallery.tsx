"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { PRESETS, buildGradientCSS, GradientConfig, GradientPreset } from "../lib/gradientUtils";

interface PresetGalleryProps {
  saved: GradientPreset[];
  selectPreset: (config: GradientConfig) => void;
  deletePreset: (id: string, e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function PresetGallery({
  saved,
  selectPreset,
  deletePreset,
}: PresetGalleryProps) {
  return (
    <div>
      {/* Curated Presets */}
      <div>
        <div className="section-title">Curated Presets</div>
        <div className="curated-presets-scroll" data-testid="presets-curated">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {PRESETS.map((p, i) => (
              <div
                key={i}
                className="preset-card"
                style={{ background: buildGradientCSS(p.config) }}
                onClick={() => selectPreset(p.config)}
                data-testid={`preset-${p.name.replace(/\s+/g, "-").toLowerCase()}`}
              >
                <div className="preset-label">{p.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Saved Presets */}
      {saved.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="section-title">Your Saved ({saved.length})</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }} data-testid="presets-saved">
            {saved.map((p) => (
              <div
                key={p.id}
                className="preset-card"
                style={{ background: buildGradientCSS(p.config) }}
                onClick={() => selectPreset(p.config)}
                data-testid={`saved-preset-${p.id}`}
              >
                <div className="preset-label">{p.name}</div>
                <button
                  onClick={(e) => deletePreset(p.id, e)}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    background: "rgba(0,0,0,0.5)",
                    border: "none",
                    borderRadius: 4,
                    padding: 4,
                    cursor: "pointer",
                    color: "white",
                    display: "flex",
                  }}
                  data-testid={`saved-preset-delete-${p.id}`}
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
