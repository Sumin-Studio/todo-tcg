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
  return { success: true, data: true };
}

export function dealPacks(
  cardPool: Card[],
  settings: PackSettings,
  seed: string
): Result<Player[]> {
  const validation = validateSettings(cardPool, settings);
  if (!validation.success) return validation;

  const rng = mulberry32(djb2Hash(seed));
  const { playerCount, cardsPerPack } = settings;

  // Shuffle the entire card pool — rarity is not used for dealing
  const shuffledPool = seededShuffle([...cardPool], rng);

  const players: Player[] = [];
  let poolIndex = 0;

  for (let i = 0; i < playerCount; i++) {
    const cards: Card[] = [];
    for (let j = 0; j < cardsPerPack; j++) {
      // Cycle through the pool if there aren't enough unique cards
      cards.push(shuffledPool[poolIndex % shuffledPool.length]);
      poolIndex++;
    }
    players.push({
      id: `player-${i + 1}`,
      name: `Player ${i + 1}`,
      cards,
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
