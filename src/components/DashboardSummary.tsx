"use client";

import { ActivePlayerChart } from "@/components/ActivePlayerChart";
import { MetricCards } from "@/components/MetricCards";
import { SummarySkeleton } from "@/components/SummarySkeleton";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import type { ClubDateRange } from "@/types/range";

export function DashboardSummary({ current, settled }: { current: ClubDateRange | null; settled: ClubDateRange | null }) {
  const { summary, summaryLoading, summaryErrorMessage } = useDashboardSummary({ current, settled });

  if (summaryErrorMessage) return <p role="alert">{summaryErrorMessage}</p>;
  if (summaryLoading || !summary) return summaryLoading ? <SummarySkeleton /> : null;

  return (
    <section className="flex flex-col gap-6">
      {summary.message ? <p>{summary.message}</p> : null}
      <MetricCards dashboard={summary} />
      {summary.showChart ? <ActivePlayerChart weeks={summary.weeks} /> : null}
    </section>
  );
}
