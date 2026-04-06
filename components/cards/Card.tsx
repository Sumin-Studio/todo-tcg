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
  const hasHolographicEffect = card.rarity === "rare" || card.rarity === "legendary";

  function applyTilt(clientX: number, clientY: number) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    el.style.setProperty("--rotateY", `${((x - cx) / cx) * 10}deg`);
    el.style.setProperty("--rotateX", `${-((y - cy) / cy) * 10}deg`);
    el.style.setProperty("--mx", `${((x / rect.width) * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${((y / rect.height) * 100).toFixed(1)}%`);
  }

  function resetTilt() {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rotateX", "0deg");
    el.style.setProperty("--rotateY", "0deg");
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => applyTilt(e.clientX, e.clientY),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0];
      if (touch) applyTilt(touch.clientX, touch.clientY);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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
      onMouseLeave={resetTilt}
      onTouchMove={handleTouchMove}
      onTouchEnd={resetTilt}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); }
          : undefined
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.frameLayer} src={`/frames/${card.rarity}.png`} alt="" aria-hidden="true" draggable={false} />

      {card.artUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.artLayer} src={card.artUrl} alt={card.taskName} draggable={false} />
      ) : (
        <ArtFallback rarity={card.rarity} />
      )}

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
  return <div className={styles.artFallback} style={{ background: gradients[rarity] }} aria-hidden="true" />;
}
