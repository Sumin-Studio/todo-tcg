import type { Rarity } from "@/lib/types";

interface MiniCardProps {
  taskName: string;
  rarity: Rarity;
  isComplete: boolean;
}

const RARITY_COLORS: Record<Rarity, string> = {
  common: "rgba(255,255,255,0.25)",
  rare: "rgba(255,255,255,0.35)",
  legendary: "rgba(255,158,22,0.26)",
};

export default function MiniCard({
  taskName,
  rarity,
  isComplete,
}: MiniCardProps) {
  return (
    <div
      title={taskName}
      className={`inline-flex max-w-[160px] items-center gap-2 overflow-hidden whitespace-nowrap rounded-full border px-3 py-1.5 text-xs ${
        isComplete
          ? "border-[rgba(85,137,100,0.28)] bg-[var(--success-soft)] text-[var(--success)] line-through"
          : "border-[var(--border)] text-[rgba(32,32,32,0.74)]"
      }`}
      style={{ backgroundColor: isComplete ? undefined : RARITY_COLORS[rarity] }}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: rarity === "legendary" ? "#ff9e16" : "#8b8b8b" }}
      />
      <span className="truncate">{taskName}</span>
    </div>
  );
}
