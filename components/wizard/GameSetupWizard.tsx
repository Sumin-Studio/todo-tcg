"use client";

import { useMemo, useState } from "react";
import Card from "@/components/cards/Card";
import { getFlavorText } from "@/lib/flavor-text";
import type { PackSettings } from "@/lib/types";
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
    <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
      <aside className="app-panel p-6">
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
            <Button onClick={addTask} className="min-w-[168px] flex-1">
              + Create
            </Button>
            <Button
              onClick={generate}
              disabled={generating || !canGenerate()}
              className="min-w-[168px] flex-1"
            >
              {generating ? "Creating..." : "Play →"}
            </Button>
          </div>

          {genError && (
            <div className="rounded-[18px] border border-[rgba(155,77,77,0.22)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
              {genError}
            </div>
          )}

          <div className="rounded-[22px] border border-[var(--border)] bg-white/45 p-4">
            <p className="app-kicker">Cards</p>
            <ul className="app-scroll mt-3 flex max-h-[280px] flex-col gap-2 overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <li className="rounded-[18px] border border-dashed border-[var(--border)] px-4 py-6 text-center text-sm text-[rgba(32,32,32,0.56)]">
                  No cards yet.
                </li>
              ) : (
                tasks.map((task, index) => (
                  <li
                    key={`${task.name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-[18px] border border-[var(--border)] bg-white/60 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm">{task.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[rgba(32,32,32,0.52)]">
                        common
                      </p>
                    </div>
                    <button
                      onClick={() => removeTask(index)}
                      className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[rgba(32,32,32,0.64)] transition-colors hover:bg-white"
                    >
                      Remove
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

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

      <section className="app-panel min-h-[720px] p-6">
        <div className="app-scroll flex h-full flex-wrap content-start gap-x-8 gap-y-10 overflow-y-auto">
          {previewCards.map((card, index) => (
            <div
              key={card.id}
              className={index % 2 === 0 ? "scale-[0.92] rotate-[-1.1deg]" : "scale-[0.92] rotate-[1deg]"}
            >
              <Card card={card} isComplete={false} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
