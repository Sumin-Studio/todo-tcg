"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TaskInputGrid, { type TaskRow } from "@/components/wizard/TaskInputGrid";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function LandingPage() {
  const router = useRouter();
  const today = todayIso();
  const [tasks, setTasks] = useState<TaskRow[]>([
    { name: "", rarity: "common", urgency: "medium", dueDate: today },
  ]);

  function canContinue() {
    if (tasks.length === 0) return false;
    return tasks.every((t) => t.name.trim().length > 0);
  }

  function handleContinue() {
    if (!canContinue()) return;
    const cleaned = tasks
      .map((t) => ({ ...t, name: t.name.trim() }))
      .filter((t) => t.name);
    sessionStorage.setItem("todo-tcg-tasks", JSON.stringify(cleaned));
    router.push("/create");
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[900px] flex-col items-center gap-8">
        <div className="relative text-center">
          <h1 className="app-title text-[3.8rem] leading-[0.75] tracking-[-0.09em] sm:text-[4.25rem]">
            TO-DO
          </h1>
        </div>

        <section className="app-panel w-full p-5 sm:p-7">
          <div className="flex flex-col gap-5">
            <p className="app-kicker">Enter your tasks</p>

            <TaskInputGrid tasks={tasks} onChange={setTasks} defaultDueDate={today} />

            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue()}
              className="app-button w-full justify-center text-center text-[1.05rem] mt-2"
            >
              Continue →
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
