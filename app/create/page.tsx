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
    <main className="min-h-screen px-4 py-4 sm:px-5 sm:py-5">
      <div className="w-full max-w-[1880px]">
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
