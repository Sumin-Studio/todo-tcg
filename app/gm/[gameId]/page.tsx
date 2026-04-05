import { notFound, redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getGame } from "@/lib/supabase/queries";
import GMDashboard from "@/components/dashboard/GMDashboard";

interface Props {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function GMPage({ params, searchParams }: Props) {
  const { gameId } = await params;
  const { token } = await searchParams;

  if (!token) redirect("/");

  const supabase = getSupabaseServer();
  const result = await getGame(supabase, gameId);

  if (!result.success) notFound();

  const game = result.data;

  if (game.gmToken !== token) redirect("/");

  const { gmToken: _, ...safeGame } = game;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="app-panel p-5 sm:p-6">
          <p className="app-kicker">GM Dashboard</p>
          <h1 className="app-title mt-2 text-4xl leading-[0.84] tracking-[-0.07em]">
            {game.title}
          </h1>
          {game.description && (
            <p className="mt-3 max-w-3xl text-sm leading-[1.5] text-[rgba(32,32,32,0.62)]">
              {game.description}
            </p>
          )}
        </header>

        <GMDashboard game={{ ...safeGame, gmToken: "" }} />
      </div>
    </main>
  );
}
