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

type AnimPhase = "idle" | "revealing" | "exiting";

export default function PackReveal({ cards, onComplete }: PackRevealProps) {
  const [revealed, setRevealed] = useState(0);
  const [phase, setPhase] = useState<AnimPhase>("idle");
  const [showFace, setShowFace] = useState(false);

  useEffect(() => {
    if (phase === "revealing") {
      // Hold on the revealed face briefly, then exit
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
    setShowFace(true);
    setPhase("revealing");
  }

  const currentCard = cards[revealed];
  const remaining = cards.length - revealed;

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

        {/* Top card — fresh node per card, no 3D transforms */}
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
          {showFace ? (
            <div className={phase === "revealing" ? styles.cardAppear : ""}>
              <Card card={currentCard} isComplete={false} />
            </div>
          ) : (
            <CardBack />
          )}
        </div>
      </div>
    </div>
  );
}
