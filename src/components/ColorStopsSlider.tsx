"use client";

import React from "react";
import { GradientConfig } from "../lib/gradientUtils";

interface ColorStopsSliderProps {
  gradient: GradientConfig;
  activeStopId: string;
  updateStopById: (id: string, patch: { position: number }) => void;
  setActiveStopId: (id: string) => void;
  handleDrag: (stopId: string, e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  isExtracting: boolean;
  sliderTrackBackground: string;
}

export default function ColorStopsSlider({
  gradient,
  activeStopId,
  updateStopById,
  setActiveStopId,
  handleDrag,
  isExtracting,
  sliderTrackBackground,
}: ColorStopsSliderProps) {
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
            role="slider"
            tabIndex={0}
            aria-label={`Position of ${s.color} color stop`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={s.position}
            onFocus={() => setActiveStopId(s.id)}
            onKeyDown={event => {
              const delta = event.shiftKey ? 10 : 1;
              const positions: Record<string, number> = { ArrowLeft: s.position - delta, ArrowDown: s.position - delta, ArrowRight: s.position + delta, ArrowUp: s.position + delta, Home: 0, End: 100 };
              if (event.key in positions) {
                event.preventDefault();
                updateStopById(s.id, { position: Math.max(0, Math.min(100, positions[event.key])) });
              }
            }}
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
