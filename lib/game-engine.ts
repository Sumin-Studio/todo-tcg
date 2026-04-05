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
  const { playerCount, cardsPerPack, rarityDistribution, allowDuplicates } = settings;
  const { common, rare, legendary } = rarityDistribution;

  if (common + rare + legendary !== cardsPerPack) {
    return {
      success: false,
      error: new Error(
        `Rarity distribution (${common}+${rare}+${legendary}=${common + rare + legendary}) must equal cardsPerPack (${cardsPerPack})`
      ),
    };
  }

  const commonCards = cardPool.filter((c) => c.rarity === "common");
  const rareCards = cardPool.filter((c) => c.rarity === "rare");
  const legendaryCards = cardPool.filter((c) => c.rarity === "legendary");

  const neededCommon = allowDuplicates ? 1 : common * playerCount;
  const neededRare = allowDuplicates ? 1 : rare * playerCount;
  const neededLegendary = allowDuplicates ? 1 : legendary * playerCount;

  if (commonCards.length < neededCommon) {
    return {
      success: false,
      error: new Error(
        `Need ${neededCommon} common cards, only ${commonCards.length} available`
      ),
    };
  }
  if (rareCards.length < neededRare) {
    return {
      success: false,
      error: new Error(
        `Need ${neededRare} rare cards, only ${rareCards.length} available`
      ),
    };
  }
  if (legendaryCards.length < neededLegendary) {
    return {
      success: false,
      error: new Error(
        `Need ${neededLegendary} legendary cards, only ${legendaryCards.length} available`
      ),
    };
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
  const { playerCount, cardsPerPack, rarityDistribution, allowDuplicates } = settings;
  const { common, rare, legendary } = rarityDistribution;

  let commonPool = seededShuffle(
    cardPool.filter((c) => c.rarity === "common"),
    rng
  );
  let rarePool = seededShuffle(
    cardPool.filter((c) => c.rarity === "rare"),
    rng
  );
  let legendaryPool = seededShuffle(
    cardPool.filter((c) => c.rarity === "legendary"),
    rng
  );

  const players: Player[] = [];

  for (let i = 0; i < playerCount; i++) {
    const cards: Card[] = [];

    const dealFromPool = (pool: Card[], count: number): Card[] => {
      if (allowDuplicates) {
        return Array.from({ length: count }, (_, idx) => pool[idx % pool.length]);
      }
      return pool.splice(0, count);
    };

    cards.push(...dealFromPool(commonPool, common));
    cards.push(...dealFromPool(rarePool, rare));
    cards.push(...dealFromPool(legendaryPool, legendary));

    // Shuffle the dealt cards so rarity order isn't predictable
    const shuffledCards = seededShuffle(cards, rng);

    players.push({
      id: `player-${i + 1}`,
      name: `Player ${i + 1}`,
      cards: shuffledCards,
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
