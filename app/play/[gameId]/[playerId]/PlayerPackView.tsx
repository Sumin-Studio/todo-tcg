"use client";

import { useState, useEffect } from "react";
import type { Card } from "@/lib/types";
import FrameBoosterPack from "@/components/pack/FrameBoosterPack";
import PackReveal from "@/components/pack/PackReveal";
import CardGrid from "@/components/cards/CardGrid";
import ProgressBar from "@/components/ui/ProgressBar";
import { useCompletions } from "@/hooks/useCompletions";

type Phase = "pack" | "reveal" | "deck";

interface PlayerPackViewProps {
  gameId: string;
  playerId: string;
  gameTitle: string;
  dayLabel?: string;
  cards: Card[];
}

export default function PlayerPackView({
  gameId,
  playerId,
  gameTitle,
  dayLabel,
  cards,
}: PlayerPackViewProps) {
  const [phase, setPhase] = useState<Phase>("pack");
  const { completedIds, markComplete, loading, lastError } = useCompletions({ gameId, playerId });

  const completedCount = cards.filter((c) => completedIds.has(c.id)).length;
  const progress = cards.length > 0 ? (completedCount / cards.length) * 100 : 0;

  // Preload card art + frames in the background while the pack animation plays.
  // By the time the user finishes opening the pack, images are in browser cache,
  // so the reveal phase can start immediately with no "loading" gap.
  useEffect(() => {
    const frameUrls = [...new Set(cards.map((c) => `/frames/${c.rarity}.png`))];
    const artUrls = cards.map((c) => c.artUrl).filter(Boolean);
    const urls = ["/card-back.png", ...frameUrls, ...artUrls];
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [cards]);

  function handlePackOpen() {
    setPhase("reveal");
  }

  if (phase === "reveal") {
    const rarityOrder = { common: 0, rare: 1, legendary: 2 };
    const sortedCards = [...cards].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
    return <PackReveal cards={sortedCards} onComplete={() => setPhase("deck")} />;
  }

  // Rest day — no cards assigned for this day
  if (cards.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 py-8 text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="app-title text-2xl font-semibold">{gameTitle}</h1>
        {dayLabel && (
          <p className="app-kicker">{dayLabel}</p>
        )}
        <p className="mt-2 text-lg text-[rgba(32,32,32,0.62)]">
          Nothing due today — enjoy your rest day!
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      {dayLabel && phase === "pack" && (
        <div className="text-center">
          <p className="app-kicker">{dayLabel}</p>
          <h1 className="app-title mt-1 text-xl font-semibold">{gameTitle}</h1>
        </div>
      )}
      {phase === "pack" && <FrameBoosterPack onOpen={handlePackOpen} />}

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
