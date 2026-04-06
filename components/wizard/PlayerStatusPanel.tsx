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

            {/* Copy icon button */}
            <button
              onClick={() => copy(link.url, link.playerId)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white/92 text-[rgba(32,32,32,0.62)] shadow-[0_2px_6px_rgba(0,0,0,0.06)] transition-colors hover:text-[rgba(32,32,32,0.9)]"
              aria-label={`Copy link for ${link.name}`}
            >
              {copied === link.playerId ? (
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
}
