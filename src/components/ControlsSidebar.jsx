import { useState, useEffect, useRef } from "react";
import PresetSaveBox from "./PresetSaveBox";
import ColorStopsSlider from "./ColorStopsSlider";
import ColorStopsList from "./ColorStopsList";
import ImageColorExtractor from "./ImageColorExtractor";
import CSSCodeConsole from "./CSSCodeConsole";
import PresetGallery from "./PresetGallery";
import { FlipHorizontal, RotateCw } from "lucide-react";
import { PATTERNS } from "../lib/gradientUtils";

const TYPES = [
  { id: "radial", label: "Radial" },
  { id: "linear", label: "Linear" },
  { id: "conic", label: "Conic" },
];

export default function ControlsSidebar({
  gradient,
  update,
  activeStopId,
  setActiveStopId,
  updateStopById,
  removeStopById,
  addStop,
  handleDrag,
  sliderTrackBackground,
  isExtracting,
  fileInputRef,
  handleImageUpload,
  name,
  setName,
  savePreset,
  saved,
  selectPreset,
  deletePreset,
  cssFull,
  colorFormat,
  setColorFormat,
  padRef,
  onPadClick,
  flipGradient,
  rotateGradient,
  activeTab,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="controls stagger" data-testid="controls-rail">
      {/* 1st: Save Preset */}
      <PresetSaveBox
        name={name}
        setName={setName}
        savePreset={savePreset}
      />

      {/* Slider Track */}
      <ColorStopsSlider
        gradient={gradient}
        activeStopId={activeStopId}
        setActiveStopId={setActiveStopId}
        handleDrag={handleDrag}
        isExtracting={isExtracting}
        sliderTrackBackground={sliderTrackBackground}
      />

      {/* Stops List */}
      <ColorStopsList
        gradient={gradient}
        activeStopId={activeStopId}
        setActiveStopId={setActiveStopId}
        updateStopById={updateStopById}
        removeStopById={removeStopById}
        addStop={addStop}
        isExtracting={isExtracting}
      />

      {/* 2nd: Gradient settings based on active tab */}
      {activeTab === "noisy" ? (
        <div className="stagger">
          <div className="section-title">Noisy Gradient Settings</div>
          
          <div className="slider-row">
            <label>Chaos</label>
            <input
              type="range" min="0" max="1" step="0.01"
              value={gradient.chaos ?? 0.5}
              onChange={(e) => update({ chaos: Number(e.target.value) })}
              data-testid="slider-chaos"
            />
            <span className="val mono">{Math.round((gradient.chaos ?? 0.5) * 100)}%</span>
          </div>

          <div className="slider-row">
            <label>Grain</label>
            <input
              type="range" min="0" max="1" step="0.01"
              value={gradient.grain ?? 0.3}
              onChange={(e) => update({ grain: Number(e.target.value) })}
              data-testid="slider-grain"
            />
            <span className="val mono">{Math.round((gradient.grain ?? 0.3) * 100)}%</span>
          </div>

          <div className="slider-row">
            <label>Blur</label>
            <input
              type="range" min="10" max="300" step="1"
              value={gradient.blur ?? 150}
              onChange={(e) => update({ blur: Number(e.target.value) })}
              data-testid="slider-blur"
            />
            <span className="val mono">{gradient.blur ?? 150}px</span>
          </div>

          <div style={{ marginTop: 16, position: "relative", marginBottom: dropdownOpen ? 212 : 16 }} ref={dropdownRef}>
            <div className="section-title" style={{ marginTop: 0, marginBottom: 8 }}>Noise Pattern</div>
            <button
              className="custom-dropdown-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: "12px",
                fontWeight: "600",
                borderRadius: "6px",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--input))",
                color: "hsl(var(--foreground))",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "border-color 160ms ease"
              }}
            >
              <span>{PATTERNS.find(p => p.id === (gradient.pattern ?? "fine"))?.label || "Fine Grain"}</span>
              <span style={{ fontSize: "10px", opacity: 0.6 }}>▼</span>
            </button>
            
            {dropdownOpen && (
              <div
                className="custom-dropdown-menu fade-in"
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  right: 0,
                  zIndex: 99,
                  background: "hsla(var(--card) / 0.85)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid hsla(var(--border) / 0.5)",
                  borderRadius: "8px",
                  padding: "4px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                }}
              >
                {PATTERNS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      update({ pattern: p.id });
                      setDropdownOpen(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      fontSize: "12px",
                      fontWeight: "500",
                      textAlign: "left",
                      border: "none",
                      background: gradient.pattern === p.id ? "hsl(var(--secondary))" : "transparent",
                      color: gradient.pattern === p.id ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))",
                      borderRadius: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 120ms ease",
                      fontFamily: "inherit"
                    }}
                    onMouseEnter={(e) => {
                      if (gradient.pattern !== p.id) {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                        e.currentTarget.style.color = "hsl(var(--foreground))";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (gradient.pattern !== p.id) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "hsl(var(--muted-foreground))";
                      }
                    }}
                  >
                    <span>{p.label}</span>
                    {gradient.pattern === p.id && <span style={{ fontSize: "10px", color: "hsl(var(--accent))" }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 0 }}>
            <button
              className="add-stop-btn"
              onClick={() => update({ seed: Math.floor(Math.random() * 1000000) })}
              style={{ width: "100%", justifyContent: "center" }}
            >
              Shuffle Blobs
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 2nd: Gradient Type */}
          <div>
            <div className="section-title">Gradient Type</div>
            <div className="type-toggle" data-testid="type-toggle">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  className={gradient.type === t.id ? "active" : ""}
                  onClick={() => update({ type: t.id })}
                  data-testid={`type-${t.id}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3rd: Position (X, Y) & Angle */}
          {(gradient.type === "radial" || gradient.type === "conic") && (
            <div>
              <div className="section-title">Center Position (X, Y)</div>
              <div
                ref={padRef}
                className="position-pad"
                onClick={onPadClick}
                style={{ "--px": `${gradient.pos_x}%`, "--py": `${gradient.pos_y}%` }}
                data-testid="position-pad"
              >
                <div
                  className="pad-handle"
                  style={{ left: `${gradient.pos_x}%`, top: `${gradient.pos_y}%` }}
                />
              </div>
              <div className="slider-row" style={{ marginTop: 10 }}>
                <label>X</label>
                <input
                  type="range" min="0" max="100" step="0.5"
                  value={gradient.pos_x}
                  onChange={(e) => update({ pos_x: Number(e.target.value) })}
                  data-testid="slider-pos-x"
                />
                <span className="val mono">{gradient.pos_x.toFixed(0)}%</span>
              </div>
              <div className="slider-row">
                <label>Y</label>
                <input
                  type="range" min="0" max="100" step="0.5"
                  value={gradient.pos_y}
                  onChange={(e) => update({ pos_y: Number(e.target.value) })}
                  data-testid="slider-pos-y"
                />
                <span className="val mono">{gradient.pos_y.toFixed(0)}%</span>
              </div>
            </div>
          )}

          {gradient.type === "linear" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, marginBottom: 10 }}>
                <div className="section-title" style={{ margin: 0 }}>Angle</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-pill" onClick={flipGradient} title="Flip Gradient Colors 180°" style={{ padding: "4px 8px", fontSize: 11, height: 26, borderRadius: 6 }}>
                    <FlipHorizontal size={12} /> Flip
                  </button>
                  <button className="btn-pill" onClick={rotateGradient} title="Rotate 90° Clockwise" style={{ padding: "4px 8px", fontSize: 11, height: 26, borderRadius: 6 }}>
                    <RotateCw size={12} /> Rotate
                  </button>
                </div>
              </div>
              <div className="slider-row">
                <label>Deg</label>
                <input
                  type="range" min="0" max="360" step="1"
                  value={gradient.angle}
                  onChange={(e) => update({ angle: Number(e.target.value) })}
                  data-testid="slider-angle"
                />
                <span className="val mono">{gradient.angle}°</span>
              </div>
            </div>
          )}

          {gradient.type === "conic" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, marginBottom: 10 }}>
                <div className="section-title" style={{ margin: 0 }}>Start Angle</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-pill" onClick={flipGradient} title="Flip Gradient Colors 180°" style={{ padding: "4px 8px", fontSize: 11, height: 26, borderRadius: 6 }}>
                    <FlipHorizontal size={12} /> Flip
                  </button>
                  <button className="btn-pill" onClick={rotateGradient} title="Rotate 90° Clockwise" style={{ padding: "4px 8px", fontSize: 11, height: 26, borderRadius: 6 }}>
                    <RotateCw size={12} /> Rotate
                  </button>
                </div>
              </div>
              <div className="slider-row">
                <label>Deg</label>
                <input
                  type="range" min="0" max="360" step="1"
                  value={gradient.angle}
                  onChange={(e) => update({ angle: Number(e.target.value) })}
                  data-testid="slider-angle-conic"
                />
                <span className="val mono">{gradient.angle}°</span>
              </div>
            </div>
          )}

          {/* 4th: Shape (Radial only) */}
          {gradient.type === "radial" && (
            <div>
              <div className="section-title">Shape</div>
              <div className="field-row">
                <div className="type-toggle" style={{ flex: 1, gridTemplateColumns: "1fr 1fr" }}>
                  {["circle", "ellipse"].map((s) => (
                    <button
                      key={s}
                      className={gradient.shape === s ? "active" : ""}
                      onClick={() => update({ shape: s })}
                      data-testid={`shape-${s}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5th: Extract from Image */}
          <ImageColorExtractor
            fileInputRef={fileInputRef}
            handleImageUpload={handleImageUpload}
            isExtracting={isExtracting}
          />

          {/* 6th: Generated CSS */}
          <CSSCodeConsole
            cssFull={cssFull}
            colorFormat={colorFormat}
            setColorFormat={setColorFormat}
          />

          {/* 7th: Presets Gallery */}
          <PresetGallery
            saved={saved}
            selectPreset={selectPreset}
            deletePreset={deletePreset}
          />
        </>
      )}
    </aside>
  );
}
