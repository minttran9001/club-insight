import { Skeleton } from "@/components/Skeleton";

export function ListSkeleton() {
  return (
    <section className="flex flex-col gap-3" aria-busy="true">
      <p className="sr-only">Loading the list</p>
      <Skeleton key="heading" className="h-6 w-48" />
      {Array.from({ length: 12 }).map((_, index) => <Skeleton key={index} className="h-10 w-full" />)}
    </section>
  );
}
