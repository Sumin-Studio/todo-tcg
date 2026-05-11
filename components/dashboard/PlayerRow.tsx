import type { Player, Completion } from "@/lib/types";
import MiniCard from "./MiniCard";
import ProgressBar from "@/components/ui/ProgressBar";

interface PlayerRowProps {
  player: Player;
  completions: Completion[];
}

export default function PlayerRow({ player, completions }: PlayerRowProps) {
  // Flatten all cards across all days for this player
  const allCards = Object.values(player.packsByDay).flat();

  const completedIds = new Set(
    completions.filter((c) => c.playerId === player.id).map((c) => c.cardId)
  );

  const completedCount = allCards.filter((c) => completedIds.has(c.id)).length;
  const progress = allCards.length > 0 ? (completedCount / allCards.length) * 100 : 0;

  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-white/55 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-base">{player.name}</span>
        <span className="text-xs text-[rgba(32,32,32,0.54)]">
          {completedCount}/{allCards.length} done
        </span>
      </div>

      <ProgressBar value={progress} className="mt-4" />

      <div className="mt-4 flex flex-wrap gap-2">
        {allCards.map((card) => (
          <MiniCard
            key={card.id}
            taskName={card.taskName}
            rarity={card.rarity}
            isComplete={completedIds.has(card.id)}
          />
        ))}
      </div>
    </div>
  );
}
