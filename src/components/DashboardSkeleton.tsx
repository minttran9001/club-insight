import { HeaderSkeleton } from "@/components/HeaderSkeleton";
import { SummarySkeleton } from "@/components/SummarySkeleton";

export function DashboardSkeleton() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-8 text-zinc-900 sm:px-6">
      <HeaderSkeleton />
      <SummarySkeleton />
    </main>
  );
}
