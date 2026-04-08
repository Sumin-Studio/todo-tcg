"use client";

import { useEffect, useRef, useState } from "react";

// Tell TypeScript about the <spline-viewer> custom element.
// React 19 uses React.JSX, not the global JSX namespace.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "spline-viewer": {
        url?: string;
        style?: import("react").CSSProperties;
        className?: string;
      };
    }
  }
}

const SPLINE_SCENE_URL =
  "https://prod.spline.design/ixsaTw-8uprK5jbV/scene.splinecode";

interface SplinePackProps {
  onOpen: () => void;
}

export default function SplinePack({ onOpen }: SplinePackProps) {
  const [fadeActive, setFadeActive] = useState(false);
  const calledRef = useRef(false);

  // Inject <script type="module"> — Next.js Script component doesn't support
  // type="module" reliably, so we do it manually once.
  useEffect(() => {
    if (document.querySelector('script[src*="spline-viewer"]')) return;
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@splinetool/viewer@1.12.78/build/spline-viewer.js";
    document.head.appendChild(script);
  }, []);

  function handleClick() {
    if (calledRef.current) return;
    calledRef.current = true;
    // Native click events are composed:true, so they bubble through the
    // <spline-viewer> shadow DOM to this wrapper — Spline's own animation
    // triggers first, then we start our timer.
    setTimeout(() => {
      setFadeActive(true);
      setTimeout(onOpen, 500);
    }, 2000);
  }

  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 10 }}
        onClick={handleClick}
      >
        <spline-viewer
          url={SPLINE_SCENE_URL}
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
