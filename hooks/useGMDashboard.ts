"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getCompletions } from "@/lib/supabase/queries";
import type { Completion } from "@/lib/types";

interface UseGMDashboardOptions {
  gameId: string;
}

export function useGMDashboard({ gameId }: UseGMDashboardOptions) {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Initial fetch
    getCompletions(supabase, gameId).then((result) => {
      if (result.success) setCompletions(result.data);
      setLoading(false);
    });

    // Realtime subscription
    const channel = supabase
      .channel(`completions:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "completions",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          const row = payload.new;
          const newCompletion: Completion = {
            id: row.id,
            gameId: row.game_id,
            playerId: row.player_id,
            cardId: row.card_id,
            completedAt: row.completed_at,
          };
          setCompletions((prev) => [...prev, newCompletion]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  return { completions, loading };
}
