"use client";

import { useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Application } from "@splinetool/runtime";

// Spline uses WebGL — must be dynamically imported to avoid SSR errors.
const Spline = dynamic(() => import("@splinetool/react-spline"), { ssr: false });

// ← Replace with your published Spline scene URL
const SPLINE_SCENE_URL = "https://prod.spline.design/splinedesigncourse-0C0ELtGkfRQtejXY4NE8CGUU/scene.splinecode";

interface SplinePackProps {
  onOpen: () => void;
}

export default function SplinePack({ onOpen }: SplinePackProps) {
  const splineRef = useRef<Application | null>(null);
  const [fadeActive, setFadeActive] = useState(false);
  const calledRef = useRef(false); // guard against double-fire

  const handleLoad = useCallback((splineApp: Application) => {
    splineRef.current = splineApp;
  }, []);

  // onSplineMouseDown fires when user clicks any object in the scene.
  // Using this (not a wrapper div onClick) lets Spline receive the pointer
  // event natively so its built-in animations trigger correctly.
  const handleSplineMouseDown = useCallback(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    // Wait 2s for the Spline animation to play, then fade to black (500ms),
    // then call onOpen to begin image preloading.
    setTimeout(() => {
      setFadeActive(true);
      setTimeout(onOpen, 500);
    }, 2000);
  }, [onOpen]);

  return (
    <>
      {/* Full-viewport Spline canvas */}
      <div style={{ position: "fixed", inset: 0, zIndex: 10 }}>
        <Spline
          scene={SPLINE_SCENE_URL}
          onLoad={handleLoad}
          onSplineMouseDown={handleSplineMouseDown}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Fade-to-black overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 20,
          backgroundColor: "#000",
          opacity: fadeActive ? 1 : 0,
          transition: fadeActive ? "opacity 500ms ease-in" : "none",
          pointerEvents: fadeActive ? "all" : "none",
        }}
      />
    </>
  );
}
