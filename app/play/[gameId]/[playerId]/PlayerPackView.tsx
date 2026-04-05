"use client";

import { useState } from "react";
import type { Card } from "@/lib/types";
import BoosterPack from "@/components/pack/BoosterPack";
import PackReveal from "@/components/pack/PackReveal";
import CardGrid from "@/components/cards/CardGrid";
import ProgressBar from "@/components/ui/ProgressBar";
import { useCompletions } from "@/hooks/useCompletions";

type Phase = "pack" | "reveal" | "deck";

interface PlayerPackViewProps {
  gameId: string;
  playerId: string;
  gameTitle: string;
  cards: Card[];
}

export default function PlayerPackView({
  gameId,
  playerId,
  gameTitle,
  cards,
}: PlayerPackViewProps) {
  const [phase, setPhase] = useState<Phase>("pack");
  const { completedIds, markComplete, loading } = useCompletions({ gameId, playerId });

  const completedCount = cards.filter((c) => completedIds.has(c.id)).length;
  const progress = cards.length > 0 ? (completedCount / cards.length) * 100 : 0;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col gap-6">
      <header className="app-panel p-5 sm:p-6">
        <p className="app-kicker">Player View</p>
        <h1 className="app-title mt-2 text-4xl leading-[0.84] tracking-[-0.07em]">
          {gameTitle}
        </h1>
        <p className="mt-3 text-sm text-[rgba(32,32,32,0.62)]">
          {phase === "deck"
            ? "Tap a card to mark it complete."
            : "Open your pack, reveal each card, then work through the deck."}
        </p>
      </header>

      {phase === "pack" && (
        <div className="app-panel flex flex-1 items-center justify-center p-8">
          <BoosterPack gameTitle={gameTitle} onOpen={() => setPhase("reveal")} />
        </div>
      )}

      {phase === "reveal" && <PackReveal cards={cards} onComplete={() => setPhase("deck")} />}

      {phase === "deck" && (
        <div className="app-panel flex flex-col gap-6 p-5 sm:p-6">
          <ProgressBar
            value={progress}
            label={`${completedCount} / ${cards.length} complete`}
          />
          {loading ? (
            <p className="text-sm text-[rgba(32,32,32,0.54)]">Loading...</p>
          ) : (
            <CardGrid
              cards={cards}
              completedIds={completedIds}
              onMarkComplete={markComplete}
            />
          )}
        </div>
      )}
    </div>
  );
}
