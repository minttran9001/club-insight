"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/apiClient/apiError";
import { isAborted } from "@/apiClient/client";
import { fetchUnrecordedSessions } from "@/apiClient/unrecorded-sessions";
import { OpenList } from "@/types/dashboard";
import type { ClubDateRange } from "@/types/range";
import type { UnrecordedSessionItem } from "@/types/session";
import { sameRange } from "@/utils/viewState";

export function useUnrecordedSessions(range: { open: OpenList; current: ClubDateRange; settled: ClubDateRange | null }) {
  const { open, current, settled } = range;
  const settledClubId = settled?.clubId;
  const settledFrom = settled?.from;
  const settledTo = settled?.to;
  const [loaded, setLoaded] = useState<(ClubDateRange & { sessions: UnrecordedSessionItem[] }) | null>(null);
  const [loadError, setLoadError] = useState<(ClubDateRange & { message: string }) | null>(null);

  useEffect(() => {
    if (open !== OpenList.noShows || !settledClubId || !settledFrom || !settledTo) return;
    const controller = new AbortController();
    const requested = { clubId: settledClubId, from: settledFrom, to: settledTo };
    fetchUnrecordedSessions(requested, controller.signal)
      .then((body) => {
        if (controller.signal.aborted || !sameRange(body, requested)) return;
        setLoaded(body);
        setLoadError((error) => (error && sameRange(error, requested) ? null : error));
      })
      .catch((caught: unknown) => {
        if (isAborted(caught, controller.signal)) return;
        setLoadError({ ...requested, message: errorMessage(caught, "Could not load sessions where attendance was not taken.") });
      });
    return () => controller.abort();
  }, [open, settledClubId, settledFrom, settledTo]);

  const showing = open === OpenList.noShows;
  return {
    unrecordedSessions: showing && loaded && sameRange(loaded, current) ? loaded.sessions : [],
    unrecordedSessionsErrorMessage: showing && loadError && sameRange(loadError, current) ? loadError.message : null,
  };
}
