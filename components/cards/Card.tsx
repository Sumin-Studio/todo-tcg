"use client";

import { useRef, useCallback, useEffect } from "react";
import type { Card as CardType } from "@/lib/types";
import styles from "./card.module.css";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";

interface CardProps {
  card: CardType;
  isComplete: boolean;
  onClick?: () => void;
  orientationActive?: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function Card({ card, isComplete, onClick, orientationActive = false }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hasHolographicEffect = card.rarity === "rare" || card.rarity === "legendary";

  // Desktop: mouse-driven parallax
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateY = ((x - cx) / cx) * 10;
      const rotateX = -((y - cy) / cy) * 10;
      const mx = ((x / rect.width) * 100).toFixed(1) + "%";
      const my = ((y / rect.height) * 100).toFixed(1) + "%";
      el.style.setProperty("--rotateX", `${rotateX}deg`);
      el.style.setProperty("--rotateY", `${rotateY}deg`);
      el.style.setProperty("--mx", mx);
      el.style.setProperty("--my", my);
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rotateX", "0deg");
    el.style.setProperty("--rotateY", "0deg");
  }, []);

  // Mobile: device-orientation-driven parallax — drives the same CSS vars
  useDeviceOrientation(
    useCallback((gamma: number, beta: number) => {
      const el = cardRef.current;
      if (!el) return;
      const rotateY = clamp(gamma * 0.33, -10, 10);
      const rotateX = clamp((beta - 55) * 0.22, -10, 10);
      const mx = ((gamma + 60) / 120 * 100).toFixed(1) + "%";
      const my = (clamp((beta - 25) / 60, 0, 1) * 100).toFixed(1) + "%";
      el.style.setProperty("--rotateX", `${rotateX}deg`);
      el.style.setProperty("--rotateY", `${rotateY}deg`);
      el.style.setProperty("--mx", mx);
      el.style.setProperty("--my", my);
    }, []),
    orientationActive
  );

  // Reset CSS vars when orientation becomes inactive
  useEffect(() => {
    if (!orientationActive) {
      const el = cardRef.current;
      if (!el) return;
      el.style.setProperty("--rotateX", "0deg");
      el.style.setProperty("--rotateY", "0deg");
    }
  }, [orientationActive]);

  return (
    <div
      ref={cardRef}
      className={[
        styles.card,
        isComplete ? styles.cardComplete : "",
        styles.parallax,
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
    >
      {/* z-index 0: Frame PNG */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.frameLayer}
        src={`/frames/${card.rarity}.png`}
        alt=""
        aria-hidden="true"
        draggable={false}
      />

      {/* z-index 1: AI Art (or gradient fallback) */}
      {card.artUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={styles.artLayer}
          src={card.artUrl}
          alt={card.taskName}
          draggable={false}
        />
      ) : (
        <ArtFallback rarity={card.rarity} />
      )}

      {/* z-index 2: Text */}
      <div className={styles.textLayer}>
        <span className={styles.taskName}>{card.taskName}</span>
      </div>

      {hasHolographicEffect && (
        <div
          className={[
            styles.holographicLayer,
            card.rarity === "legendary" ? styles.legendaryHolographic : styles.rareHolographic,
          ].join(" ")}
          aria-hidden="true"
        />
      )}

      {/* z-index 4: Complete stamp */}
      {isComplete && (
        <div className={styles.completeStamp} aria-label="Completed">
          <span className={styles.stampText}>Done</span>
        </div>
      )}
    </div>
  );
}

function ArtFallback({ rarity }: { rarity: CardType["rarity"] }) {
  const gradients: Record<CardType["rarity"], string> = {
    common: "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
    rare: "linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)",
    legendary: "linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)",
  };
  return (
    <div
      className={styles.artFallback}
      style={{ background: gradients[rarity] }}
      aria-hidden="true"
    />
  );
}
