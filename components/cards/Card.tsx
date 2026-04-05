"use client";

import { useRef, useCallback } from "react";
import type { Card as CardType } from "@/lib/types";
import styles from "./card.module.css";

interface CardProps {
  card: CardType;
  isComplete: boolean;
  onClick?: () => void;
}

export default function Card({ card, isComplete, onClick }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (card.rarity !== "legendary") return;
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
    [card.rarity]
  );

  const handleMouseLeave = useCallback(() => {
    if (card.rarity !== "legendary") return;
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rotateX", "0deg");
    el.style.setProperty("--rotateY", "0deg");
  }, [card.rarity]);

  const isLegendary = card.rarity === "legendary";
  const isRare = card.rarity === "rare";

  return (
    <div
      ref={cardRef}
      className={[
        styles.card,
        isComplete ? styles.cardComplete : "",
        isLegendary ? styles.parallax : "",
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
        <div className={styles.divider} />
        <span className={styles.flavorText}>{card.flavorText}</span>
      </div>

      {/* z-index 3: FX overlay */}
      {isRare && <div className={styles.shimmer} aria-hidden="true" />}
      {isLegendary && <div className={styles.parallaxFx} aria-hidden="true" />}

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
