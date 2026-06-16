"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  DEFAULT_GRADIENT,
  buildGradientCSS,
  buildGradientSVG,
  buildNoisySVG,
  encodeSVGForCSS,
  exportGradientPNG,
  exportNoisyGradientPNG,
  formatColor,
  hexToRgb,
  randomHex,
  validateGradientPreset,
  GradientConfig,
  ColorStop,
  GradientPreset
} from "@/lib/gradientUtils";
import AppSkeleton from "./AppSkeleton";
import ControlsSidebar from "./ControlsSidebar";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Header from "./Header";
import PreviewArea from "./PreviewArea";

interface GradientMakerProps {
  theme: string;
  toggleTheme: () => void;
  activeStudio: "gradient" | "palette";
  onChangeStudio: (studio: "gradient" | "palette") => void;
}

export default function GradientMaker({
  theme,
  toggleTheme,
  activeStudio,
  onChangeStudio,
}: GradientMakerProps) {
  const [gradient, setGradient] = useState<GradientConfig>(DEFAULT_GRADIENT);
  const [name, setName] = useState<string>("");
  const [saved, setSaved] = useState<GradientPreset[]>([]);
  const [activeTab, setActiveTab] = useState<string>("Gradient"); // 'Gradient' | 'mockups'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Load presets on mount safely on the client side
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gradient-presets");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const validated = parsed
            .map((p) => validateGradientPreset(p))
            .filter((p): p is GradientPreset => p !== null);
          setSaved(validated);
        }
      }
    } catch (e) {
      console.error("Failed to load saved presets:", e);
    }
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "mockups") {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  };

  const [colorFormat, setColorFormat] = useState<string>("HEX"); // 'HEX' | 'RGB' | 'HSL' | 'HSB'
  const [activeStopId, setActiveStopId] = useState<string>(DEFAULT_GRADIENT.stops[0].id);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [presetToDelete, setPresetToDelete] = useState<string | null>(null);
  const [ratio, setRatio] = useState<string>("fluid"); // 'fluid' | '1:1' | '4:5' | '16:9' | '9:16' | '19:6' | '6:19'
  
  const padRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const css = useMemo(() => buildGradientCSS(gradient), [gradient]);

  const cssFull = useMemo(() => {
    const stopsFormatted = [...gradient.stops]
      .sort((a, b) => a.position - b.position)
      .map((s) => `${formatColor(s.color, s.opacity ?? 100, colorFormat)} ${s.position.toFixed(1)}%`)
      .join(", ");
      
    const cssRule = gradient.type === "linear"
      ? `linear-gradient(${gradient.angle}deg, ${stopsFormatted})`
      : gradient.type === "conic"
      ? `conic-gradient(from ${gradient.angle}deg at ${gradient.pos_x}% ${gradient.pos_y}%, ${stopsFormatted})`
      : `radial-gradient(${gradient.shape} farthest-corner at ${gradient.pos_x}% ${gradient.pos_y}%, ${stopsFormatted})`;
    return `background: ${cssRule};`;
  }, [gradient, colorFormat]);

  const noisySVG = useMemo(() => {
    return buildNoisySVG(gradient, ratio);
  }, [gradient, ratio]);

  const noisyCSS = useMemo(() => {
    return `background-image: url("data:image/svg+xml,${encodeSVGForCSS(noisySVG)}");`;
  }, [noisySVG]);

  const displayedCSS = activeTab === "noisy" ? noisyCSS : cssFull;

  const sliderTrackBackground = useMemo(() => {
    const stops = [...gradient.stops]
      .sort((a, b) => a.position - b.position)
      .map((s) => `${s.color} ${s.position}%`)
      .join(", ");
    return `linear-gradient(90deg, ${stops})`;
  }, [gradient.stops]);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [theme]);

  const update = (patch: Partial<GradientConfig>) => setGradient((g) => ({ ...g, ...patch }));
  
  const updateStopById = (id: string, patch: Partial<ColorStop>) => {
    setGradient((g) => {
      const stops = g.stops.map((s) => (s.id === id ? { ...s, ...patch } : s));
      return { ...g, stops };
    });
  };

  const addStop = () => {
    setGradient((g) => {
      const last = g.stops[g.stops.length - 1];
      const first = g.stops[0];
      const mid = ((last?.position ?? 100) + (first?.position ?? 0)) / 2;
      const newId = Date.now().toString();
      setActiveStopId(newId);
      return { ...g, stops: [...g.stops, { id: newId, color: randomHex(), position: Number(mid.toFixed(1)), opacity: 100 }] };
    });
  };

  const removeStopById = (id: string) => {
    setGradient((g) => {
      if (g.stops.length <= 2) return g;
      const filtered = g.stops.filter((s) => s.id !== id);
      return { ...g, stops: filtered };
    });
    if (activeStopId === id) {
      const remaining = gradient.stops.filter((s) => s.id !== id);
      if (remaining.length > 0) {
        setActiveStopId(remaining[0].id);
      }
    }
  };

  const selectPreset = (config: GradientConfig) => {
    const stopsWithIds = config.stops.map((s, idx) => ({
      ...s,
      id: s.id || `preset_${idx}_${Date.now()}`
    }));
    setGradient({ ...config, stops: stopsWithIds });
    if (stopsWithIds.length > 0) {
      setActiveStopId(stopsWithIds[0].id);
    }
  };

  const onPadClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    update({ pos_x: Math.max(0, Math.min(100, x)), pos_y: Math.max(0, Math.min(100, y)) });
  };

  const copyCSS = async () => {
    try {
      await navigator.clipboard.writeText(displayedCSS);
      toast.success("CSS copied to clipboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy CSS");
    }
  };

  const copySVG = async () => {
    try {
      const svgMarkup = activeTab === "noisy" ? noisySVG : buildGradientSVG(gradient);
      await navigator.clipboard.writeText(svgMarkup);
      toast.success("SVG copied to clipboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy SVG");
    }
  };

  const downloadPNG = () => {
    let width = 1920;
    let height = 1080;
    
    if (ratio === "1:1") { width = 1200; height = 1200; }
    else if (ratio === "4:5") { width = 1080; height = 1350; }
    else if (ratio === "9:16") { width = 1080; height = 1920; }
    else if (ratio === "19:6") { width = 1900; height = 600; }
    else if (ratio === "6:19") { width = 600; height = 1900; }
    else if (ratio === "16:9") { width = 1920; height = 1080; }

    if (activeTab === "noisy") {
      exportNoisyGradientPNG(noisySVG, width, height, `noisy-gradient-${Date.now()}.png`);
    } else {
      exportGradientPNG(gradient, width, height, `gradient-${Date.now()}.png`);
    }
  };

  const randomize = () => {
    const stops = Array.from({ length: 3 + Math.floor(Math.random() * 2) }).map((_, i, arr) => ({
      id: `r_${i}_${Date.now()}_${Math.random()}`,
      color: randomHex(),
      position: Number(((i / (arr.length - 1)) * 100).toFixed(1)),
      opacity: 100,
    }));
    const types = ["radial", "linear", "conic"];
    const nextGrad = {
      type: types[Math.floor(Math.random() * types.length)] as "linear" | "radial" | "conic",
      angle: Math.floor(Math.random() * 360),
      pos_x: Math.floor(Math.random() * 100),
      pos_y: Math.floor(Math.random() * 100),
      shape: "circle" as const,
      size: "farthest-corner",
      stops,
    };
    setGradient(nextGrad);
    if (stops.length > 0) {
      setActiveStopId(stops[0].id);
    }
  };

  const savePreset = () => {
    const presetName = name.trim().replace(/[<>]/g, "").slice(0, 32); // Strip tags and limit size
    if (!presetName) {
      toast.error("Please enter a valid preset name");
      return;
    }
    const exists = saved.some((p) => p.name.toLowerCase() === presetName.toLowerCase());
    if (exists) {
      toast.error("Already this name exists, please give a new name");
      return;
    }
    try {
      const newPreset = {
        id: Date.now().toString(),
        name: presetName,
        config: gradient,
      };
      const validated = validateGradientPreset(newPreset);
      if (!validated) {
        toast.error("Failed to validate preset configuration");
        return;
      }
      const updated = [...saved, validated];
      localStorage.setItem("gradient-presets", JSON.stringify(updated));
      setSaved(updated);
      toast.success(`Saved "${validated.name}"`);
      setName("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save preset");
    }
  };

  const deletePreset = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setPresetToDelete(id);
  };

  const confirmDeletePreset = () => {
    if (!presetToDelete) return;
    try {
      const updated = saved.filter((p) => p.id !== presetToDelete);
      localStorage.setItem("gradient-presets", JSON.stringify(updated));
      setSaved(updated);
      setPresetToDelete(null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete preset");
    }
  };

  const flipGradient = () => {
    setGradient((g) => {
      // Reverse stops color order to flip gradient
      const reversedStops = [...g.stops].reverse().map((s, idx) => ({
        ...s,
        position: g.stops[idx].position
      }));
      return { ...g, stops: reversedStops };
    });
  };

  const rotateGradient = () => {
    setGradient((g) => {
      if (g.type === "radial") return g;
      const nextAngle = (g.angle + 90) % 360;
      return { ...g, angle: nextAngle };
    });
  };

  const handleDrag = (stopId: string, e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const track = e.currentTarget.parentElement;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    
    const moveHandler = (moveEvent: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const offsetX = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
      
      setGradient((g) => {
        const stops = g.stops.map((s) => 
          s.id === stopId ? { ...s, position: Number(pct.toFixed(1)) } : s
        );
        return { ...g, stops };
      });
    };

    const upHandler = () => {
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("mouseup", upHandler);
      window.removeEventListener("touchmove", moveHandler);
      window.removeEventListener("touchend", upHandler);
    };

    window.addEventListener("mousemove", moveHandler);
    window.addEventListener("mouseup", upHandler);
    window.addEventListener("touchmove", moveHandler);
    window.addEventListener("touchend", upHandler);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsExtracting(false);
          return;
        }
        ctx.drawImage(img, 0, 0, 10, 10);
        const data = ctx.getImageData(0, 0, 10, 10).data;

        const hexColors: string[] = [];
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          const a = data[i+3];
          if (a < 50) continue; // skip transparent
          const hex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("").toUpperCase();
          if (!hexColors.includes(hex)) {
            hexColors.push(hex);
          }
        }

        const distinctColors: string[] = [];
        for (const col of hexColors) {
          const rgb1 = hexToRgb(col);
          const isTooClose = distinctColors.some(existing => {
            const rgb2 = hexToRgb(existing);
            const distance = Math.sqrt(
              Math.pow(rgb1.r - rgb2.r, 2) +
              Math.pow(rgb1.g - rgb2.g, 2) +
              Math.pow(rgb1.b - rgb2.b, 2)
            );
            return distance < 65; // color difference threshold
          });
          if (!isTooClose) {
            distinctColors.push(col);
          }
          if (distinctColors.length >= 5) break;
        }

        if (distinctColors.length < 2) {
          distinctColors.push(...hexColors.slice(0, 3 - distinctColors.length));
        }

        if (distinctColors.length === 0) {
          toast.error("Could not extract colors from image");
          setIsExtracting(false);
          return;
        }

        const stops = distinctColors.map((color, idx, arr) => ({
          id: `ext_${idx}_${Date.now()}`,
          color,
          position: Number(((idx / (arr.length - 1)) * 100).toFixed(1)),
          opacity: 100,
        }));

        setTimeout(() => {
          setGradient((g) => ({ ...g, stops }));
          if (stops.length > 0) {
            setActiveStopId(stops[0].id);
          }
          setIsExtracting(false);
        }, 650);

        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  if (isAppLoading) {
    return <AppSkeleton theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className={`app-shell ${isSidebarCollapsed && activeTab === "mockups" ? "sidebar-collapsed" : ""}`}>
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        activeStudio={activeStudio}
        onChangeStudio={onChangeStudio}
        randomize={randomize}
        copyCSS={copyCSS}
        copySVG={copySVG}
        downloadPNG={downloadPNG}
      />
      <PreviewArea
        gradient={gradient}
        css={css}
        noisySVG={noisySVG}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        ratio={ratio}
        setRatio={setRatio}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />
      <ControlsSidebar
        gradient={gradient}
        update={update}
        activeStopId={activeStopId}
        setActiveStopId={setActiveStopId}
        updateStopById={updateStopById}
        removeStopById={removeStopById}
        addStop={addStop}
        handleDrag={handleDrag}
        sliderTrackBackground={sliderTrackBackground}
        isExtracting={isExtracting}
        fileInputRef={fileInputRef}
        handleImageUpload={handleImageUpload}
        name={name}
        setName={setName}
        savePreset={savePreset}
        saved={saved}
        selectPreset={selectPreset}
        deletePreset={deletePreset}
        cssFull={displayedCSS}
        colorFormat={colorFormat}
        setColorFormat={setColorFormat}
        padRef={padRef}
        onPadClick={onPadClick}
        flipGradient={flipGradient}
        rotateGradient={rotateGradient}
        activeTab={activeTab}
      />
      {presetToDelete && (
        <DeleteConfirmModal
          presetName={saved.find((p) => p.id === presetToDelete)?.name || "this preset"}
          onConfirm={confirmDeletePreset}
          onCancel={() => setPresetToDelete(null)}
        />
      )}
    </div>
  );
}
