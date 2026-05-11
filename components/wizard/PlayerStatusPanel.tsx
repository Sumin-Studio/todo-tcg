"use client";

import { useState } from "react";
import type { Completion } from "@/lib/types";

interface DayLink {
  playerId: string;
  name: string;
  dayOffset: number;
  dateLabel: string;
  cardCount: number;
  url: string;
}

interface PlayerStatusPanelProps {
  links: DayLink[];
  completions: Completion[];
}

export default function PlayerStatusPanel({ links, completions }: PlayerStatusPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  // Group links by player
  const players = Array.from(
    links.reduce((map, link) => {
      if (!map.has(link.playerId)) {
        map.set(link.playerId, { playerId: link.playerId, name: link.name, days: [] });
      }
      map.get(link.playerId)!.days.push(link);
      return map;
    }, new Map<string, { playerId: string; name: string; days: DayLink[] }>())
      .values()
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="app-kicker">Player links</p>

      {players.map((player) => {
        const doneCount = completions.filter((c) => c.playerId === player.playerId).length;
        const totalCards = player.days.reduce((sum, d) => sum + d.cardCount, 0);

        return (
          <div key={player.playerId} className="flex flex-col gap-2">
            {/* Player header */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[rgba(32,32,32,0.78)]">
                {player.name}
              </span>
              <span className="text-xs text-[rgba(32,32,32,0.45)]">
                {doneCount}/{totalCards} done
              </span>
            </div>

            {/* Day rows */}
            {player.days.map((day) => {
              const copyKey = `${day.playerId}-${day.dayOffset}`;
              return (
                <div
                  key={day.dayOffset}
                  className="flex items-center gap-2 rounded-[14px] border border-[var(--border)] bg-white/55 px-3 py-2"
                >
                  {/* Day label */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-xs font-medium text-[rgba(32,32,32,0.78)] truncate">
                      {day.dateLabel}
                    </span>
                    <span className="text-[10px] text-[rgba(32,32,32,0.42)]">
                      {day.cardCount === 0
                        ? "rest day"
                        : `${day.cardCount} card${day.cardCount !== 1 ? "s" : ""}`}
                    </span>
                  </div>

                  {/* Copy button */}
                  <button
                    onClick={() => copy(day.url, copyKey)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white/92 text-[rgba(32,32,32,0.62)] shadow-[0_2px_6px_rgba(0,0,0,0.06)] transition-colors hover:text-[rgba(32,32,32,0.9)]"
                    aria-label={`Copy link for ${player.name} — ${day.dateLabel}`}
                  >
                    {copied === copyKey ? (
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 7l3 3 6-6" />
                      </svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" />
                        <path d="M2.5 8.5H2A1.5 1.5 0 0 1 .5 7V2A1.5 1.5 0 0 1 2 .5h5A1.5 1.5 0 0 1 8.5 2v.5" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
