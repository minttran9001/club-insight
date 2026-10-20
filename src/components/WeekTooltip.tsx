import type { WeekPoint } from "@/types/dashboard";

export function WeekTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: WeekPoint }>;
}) {
  const week = payload?.[0]?.payload;
  if (!active || !week) return null;
  return (
    <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-950">
      <p>{week.text}</p>
    </div>
  );
}
