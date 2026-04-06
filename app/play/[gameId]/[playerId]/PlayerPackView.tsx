"use client";

import { useState } from "react";
import type { Card } from "@/lib/types";
import BoosterPack from "@/components/pack/BoosterPack";
import PackReveal from "@/components/pack/PackReveal";
import CardGrid from "@/components/cards/CardGrid";
import ProgressBar from "@/components/ui/ProgressBar";
import { useCompletions } from "@/hooks/useCompletions";

type Phase = "pack" | "loading" | "reveal" | "deck";

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
  const { completedIds, markComplete, loading, lastError } = useCompletions({ gameId, playerId });

  const completedCount = cards.filter((c) => completedIds.has(c.id)).length;
  const progress = cards.length > 0 ? (completedCount / cards.length) * 100 : 0;

  function handlePackOpen() {
    const urls = cards.map((c) => c.artUrl).filter(Boolean);
    if (urls.length === 0) { setPhase("reveal"); return; }
    setPhase("loading");
    let remaining = urls.length;
    urls.forEach((url) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        remaining--;
        if (remaining === 0) setPhase("reveal");
      };
      img.src = url;
    });
  }

  if (phase === "reveal") {
    return <PackReveal cards={cards} onComplete={() => setPhase("deck")} />;
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      {(phase === "pack" || phase === "loading") && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div style={{ transform: "scale(1.5)", transformOrigin: "center" }}>
            <BoosterPack gameTitle={gameTitle} onOpen={handlePackOpen} />
          </div>
          {phase === "loading" && (
            <p className="text-sm text-[rgba(32,32,32,0.45)] mt-8">Loading cards...</p>
          )}
        </div>
      )}

      {phase === "deck" && (
        <div className="app-panel flex flex-col gap-6 p-5 sm:p-6">
          <ProgressBar
            value={progress}
            label={`${completedCount} / ${cards.length} complete`}
          />
          {lastError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 font-mono break-all">
              Error: {lastError}
            </p>
          )}
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
