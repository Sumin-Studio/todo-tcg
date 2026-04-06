"use client";

import { useState } from "react";
import type { Completion } from "@/lib/types";

interface PlayerLink {
  playerId: string;
  name: string;
  url: string;
}

interface PlayerStatusPanelProps {
  links: PlayerLink[];
  completions: Completion[];
  cardsPerPack: number;
}

export default function PlayerStatusPanel({
  links,
  completions,
  cardsPerPack,
}: PlayerStatusPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="app-kicker">Players</p>
      {links.map((link) => {
        const doneCount = completions.filter(
          (c) => c.playerId === link.playerId
        ).length;

        return (
          <div
            key={link.playerId}
            className="flex items-center gap-3 rounded-[18px] border border-[var(--border)] bg-white/55 px-4 py-3"
          >
            {/* Player name */}
            <span className="w-20 shrink-0 text-sm font-medium text-[rgba(32,32,32,0.78)]">
              {link.name}
            </span>

            {/* LED dots */}
            <div className="flex flex-1 flex-wrap gap-1.5">
              {Array.from({ length: cardsPerPack }).map((_, i) => {
                const done = i < doneCount;
                return (
                  <span
                    key={i}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                      done
                        ? "bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.55)]"
                        : "bg-[rgba(0,0,0,0.12)]"
                    }`}
                  />
                );
              })}
            </div>

            {/* Copy button */}
            <button
              onClick={() => copy(link.url, link.playerId)}
              className="app-button shrink-0 px-4 py-1.5 text-xs"
            >
              {copied === link.playerId ? "Copied" : "Copy"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
