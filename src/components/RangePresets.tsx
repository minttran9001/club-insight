import type { ClubSummary } from "@/types/club";
import type { DateRange } from "@/types/range";
import { PresetButton } from "@/components/PresetButton";

export function RangePresets({
  selected,
  from,
  to,
  onSelect,
}: {
  selected: ClubSummary | null;
  from: string | null;
  to: string | null;
  onSelect: (range: DateRange) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Range presets">
      <PresetButton label="4 weeks" range={selected?.presets.fourWeeks} from={from} to={to} onSelect={onSelect} />
      <PresetButton label="12 weeks" range={selected?.presets.twelveWeeks} from={from} to={to} onSelect={onSelect} />
      <PresetButton label="All" range={selected?.presets.all} from={from} to={to} onSelect={onSelect} />
    </div>
  );
}
