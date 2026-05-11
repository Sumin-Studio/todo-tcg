"use client";

import { useRef, useCallback } from "react";
import type { Rarity, Urgency } from "@/lib/types";

export interface TaskRow {
  name: string;
  rarity: Rarity;       // "common" = not a reward
  urgency: Urgency;
  dueDate: string;      // YYYY-MM-DD
  customImageUrl?: string;
}

interface TaskInputGridProps {
  tasks: TaskRow[];
  onChange: (tasks: TaskRow[]) => void;
  /** Default due-date for newly-added rows (defaults to today). */
  defaultDueDate?: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const GRID_COLS = "minmax(0,1fr) 130px 110px 150px 70px";

export default function TaskInputGrid({
  tasks,
  onChange,
  defaultDueDate,
}: TaskInputGridProps) {
  const today = defaultDueDate ?? todayIso();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetIndex = useRef<number>(-1);

  function updateTask(index: number, patch: Partial<TaskRow>) {
    onChange(tasks.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function addTask() {
    onChange([
      ...tasks,
      { name: "", rarity: "common", urgency: "medium", dueDate: today },
    ]);
  }

  function removeTask(index: number) {
    onChange(tasks.filter((_, i) => i !== index));
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
        onChange(
          tasks.map((t, i) => (i === index ? { ...t, customImageUrl: dataUrl } : t))
        );
      };
      reader.readAsDataURL(file);
    },
    [tasks, onChange]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div
        className="hidden sm:grid items-center gap-3 px-3 text-[10px] uppercase tracking-[0.12em] text-[rgba(32,32,32,0.42)]"
        style={{ gridTemplateColumns: GRID_COLS }}
      >
        <span>Task</span>
        <span>Due date</span>
        <span>Urgency</span>
        <span>Reward</span>
        <span />
      </div>

      {/* Task rows */}
      <div className="flex flex-col gap-2.5">
        {tasks.map((task, index) => {
          return (
            <div
              key={index}
              className="grid items-center gap-3 rounded-[14px] border border-[var(--border)] bg-white/65 px-3 py-2.5"
              style={{ gridTemplateColumns: GRID_COLS }}
            >
              <input
                type="text"
                value={task.name}
                onChange={(e) => updateTask(index, { name: e.target.value })}
                placeholder="Task name…"
                className="min-w-0 rounded-[6px] border-0 bg-transparent px-2 py-1.5 text-sm text-[var(--text-body)] placeholder-[var(--text-placeholder)] outline-none focus:bg-white/90 transition-all"
              />

              <input
                type="date"
                value={task.dueDate}
                onChange={(e) =>
                  updateTask(index, { dueDate: e.target.value || today })
                }
                className="w-full rounded-[8px] border border-[var(--border)] bg-white/85 px-2 py-1.5 text-xs text-[var(--text-body)] outline-none focus:ring-1 focus:ring-[rgba(32,32,32,0.2)]"
              />

              <select
                value={task.urgency}
                onChange={(e) => updateTask(index, { urgency: e.target.value as Urgency })}
                className="select-pill w-full"
                data-urgency={task.urgency}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <select
                value={task.rarity}
                onChange={(e) => updateTask(index, { rarity: e.target.value as Rarity })}
                className="select-pill w-full"
                data-rarity={task.rarity}
              >
                <option value="common">No reward</option>
                <option value="rare">★★ Rare</option>
                <option value="legendary">★★★ Legendary</option>
              </select>

              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => openUpload(index)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-white/90 text-[rgba(32,32,32,0.55)] hover:text-[rgba(32,32,32,0.9)] hover:bg-white transition-colors"
                  aria-label="Upload image"
                  title={task.customImageUrl ? "Replace image" : "Upload custom image"}
                >
                  {task.customImageUrl ? (
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="currentColor">
                      <circle cx="7" cy="7" r="3" />
                    </svg>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 9V2M4 5l3-3 3 3M2 11h10" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => removeTask(index)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-white/90 text-base leading-none text-[rgba(32,32,32,0.45)] hover:text-[var(--danger)] hover:bg-white transition-colors"
                  aria-label="Remove task"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addTask}
        className="flex items-center gap-2 self-start rounded-full border border-dashed border-[var(--border)] px-4 py-2 text-sm text-[rgba(32,32,32,0.55)] hover:border-[rgba(32,32,32,0.4)] hover:text-[rgba(32,32,32,0.8)] transition-colors"
      >
        <span className="text-base leading-none">+</span>
        Add task
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
