import type { Player, Completion } from "@/lib/types";
import MiniCard from "./MiniCard";
import ProgressBar from "@/components/ui/ProgressBar";

interface PlayerRowProps {
  player: Player;
  completions: Completion[];
}

export default function PlayerRow({ player, completions }: PlayerRowProps) {
  const completedIds = new Set(
    completions.filter((c) => c.playerId === player.id).map((c) => c.cardId)
  );

  const completedCount = player.cards.filter((c) => completedIds.has(c.id)).length;
  const progress =
    player.cards.length > 0 ? (completedCount / player.cards.length) * 100 : 0;

  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-white/55 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-base">{player.name}</span>
        <span className="text-xs text-[rgba(32,32,32,0.54)]">
          {completedCount}/{player.cards.length} done
        </span>
      </div>

      <ProgressBar value={progress} className="mt-4" />

      <div className="mt-4 flex flex-wrap gap-2">
        {player.cards.map((card) => (
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
