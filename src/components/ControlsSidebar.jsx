import PresetSaveBox from "./PresetSaveBox";
import ColorStopsSlider from "./ColorStopsSlider";
import ColorStopsList from "./ColorStopsList";
import ImageColorExtractor from "./ImageColorExtractor";
import CSSCodeConsole from "./CSSCodeConsole";
import PresetGallery from "./PresetGallery";
import { FlipHorizontal, RotateCw } from "lucide-react";

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
}) {
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
    </aside>
  );
}
