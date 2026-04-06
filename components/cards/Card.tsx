"use client";

import { useRef, useCallback, useEffect } from "react";
import type { Card as CardType } from "@/lib/types";
import styles from "./card.module.css";

interface CardProps {
  card: CardType;
  isComplete: boolean;
  onClick?: () => void;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

export default function Card({ card, isComplete, onClick }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const hasHolographicEffect = card.rarity === "rare" || card.rarity === "legendary";

  // Desktop: position-relative parallax
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    el.style.setProperty("--rotateY", `${((x - cx) / cx) * 10}deg`);
    el.style.setProperty("--rotateX", `${-((y - cy) / cy) * 10}deg`);
    el.style.setProperty("--mx", `${((x / rect.width) * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${((y / rect.height) * 100).toFixed(1)}%`);
  }, []);

  const resetTilt = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rotateX", "0deg");
    el.style.setProperty("--rotateY", "0deg");
  }, []);

  // Mobile: delta-from-start drag parallax, non-passive to block page scroll
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      if (t) touchStart.current = { x: t.clientX, y: t.clientY };
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault(); // stop page scroll — requires non-passive listener
      const t = e.touches[0];
      if (!t || !touchStart.current || !cardRef.current) return;
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      // ±120px drag → ±20deg tilt
      const rotateY = clamp((dx / 120) * 20, -20, 20);
      const rotateX = clamp((-dy / 120) * 20, -20, 20);
      const mx = clamp(50 + (dx / 120) * 50, 0, 100).toFixed(1) + "%";
      const my = clamp(50 + (dy / 120) * 50, 0, 100).toFixed(1) + "%";
      cardRef.current.style.setProperty("--rotateY", `${rotateY}deg`);
      cardRef.current.style.setProperty("--rotateX", `${rotateX}deg`);
      cardRef.current.style.setProperty("--mx", mx);
      cardRef.current.style.setProperty("--my", my);
    }

    function onTouchEnd() {
      touchStart.current = null;
      if (!cardRef.current) return;
      cardRef.current.style.setProperty("--rotateX", "0deg");
      cardRef.current.style.setProperty("--rotateY", "0deg");
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

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
