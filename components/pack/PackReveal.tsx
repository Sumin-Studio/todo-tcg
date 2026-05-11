"use client";

import { useState, useEffect } from "react";
import type { Card as CardType } from "@/lib/types";
import Card from "@/components/cards/Card";
import styles from "./pack.module.css";

interface PackRevealProps {
  cards: CardType[];
  onComplete: () => void;
}

type CardPhase = "back" | "front" | "exiting";

const EXIT_MS = 450;
const FLIP_MS = 600;

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

function CardBackImg({ style }: { style?: React.CSSProperties }) {
  return (
    <img
      src="/card-back.png"
      alt=""
      aria-hidden="true"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "var(--card-radius)",
        ...style,
      }}
    />
  );
}

export default function PackReveal({ cards, onComplete }: PackRevealProps) {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<CardPhase>("back");
  // Rarity effect plays once flip is complete, not at flip start
  const [effectArmed, setEffectArmed] = useState(false);

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

  // Trigger rarity effect after flip finishes
  useEffect(() => {
    if (phase !== "front") {
      setEffectArmed(false);
      return;
    }
    const t = setTimeout(() => setEffectArmed(true), FLIP_MS);
    return () => clearTimeout(t);
  }, [phase, current]);

  // After exit animation, advance to next card or complete
  useEffect(() => {
    if (phase !== "exiting") return;
    const t = setTimeout(() => {
      const next = current + 1;
      if (next >= cards.length) {
        onComplete();
      } else {
        setCurrent(next);
        setPhase("back");
      }
    }, EXIT_MS);
    return () => clearTimeout(t);
  }, [phase, current, cards.length, onComplete]);

  function handleClick() {
    if (phase === "back") {
      setPhase("front");
    } else if (phase === "front") {
      setPhase("exiting");
    }
  }

  const currentCard = cards[current];
  const remaining = cards.length - current;
  const rarity = currentCard.rarity;
  const showEffect = effectArmed && phase === "front" && (rarity === "rare" || rarity === "legendary");
  const isFlipped = phase === "front" || phase === "exiting";

  return (
    <div className="relative flex h-screen items-center justify-center">
      {/* Full-screen rarity effect — fires after flip completes */}
      {showEffect && (
        <div key={current} className={rarity === "legendary" ? styles.effectLegendary : styles.effectRare} aria-hidden="true">
          <div className={styles.effectRays} />
          <div className={styles.effectShockwave} />
          <div className={styles.effectShockwave2} />
          <div className={styles.effectFlash} />
          <div className={styles.effectGlow} />
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <div
          className={styles.flipScene}
          style={{ width: "var(--card-width)", height: "var(--card-height)", position: "relative" }}
        >
          {/* Stack — face-down card-backs behind the top card */}
          <div className={styles.stackCard2} style={{ opacity: remaining > 2 ? 0.45 : 0 }} aria-hidden="true">
            <CardBackImg />
          </div>
          <div className={styles.stackCard1} style={{ opacity: remaining > 1 ? 0.68 : 0 }} aria-hidden="true">
            <CardBackImg />
          </div>

          {/* Top card — flippable + clickable */}
          <div
            key={current}
            className={[
              styles.stackCardTop,
              phase === "exiting" ? styles.stackExitFade : "",
            ].filter(Boolean).join(" ")}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleClick();
            }}
            aria-label={phase === "back" ? "Tap to flip card" : "Tap to dismiss card"}
          >
            <div className={`${styles.flipCard} ${isFlipped ? styles.flipped : ""}`}>
              {/* flipFront sits at 0deg — shown when not flipped */}
              <div className={styles.flipFront}>
                <CardBackImg />
              </div>
              {/* flipBack sits at 180deg — shown after flip */}
              <div className={styles.flipBack}>
                <Card card={currentCard} isComplete={false} />
              </div>
            </div>
          </div>
        </div>

        {/* Rarity stars only after flip */}
        {phase === "front" && <RarityStars key={current} rarity={rarity} />}
      </div>
    </div>
  );
}
