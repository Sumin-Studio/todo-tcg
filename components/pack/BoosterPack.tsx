"use client";

import { useState } from "react";
import styles from "./pack.module.css";

interface BoosterPackProps {
  gameTitle: string;
  onOpen: () => void;
}

export default function BoosterPack({ gameTitle, onOpen }: BoosterPackProps) {
  const [tearing, setTearing] = useState(false);

  function handleOpen() {
    if (tearing) return;
    setTearing(true);
    setTimeout(onOpen, 400);
  }

  return (
    <div
      className={styles.packWrapper}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleOpen();
      }}
      role="button"
      tabIndex={0}
      aria-label="Open booster pack"
    >
      <div className={`${styles.pack} ${tearing ? styles.packTearing : ""}`}>
        <div className={styles.packSheen} aria-hidden="true" />
        <div className={styles.tearLine} aria-hidden="true" />
        <div className={styles.packInner}>
          <span className={styles.packTitle}>Booster Pack</span>
          <span className={styles.packName}>{gameTitle}</span>
        </div>
      </div>
      {!tearing && (
        <p className={styles.packTapHint}>Tap to open</p>
      )}
    </div>
  );
}
