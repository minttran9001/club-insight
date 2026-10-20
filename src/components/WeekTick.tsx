import { chartAxis } from "@/constants/chartColors";
import type { WeekPoint } from "@/types/dashboard";

export function WeekTick({
  x,
  y,
  payload,
  weeks,
}: {
  x?: number | string;
  y?: number | string;
  payload?: { value?: string };
  weeks?: WeekPoint[];
}) {
  const left = Number(x);
  const top = Number(y);
  if (!payload?.value || Number.isNaN(left) || Number.isNaN(top)) return <g />;
  const week = weeks?.find((item) => item.label === payload.value);
  return (
    <g transform={`translate(${left},${top})`}>
      <text textAnchor="middle" fill={chartAxis} fontSize={11} dy={14}>
        {payload.value}
      </text>
      {week?.partial ? (
        <text textAnchor="middle" fill={chartAxis} fontSize={11} dy={28}>
          Partial
        </text>
      ) : null}
    </g>
  );
}
