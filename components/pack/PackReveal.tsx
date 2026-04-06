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

type AnimPhase = "idle" | "fold-out" | "fold-in" | "exiting";

export default function PackReveal({ cards, onComplete }: PackRevealProps) {
  const [revealed, setRevealed] = useState(0);
  const [phase, setPhase] = useState<AnimPhase>("idle");
  const [showFace, setShowFace] = useState(false);

  useEffect(() => {
    if (phase === "fold-out") {
      // Fold card closed, then swap to face and fold open
      const t = setTimeout(() => {
        setShowFace(true);
        setPhase("fold-in");
      }, 200);
      return () => clearTimeout(t);
    }
    if (phase === "fold-in") {
      // Fold open, then hold briefly, then exit
      const t = setTimeout(() => setPhase("exiting"), 500);
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
    if (phase !== "idle") return;
    setPhase("fold-out");
  }

  const currentCard = cards[revealed];
  const remaining = cards.length - revealed;

  const flipClass =
    phase === "fold-out" ? styles.foldOut :
    phase === "fold-in"  ? styles.foldIn  : "";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className="relative"
        style={{ width: "var(--card-width)", height: "var(--card-height)" }}
      >
        {remaining > 2 && (
          <div className={styles.stackCard2} aria-hidden="true">
            <CardBack />
          </div>
        )}
        {remaining > 1 && (
          <div className={styles.stackCard1} aria-hidden="true">
            <CardBack />
          </div>
        )}

        <div
          key={revealed}
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
          aria-label={showFace ? currentCard.taskName : "Tap to reveal card"}
        >
          <div className={flipClass}>
            {showFace
              ? <Card card={currentCard} isComplete={false} />
              : <CardBack />}
          </div>
        </div>
      </div>
    </div>
  );
}
