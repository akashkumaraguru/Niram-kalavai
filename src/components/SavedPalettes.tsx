"use client";

import { Trash2, Calendar, FileDown, Plus } from "lucide-react";
import { FullPalette } from "@/lib/paletteUtils";

interface SavedPalettesProps {
  saved: FullPalette[];
  currentPalette: FullPalette;
  onSelect: (palette: FullPalette) => void;
  onDelete: (name: string) => void;
}

export default function SavedPalettes({
  saved,
  currentPalette,
  onSelect,
  onDelete,
}: SavedPalettesProps) {
  return (
    <div className="space-y-6 text-foreground">
      {/* Saved Palettes List */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Your Saved Palettes ({saved.length})
        </h4>

        {saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border border-dashed border-border/60 rounded-2xl">
            <FileDown size={28} className="mb-2 text-muted-foreground/40" />
            <p className="text-xs font-semibold">No saved palettes yet</p>
            <p className="text-[10px] text-muted-foreground/50 mt-1">Name and save one above</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {saved.map((pal) => {
              const isSelected = pal.baseColor.toLowerCase() === currentPalette.baseColor.toLowerCase();
              return (
                <div
                  key={pal.name}
                  onClick={() => onSelect(pal)}
                  className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-secondary/40 border-accent shadow-md shadow-accent/5"
                      : "bg-input/30 border-border hover:bg-secondary/70 hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="text-xs font-bold text-foreground group-hover:text-accent transition-colors truncate max-w-[150px]">
                        {pal.name}
                      </h5>
                      <span className="text-[10px] text-muted-foreground/75 flex items-center gap-1 mt-0.5">
                        <Calendar size={10} />
                        {pal.createdDate}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(pal.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive rounded transition-all hover:bg-input"
                      title="Delete saved palette"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Palette Swatches Container */}
                  <div className="space-y-2.5 mt-2.5">
                    {/* Primary Scale (All 11 shades) */}
                    <div>
                      <div className="flex h-3.5 rounded-md overflow-hidden border border-black/10">
                        {pal.shades.map((sh, index) => (
                          <div
                            key={index}
                            className="flex-1 h-full"
                            style={{ backgroundColor: sh.hex }}
                            title={`Primary ${sh.level}: ${sh.hex}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Subscales (Secondary, Neutral, Success, Warning, Error) */}
                    <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-border/40">
                      {/* Secondary */}
                      <div>
                        <div className="text-[7px] font-bold text-muted-foreground/60 mb-0.5 truncate uppercase tracking-wider">Sec</div>
                        <div className="flex h-1.5 rounded-sm overflow-hidden border border-black/5">
                          {pal.secondary && pal.secondary.length > 0 ? (
                            pal.secondary.map((sh, idx) => (
                              <div key={idx} className="flex-1 h-full" style={{ backgroundColor: sh.hex }} title={`Secondary: ${sh.hex}`} />
                            ))
                          ) : (
                            <div className="w-full h-full bg-muted" />
                          )}
                        </div>
                      </div>

                      {/* Neutral */}
                      <div>
                        <div className="text-[7px] font-bold text-muted-foreground/60 mb-0.5 truncate uppercase tracking-wider">Neu</div>
                        <div className="flex h-1.5 rounded-sm overflow-hidden border border-black/5">
                          {pal.neutrals && pal.neutrals.length > 0 ? (
                            pal.neutrals.map((sh, idx) => (
                              <div key={idx} className="flex-1 h-full" style={{ backgroundColor: sh.hex }} title={`Neutral: ${sh.hex}`} />
                            ))
                          ) : (
                            <div className="w-full h-full bg-muted" />
                          )}
                        </div>
                      </div>

                      {/* Success */}
                      <div>
                        <div className="text-[7px] font-bold text-muted-foreground/60 mb-0.5 truncate uppercase tracking-wider">Suc</div>
                        <div className="flex h-1.5 rounded-sm overflow-hidden border border-black/5">
                          {pal.success && pal.success.length > 0 ? (
                            pal.success.map((sh, idx) => (
                              <div key={idx} className="flex-1 h-full" style={{ backgroundColor: sh.hex }} title={`Success: ${sh.hex}`} />
                            ))
                          ) : (
                            <div className="w-full h-full bg-muted" />
                          )}
                        </div>
                      </div>

                      {/* Warning */}
                      <div>
                        <div className="text-[7px] font-bold text-muted-foreground/60 mb-0.5 truncate uppercase tracking-wider">Wrn</div>
                        <div className="flex h-1.5 rounded-sm overflow-hidden border border-black/5">
                          {pal.warning && pal.warning.length > 0 ? (
                            pal.warning.map((sh, idx) => (
                              <div key={idx} className="flex-1 h-full" style={{ backgroundColor: sh.hex }} title={`Warning: ${sh.hex}`} />
                            ))
                          ) : (
                            <div className="w-full h-full bg-muted" />
                          )}
                        </div>
                      </div>

                      {/* Error */}
                      <div>
                        <div className="text-[7px] font-bold text-muted-foreground/60 mb-0.5 truncate uppercase tracking-wider">Err</div>
                        <div className="flex h-1.5 rounded-sm overflow-hidden border border-black/5">
                          {pal.error && pal.error.length > 0 ? (
                            pal.error.map((sh, idx) => (
                              <div key={idx} className="flex-1 h-full" style={{ backgroundColor: sh.hex }} title={`Error: ${sh.hex}`} />
                            ))
                          ) : (
                            <div className="w-full h-full bg-muted" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
