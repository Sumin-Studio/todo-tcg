"use client";

import type { Game } from "@/lib/types";
import { useGMDashboard } from "@/hooks/useGMDashboard";
import PlayerRow from "./PlayerRow";
import ProgressBar from "@/components/ui/ProgressBar";

interface GMDashboardProps {
  game: Game;
}

export default function GMDashboard({ game }: GMDashboardProps) {
  const { completions, loading } = useGMDashboard({ gameId: game.id });

  const totalCards = game.players.reduce((sum, p) => sum + p.cards.length, 0);
  const completedCount = completions.length;
  const overallProgress = totalCards > 0 ? (completedCount / totalCards) * 100 : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-[24px] border border-[var(--border)] bg-white/55 p-5">
        <h2 className="app-kicker">Overall Progress</h2>
        <ProgressBar
          value={overallProgress}
          label={`${completedCount} / ${totalCards} cards completed`}
          className="mt-4"
        />
        {loading && (
          <p className="mt-3 text-xs text-[rgba(32,32,32,0.54)]">
            Connecting to live updates...
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="app-kicker">Players ({game.players.length})</h2>
        {game.players.map((player) => (
          <PlayerRow key={player.id} player={player} completions={completions} />
        ))}
      </div>
    </div>
  );
}
