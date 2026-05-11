import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getGame } from "@/lib/supabase/queries";
import PlayerPackView from "../PlayerPackView";

interface Props {
  params: Promise<{ gameId: string; playerId: string; day: string }>;
}

export default async function PlayDayPage({ params }: Props) {
  const { gameId, playerId, day } = await params;
  const dayOffset = parseInt(day, 10);

  if (isNaN(dayOffset) || dayOffset < 0) notFound();

  const supabase = getSupabaseServer();
  const result = await getGame(supabase, gameId);

  if (!result.success) notFound();

  const game = result.data;
  const player = game.players.find((p) => p.id === playerId);

  if (!player) notFound();

  const cards = player.packsByDay?.[dayOffset] ?? [];

  // Build a date label for this day
  const startDate = game.settings.startDate;
  const date = new Date(startDate + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + dayOffset);
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <main>
      <PlayerPackView
        gameId={gameId}
        playerId={playerId}
        gameTitle={game.title}
        dayLabel={dateLabel}
        cards={cards}
      />
    </main>
  );
}
