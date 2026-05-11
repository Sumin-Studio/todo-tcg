import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ gameId: string; playerId: string }>;
}

// Redirect legacy links (no day segment) to day 0
export default async function PlayPage({ params }: Props) {
  const { gameId, playerId } = await params;
  redirect(`/play/${gameId}/${playerId}/0`);
}
