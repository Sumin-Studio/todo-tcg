"use client";

import { useState } from "react";
import type { Card } from "@/lib/types";
import SplinePack from "@/components/pack/SplinePack";
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
    const frameUrls = [...new Set(cards.map((c) => `/frames/${c.rarity}.png`))];
    const artUrls = cards.map((c) => c.artUrl).filter(Boolean);
    const urls = ["/card-back.png", ...frameUrls, ...artUrls];
    setPhase("loading");
    let remaining = urls.length;
    const onDone = () => { if (--remaining === 0) setPhase("reveal"); };
    urls.forEach((url) => {
      const img = new Image();
      img.onload = img.onerror = onDone;
      img.src = url;
    });
  }

  if (phase === "reveal") {
    const rarityOrder = { common: 0, rare: 1, legendary: 2 };
    const sortedCards = [...cards].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
    return <PackReveal cards={sortedCards} onComplete={() => setPhase("deck")} />;
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      {(phase === "pack" || phase === "loading") && (
        <>
          <SplinePack onOpen={handlePackOpen} />
          {phase === "loading" && (
            <p
              className="text-sm text-[rgba(32,32,32,0.45)]"
              style={{
                position: "fixed",
                bottom: "2rem",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 30,
              }}
            >
              Loading cards...
            </p>
          )}
        </>
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
