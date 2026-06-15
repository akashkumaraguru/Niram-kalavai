import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Niram Kalavai - Gradient Generator & Color Mixer",
  description: "An interactive laboratory for organic color fields, smooth multi-stop gradients, and custom grain patterns. Generate and export premium CSS code, SVG vector layers, and canvas-rendered PNGs.",
  icons: {
    icon: "/Logo-desktop.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
