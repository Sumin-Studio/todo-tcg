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
    <div className="flex min-h-screen flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      {phase === "pack" && (
        <div className="flex flex-1 items-center justify-center">
          <div style={{ transform: "scale(1.5)", transformOrigin: "center" }}>
            <BoosterPack gameTitle={gameTitle} onOpen={() => setPhase("reveal")} />
          </div>
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
