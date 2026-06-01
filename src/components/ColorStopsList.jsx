import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function ColorStopsList({
  gradient,
  activeStopId,
  setActiveStopId,
  updateStopById,
  removeStopById,
  addStop,
  isExtracting,
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 12 }}>
        <div className="section-title" style={{ margin: 0 }}>Stops</div>
        <button className="icon-btn" onClick={addStop} title="Add color stop" disabled={isExtracting}>
          <Plus size={16} />
        </button>
      </div>

      {isExtracting ? (
        <div className="custom-stops-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="custom-stop-row skeleton-block shimmer" style={{ height: 48, opacity: 0.6 }} />
          ))}
        </div>
      ) : (
        <div className="custom-stops-list">
          {gradient.stops.map((s) => (
            <div 
              className={`custom-stop-row ${activeStopId === s.id ? "selected" : ""}`} 
              onClick={() => setActiveStopId(s.id)}
              key={s.id}
            >
              {/* Position Box */}
              <div className="custom-stop-position">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(s.position)}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                    updateStopById(s.id, { position: val });
                  }}
                />
                <span className="percent-label">%</span>
              </div>

              {/* Swatch + Hex Input + Opacity Input */}
              <div className="custom-stop-color-group">
                <label className="custom-stop-swatch" style={{ background: s.color }}>
                  <input
                    type="color"
                    value={s.color.slice(0, 7)} // color picker only takes 7-character hex (no alpha)
                    onChange={(e) => updateStopById(s.id, { color: e.target.value.toUpperCase() })}
                  />
                </label>
                <input
                  type="text"
                  className="custom-stop-hex mono"
                  value={s.color.replace("#", "")}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^A-Fa-f0-9]/g, "").slice(0, 8); // allow only valid hex chars up to 8 chars
                    updateStopById(s.id, { color: `#${val.toUpperCase()}` });
                  }}
                />
                <div className="custom-stop-opacity">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={s.opacity ?? 100}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                      updateStopById(s.id, { opacity: val });
                    }}
                  />
                  <span className="opacity-label">%</span>
                </div>
              </div>

              {/* Remove Button */}
              <button
                className="custom-stop-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (gradient.stops.length <= 2) {
                    toast.error("You cannot have less than 2 color stops");
                  } else {
                    removeStopById(s.id);
                  }
                }}
              >
                —
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
