import GameSetupWizard from "@/components/wizard/GameSetupWizard";

export const metadata = {
  title: "Create a Game — TODO TCG",
};

export default function CreatePage() {
  return (
    <main className="min-h-screen px-4 py-4 sm:px-5 sm:py-5">
      <div className="w-full max-w-[1880px]">
        <GameSetupWizard />
      </div>
    </main>
  );
}
