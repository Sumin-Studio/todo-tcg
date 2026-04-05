"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { insertCompletion, getPlayerCompletions } from "@/lib/supabase/queries";

interface UseCompletionsOptions {
  gameId: string;
  playerId: string;
}

export function useCompletions({ gameId, playerId }: UseCompletionsOptions) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    getPlayerCompletions(supabase, gameId, playerId).then((result) => {
      if (result.success) {
        setCompletedIds(new Set(result.data.map((c) => c.cardId)));
      }
      setLoading(false);
    });
  }, [gameId, playerId]);

  const markComplete = useCallback(
    async (cardId: string) => {
      // Optimistic update
      setCompletedIds((prev) => new Set([...prev, cardId]));

      const supabase = getSupabaseClient();
      const result = await insertCompletion(supabase, { gameId, playerId, cardId });

      if (!result.success) {
        // Roll back on failure
        setCompletedIds((prev) => {
          const next = new Set(prev);
          next.delete(cardId);
          return next;
        });
      }
    },
    [gameId, playerId]
  );

  return { completedIds, markComplete, loading };
}
