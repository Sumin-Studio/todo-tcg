"use client";

import { useState, useEffect } from "react";
import type { Card as CardType } from "@/lib/types";
import Card from "@/components/cards/Card";
import CardBack from "@/components/cards/CardBack";
import styles from "./pack.module.css";

interface PackRevealProps {
  cards: CardType[];
  onComplete: () => void;
}

// fold-out: card turns edge-on (rotateY 0→90deg)
// fold-in:  card turns face-forward + grows (rotateY 90→0deg, scale 1→1.2)
// revealed: card held at 1.2x, waiting for second click
// exiting:  card slides up off screen
type AnimPhase = "idle" | "fold-out" | "fold-in" | "revealed" | "exiting";

export default function PackReveal({ cards, onComplete }: PackRevealProps) {
  const [revealed, setRevealed] = useState(0);
  const [phase, setPhase] = useState<AnimPhase>("idle");
  const [showFace, setShowFace] = useState(false);
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
    if (phase === "fold-out") {
      const t = setTimeout(() => {
        setShowFace(true);
        setPhase("fold-in");
      }, 220);
      return () => clearTimeout(t);
    }
    if (phase === "fold-in") {
      const t = setTimeout(() => {
        setPhase("revealed");
        setEffectKey((k) => k + 1);
      }, 380);
      return () => clearTimeout(t);
    }
    if (phase === "exiting") {
      const t = setTimeout(() => {
        const next = revealed + 1;
        setShowFace(false);
        if (next >= cards.length) {
          onComplete();
        } else {
          setRevealed(next);
          setPhase("idle");
        }
      }, 450);
      return () => clearTimeout(t);
    }
  }, [phase, revealed, cards.length, onComplete]);

  function handleClick() {
    if (phase === "idle") setPhase("fold-out");
    else if (phase === "revealed") setPhase("exiting");
  }

  const currentCard = cards[revealed];
  const remaining = cards.length - revealed;

  const innerClass =
    phase === "fold-out" ? styles.turnOut :
    phase === "fold-in"  ? styles.turnInGrow :
    (phase === "revealed" || phase === "exiting") ? styles.scaleUp : "";

  const rarity = currentCard.rarity;
  const showEffect = phase === "revealed" && (rarity === "rare" || rarity === "legendary");

  return (
    <div className="relative flex h-screen items-center justify-center">

      {/* Full-screen rarity effect */}
      {showEffect && (
        <div key={effectKey} className={rarity === "legendary" ? styles.effectLegendary : styles.effectRare} aria-hidden="true">
          <div className={styles.effectRays} />
          <div className={styles.effectFlash} />
        </div>
      )}

        <div
          className="relative"
          style={{ width: "var(--card-width)", height: "var(--card-height)" }}
        >
          {/* Always rendered — opacity fades when no longer needed */}
          <div className={styles.stackCard2} style={{ opacity: remaining > 2 ? 1 : 0 }} aria-hidden="true">
            <CardBack />
          </div>
          <div className={styles.stackCard1} style={{ opacity: remaining > 1 ? 1 : 0 }} aria-hidden="true">
            <CardBack />
          </div>

          <div
            key={revealed}
            className={[
              styles.stackCardTop,
              revealed > 0 ? styles.stackPromote : "",
              phase === "exiting" ? styles.stackExiting : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleClick();
            }}
            aria-label={
              phase === "idle" ? "Tap to reveal card" :
              phase === "revealed" ? "Tap to dismiss" :
              currentCard.taskName
            }
          >
            {/* perspective wrapper — isolated, no preserve-3d, won't bleed onto siblings */}
            <div className={styles.cardTurnPerspective}>
              <div className={innerClass}>
                {showFace
                  ? <Card card={currentCard} isComplete={false} />
                  : <CardBack />}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
