// lib/supabase/queries.ts — ALL Supabase calls. No component imports supabase directly.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Game, Completion, Result } from "../types";

// ─── Games ────────────────────────────────────────────────────────────────────

export async function createGame(
  supabase: SupabaseClient,
  game: Game
): Promise<Result<Game>> {
  const { data, error } = await supabase
    .from("games")
    .insert({
      id: game.id,
      gm_token: game.gmToken,
      title: game.title,
      description: game.description ?? null,
      card_pool: game.cardPool,
      players: game.players,
      settings: game.settings,
      status: game.status,
    })
    .select()
    .single();

  if (error) return { success: false, error: new Error(error.message) };
  return { success: true, data: rowToGame(data) };
}

export async function getGame(
  supabase: SupabaseClient,
  gameId: string
): Promise<Result<Game>> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (error) return { success: false, error: new Error(error.message) };
  if (!data) return { success: false, error: new Error("Game not found") };
  return { success: true, data: rowToGame(data) };
}

export async function updateGamePlayers(
  supabase: SupabaseClient,
  gameId: string,
  players: Game["players"]
): Promise<Result<true>> {
  const { error } = await supabase
    .from("games")
    .update({ players })
    .eq("id", gameId);

  if (error) return { success: false, error: new Error(error.message) };
  return { success: true, data: true };
}

// ─── Completions ──────────────────────────────────────────────────────────────

export async function insertCompletion(
  supabase: SupabaseClient,
  completion: Omit<Completion, "id" | "completedAt">
): Promise<Result<Completion>> {
  const { data, error } = await supabase
    .from("completions")
    .insert({
      game_id: completion.gameId,
      player_id: completion.playerId,
      card_id: completion.cardId,
    })
    .select()
    .single();

  if (error) return { success: false, error: new Error(error.message) };
  return { success: true, data: rowToCompletion(data) };
}

export async function getCompletions(
  supabase: SupabaseClient,
  gameId: string
): Promise<Result<Completion[]>> {
  const { data, error } = await supabase
    .from("completions")
    .select("*")
    .eq("game_id", gameId);

  if (error) return { success: false, error: new Error(error.message) };
  return { success: true, data: (data ?? []).map(rowToCompletion) };
}

export async function getPlayerCompletions(
  supabase: SupabaseClient,
  gameId: string,
  playerId: string
): Promise<Result<Completion[]>> {
  const { data, error } = await supabase
    .from("completions")
    .select("*")
    .eq("game_id", gameId)
    .eq("player_id", playerId);

  if (error) return { success: false, error: new Error(error.message) };
  return { success: true, data: (data ?? []).map(rowToCompletion) };
}

// ─── Row mappers ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToGame(row: any): Game {
  return {
    id: row.id,
    gmToken: row.gm_token,
    title: row.title,
    description: row.description ?? undefined,
    cardPool: row.card_pool,
    players: row.players,
    settings: row.settings,
    status: row.status,
    createdAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCompletion(row: any): Completion {
  return {
    id: row.id,
    gameId: row.game_id,
    playerId: row.player_id,
    cardId: row.card_id,
    completedAt: row.completed_at,
  };
}
