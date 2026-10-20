"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/apiClient/apiError";
import { fetchClubs } from "@/apiClient/clubs";
import { isAborted } from "@/apiClient/client";
import type { ClubSummary } from "@/types/club";

export function useClubs() {
  const [clubs, setClubs] = useState<ClubSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchClubs(controller.signal)
      .then(setClubs)
      .catch((caught: unknown) => {
        if (isAborted(caught, controller.signal)) return;
        setError(errorMessage(caught, "Could not load clubs."));
      });
    return () => controller.abort();
  }, []);

  return { clubs, error };
}
