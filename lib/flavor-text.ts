// lib/flavor-text.ts — Deterministic flavor text selection (same cardId = same text)

import { djb2Hash } from "./hash";
import { FLAVOR_POOLS } from "./constants";
import type { Rarity } from "./types";

export function getFlavorText(cardId: string, rarity: Rarity): string {
  const pool = FLAVOR_POOLS[rarity];
  return pool[djb2Hash(cardId) % pool.length];
}
