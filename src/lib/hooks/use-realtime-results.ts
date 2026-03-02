"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PollOption } from "@/types";

interface UseRealtimeResultsOptions {
  pollId: string;
  initialOptions: PollOption[];
  initialTotalVotes: number;
}

interface RealtimeResults {
  options: PollOption[];
  totalVotes: number;
}

export function useRealtimeResults({
  pollId,
  initialOptions,
  initialTotalVotes,
}: UseRealtimeResultsOptions): RealtimeResults {
  const [options, setOptions] = useState<PollOption[]>(initialOptions);
  const [totalVotes, setTotalVotes] = useState(initialTotalVotes);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-results-${pollId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "poll_options",
          filter: `poll_id=eq.${pollId}`,
        },
        (payload) => {
          setOptions((prev) =>
            prev.map((opt) =>
              opt.id === payload.new.id
                ? { ...opt, vote_count: payload.new.vote_count }
                : opt
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "polls",
          filter: `id=eq.${pollId}`,
        },
        (payload) => {
          setTotalVotes(payload.new.total_votes);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId]);

  return { options, totalVotes };
}
