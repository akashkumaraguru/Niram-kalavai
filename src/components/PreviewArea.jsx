export default function PreviewArea({
  gradient,
  css,
  activeTab,
  setActiveTab,
}) {
  return (
    <main className="preview-area" data-testid="preview-area">
      <div className="preview-tabs">
        <button 
          className={`preview-tab-btn ${activeTab === "canvas" ? "active" : ""}`}
          onClick={() => setActiveTab("canvas")}
        >
          Canvas
        </button>
        <button 
          className={`preview-tab-btn ${activeTab === "mockups" ? "active" : ""}`}
          onClick={() => setActiveTab("mockups")}
        >
          Mockups Preview
        </button>
      </div>

      {activeTab === "canvas" ? (
        <div
          className="preview-canvas fade-in"
          style={{ background: css }}
          data-testid="preview-canvas"
        >
          {(gradient.type === "radial" || gradient.type === "conic") && (
            <div
              className="crosshair"
              style={{ left: `${gradient.pos_x}%`, top: `${gradient.pos_y}%` }}
              data-testid="preview-crosshair"
            />
          )}
        </div>
      ) : (
        <div className="mockups-board fade-in">
          {/* Typography & Gradient Text */}
          <div className="mockup-card-container">
            <div className="mockup-header-title">Typography & Text</div>
            <div className="mockup-typography-wrapper">
              <h1 className="mockup-gradient-text" style={{ backgroundImage: css }}>
                Fluid Gradient Text
              </h1>
              <p style={{ color: "hsl(var(--foreground))", fontSize: "14px", opacity: 0.8, maxWidth: "500px", margin: "8px 0 0 0" }}>
                A demonstration of applying the CSS gradient directly as clipping masks on large headings.
              </p>
            </div>
          </div>

          {/* Hero Mockup */}
          <div className="mockup-card-container">
            <div className="mockup-header-title">Hero Section Mockup</div>
            <div className="mockup-hero" style={{ background: css }}>
              <h1>Experience Vibrant Design</h1>
              <p>Generate, adjust, and copy CSS and SVG code for fluid color transitions.</p>
              <div className="mockup-hero-actions">
                <button className="mockup-btn primary">Explore Studio</button>
                <button className="mockup-btn secondary">View Documentation</button>
              </div>
            </div>
          </div>

          {/* Glassmorphic Overlay Panels */}
          <div className="mockup-card-container">
            <div className="mockup-header-title">Overlays & Contrast (Dark / Light)</div>
            <div className="mockup-overlays-grid" style={{ background: css }}>
              <div className="mockup-glass-panel dark">
                <h3>Dark Glass Card</h3>
                <p>Standard white text overlaying a dark glass container. Ideal for checking general readability and card outline styles.</p>
                <div className="mockup-glass-footer">
                  <span>Contrast Check</span>
                  <span className="glass-pill">OK</span>
                </div>
              </div>
              
              <div className="mockup-glass-panel light">
                <h3>Light Glass Card</h3>
                <p>Standard dark text overlaying a light glass container. Useful to verify readability with high-transparency panels.</p>
                <div className="mockup-glass-footer">
                  <span>Contrast Check</span>
                  <span className="glass-pill">OK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
