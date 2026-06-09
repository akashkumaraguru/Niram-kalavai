import logoIcon from "../assets/Logo.svg";

export default function PreviewArea({
  css,
  noisySVG,
  activeTab,
  setActiveTab,
  ratio,
  setRatio,
  gradient,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}) {
  const getGradientStyle = () => {
    if (ratio === "fluid") {
      return { width: "100%", height: "100%", flex: 1 };
    }
    return {
      aspectRatio: ratio.replace(":", " / "),
      maxWidth: "100%",
      maxHeight: "100%",
      width: "auto",
      height: "auto",
      flex: "none",
    };
  };

  const getMockupBackground = () => {
    return {
      background: css,
    };
  };

  const getMockupTextStyle = () => {
    return {
      backgroundImage: css,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
      color: "transparent",
    };
  };

  const getLogoGradientStyle = () => {
    return {
      width: "44px",
      height: "44px",
      display: "block",
      maskImage: `url(${logoIcon})`,
      WebkitMaskImage: `url(${logoIcon})`,
      maskSize: "contain",
      WebkitMaskSize: "contain",
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
      maskPosition: "center",
      WebkitMaskPosition: "center",
      background: css,
    };
  };

  return (
    <main className="preview-area" data-testid="preview-area">
      <div className="preview-header-controls">
        <div className="preview-tabs">
          <button 
            className={`preview-tab-btn ${activeTab === "Gradient" ? "active" : ""}`}
            onClick={() => setActiveTab("Gradient")}
          >
            Gradient
          </button>
          <button 
            className={`preview-tab-btn ${activeTab === "noisy" ? "active" : ""}`}
            onClick={() => setActiveTab("noisy")}
          >
            Noisy Gradient
          </button>
          <button 
            className={`preview-tab-btn ${activeTab === "mockups" ? "active" : ""}`}
            onClick={() => setActiveTab("mockups")}
          >
            Mockups Preview
          </button>
        </div>

        {activeTab === "noisy" && (
          <div className="ratio-selector">
            <span className="ratio-label" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "hsl(var(--muted-foreground))", marginRight: 6, fontWeight: 600 }}>Ratio:</span>
            {["fluid", "1:1", "4:5", "16:9", "9:16", "19:6", "6:19"].map((r) => (
              <button
                key={r}
                className={`ratio-btn ${ratio === r ? "active" : ""}`}
                onClick={() => setRatio(r)}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {activeTab === "mockups" && (
          <button
            className="btn-pill"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", height: "auto", borderRadius: "6px" }}
            title={isSidebarCollapsed ? "Show controls sidebar" : "Hide controls sidebar"}
          >
            {isSidebarCollapsed ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-left"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>
                <span className="btn-text" style={{ fontSize: 12 }}></span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-right"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>
                <span className="btn-text" style={{ fontSize: 12 }}></span>
              </>
            )}
          </button>
        )}
      </div>

      {activeTab !== "mockups" ? (
        <div className="Gradient-wrapper" style={{ flex: 1, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", minHeight: 0 }}>
          {activeTab === "Gradient" ? (
            <div
              className="preview-Gradient fade-in"
              style={{ background: css, width: "100%", height: "100%", flex: 1 }}
              data-testid="preview-Gradient"
            />
          ) : (
            <div
              className="preview-Gradient fade-in noisy"
              style={getGradientStyle()}
              data-testid="preview-Gradient-noisy"
              dangerouslySetInnerHTML={{ __html: noisySVG }}
            />
          )}
        </div>
      ) : (
        <div className="mockups-board fade-in">
          {/* Typography & Gradient Text */}
          <div className="mockup-card-container">
            <div className="mockup-header-title">Typography & Text</div>
            <div className="mockup-typography-wrapper">
              <h1 className="mockup-gradient-text" style={getMockupTextStyle()}>
                Fluid Gradient Text
              </h1>
              <p style={{ color: "hsl(var(--foreground))", fontSize: "14px", opacity: 0.8, maxWidth: "500px", margin: "8px 0 0 0" }}>
                A demonstration of applying the CSS gradient directly as clipping masks on large headings.
              </p>
            </div>
          </div>

          {/* Logo & Brand Identity Mockup */}
          <div className="mockup-card-container">
            <div className="mockup-header-title">Logo & Brand Identity</div>
            <div className="mockup-logo-grid">
              <div className="mockup-logo-panel dark">
                <div className="logo-box">
                  <div className="brand-logo-emblem" style={getMockupBackground()}>
                    <img src={logoIcon} alt="Logo" className="brand-logo-mockup-white" />
                  </div>
                  <span className="logo-text">niram</span>
                </div>
                <div className="logo-caption">Emblem Fill - Dark Base</div>
              </div>

              <div className="mockup-logo-panel light">
                <div className="logo-box">
                  <div className="brand-logo-mask" style={getLogoGradientStyle()} />
                  <span className="logo-text">NIRAM</span>
                </div>
                <div className="logo-caption">Geometric Silhouette - Light Base</div>
              </div>
            </div>
          </div>

          {/* Editorial Swiss Poster Mockup */}
          <div className="mockup-card-container">
            <div className="mockup-header-title">Editorial Swiss Poster</div>
            <div className="mockup-poster-wrapper">
              <div className="mockup-editorial-poster" style={getMockupBackground()}>
                <div className="poster-tech-border" />
                <div className="poster-header">
                  <div className="poster-meta-col">
                    <span>DESIGN STUDIO</span>
                    <span>EST. 2026</span>
                  </div>
                  <div className="poster-meta-col text-right">
                    <span>ISSUE 01 / EDITION</span>
                    <span>REF. NK-2026</span>
                  </div>
                </div>

                <div className="poster-body">
                  <h1 className="poster-main-title">NIRAM</h1>
                  <h2 className="poster-sub-title">KALAVAI</h2>
                  <p className="poster-desc">
                    An exploration of organic color fields, stochastic grain, and fluid canvas dimensions. Produced by the Antigravity Design Engine.
                  </p>
                </div>

                <div className="poster-footer">
                  <div className="poster-specs-grid">
                    <div className="spec-item">
                      <span className="spec-label">TYPE:</span>
                      <span className="spec-val">{(gradient?.type || "RADIAL").toUpperCase()}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">STOPS:</span>
                      <span className="spec-val">{gradient?.stops?.length || 2}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">CHAOS:</span>
                      <span className="spec-val">{gradient?.chaos ?? 0.5}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">GRAIN:</span>
                      <span className="spec-val">{gradient?.grain ?? 0.3}</span>
                    </div>
                  </div>
                  <div className="poster-stamp">
                    <span>STOCHASTIC ENGINE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Creative Bi-fold Brochure Mockup */}
          <div className="mockup-card-container">
            <div className="mockup-header-title">Creative Bi-fold Brochure Layout</div>
            <div className="mockup-brochure-wrapper">
              <div className="mockup-brochure-page cover" style={getMockupBackground()}>
                <div className="brochure-mask-overlay" />
                <div className="brochure-content">
                  <div className="brochure-tag">CREATIVE LAB</div>
                  <h2 className="brochure-title">VIBRANT BRANDING</h2>
                  <div className="brochure-footer">
                    <span>VOLUME 02</span>
                    <span>2026 ANNUAL REPORT</span>
                  </div>
                </div>
              </div>

              <div className="mockup-brochure-page spread">
                <div className="brochure-grid">
                  <div className="brochure-header-row">
                    <span className="section-no">01 / CONCEPT</span>
                    <div className="accent-bar" style={getMockupBackground()} />
                  </div>
                  <h3>Organic Color Fields</h3>
                  <p>
                    In modern design systems, gradients reflect fluid, dynamic interaction states. By layering colors and introducing fine stochastic noise, we simulate realistic ambient lighting.
                  </p>
                  <div className="spread-footer-row">
                    <span>NIRAM DESIGN AGY</span>
                    <span>PAGE 03</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Mockup */}
          <div className="mockup-card-container">
            <div className="mockup-header-title">Hero Section Mockup</div>
            <div className="mockup-hero" style={getMockupBackground()}>
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
            <div className="mockup-overlays-grid" style={getMockupBackground()}>
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
      <div className="preview-footer-credits" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 16, fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>
        <span>
          Made with ❤️ by{" "}
          <a
            href="https://www.linkedin.com/in/akash-kumaraguru/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "hsl(var(--accent))", textDecoration: "none", fontWeight: 500 }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
          >
            Akash Kumaraguru
          </a>
        </span>
      </div>
    </main>
  );
}


