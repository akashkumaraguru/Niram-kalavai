"use client";

import { Save } from "lucide-react";

interface PresetSaveBoxProps {
  name: string;
  setName: (name: string) => void;
  savePreset: () => void;
}

export default function PresetSaveBox({ name, setName, savePreset }: PresetSaveBoxProps) {
  return (
    <div>
      <div className="section-title">Save Preset</div>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          type="text"
          placeholder="Preset name"
          value={name}
          onChange={(e) => setName(e.target.value.replace(/[<>]/g, "").slice(0, 32))}
          data-testid="input-preset-name"
          style={{
            flex: 1,
            padding: "10px 12px",
            background: "hsl(var(--input))",
            border: "1px solid hsl(var(--border))",
            color: "hsl(var(--foreground))",
            borderRadius: 6,
            fontSize: 13,
            marginTop: 10
          }}
        />
        <button className="btn-pill primary" onClick={savePreset} data-testid="btn-save-preset" style={{ borderRadius: 8, marginTop: 10 }}>
          <Save size={14} /> Save
        </button>
      </div>
    </div>
  );
}
