export default function ColorStopsSlider({
  gradient,
  activeStopId,
  setActiveStopId,
  handleDrag,
  isExtracting,
  sliderTrackBackground,
}) {
  if (isExtracting) {
    return (
      <div className="stops-slider-container">
        <div className="stops-slider-track skeleton-block shimmer" style={{ display: "flex", alignItems: "center", justifyContent: "center", borderStyle: "dashed" }}>
          <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", fontWeight: 500 }}>Extracting color stops...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="stops-slider-container">
      <div className="stops-slider-track" style={{ background: sliderTrackBackground }}>
        {gradient.stops.map((s) => (
          <div
            key={s.id}
            className={`stop-handle-pin ${activeStopId === s.id ? "active" : ""}`}
            style={{ left: `${s.position}%` }}
            onMouseDown={(e) => {
              setActiveStopId(s.id);
              handleDrag(s.id, e);
            }}
            onTouchStart={(e) => {
              setActiveStopId(s.id);
              handleDrag(s.id, e);
            }}
          >
            <svg width="24" height="28" viewBox="0 0 24 28" className="pin-svg">
              <path
                d="M12 28C9 22 2 16 2 10C2 4.47715 6.47715 0 12 0C17.5228 0 22 4.47715 22 10C22 16 15 22 12 28Z"
                fill="var(--pin-bg)"
                stroke="var(--pin-stroke)"
                strokeWidth="1.5"
              />
            </svg>
            <span className="stop-pin-swatch" style={{ background: s.color }} />
          </div>
        ))}
      </div>
    </div>
  );
}
