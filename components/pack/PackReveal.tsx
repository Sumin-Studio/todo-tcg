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

type AnimPhase = "idle" | "flipping" | "exiting";

export default function PackReveal({ cards, onComplete }: PackRevealProps) {
  const [revealed, setRevealed] = useState(0);
  const [phase, setPhase] = useState<AnimPhase>("idle");

  useEffect(() => {
    if (phase === "flipping") {
      // After flip completes, start exit
      const t = setTimeout(() => setPhase("exiting"), 600);
      return () => clearTimeout(t);
    }
    if (phase === "exiting") {
      const t = setTimeout(() => {
        const next = revealed + 1;
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
    if (phase !== "idle") return;
    setPhase("flipping");
  }

  const currentCard = cards[revealed];
  const remaining = cards.length - revealed;
  const isFlipped = phase === "flipping" || phase === "exiting";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className="relative"
        style={{ width: "var(--card-width)", height: "var(--card-height)" }}
      >
        {/* Bottom of stack */}
        {remaining > 2 && (
          <div className={styles.stackCard2} aria-hidden="true">
            <CardBack />
          </div>
        )}

        {/* Middle of stack */}
        {remaining > 1 && (
          <div className={styles.stackCard1} aria-hidden="true">
            <CardBack />
          </div>
        )}

        {/* Top card — interactive */}
        <div
          className={[
            styles.stackCardTop,
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
          aria-label={isFlipped ? currentCard.taskName : "Tap to reveal card"}
        >
          <div className={styles.flipScene}>
            <div
              className={`${styles.flipCard} ${isFlipped ? styles.flipped : ""}`}
            >
              <div className={styles.flipFront}>
                <CardBack />
              </div>
              <div className={styles.flipBack}>
                <Card card={currentCard} isComplete={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
