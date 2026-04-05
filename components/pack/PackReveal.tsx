"use client";

import { useState } from "react";
import type { Card as CardType } from "@/lib/types";
import Card from "@/components/cards/Card";
import CardBack from "@/components/cards/CardBack";
import Button from "@/components/ui/Button";
import styles from "./pack.module.css";

interface PackRevealProps {
  cards: CardType[];
  onComplete: () => void;
}

export default function PackReveal({ cards, onComplete }: PackRevealProps) {
  const [flippedIndexes, setFlippedIndexes] = useState<Set<number>>(new Set());
  const [showBurst, setShowBurst] = useState<number | null>(null);

  const allFlipped = flippedIndexes.size === cards.length;

  function flipCard(index: number) {
    if (flippedIndexes.has(index)) return;
    setFlippedIndexes((prev) => new Set([...prev, index]));
    setShowBurst(index);
    setTimeout(() => setShowBurst(null), 600);
  }

  return (
    <div className="flex flex-col items-center gap-8 rounded-[28px] border border-[var(--border)] bg-white/45 px-4 py-6 sm:px-6">
      <p className="text-center text-sm text-[rgba(32,32,32,0.62)]">
        {allFlipped
          ? "All cards revealed."
          : `Tap cards to reveal (${flippedIndexes.size}/${cards.length})`}
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        {cards.map((card, i) => {
          const isFlipped = flippedIndexes.has(i);
          return (
            <div key={card.id} className={styles.burstContainer}>
              <div
                className={styles.flipScene}
                onClick={() => flipCard(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") flipCard(i);
                }}
                role="button"
                tabIndex={0}
                aria-label={isFlipped ? card.taskName : "Hidden card — tap to reveal"}
              >
                <div className={`${styles.flipCard} ${isFlipped ? styles.flipped : ""}`}>
                  <div className={styles.flipFront}>
                    <CardBack />
                  </div>
                  <div className={styles.flipBack}>
                    <Card card={card} isComplete={false} />
                  </div>
                </div>
              </div>
              {showBurst === i && <div className={styles.burst} aria-hidden="true" />}
            </div>
          );
        })}
      </div>

      {allFlipped && <Button onClick={onComplete}>View My Deck →</Button>}
    </div>
  );
}
