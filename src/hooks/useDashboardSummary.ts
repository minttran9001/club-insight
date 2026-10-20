"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/apiClient/apiError";
import { isAborted } from "@/apiClient/client";
import { fetchDashboard } from "@/apiClient/dashboard";
import type { DashboardReport } from "@/types/dashboard";
import type { QueryError } from "@/types/dashboard";
import { clearQueryError } from "@/utils/viewState";

export function useDashboardSummary(range: {
  club: string | null;
  from: string | null;
  to: string | null;
  settledClub: string | null;
  settledFrom: string | null;
  settledTo: string | null;
}) {
  const { club, from, to, settledClub, settledFrom, settledTo } = range;
  const [summary, setSummary] = useState<DashboardReport | null>(null);
  const [summaryError, setSummaryError] = useState<QueryError | null>(null);

  useEffect(() => {
    if (!settledClub || !settledFrom || !settledTo) return;
    const controller = new AbortController();
    const requested = { club: settledClub, from: settledFrom, to: settledTo };
    fetchDashboard({ clubId: settledClub, from: settledFrom, to: settledTo }, controller.signal)
      .then((body) => {
        if (controller.signal.aborted) return;
        if (body.clubId !== requested.club || body.range.from !== requested.from || body.range.to !== requested.to) return;
        setSummary(body);
        setSummaryError((current) => clearQueryError(current, body.clubId, body.range.from, body.range.to));
      })
      .catch((caught: unknown) => {
        if (isAborted(caught, controller.signal)) return;
        setSummaryError({ ...requested, message: errorMessage(caught, "Could not load this range.") });
      });
    return () => controller.abort();
  }, [settledClub, settledFrom, settledTo]);

  const summaryIsForCurrentRange = summary !== null && summary.clubId === club && summary.range.from === from && summary.range.to === to;
  const summaryErrorMessage =
    summaryError && summaryError.club === club && summaryError.from === from && summaryError.to === to ? summaryError.message : null;

  return {
    summary,
    summaryLoading: Boolean(club && from && to) && !summaryIsForCurrentRange && !summaryErrorMessage,
    summaryErrorMessage,
  };
}
