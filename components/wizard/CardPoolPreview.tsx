import type { PackSettings } from "@/lib/types";

interface Task {
  name: string;
  rarity: "common" | "rare" | "legendary";
}

interface CardPoolPreviewProps {
  tasks: Task[];
  settings: PackSettings;
}

const CARD_TONES = {
  common: "bg-[rgba(255,255,255,0.25)]",
  rare: "bg-[rgba(255,255,255,0.35)]",
  legendary: "bg-[rgba(255,158,22,0.18)]",
};

export default function CardPoolPreview({
  tasks,
  settings,
}: CardPoolPreviewProps) {
  const counts = {
    common: tasks.filter((t) => t.rarity === "common").length,
    rare: tasks.filter((t) => t.rarity === "rare").length,
    legendary: tasks.filter((t) => t.rarity === "legendary").length,
  };

  const totalCards = settings.cardsPerPack * settings.playerCount;
  const needed = {
    common: settings.rarityDistribution.common * settings.playerCount,
    rare: settings.rarityDistribution.rare * settings.playerCount,
    legendary: settings.rarityDistribution.legendary * settings.playerCount,
  };

  const issues: string[] = [];
  if (!settings.allowDuplicates) {
    (["common", "rare", "legendary"] as const).forEach((r) => {
      if (counts[r] < needed[r]) {
        issues.push(`Need ${needed[r]} ${r} cards, have ${counts[r]}`);
      }
    });
  }

  const { common: dc, rare: dr, legendary: dl } = settings.rarityDistribution;
  if (dc + dr + dl !== settings.cardsPerPack) {
    issues.push(
      `Rarity distribution (${dc + dr + dl}) does not match cards per pack (${settings.cardsPerPack})`
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
      <div className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-3">
          {(["common", "rare", "legendary"] as const).map((r) => (
            <div
              key={r}
              className={`rounded-[22px] border border-[var(--border)] p-5 ${CARD_TONES[r]}`}
            >
              <p className="text-4xl leading-none">{counts[r]}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[rgba(32,32,32,0.52)]">
                {r}
              </p>
              {!settings.allowDuplicates && (
                <p className="mt-3 text-sm text-[rgba(32,32,32,0.62)]">
                  need {needed[r]}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[22px] border border-[var(--border)] bg-white/48 p-5">
            <p className="app-kicker">Total Packs</p>
            <p className="mt-3 text-4xl leading-none">{settings.playerCount}</p>
          </div>
          <div className="rounded-[22px] border border-[var(--border)] bg-white/48 p-5">
            <p className="app-kicker">Cards Dealt</p>
            <p className="mt-3 text-4xl leading-none">{totalCards}</p>
          </div>
        </div>

        <div className="rounded-[22px] border border-[var(--border)] bg-white/48 p-5">
          <p className="app-kicker">Task List</p>
          <ul className="app-scroll mt-4 flex max-h-[240px] flex-col gap-2 overflow-y-auto pr-1">
            {tasks.map((task, i) => (
              <li
                key={`${task.name}-${i}`}
                className="flex items-center justify-between rounded-[18px] border border-[var(--border)] bg-white/65 px-4 py-3 text-sm"
              >
                <span className="truncate">{task.name}</span>
                <span className="ml-3 shrink-0 text-xs uppercase tracking-[0.12em] text-[rgba(32,32,32,0.52)]">
                  {task.rarity}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <aside className="rounded-[22px] border border-[var(--border)] bg-white/48 p-4">
        <p className="app-kicker">Status</p>
        {issues.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3">
            {issues.map((issue, i) => (
              <div
                key={i}
                className="rounded-[18px] border border-[rgba(155,77,77,0.22)] bg-[var(--danger-soft)] px-4 py-3 text-sm leading-[1.45] text-[var(--danger)]"
              >
                {issue}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-[18px] border border-[rgba(85,137,100,0.2)] bg-[var(--success-soft)] px-4 py-4 text-sm leading-[1.45] text-[var(--success)]">
            Configuration is valid and ready to generate.
          </div>
        )}
      </aside>
    </div>
  );
}
