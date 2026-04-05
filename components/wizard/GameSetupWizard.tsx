"use client";

import { useMemo, useState } from "react";
import Card from "@/components/cards/Card";
import { getFlavorText } from "@/lib/flavor-text";
import type { PackSettings, Rarity } from "@/lib/types";
import { DEFAULT_PACK_SETTINGS } from "@/lib/constants";
import PlayerLinkList from "./PlayerLinkList";
import Button from "@/components/ui/Button";

interface Task {
  name: string;
  rarity: "common" | "rare" | "legendary";
}

interface GeneratedGame {
  gameId: string;
  gmToken: string;
  playerLinks: { playerId: string; name: string; url: string }[];
}

interface InitialWizardState {
  title?: string;
  description?: string;
  tasks?: Task[];
  settings?: PackSettings;
}

interface GameSetupWizardProps {
  initialState?: InitialWizardState;
}

const RARITIES: Rarity[] = ["common", "rare", "legendary"];

export default function GameSetupWizard({
  initialState,
}: GameSetupWizardProps) {
  const initialTasks = initialState?.tasks ?? [];
  const initialTitle = initialState?.title ?? "TODO Deck";
  const initialSettings = initialState?.settings ?? DEFAULT_PACK_SETTINGS;

  const [title] = useState(initialTitle);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [taskName, setTaskName] = useState("");
  const [settings, setSettings] = useState<PackSettings>(initialSettings);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [result, setResult] = useState<GeneratedGame | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const previewCards = useMemo(
    () =>
      tasks.map((task, index) => ({
        id: `preview-card-${index}`,
        taskName: task.name,
        rarity: task.rarity,
        artUrl: "",
        flavorText: getFlavorText(`preview-card-${index}`, task.rarity),
      })),
    [tasks]
  );

  function updateSettings(patch: Partial<PackSettings>) {
    setSettings((current) => ({ ...current, ...patch }));
  }

  function canGenerate() {
    const { common, rare, legendary } = settings.rarityDistribution;
    return (
      tasks.length > 0 &&
      common + rare + legendary === settings.cardsPerPack &&
      settings.playerCount > 0
    );
  }

  function addTask() {
    const trimmed = taskName.trim();
    if (!trimmed) {
      setGenError("Add at least one task name before creating a card.");
      return;
    }

    setTasks((current) => [...current, { name: trimmed, rarity: "common" }]);
    setTaskName("");
    setGenError("");
  }

  function removeTask(index: number) {
    setTasks((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setActiveCardIndex((current) => (current === index ? null : current));
  }

  function updateTaskRarity(index: number, rarity: Rarity) {
    setTasks((current) =>
      current.map((task, currentIndex) =>
        currentIndex === index ? { ...task, rarity } : task
      )
    );
  }

  async function generate() {
    if (!canGenerate()) {
      setGenError("Check the pack settings and make sure you have at least one card.");
      return;
    }

    setGenerating(true);
    setGenError("");

    try {
      const res = await fetch("/api/generate-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: "",
          tasks,
          settings,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setGenError(json.error ?? "Something went wrong");
        return;
      }

      setResult(json);
    } catch {
      setGenError("Network error — please try again");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
      <aside className="app-panel min-h-[760px] p-5">
        <div className="flex h-full flex-col gap-6">
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="app-label">How many players</span>
              <input
                type="number"
                min={1}
                max={20}
                value={settings.playerCount}
                onChange={(e) =>
                  updateSettings({ playerCount: Math.max(1, Number(e.target.value) || 1) })
                }
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
                onChange={(e) =>
                  updateSettings({ cardsPerPack: Math.max(1, Number(e.target.value) || 1) })
                }
                className="app-input"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="app-label">Create a card</span>
              <input
                type="text"
                value={taskName}
                onChange={(e) => {
                  setTaskName(e.target.value);
                  setGenError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTask();
                  }
                }}
                placeholder="clean the kitchen"
                className="app-input !text-left"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={addTask} className="min-w-0 flex-1 px-5 text-sm">
              + Create
            </Button>
            <Button
              onClick={generate}
              disabled={generating || !canGenerate()}
              className="min-w-0 flex-1 px-5 text-sm"
            >
              {generating ? "Creating..." : "Play →"}
            </Button>
          </div>

          {genError && (
            <div className="rounded-[18px] border border-[rgba(155,77,77,0.22)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
              {genError}
            </div>
          )}

          {result && (
            <PlayerLinkList
              links={result.playerLinks.map((link) => ({
                ...link,
                url: `${origin}/play/${result.gameId}/${link.playerId}`,
              }))}
              gmUrl={`${origin}/gm/${result.gameId}?token=${result.gmToken}`}
            />
          )}
        </div>
      </aside>

      <section className="min-h-[760px] overflow-hidden rounded-[25px] px-1 py-1">
        <div className="app-scroll h-full overflow-y-auto">
          <div className="flex min-h-full flex-wrap content-start gap-x-10 gap-y-12 px-2 py-3 sm:px-3 sm:py-4 xl:px-4 xl:py-5">
          {previewCards.map((card, index) => (
            <div
              key={card.id}
              className={`group relative origin-top-left ${index % 2 === 0 ? "scale-[0.94] rotate-[-0.75deg]" : "scale-[0.94] rotate-[0.8deg]"}`}
              onMouseEnter={() => setActiveCardIndex(index)}
              onMouseLeave={() =>
                setActiveCardIndex((current) => (current === index ? null : current))
              }
            >
              <button
                type="button"
                className="block rounded-[18px]"
                onClick={() =>
                  setActiveCardIndex((current) => (current === index ? null : index))
                }
              >
                <Card card={card} isComplete={false} />
              </button>

              <div
                className={`pointer-events-none absolute inset-x-0 top-3 flex justify-end px-3 transition-opacity ${
                  activeCardIndex === index ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <button
                  type="button"
                  className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-white/92 text-lg leading-none text-[rgba(32,32,32,0.78)] shadow-[0_6px_10px_rgba(0,0,0,0.08)]"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeTask(index);
                  }}
                  aria-label={`Delete ${card.taskName}`}
                >
                  ×
                </button>
              </div>

              <div
                className={`pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-3 transition-opacity ${
                  activeCardIndex === index ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <div className="pointer-events-auto flex gap-1 rounded-full border border-[var(--border)] bg-white/92 p-1 shadow-[0_8px_16px_rgba(0,0,0,0.08)]">
                  {RARITIES.map((rarity) => {
                    const selected = tasks[index]?.rarity === rarity;
                    return (
                      <button
                        key={rarity}
                        type="button"
                        className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.12em] transition-colors ${
                          selected
                            ? "bg-[rgba(32,32,32,0.1)] text-[rgba(32,32,32,0.86)]"
                            : "text-[rgba(32,32,32,0.48)]"
                        }`}
                        onClick={(event) => {
                          event.stopPropagation();
                          updateTaskRarity(index, rarity);
                        }}
                      >
                        {rarity}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
            {previewCards.length === 0 && (
              <div className="flex min-h-[620px] w-full items-start justify-start">
                <div className="h-full w-full" />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
