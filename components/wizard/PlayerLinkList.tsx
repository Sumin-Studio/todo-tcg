"use client";

import { useState } from "react";

interface PlayerLink {
  playerId: string;
  name: string;
  url: string;
}

interface PlayerLinkListProps {
  links: PlayerLink[];
  gmUrl: string;
}

export default function PlayerLinkList({ links, gmUrl }: PlayerLinkListProps) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex flex-col gap-4">
        <div className="rounded-[22px] border border-[var(--border)] bg-white/55 p-5">
          <p className="app-kicker">GM Dashboard Link</p>
          <p className="mt-3 text-sm leading-[1.5] text-[rgba(32,32,32,0.62)]">
            Bookmark this one. It is the only URL that can open the GM view.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <code className="min-w-0 flex-1 overflow-hidden rounded-[18px] border border-[var(--border)] bg-white px-4 py-3 text-xs text-[rgba(32,32,32,0.62)]">
              {gmUrl}
            </code>
            <button
              onClick={() => copy(gmUrl, "gm")}
              className="app-button min-h-[48px] shrink-0 px-5 text-sm"
            >
              {copied === "gm" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          {links.map((link) => (
            <li
              key={link.playerId}
              className="rounded-[22px] border border-[var(--border)] bg-white/55 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="sm:w-24">
                  <p className="text-sm">{link.name}</p>
                </div>
                <code className="min-w-0 flex-1 overflow-hidden rounded-[18px] border border-[var(--border)] bg-white px-4 py-3 text-xs text-[rgba(32,32,32,0.62)]">
                  {link.url}
                </code>
                <button
                  onClick={() => copy(link.url, link.playerId)}
                  className="app-button min-h-[48px] shrink-0 px-5 text-sm"
                >
                  {copied === link.playerId ? "Copied" : "Copy"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="rounded-[22px] border border-[var(--border)] bg-white/48 p-4">
        <p className="app-kicker">Next</p>
        <div className="mt-4 space-y-3 text-sm leading-[1.5] text-[rgba(32,32,32,0.62)]">
          <p>1. Keep the GM link to yourself.</p>
          <p>2. Send one player link to each participant.</p>
          <p>3. Test one player flow before the real session starts.</p>
        </div>
      </aside>
    </div>
  );
}
