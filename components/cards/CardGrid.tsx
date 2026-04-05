"use client";

import Card from "./Card";
import type { Card as CardType } from "@/lib/types";

interface CardGridProps {
  cards: CardType[];
  completedIds: Set<string>;
  onMarkComplete?: (cardId: string) => void;
}

export default function CardGrid({
  cards,
  completedIds,
  onMarkComplete,
}: CardGridProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4 rounded-[26px] border border-[var(--border)] bg-white/38 p-4 sm:p-5">
      {cards.map((card, index) => (
        <div
          key={card.id}
          className={index % 2 === 0 ? "rotate-[-0.35deg]" : "rotate-[0.35deg]"}
        >
          <Card
            card={card}
            isComplete={completedIds.has(card.id)}
            onClick={
              onMarkComplete && !completedIds.has(card.id)
                ? () => onMarkComplete(card.id)
                : undefined
            }
          />
        </div>
      ))}
    </div>
  );
}
