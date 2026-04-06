import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getGame } from "@/lib/supabase/queries";
import PlayerPackView from "./PlayerPackView";

interface Props {
  params: Promise<{ gameId: string; playerId: string }>;
}

export default async function PlayPage({ params }: Props) {
  const { gameId, playerId } = await params;
  const supabase = getSupabaseServer();
  const result = await getGame(supabase, gameId);

  if (!result.success) notFound();

  const game = result.data;
  const player = game.players.find((p) => p.id === playerId);

  if (!player) notFound();

  return (
    <main className="min-h-screen">
      <PlayerPackView
        gameId={gameId}
        playerId={playerId}
        gameTitle={game.title}
        cards={player.cards}
      />
    </main>
  );
}
