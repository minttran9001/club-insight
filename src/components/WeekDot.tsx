import { chartInk, chartPartial } from "@/constants/chartColors";
import type { WeekPoint } from "@/types/dashboard";

export function WeekDot({ cx, cy, payload }: { cx?: number; cy?: number; payload?: WeekPoint }) {
  if (cx == null || cy == null || Number.isNaN(cx) || Number.isNaN(cy)) return null;
  const partial = payload?.partial === true;
  return <circle cx={cx} cy={cy} r={4.5} fill={partial ? "#fffbeb" : chartInk} stroke={partial ? chartPartial : chartInk} strokeWidth={2} />;
}
