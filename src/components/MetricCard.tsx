import { formatDeltaWithPercent } from "@/utils/formatDelta";

const tones = {
  teal: "border-teal-200 bg-teal-50 text-teal-950",
  sky: "border-sky-200 bg-sky-50 text-sky-950",
  amber: "border-amber-200 bg-amber-50 text-amber-950",
} as const;

export function MetricCard({
  label,
  value,
  count,
  delta,
  definition,
  coverage,
  comparison,
  tone,
}: {
  label: string;
  value: string;
  count: number | null;
  delta: number | null;
  definition: string;
  coverage?: string | null;
  comparison: string;
  tone: keyof typeof tones;
}) {
  const explanation = coverage ? `${definition} ${coverage}` : definition;

  return (
    <article className={`flex h-full flex-col items-start gap-2 rounded-lg border p-4 shadow-sm ${tones[tone]}`}>
      <div className="flex items-center gap-1.5">
        <h2 className="text-sm font-medium">{label}</h2>
        <span className="group relative flex items-center">
          <button
            type="button"
            aria-label={explanation}
            className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-current text-[0.7rem] leading-none font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            !
          </button>
          <span
            role="tooltip"
            className="invisible absolute top-full left-0 z-20 mt-1.5 w-64 rounded-md border border-zinc-200 bg-white p-2 text-sm leading-5 font-normal text-zinc-700 shadow-lg group-hover:visible group-focus-within:visible"
          >
            <p>{definition}</p>
            {coverage ? <p className="mt-1">{coverage}</p> : null}
          </span>
        </span>
      </div>
      <p className="text-3xl font-semibold tabular-nums">{value}</p>
      {delta !== null ? <p className={`text-sm tabular-nums font-bold ${deltaColor(delta)}`}>{formatDeltaWithPercent(delta, count)}</p> : null}
      <p className="text-sm text-zinc-500">{comparison}</p>
    </article>
  );
}

function deltaColor(delta: number): string {
  if (delta > 0) return "text-green-700";
  if (delta < 0) return "text-red-700";
  return "text-zinc-950";
}
