import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { createGame } from "@/lib/supabase/queries";
import { dealPacks, generateGameId, generateGmToken } from "@/lib/game-engine";
import { getFlavorText } from "@/lib/flavor-text";
import type { Card, PackSettings, Rarity } from "@/lib/types";

export const runtime = "nodejs";

interface TaskInput {
  name: string;
  rarity: Rarity;
}

interface RequestBody {
  title: string;
  description?: string;
  tasks: TaskInput[];
  settings: PackSettings;
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, description, tasks, settings } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!tasks?.length) {
    return NextResponse.json({ error: "At least one task is required" }, { status: 400 });
  }

  const { common, rare, legendary } = settings.rarityDistribution;
  if (common + rare + legendary !== settings.cardsPerPack) {
    return NextResponse.json(
      { error: "Rarity distribution must equal cardsPerPack" },
      { status: 400 }
    );
  }

  const gameId = generateGameId();
  const gmToken = generateGmToken();

  // Build the card pool with IDs assigned
  const cardPool: Card[] = tasks.map((task, i) => ({
    id: `${gameId}-card-${i}`,
    taskName: task.name,
    rarity: task.rarity,
    artUrl: "",
    flavorText: getFlavorText(`${gameId}-card-${i}`, task.rarity),
  }));

  // Deal packs
  const packResult = dealPacks(cardPool, settings, gameId);
  if (!packResult.success) {
    return NextResponse.json({ error: packResult.error.message }, { status: 400 });
  }

  const players = packResult.data;

  // Save to Supabase
  const supabase = getSupabaseServer();
  const saveResult = await createGame(supabase, {
    id: gameId,
    gmToken,
    title: title.trim(),
    description: description?.trim(),
    cardPool,
    players,
    settings,
    status: "active",
    createdAt: new Date().toISOString(),
  });

  if (!saveResult.success) {
    return NextResponse.json(
      { error: saveResult.error.message || "Failed to save game" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    gameId,
    gmToken,
    playerLinks: players.map((p) => ({
      playerId: p.id,
      name: p.name,
    })),
  });
}
