"use client";

import { useEffect, useCallback } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function useDeviceOrientation(
  onOrientation: (gamma: number, beta: number) => void,
  active: boolean
) {
  const stableCallback = useCallback(onOrientation, [onOrientation]);

  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    function handler(e: DeviceOrientationEvent) {
      if (e.gamma === null || e.beta === null) return;
      stableCallback(
        clamp(e.gamma, -60, 60),
        clamp(e.beta, 0, 180)
      );
    }

    window.addEventListener("deviceorientation", handler, true);
    return () => window.removeEventListener("deviceorientation", handler, true);
  }, [active, stableCallback]);
}
