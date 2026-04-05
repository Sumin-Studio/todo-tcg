import GameSetupWizard from "@/components/wizard/GameSetupWizard";
import { DEFAULT_PACK_SETTINGS } from "@/lib/constants";
import type { PackSettings, Rarity } from "@/lib/types";

export const metadata = {
  title: "Create a Game — TODO TCG",
};

interface CreatePageProps {
  searchParams?: Promise<{
    tasks?: string;
    players?: string;
    title?: string;
    description?: string;
  }>;
}

function clampPlayerCount(value: number) {
  return Math.max(1, Math.min(20, value));
}

export default async function CreatePage({ searchParams }: CreatePageProps) {
  const params = (await searchParams) ?? {};
  const taskLines = (params.tasks ?? "")
    .split(/\r?\n/)
    .map((task) => task.trim())
    .filter(Boolean);

  const initialTasks = taskLines.map((name) => ({
    name,
    rarity: "common" as Rarity,
  }));

  const requestedPlayers = Number(params.players);
  const playerCount = Number.isFinite(requestedPlayers)
    ? clampPlayerCount(requestedPlayers)
    : DEFAULT_PACK_SETTINGS.playerCount;

  const initialSettings: PackSettings = {
    ...DEFAULT_PACK_SETTINGS,
    playerCount,
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="app-kicker">Game Setup</p>
          <h1 className="app-title text-4xl leading-[0.82] tracking-[-0.07em] sm:text-5xl">
            Build the deck.
          </h1>
          <p className="max-w-2xl text-sm leading-[1.45] text-[rgba(32,32,32,0.62)]">
            Add tasks, tune pack distribution, and generate a shareable game
            without leaving this screen.
          </p>
        </div>

        <GameSetupWizard
          initialState={{
            title:
              params.title?.trim() ??
              (initialTasks.length > 0 ? "TODO Deck" : ""),
            description: params.description?.trim() ?? "",
            tasks: initialTasks,
            settings: initialSettings,
          }}
        />
      </div>
    </main>
  );
}
