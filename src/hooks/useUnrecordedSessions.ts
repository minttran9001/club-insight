"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/apiClient/apiError";
import { isAborted } from "@/apiClient/client";
import { fetchUnrecordedSessions } from "@/apiClient/unrecorded-sessions";
import type { UnrecordedSessionItem } from "@/types/session";
import { OpenList, type OpenMetric } from "@/types/dashboard";

type LoadedUnrecordedSessions = {
  clubId: string;
  from: string;
  to: string;
  sessions: UnrecordedSessionItem[];
};

type UnrecordedSessionsError = {
  clubId: string;
  from: string;
  to: string;
  message: string;
};

export function useUnrecordedSessions(range: {
  open: OpenMetric;
  settledClub: string | null;
  settledFrom: string | null;
  settledTo: string | null;
}) {
  const { open, settledClub, settledFrom, settledTo } = range;
  const [loadedUnrecordedSessions, setLoadedUnrecordedSessions] = useState<LoadedUnrecordedSessions | null>(null);
  const [unrecordedSessionsError, setUnrecordedSessionsError] = useState<UnrecordedSessionsError | null>(null);

  useEffect(() => {
    if (open !== OpenList.noShows || !settledClub || !settledFrom || !settledTo) return;
    const controller = new AbortController();
    const requested = { clubId: settledClub, from: settledFrom, to: settledTo };
    fetchUnrecordedSessions({ clubId: settledClub, from: settledFrom, to: settledTo }, controller.signal)
      .then((body) => {
        if (controller.signal.aborted) return;
        if (body.clubId !== requested.clubId || body.from !== requested.from || body.to !== requested.to) return;
        setLoadedUnrecordedSessions({ clubId: body.clubId, from: body.from, to: body.to, sessions: body.sessions });
        setUnrecordedSessionsError((current) =>
          current && current.clubId === requested.clubId && current.from === requested.from && current.to === requested.to ? null : current,
        );
      })
      .catch((caught: unknown) => {
        if (isAborted(caught, controller.signal)) return;
        setUnrecordedSessionsError({
          ...requested,
          message: errorMessage(caught, "Could not load sessions where attendance was not taken."),
        });
      });
    return () => controller.abort();
  }, [open, settledClub, settledFrom, settledTo]);

  const unrecordedSessions =
    open === OpenList.noShows &&
    loadedUnrecordedSessions !== null &&
    loadedUnrecordedSessions.clubId === settledClub &&
    loadedUnrecordedSessions.from === settledFrom &&
    loadedUnrecordedSessions.to === settledTo
      ? loadedUnrecordedSessions.sessions
      : [];
  const unrecordedSessionsErrorMessage =
    open === OpenList.noShows &&
    unrecordedSessionsError &&
    unrecordedSessionsError.clubId === settledClub &&
    unrecordedSessionsError.from === settledFrom &&
    unrecordedSessionsError.to === settledTo
      ? unrecordedSessionsError.message
      : null;

  return { unrecordedSessions, unrecordedSessionsErrorMessage };
}
