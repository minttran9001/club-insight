"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/apiClient/apiError";
import { isAborted } from "@/apiClient/client";
import { fetchDashboard } from "@/apiClient/dashboard";
import type { DashboardReport } from "@/types/dashboard";
import type { ClubDateRange } from "@/types/range";
import { sameRange } from "@/utils/viewState";

export function useDashboardSummary(range: { current: ClubDateRange | null; settled: ClubDateRange | null }) {
  const { current, settled } = range;
  const settledClubId = settled?.clubId;
  const settledFrom = settled?.from;
  const settledTo = settled?.to;
  const [summary, setSummary] = useState<DashboardReport | null>(null);
  const [summaryError, setSummaryError] = useState<(ClubDateRange & { message: string }) | null>(null);

  useEffect(() => {
    if (!settledClubId || !settledFrom || !settledTo) return;
    const controller = new AbortController();
    const requested = { clubId: settledClubId, from: settledFrom, to: settledTo };
    fetchDashboard(requested, controller.signal)
      .then((body) => {
        if (controller.signal.aborted) return;
        if (!sameRange({ clubId: body.clubId, ...body.range }, requested)) return;
        setSummary(body);
        setSummaryError((error) => (error && sameRange(error, requested) ? null : error));
      })
      .catch((caught: unknown) => {
        if (isAborted(caught, controller.signal)) return;
        setSummaryError({ ...requested, message: errorMessage(caught, "Could not load this range.") });
      });
    return () => controller.abort();
  }, [settledClubId, settledFrom, settledTo]);

  const summaryIsForCurrentRange = current !== null && summary !== null && sameRange({ clubId: summary.clubId, ...summary.range }, current);
  const summaryErrorMessage = current && summaryError && sameRange(summaryError, current) ? summaryError.message : null;

  return {
    summary,
    summaryLoading: current !== null && !summaryIsForCurrentRange && !summaryErrorMessage,
    summaryErrorMessage,
  };
}
