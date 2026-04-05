// lib/constants.ts — Flavor text pools and rarity config

import type { Rarity } from "./types";

export const FLAVOR_POOLS: Record<Rarity, string[]> = {
  common: [
    "Even the smallest task shapes the greater tapestry.",
    "A steady hand completes what a hasty one never starts.",
    "Simplicity is the foundation of mastery.",
    "The humble pebble starts the avalanche.",
    "One brushstroke at a time.",
    "Not every hero charges into battle. Some file paperwork.",
    "Done is better than perfect.",
    "The path begins with a single step forward.",
    "Small deeds, remembered long.",
    "A thousand small victories win the war.",
    "No task too minor, no effort too small.",
    "Forged in the furnace of routine.",
  ],
  rare: [
    "Few are called. Fewer answer.",
    "Power is not given — it is earned through repetition.",
    "The rarer the deed, the brighter the glory.",
    "Only the persistent pierce the veil.",
    "Crafted under pressure, honed by will.",
    "They whisper your name in the hall of deeds.",
    "Not all who wander are lost — some are hunting.",
    "The second attempt succeeds where the first could not.",
    "Fortune favors the prepared mind.",
    "You have walked where others turned back.",
    "Rare as courage in uncertain times.",
  ],
  legendary: [
    "In ten thousand years, the scholars will argue still.",
    "The gods themselves took note.",
    "One name. One deed. One age defined.",
    "When the sky cracked, you held the pieces together.",
    "What was thought impossible — done.",
    "The legend was written before the task was finished.",
    "Even the silence feared you.",
    "Beyond rarity lies singularity.",
    "A feat not merely rare — but singular.",
    "The bards will need a longer song.",
    "You did not find the limit. You moved it.",
  ],
};

export const RARITY_COLORS: Record<Rarity, string> = {
  common: "#9CA3AF",
  rare: "#3B82F6",
  legendary: "#F59E0B",
};

export const DEFAULT_PACK_SETTINGS = {
  playerCount: 4,
  cardsPerPack: 5,
  rarityDistribution: {
    common: 3,
    rare: 1,
    legendary: 1,
  },
  allowDuplicates: false,
};
