"use client";

import { ActivePlayerChart } from "@/components/ActivePlayerChart";
import { MetricCards } from "@/components/MetricCards";
import { SummarySkeleton } from "@/components/SummarySkeleton";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";

export function DashboardSummary({
  club,
  from,
  to,
  settledClub,
  settledFrom,
  settledTo,
}: {
  club: string | null;
  from: string | null;
  to: string | null;
  settledClub: string | null;
  settledFrom: string | null;
  settledTo: string | null;
}) {
  const { summary, summaryLoading, summaryErrorMessage } = useDashboardSummary({ club, from, to, settledClub, settledFrom, settledTo });

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
