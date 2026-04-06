"use client";

import { useState, useRef, useCallback } from "react";
import styles from "./pack.module.css";

interface BoosterPackProps {
  gameTitle: string;
  onOpen: () => void;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

export default function BoosterPack({ gameTitle, onOpen }: BoosterPackProps) {
  const [tearing, setTearing] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  function handleOpen() {
    if (tearing) return;
    setTearing(true);
    setTimeout(onOpen, 600);
  }

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    el.style.setProperty("--rotateY", `${clamp(((x - cx) / cx) * 12, -12, 12)}deg`);
    el.style.setProperty("--rotateX", `${clamp(-((y - cy) / cy) * 12, -12, 12)}deg`);
    el.style.setProperty("--mx", `${((x / rect.width) * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${((y / rect.height) * 100).toFixed(1)}%`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.style.setProperty("--rotateX", "0deg");
    el.style.setProperty("--rotateY", "0deg");
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={styles.packWrapper}
      onClick={handleOpen}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleOpen();
      }}
      role="button"
      tabIndex={0}
      aria-label="Open booster pack"
    >
      <div className={styles.packScene}>

        {/* TOP STRIP — tears away upward */}
        <div
          className={[styles.pack, styles.packHalfTop, tearing ? styles.tearTop : ""].filter(Boolean).join(" ")}
          aria-hidden="true"
        >
          <div className={styles.packFoil} />
          <div className={styles.packSheen} />
        </div>

        {/* MAIN BODY — falls away on tear */}
        <div
          className={[styles.pack, styles.packHalfBottom, tearing ? styles.tearBottom : ""].filter(Boolean).join(" ")}
        >
          <div className={styles.packFoil} />
          <div className={styles.packSheen} />
          <div className={styles.tearLine} aria-hidden="true" />
          <div className={styles.packInner}>
            <span className={styles.packTitle}>Booster Pack</span>
            <span className={styles.packName}>{gameTitle}</span>
          </div>
        </div>

      </div>

      {!tearing && (
        <p className={styles.packTapHint}>Tap to open</p>
      )}
    </div>
  );
}
