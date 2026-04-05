import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { createGame } from "@/lib/supabase/queries";
import { dealPacks, generateGameId, generateGmToken } from "@/lib/game-engine";
import { getFlavorText } from "@/lib/flavor-text";
import type { Card, PackSettings, Rarity } from "@/lib/types";

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
    artUrl: "", // filled in after image generation below
    flavorText: getFlavorText(`${gameId}-card-${i}`, task.rarity),
  }));

  // Deal packs
  const packResult = dealPacks(cardPool, settings, gameId);
  if (!packResult.success) {
    return NextResponse.json({ error: packResult.error.message }, { status: 400 });
  }

  const players = packResult.data;

  // Generate AI art for each card (server-side only)
  const supabase = getSupabaseServer();
  const dashscopeKey = process.env.DASHSCOPE_API_KEY;

  if (dashscopeKey) {
    await Promise.all(
      cardPool.map(async (card) => {
        try {
          // Call qwen-image-2.0-pro via DashScope
          const aiRes = await fetch(
            "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${dashscopeKey}`,
              },
              body: JSON.stringify({
                model: "qwen-image-2.0-pro",
                input: {
                  messages: [
                    {
                      role: "user",
                      content: [
                        {
                          text: `Fantasy trading card illustration of ${card.taskName}, epic detailed art, no text, no borders`,
                        },
                      ],
                    },
                  ],
                },
                parameters: {
                  size: "1024*1024",
                  prompt_extend: true,
                  watermark: false,
                  negative_prompt:
                    "blurry, low quality, text, borders, watermark, logo",
                },
              }),
            }
          );

          if (!aiRes.ok) return;

          const aiData = await aiRes.json();
          // Response: output.choices[0].message.content[0].image
          const imageUrl: string =
            aiData.output?.choices?.[0]?.message?.content?.[0]?.image;
          if (!imageUrl) return;

          // Download image immediately — DashScope URLs expire after 24h
          const imgRes = await fetch(imageUrl);
          if (!imgRes.ok) return;
          const buffer = await imgRes.arrayBuffer();

          // Upload to Supabase Storage
          const path = `${gameId}/${card.id}.png`;
          const { error } = await supabase.storage
            .from("card-art")
            .upload(path, buffer, { contentType: "image/png", upsert: true });

          if (error) return;

          // Get public URL and update card
          const { data: urlData } = supabase.storage
            .from("card-art")
            .getPublicUrl(path);
          card.artUrl = urlData.publicUrl;
        } catch {
          // Silently fall back to empty artUrl — CSS gradient used in Card component
        }
      })
    );
  }

  // Update artUrls in dealt player cards to match generated URLs
  const artUrlMap = new Map(cardPool.map((c) => [c.id, c.artUrl]));
  const playersWithArt = players.map((p) => ({
    ...p,
    cards: p.cards.map((c) => ({ ...c, artUrl: artUrlMap.get(c.id) ?? "" })),
  }));

  // Save to Supabase
  const saveResult = await createGame(supabase, {
    id: gameId,
    gmToken,
    title: title.trim(),
    description: description?.trim(),
    cardPool,
    players: playersWithArt,
    settings,
    status: "active",
    createdAt: new Date().toISOString(),
  });

  if (!saveResult.success) {
    return NextResponse.json(
      { error: "Failed to save game" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    gameId,
    gmToken,
    playerLinks: playersWithArt.map((p) => ({
      playerId: p.id,
      name: p.name,
    })),
  });
}
