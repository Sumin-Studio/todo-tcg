"use client";

import type { PackSettings as PackSettingsType } from "@/lib/types";

interface PackSettingsProps {
  settings: PackSettingsType;
  onChange: (settings: PackSettingsType) => void;
  error?: string;
}

export default function PackSettings({
  settings,
  onChange,
  error,
}: PackSettingsProps) {
  const { common, rare, legendary } = settings.rarityDistribution;
  const distributionSum = common + rare + legendary;
  const distributionValid = distributionSum === settings.cardsPerPack;

  function update(patch: Partial<PackSettingsType>) {
    onChange({ ...settings, ...patch });
  }

  function updateDist(key: "common" | "rare" | "legendary", value: number) {
    onChange({
      ...settings,
      rarityDistribution: { ...settings.rarityDistribution, [key]: value },
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="app-label">Players</span>
            <input
              type="number"
              min={1}
              max={20}
              value={settings.playerCount}
              onChange={(e) => update({ playerCount: Number(e.target.value) })}
              className="app-input"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="app-label">Cards per pack</span>
            <input
              type="number"
              min={1}
              max={20}
              value={settings.cardsPerPack}
              onChange={(e) => update({ cardsPerPack: Number(e.target.value) })}
              className="app-input"
            />
          </label>
        </div>

        <div className="rounded-[22px] border border-[var(--border)] bg-white/48 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="app-label">Rarity distribution</span>
            <span
              className={`text-sm ${
                distributionValid
                  ? "text-[var(--success)]"
                  : "text-[var(--danger)]"
              }`}
            >
              {distributionSum} / {settings.cardsPerPack} cards
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {(["common", "rare", "legendary"] as const).map((r) => (
              <label key={r} className="flex flex-col gap-2">
                <span className="app-label capitalize">{r}</span>
                <input
                  type="number"
                  min={0}
                  max={settings.cardsPerPack}
                  value={settings.rarityDistribution[r]}
                  onChange={(e) => updateDist(r, Number(e.target.value))}
                  className="app-input"
                />
              </label>
            ))}
          </div>
        </div>

        <label className="rounded-[22px] border border-[var(--border)] bg-white/48 p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={settings.allowDuplicates}
              onChange={(e) => update({ allowDuplicates: e.target.checked })}
              className="app-checkbox mt-1"
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm">Allow duplicate cards</span>
              <span className="text-xs leading-[1.45] text-[rgba(32,32,32,0.58)]">
                Toggle this on if multiple players can receive the same task
                card.
              </span>
            </div>
          </div>
        </label>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      </div>

      <aside className="rounded-[22px] border border-[var(--border)] bg-white/48 p-4">
        <p className="app-kicker">Distribution Notes</p>
        <div className="mt-4 space-y-3 text-sm leading-[1.5] text-[rgba(32,32,32,0.62)]">
          <p>Common cards do the bulk work and should anchor every pack.</p>
          <p>Rare cards add chase value without dominating the task list.</p>
          <p>Legendary cards are best reserved for the dramatic, high-effort jobs.</p>
        </div>
      </aside>
    </div>
  );
}
