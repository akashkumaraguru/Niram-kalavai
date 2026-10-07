"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Toaster } from "sonner";
import GradientMaker from "@/components/GradientMaker";
import PaletteGenerator from "@/components/PaletteGenerator";
import TypographyGenerator from "@/components/TypographyGenerator";

const subscribeToMount = () => () => {};

export default function Home() {
  const mounted = useSyncExternalStore(subscribeToMount, () => true, () => false);
  if (!mounted) return <div className="w-screen h-screen bg-slate-950" role="status" aria-label="Loading studios" />;
  return <Studios />;
}

function Studios() {
  const [theme, setTheme] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("niram-kalavai-theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch { /* Use system preference when storage is unavailable. */ }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [activeStudio, setActiveStudio] = useState<"gradient" | "palette" | "typography">(() => {
    const params = new URLSearchParams(window.location.search);
    const studio = params.get("studio");
    if (studio === "gradient" || studio === "palette" || studio === "typography") return studio;
    return params.has("color") ? "palette" : "gradient";
  });

  // Update HTML theme attribute and persist to localStorage
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    try {
      localStorage.setItem("niram-kalavai-theme", theme);
    } catch (e) {
      console.error("Failed to save theme to localStorage:", e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  const handleStudioChange = (studio: "gradient" | "palette" | "typography") => {
    setActiveStudio(studio);
    
    // Update URL query parameters silently
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("studio", studio);
      // If switching to gradient or typography, clean up palette color params to prevent layout conflicts on reload
      if (studio !== "palette") {
        params.delete("color");
        params.delete("secondary");
        params.delete("neutral");
        params.delete("success");
        params.delete("info");
        params.delete("warning");
        params.delete("error");
      }
      const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
      window.history.replaceState(window.history.state, "", newUrl);
    }
  };

  return (
    <>
      {activeStudio === "gradient" ? (
        <GradientMaker
          theme={theme}
          toggleTheme={toggleTheme}
          activeStudio={activeStudio}
          onChangeStudio={handleStudioChange}
        />
      ) : activeStudio === "palette" ? (
        <PaletteGenerator
          theme={theme}
          toggleTheme={toggleTheme}
          onChangeStudio={handleStudioChange}
        />
      ) : (
        <TypographyGenerator
          theme={theme}
          toggleTheme={toggleTheme}
          onChangeStudio={handleStudioChange}
        />
      )}
      <Toaster theme={theme === "dark" ? "dark" : "light"} position="top-center" closeButton />
    </>
  );
}
