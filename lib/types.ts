// lib/types.ts — Single source of truth for all shared TypeScript interfaces

export type Rarity = "common" | "rare" | "legendary";
export type Urgency = "low" | "medium" | "high";

export interface Card {
  id: string;
  taskName: string;
  rarity: Rarity;
  artUrl: string; // Supabase Storage URL; "" = use CSS gradient fallback
  flavorText: string;
  dueDate: string;  // ISO date "YYYY-MM-DD"
  urgency: Urgency;
}

export interface PackSettings {
  playerCount: number;
  startDate: string;    // ISO date "YYYY-MM-DD" — replaces cardsPerPack
  durationDays: number; // how many days to spread tasks across
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
  packsByDay: Record<number, Card[]>; // dayOffset 0..durationDays-1 → cards
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
