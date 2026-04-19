"use client";

import { useState, useEffect } from "react";
import type { Card as CardType } from "@/lib/types";
import Card from "@/components/cards/Card";
import styles from "./pack.module.css";

interface PackRevealProps {
  cards: CardType[];
  onComplete: () => void;
}

function RarityStars({ rarity }: { rarity: CardType["rarity"] }) {
  const count = rarity === "common" ? 1 : rarity === "rare" ? 2 : 3;
  const starClass =
    rarity === "legendary" ? styles.starLegendary :
    rarity === "rare"      ? styles.starRare :
                             styles.starCommon;
  return (
    <div className={styles.rarityStars} aria-label={`${rarity} rarity — ${count} star${count > 1 ? "s" : ""}`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={`${styles.star} ${starClass}`} aria-hidden="true">★</span>
      ))}
    </div>
  );
}

type AnimPhase = "idle" | "exiting";

export default function PackReveal({ cards, onComplete }: PackRevealProps) {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<AnimPhase>("idle");
  const [effectKey, setEffectKey] = useState(0);

  // Lock scroll — iOS Safari ignores overflow:hidden; position:fixed is the only reliable fix
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    if (phase === "exiting") {
      const t = setTimeout(() => {
        const next = current + 1;
        if (next >= cards.length) {
          onComplete();
        } else {
          setCurrent(next);
          setPhase("idle");
          setEffectKey((k) => k + 1);
        }
      }, 450);
      return () => clearTimeout(t);
    }
  }, [phase, current, cards.length, onComplete]);

  function handleClick() {
    if (phase === "idle") setPhase("exiting");
  }

  const currentCard = cards[current];
  const nextCard    = cards[current + 1];
  const nextNextCard = cards[current + 2];
  const remaining   = cards.length - current;

  const rarity = currentCard.rarity;
  const showEffect = phase === "idle" && (rarity === "rare" || rarity === "legendary");

  return (
    <div className="relative flex h-screen items-center justify-center">

      {/* Full-screen rarity effect */}
      {showEffect && (
        <div key={effectKey} className={rarity === "legendary" ? styles.effectLegendary : styles.effectRare} aria-hidden="true">
          <div className={styles.effectRays} />
          <div className={styles.effectFlash} />
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <div
          className="relative"
          style={{ width: "var(--card-width)", height: "var(--card-height)" }}
        >
          {/* Stack card 2 — farthest back, face-up */}
          <div className={styles.stackCard2} style={{ opacity: remaining > 2 ? 1 : 0 }} aria-hidden="true">
            {nextNextCard && <Card card={nextNextCard} isComplete={false} />}
          </div>

          {/* Stack card 1 — second from top, face-up */}
          <div className={styles.stackCard1} style={{ opacity: remaining > 1 ? 1 : 0 }} aria-hidden="true">
            {nextCard && <Card card={nextCard} isComplete={false} />}
          </div>

          {/* Top card — face-up, clickable */}
          <div
            key={current}
            className={[
              styles.stackCardTop,
              current > 0          ? styles.stackPromote  : "",
              phase === "exiting"  ? styles.stackExitRight : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleClick();
            }}
            aria-label="Tap to go to next card"
          >
            <Card card={currentCard} isComplete={false} />
          </div>
        </div>

        {/* Rarity stars — re-mounts on each card change to replay the appear animation */}
        <RarityStars key={current} rarity={rarity} />
      </div>
    </div>
  );
}
