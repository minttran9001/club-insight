import { Skeleton } from "@/components/Skeleton";

export function SummarySkeleton() {
  return (
    <section className="flex flex-col gap-6" aria-busy="true">
      <p className="sr-only">Loading club insights</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCardSkeleton tone="border-teal-200 bg-teal-50" />
        <MetricCardSkeleton tone="border-sky-200 bg-sky-50" />
        <MetricCardSkeleton tone="border-amber-200 bg-amber-50" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    </section>
  );
}

function MetricCardSkeleton({ tone }: { tone: string }) {
  return (
    <div className={`flex flex-col gap-2 rounded-lg border p-4 ${tone}`}>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-16" />
      <Skeleton className="h-4 w-10" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-48 max-w-full" />
    </div>
  );
}
