// lib/types.ts — Single source of truth for all shared TypeScript interfaces

export type Rarity = "common" | "rare" | "legendary";

export interface Card {
  id: string;
  taskName: string;
  rarity: Rarity;
  artUrl: string; // Supabase Storage URL; "" = use CSS gradient fallback
  flavorText: string;
}

export interface PackSettings {
  playerCount: number;
  cardsPerPack: number;
  rarityDistribution: {
    common: number;
    rare: number;
    legendary: number;
  };
  allowDuplicates: boolean;
}

export interface Player {
  id: string;
  name: string;
  cards: Card[];
}

export interface Game {
  id: string;
  gmToken: string;
  title: string;
  description?: string;
  cardPool: Card[];
  players: Player[];
  settings: PackSettings;
  status: "active" | "completed";
  createdAt: string;
}

export interface Completion {
  id: string;
  gameId: string;
  playerId: string;
  cardId: string;
  completedAt: string;
}

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
