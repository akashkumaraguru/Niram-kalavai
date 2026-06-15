"use client";

interface CSSCodeConsoleProps {
  cssFull: string;
  colorFormat: string;
  setColorFormat: (format: string) => void;
}

export default function CSSCodeConsole({
  cssFull,
  colorFormat,
  setColorFormat,
}: CSSCodeConsoleProps) {
  return (
    <div>
      <div className="section-title">Generated CSS</div>
      <div className="css-box-container">
        <div className="css-box-header">
          <span className="css-box-title">CSS Code</span>
          <div className="format-toggle">
            {["HEX", "RGB", "HSL", "HSB"].map((fmt) => (
              <button
                key={fmt}
                className={`format-btn ${colorFormat === fmt ? "active" : ""}`}
                onClick={() => setColorFormat(fmt)}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
        <div className="css-block-body">
          <div className="css-block mono" data-testid="css-output">{cssFull}</div>
        </div>
      </div>
    </div>
  );
}
