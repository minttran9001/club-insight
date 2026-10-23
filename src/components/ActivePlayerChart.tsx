"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { WeekDot } from "@/components/WeekDot";
import { WeekTick } from "@/components/WeekTick";
import { WeekTooltip } from "@/components/WeekTooltip";
import { chartGrid, chartInk, chartTick } from "@/constants/chartColors";
import { CHART_RESIZE_DEBOUNCE_MS } from "@/constants/timing";
import type { WeekPoint } from "@/types/dashboard";

export function ActivePlayerChart({ weeks }: { weeks: WeekPoint[] }) {
  if (weeks.length === 0) return null;

  return (
    <figure className="flex min-w-0 flex-col gap-3 rounded-xl border border-sky-100 bg-sky-50 p-4">
      <figcaption className="text-sm font-medium text-sky-800">Active players by week</figcaption>
      <div className="h-64 min-w-0">
        <ResponsiveContainer width="100%" height="100%" debounce={CHART_RESIZE_DEBOUNCE_MS}>
          <LineChart data={weeks} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid stroke={chartGrid} vertical={false} />
            <XAxis
              dataKey="label"
              interval={weeks.length > 8 ? "preserveStartEnd" : 0}
              tick={(props: { x?: number | string; y?: number | string; payload?: { value?: string } }) => (
                <WeekTick {...props} weeks={weeks} />
              )}
              tickLine={false}
              axisLine={{ stroke: chartGrid }}
              height={48}
            />
            <YAxis
              allowDecimals={false}
              width={36}
              tick={{ fontSize: 11, fill: chartTick }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={(props) => <WeekTooltip active={props.active} payload={props.payload} />} />
            <Line
              type="linear"
              dataKey="count"
              name="Active players"
              stroke={chartInk}
              strokeWidth={2}
              dot={WeekDot}
              activeDot={{ r: 5, fill: chartInk, stroke: chartInk }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ul className="sr-only">
        {weeks.map((week) => (
          <li key={week.weekStart}>{week.text}</li>
        ))}
      </ul>
    </figure>
  );
}

