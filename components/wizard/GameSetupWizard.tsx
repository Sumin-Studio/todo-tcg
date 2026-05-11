"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import Card from "@/components/cards/Card";
import { getFlavorText } from "@/lib/flavor-text";
import type { PackSettings, Rarity, Urgency } from "@/lib/types";
import { DEFAULT_PACK_SETTINGS } from "@/lib/constants";
import PlayerStatusPanel from "./PlayerStatusPanel";
import Button from "@/components/ui/Button";
import { useGMDashboard } from "@/hooks/useGMDashboard";

interface Task {
  name: string;
  rarity: Rarity;
  urgency: Urgency;
  dueDate: string;
  customImageUrl?: string;
}

interface DayLink {
  playerId: string;
  name: string;
  dayOffset: number;
  dateLabel: string;
  cardCount: number;
}

interface GeneratedGame {
  gameId: string;
  gmToken: string;
  playerLinks: DayLink[];
  durationDays: number;
  startDate: string;
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

const PREVIEW_CARD_SCALE = 0.94 * 1.5 * 0.8;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(isoDate: string, n: number): string {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function GameSetupWizard({ initialState }: GameSetupWizardProps) {
  const today = todayIso();
  const initialTitle = initialState?.title ?? "TODO Deck";
  const initialSettings: PackSettings = initialState?.settings ?? {
    ...DEFAULT_PACK_SETTINGS,
    startDate: today,
  };

  const [title] = useState(initialTitle);
  const [tasks, setTasks] = useState<Task[]>(initialState?.tasks ?? []);
  const [taskName, setTaskName] = useState("");
  const [settings, setSettings] = useState<PackSettings>(initialSettings);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [result, setResult] = useState<GeneratedGame | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetIndex = useRef<number>(-1);

  // Hydrate from sessionStorage on mount (tasks passed from landing page)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("todo-tcg-tasks");
      if (stored) {
        const parsed: Task[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks(parsed);
          const earliest = parsed.map((t) => t.dueDate).sort()[0];
          if (earliest) setSettings((s) => ({ ...s, startDate: earliest }));
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist edits back to sessionStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem("todo-tcg-tasks", JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks, hydrated]);

  const { completions } = useGMDashboard({ gameId: result?.gameId ?? "" });
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const playerLinksWithUrls = useMemo(
    () =>
      result?.playerLinks.map((link) => ({
        ...link,
        url: `${origin}/play/${result.gameId}/${link.playerId}/${link.dayOffset}`,
      })) ?? [],
    [result, origin]
  );

  const lastDay = useMemo(
    () => addDays(settings.startDate, settings.durationDays - 1),
    [settings.startDate, settings.durationDays]
  );

  const previewCards = useMemo(
    () =>
      tasks.map((task, index) => ({
        id: `preview-card-${index}`,
        taskName: task.name || "Untitled task",
        rarity: task.rarity,
        urgency: task.urgency,
        dueDate: task.dueDate,
        artUrl: task.customImageUrl ?? "",
        flavorText: getFlavorText(`preview-card-${index}`, task.rarity),
      })),
    [tasks]
  );

  const completedCardIndices = useMemo(() => {
    if (!result) return new Set<number>();
    return new Set(
      completions
        .map((c) => {
          const parts = c.cardId.split("-card-");
          return parts.length === 2 ? Number(parts[1]) : -1;
        })
        .filter((i) => i >= 0)
    );
  }, [completions, result]);

  function updateSettings(patch: Partial<PackSettings>) {
    setSettings((s) => ({ ...s, ...patch }));
  }

  function updateTask(index: number, patch: Partial<Task>) {
    setTasks((current) =>
      current.map((task, i) => (i === index ? { ...task, ...patch } : task))
    );
  }

  function addTask() {
    const trimmed = taskName.trim();
    if (!trimmed) {
      setGenError("Type a task name first.");
      return;
    }
    setTasks((current) => [
      ...current,
      { name: trimmed, rarity: "common", urgency: "medium", dueDate: settings.startDate },
    ]);
    setTaskName("");
    setGenError("");
  }

  function removeTask(index: number) {
    setTasks((current) => current.filter((_, i) => i !== index));
    setActiveCardIndex((current) => (current === index ? null : current));
  }

  const openUpload = useCallback((index: number) => {
    uploadTargetIndex.current = index;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const index = uploadTargetIndex.current;
      if (!file || index < 0) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setTasks((current) =>
          current.map((task, i) =>
            i === index ? { ...task, customImageUrl: dataUrl } : task
          )
        );
      };
      reader.readAsDataURL(file);
    },
    []
  );

  function canGenerate() {
    return tasks.length > 0 && settings.playerCount >= 1 && settings.durationDays >= 1;
  }

  function outOfRangeCount() {
    return tasks.filter(
      (t) => t.dueDate < settings.startDate || t.dueDate > lastDay
    ).length;
  }

  function generateHint() {
    if (tasks.length === 0) return "Add at least one card.";
    const oor = outOfRangeCount();
    if (oor > 0)
      return `${oor} task(s) fall outside the ${settings.durationDays}-day window (will be clamped).`;
    return null;
  }

  async function generate() {
    if (!canGenerate()) {
      setGenError("Add at least one task and check the settings.");
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
          tasks: tasks.map((t) => ({
            name: t.name.trim(),
            rarity: t.rarity,
            urgency: t.urgency,
            dueDate: t.dueDate,
            customImageUrl: t.customImageUrl,
          })),
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

  const hint = generateHint();

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[rgba(32,32,32,0.45)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
      {/* ── Left sidebar ── */}
      <aside className="app-panel sticky top-6 self-start p-5">
        <div className="flex flex-col gap-5">
          {result ? (
            <>
              <PlayerStatusPanel
                links={playerLinksWithUrls}
                completions={completions}
              />
              <Button onClick={() => setResult(null)} className="w-full px-5 text-sm">
                End Game
              </Button>
            </>
          ) : (
            <>
              <label className="flex flex-col gap-2">
                <span className="app-label">Players</span>
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
                <span className="app-label">Start date</span>
                <input
                  type="date"
                  value={settings.startDate}
                  onChange={(e) =>
                    updateSettings({ startDate: e.target.value || today })
                  }
                  className="app-input"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="app-label">Duration (days)</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={settings.durationDays}
                  onChange={(e) =>
                    updateSettings({ durationDays: Math.max(1, Number(e.target.value) || 1) })
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

              <div className="flex gap-3">
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

              {hint && !genError && (
                <p className="text-xs text-[rgba(32,32,32,0.45)]">{hint}</p>
              )}
              {genError && (
                <div className="rounded-[18px] border border-[rgba(155,77,77,0.22)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
                  {genError}
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── Card preview grid ── */}
      <section className="rounded-[25px] px-1 py-1">
        <div className="flex flex-wrap content-start gap-x-20 gap-y-24 pl-2 pr-0 py-3 sm:pl-3 sm:pr-0 sm:py-4 xl:pl-4 xl:pr-0 xl:py-5">
          {previewCards.map((card, index) => {
            const task = tasks[index];
            const active = activeCardIndex === index;
            return (
              <div
                key={card.id}
                className="group relative"
                style={{
                  width: `calc(var(--card-width) * ${PREVIEW_CARD_SCALE})`,
                  height: `calc(var(--card-height) * ${PREVIEW_CARD_SCALE})`,
                }}
                onMouseEnter={() => setActiveCardIndex(index)}
                onMouseLeave={() =>
                  setActiveCardIndex((current) => (current === index ? null : current))
                }
              >
                <button
                  type="button"
                  className="block h-full w-full rounded-[18px]"
                  onClick={() =>
                    setActiveCardIndex((current) => (current === index ? null : index))
                  }
                >
                  <div
                    className="origin-top-left"
                    style={{
                      transform: `scale(${PREVIEW_CARD_SCALE}) rotate(${index % 2 === 0 ? "-0.75deg" : "0.8deg"})`,
                    }}
                  >
                    <Card card={card} isComplete={completedCardIndices.has(index)} />
                  </div>
                </button>

                {!result && (
                  <>
                    {/* Top-right: upload + delete */}
                    <div
                      className={`pointer-events-none absolute inset-x-0 top-3 flex justify-end gap-1.5 px-3 transition-opacity ${
                        active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <button
                        type="button"
                        className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-white/92 text-[rgba(32,32,32,0.78)] shadow-[0_6px_10px_rgba(0,0,0,0.08)]"
                        onClick={(event) => {
                          event.stopPropagation();
                          openUpload(index);
                        }}
                        aria-label={`Upload image for ${card.taskName}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 9V2M4 5l3-3 3 3" />
                          <path d="M2 11h10" />
                        </svg>
                      </button>
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

                    {/* Top-left: due-date editor */}
                    <div
                      className={`pointer-events-none absolute top-3 left-3 transition-opacity ${
                        active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <input
                        type="date"
                        value={task.dueDate}
                        onChange={(e) =>
                          updateTask(index, { dueDate: e.target.value || settings.startDate })
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="pointer-events-auto rounded-full border border-[var(--border)] bg-white/92 px-2.5 py-1 text-[10px] font-semibold text-[rgba(32,32,32,0.78)] shadow-[0_6px_10px_rgba(0,0,0,0.08)] outline-none"
                      />
                    </div>

                    {/* Bottom: urgency + rarity picker */}
                    <div
                      className={`pointer-events-none absolute inset-x-0 -bottom-2 flex flex-col items-center gap-1.5 px-3 transition-opacity ${
                        active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {/* Urgency pills */}
                      <div className="pointer-events-auto flex gap-1 rounded-full border border-[var(--border)] bg-white/92 p-1 shadow-[0_8px_16px_rgba(0,0,0,0.08)]">
                        {(["low", "medium", "high"] as Urgency[]).map((u) => {
                          const sel = task.urgency === u;
                          return (
                            <button
                              key={u}
                              type="button"
                              className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.1em] transition-colors ${
                                sel
                                  ? u === "high"
                                    ? "bg-red-100 text-red-700"
                                    : u === "medium"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-gray-200 text-gray-700"
                                  : "text-[rgba(32,32,32,0.48)]"
                              }`}
                              onClick={(event) => {
                                event.stopPropagation();
                                updateTask(index, { urgency: u });
                              }}
                            >
                              {u === "medium" ? "med" : u}
                            </button>
                          );
                        })}
                      </div>

                      {/* Reward (rarity) pills */}
                      <div className="pointer-events-auto flex gap-1 rounded-full border border-[var(--border)] bg-white/92 p-1 shadow-[0_8px_16px_rgba(0,0,0,0.08)]">
                        {(["common", "rare", "legendary"] as Rarity[]).map((r) => {
                          const sel = task.rarity === r;
                          const label = r === "common" ? "—" : r === "rare" ? "★★" : "★★★";
                          return (
                            <button
                              key={r}
                              type="button"
                              className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.1em] transition-colors ${
                                sel
                                  ? r === "legendary"
                                    ? "bg-amber-100 text-amber-700"
                                    : r === "rare"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-200 text-gray-700"
                                  : "text-[rgba(32,32,32,0.48)]"
                              }`}
                              onClick={(event) => {
                                event.stopPropagation();
                                updateTask(index, { rarity: r });
                              }}
                              title={r === "common" ? "No reward" : `${r} reward`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
          {previewCards.length === 0 && (
            <div className="flex min-h-[300px] w-full items-center justify-center text-sm text-[rgba(32,32,32,0.45)]">
              No cards yet — use the sidebar to create one.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
