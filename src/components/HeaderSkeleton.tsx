import { Skeleton } from "@/components/Skeleton";

export function HeaderSkeleton() {
  return (
    <header className="flex flex-col gap-5" aria-busy="true">
      <p className="sr-only">Loading club insights</p>
      <div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-8 w-72 max-w-full" />
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-64 flex-col gap-1">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-16" />
        </div>
        <div className="flex min-w-64 flex-col gap-1">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </header>
  );
}
