import { Upload } from "lucide-react";

export default function ImageColorExtractor({
  fileInputRef,
  handleImageUpload,
  isExtracting,
}) {
  return (
    <div>
      <div className="section-title">Extract from Image</div>
      <div className="image-extractor-box">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          style={{ display: "none" }}
          id="image-extractor-input"
          disabled={isExtracting}
        />
        <label htmlFor="image-extractor-input" className="image-extractor-label">
          <Upload size={16} style={{ color: "hsl(var(--accent))" }} />
          <span>Click to upload image</span>
          <span className="subtext">Extracts 3-5 gradient stops</span>
        </label>
      </div>
    </div>
  );
}
