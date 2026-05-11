// lib/game-engine.ts — Pure pack-dealing logic. No React, no Supabase.

import { djb2Hash, mulberry32 } from "./hash";
import type { Card, Player, PackSettings, Result } from "./types";

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Parse an ISO date string "YYYY-MM-DD" into a UTC timestamp (midnight). */
function parseIsoDate(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Return the number of whole days between two ISO date strings. */
function daysBetween(fromIso: string, toIso: string): number {
  const MS_PER_DAY = 86_400_000;
  return Math.round((parseIsoDate(toIso) - parseIsoDate(fromIso)) / MS_PER_DAY);
}

export function validateSettings(
  cardPool: Card[],
  settings: PackSettings
): Result<true> {
  if (cardPool.length === 0) {
    return { success: false, error: new Error("At least one card is required") };
  }
  if (settings.playerCount < 1) {
    return { success: false, error: new Error("At least one player is required") };
  }
  if (settings.durationDays < 1) {
    return { success: false, error: new Error("Duration must be at least 1 day") };
  }
  return { success: true, data: true };
}

/**
 * dealPacksByDay — distribute cards among players grouped by their due date.
 *
 * For each day offset 0..durationDays-1:
 *   1. Collect cards whose dueDate falls on that day.
 *   2. Seeded-shuffle the bucket (seed = gameId + ":" + dayOffset).
 *   3. Round-robin assign shuffled cards to players.
 *
 * Cards whose dueDate is outside [startDate, startDate+durationDays-1] are
 * clamped to the nearest valid day (defensive; wizard should prevent this).
 *
 * Returns Player[] where each player has a `packsByDay` map.
 */
export function dealPacksByDay(
  cardPool: Card[],
  settings: PackSettings,
  seed: string
): Result<Player[]> {
  const validation = validateSettings(cardPool, settings);
  if (!validation.success) return validation;

  const { playerCount, durationDays, startDate } = settings;

  // Initialise players
  const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
    id: `player-${i + 1}`,
    name: `Player ${i + 1}`,
    packsByDay: {},
  }));

  // Bucket cards by day offset, clamping out-of-range dates
  const buckets: Card[][] = Array.from({ length: durationDays }, () => []);
  for (const card of cardPool) {
    let offset = daysBetween(startDate, card.dueDate);
    offset = Math.max(0, Math.min(durationDays - 1, offset));
    buckets[offset].push(card);
  }

  // For each day, shuffle and round-robin assign to players
  for (let day = 0; day < durationDays; day++) {
    const bucket = buckets[day];
    if (bucket.length === 0) continue;

    const daySeed = `${seed}:${day}`;
    const rng = mulberry32(djb2Hash(daySeed));
    const shuffled = seededShuffle(bucket, rng);

    shuffled.forEach((card, idx) => {
      const player = players[idx % playerCount];
      if (!player.packsByDay[day]) player.packsByDay[day] = [];
      player.packsByDay[day].push(card);
    });
  }

  return { success: true, data: players };
}

export function generateGameId(): string {
  // Crypto-random UUID for game IDs
  return crypto.randomUUID();
}

export function generateGmToken(): string {
  // Crypto-random token for GM auth
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}
