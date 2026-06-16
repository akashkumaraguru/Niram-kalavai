"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import GradientMaker from "@/components/GradientMaker";
import PaletteGenerator from "@/components/PaletteGenerator";

export default function Home() {
  const [theme, setTheme] = useState<string>("dark"); // Default to dark theme
  const [activeStudio, setActiveStudio] = useState<"gradient" | "palette">("gradient");
  const [mounted, setMounted] = useState<boolean>(false);

  // Sync theme and active sub-app tab on client mount
  useEffect(() => {
    // 1. Theme sync
    try {
      const savedTheme = localStorage.getItem("niram-kalavai-theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      } else {
        // Fallback to system preferences
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(systemPrefersDark ? "dark" : "light");
      }
    } catch (e) {
      console.error("Failed to load theme preference:", e);
    }

    // 2. Studio selection sync from URL search params
    const params = new URLSearchParams(window.location.search);
    const studioParam = params.get("studio");
    const colorParam = params.get("color");

    if (studioParam === "palette" || colorParam) {
      setActiveStudio("palette");
    } else if (studioParam === "gradient") {
      setActiveStudio("gradient");
    }

    setMounted(true);
  }, []);

  // Update HTML theme attribute and persist to localStorage
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("light", theme === "light");
    try {
      localStorage.setItem("niram-kalavai-theme", theme);
    } catch (e) {
      console.error("Failed to save theme to localStorage:", e);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  const handleStudioChange = (studio: "gradient" | "palette") => {
    setActiveStudio(studio);
    
    // Update URL query parameters silently
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("studio", studio);
      // If switching to gradient, clean up palette color params to prevent layout conflicts on reload
      if (studio === "gradient") {
        params.delete("color");
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }
  };

  if (!mounted) {
    // Return a black background loading skeleton structure during hydration stage
    return (
      <div className="w-screen h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-t-sky-500 border-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {activeStudio === "gradient" ? (
        <GradientMaker
          theme={theme}
          toggleTheme={toggleTheme}
          activeStudio={activeStudio}
          onChangeStudio={handleStudioChange}
        />
      ) : (
        <PaletteGenerator
          theme={theme}
          toggleTheme={toggleTheme}
          onChangeStudio={handleStudioChange}
        />
      )}
      <Toaster theme={theme === "dark" ? "dark" : "light"} position="top-center" closeButton />
    </>
  );
}
