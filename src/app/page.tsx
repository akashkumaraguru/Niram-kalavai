"use client";

import GradientMaker from "@/components/GradientMaker";
import { Toaster } from "sonner";

export default function Home() {
  return (
    <>
      <GradientMaker />
      <Toaster theme="dark" position="top-center" closeButton />
    </>
  );
}
