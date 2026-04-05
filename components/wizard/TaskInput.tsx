"use client";

import { useState } from "react";
import type { Rarity } from "@/lib/types";
import Button from "@/components/ui/Button";

interface Task {
  name: string;
  rarity: Rarity;
}

interface TaskInputProps {
  tasks: Task[];
  onChange: (tasks: Task[]) => void;
}

const RARITIES: Rarity[] = ["common", "rare", "legendary"];

const RARITY_LABELS: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  legendary: "Legendary",
};

const RARITY_STYLES: Record<Rarity, string> = {
  common: "bg-[rgba(255,255,255,0.25)]",
  rare: "bg-[rgba(255,255,255,0.35)]",
  legendary: "bg-[rgba(255,158,22,0.18)]",
};

export default function TaskInput({ tasks, onChange }: TaskInputProps) {
  const [taskName, setTaskName] = useState("");
  const [rarity, setRarity] = useState<Rarity>("common");
  const [error, setError] = useState("");

  function addTask() {
    const trimmed = taskName.trim();
    if (!trimmed) {
      setError("Task name is required");
      return;
    }
    if (trimmed.length > 80) {
      setError("Task name must be 80 characters or less");
      return;
    }
    setError("");
    onChange([...tasks, { name: trimmed, rarity }]);
    setTaskName("");
    setRarity("common");
  }

  function removeTask(index: number) {
    onChange(tasks.filter((_, i) => i !== index));
  }

  const counts = { common: 0, rare: 0, legendary: 0 };
  tasks.forEach((t) => counts[t.rarity]++);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_150px]">
          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="app-label">Task name</span>
            <input
              type="text"
              value={taskName}
              onChange={(e) => {
                setTaskName(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Wash the dishes"
              maxLength={80}
              className="app-input !text-left"
            />
          </label>

          <div className="md:col-span-2">
            <span className="app-label">Choose rarity</span>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {RARITIES.map((r) => {
                const selected = rarity === r;
                return (
                  <button
                    key={r}
                    onClick={() => setRarity(r)}
                    className={`rounded-[18px] border px-4 py-3 text-sm transition-colors ${
                      selected
                        ? `border-[var(--border-button)] text-[var(--text-body)] ${RARITY_STYLES[r]}`
                        : "border-[var(--border)] bg-white/40 text-[rgba(32,32,32,0.58)]"
                    }`}
                  >
                    {RARITY_LABELS[r]}
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={addTask} className="md:col-span-2 md:justify-self-start">
            + Create Task
          </Button>
        </div>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <ul className="app-scroll flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1">
          {tasks.length === 0 && (
            <li className="rounded-[20px] border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[rgba(32,32,32,0.58)]">
              No tasks yet. Add your first card to start the pool.
            </li>
          )}

          {tasks.map((task, i) => (
            <li
              key={`${task.name}-${i}`}
              className="flex items-center justify-between gap-3 rounded-[20px] border border-[var(--border)] bg-white/55 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm">{task.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[rgba(32,32,32,0.52)]">
                  {RARITY_LABELS[task.rarity]}
                </p>
              </div>
              <button
                onClick={() => removeTask(i)}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[rgba(32,32,32,0.64)] transition-colors hover:bg-white"
                aria-label={`Remove ${task.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <aside className="rounded-[22px] border border-[var(--border)] bg-white/48 p-4">
        <p className="app-kicker">Card Counts</p>
        <div className="mt-4 grid gap-3">
          {RARITIES.map((r) => (
            <div
              key={r}
              className={`rounded-[18px] border border-[var(--border)] px-4 py-4 ${RARITY_STYLES[r]}`}
            >
              <p className="text-3xl leading-none">{counts[r]}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[rgba(32,32,32,0.52)]">
                {RARITY_LABELS[r]}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-[18px] border border-dashed border-[var(--border)] px-4 py-3 text-xs leading-[1.45] text-[rgba(32,32,32,0.58)]">
          Legendary cards stay special fastest if the pool stays small and
          deliberate.
        </div>
      </aside>
    </div>
  );
}
